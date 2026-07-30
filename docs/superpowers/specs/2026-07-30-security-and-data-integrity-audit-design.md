# Security & data-integrity audit — design

**Date:** 2026-07-30
**Scope:** Dentaris clinic site, both public (customer) and admin surfaces.
**Goal:** close authorization holes, stop silent data loss, and make the
payment → booking chain recoverable. No design, i18n, or performance work.

## Findings, by severity

### Critical

1. **`pending_bookings` has no RLS.** Every other table in `supabase/`
   enables row-level security; migration `12_booking_payment.sql` does not.
   Supabase grants `anon`/`authenticated` full DML on public-schema tables by
   default, and the anon key ships in the client bundle — so patient names,
   phones, notes, and appointment times are world-readable, and any visitor can
   `UPDATE`/`DELETE` the whole booking table.

2. **Admin server actions do not check authorization.** Only
   `src/lib/actions/appointments.ts` calls `requireAdminUser()`. Everything
   else — `services` (incl. hard delete), `team` (incl. hard delete),
   `departments`, `branches`, `bot`, `clinic` (incl. the booking fee), `sync`,
   `resolveFeedback` — writes through the service-role client with no gate.
   Server Action IDs are extractable from the client bundle.

3. **Hard-coded dev admin is live in production.** `isDevAdminAllowed()`
   returns `true` unless `DISALLOW_DEV_ADMIN` is set, so
   `admin@dentaris.mn / dentaris2026` works on the deployed site — the opposite
   of what the doc comment claims. The `dentaris_dev_admin=1` cookie is also
   unauthenticated: `httpOnly` blocks JS *reads*, not forged `Cookie` headers.

4. **Customer session is a forgeable cookie.** `getCurrentUser()` reads
   `dentaris_dev_user` and treats its value as the caller's phone number,
   *before* consulting Supabase. Sending `Cookie: dentaris_dev_user=99112233`
   exposes that phone's bookings on `/[lang]/account` and authorizes
   `cancelMyBookingAction` against them.

### High — data or money loss

5. **Sync deactivates the entire catalog.** `syncFromITDoctorAction`
   sets `is_active = false` on every service/doctor whose `itdoctor_*_id` is
   `NULL`. Per the comment in `services.ts`, that column is never written on
   create/update any more — so every hand-authored service is `NULL`. One click
   of Sync empties the public catalog. Unauthenticated on top of that.

6. **Feedback is silently discarded.** On a Supabase insert failure,
   `submitFeedbackAction` writes to `os.tmpdir()` — per-instance and ephemeral
   on Vercel — and returns `success` regardless. Patient messages vanish with
   no trace and no signal to the sender.

7. **Paid bookings can be stranded.** `fulfillPendingBooking` locks a row to
   `processing`; a crash or function timeout after that point leaves it there
   forever, and both the poller and the callback then report `pending`. Money is
   taken, no appointment exists, and there is no automatic retry. The `failed`
   path stores no reason.

8. **Two customers can hold one slot.** `getLongBookings` (slots route) only
   considers `status = 'paid'`. A `pending` row is invisible to both iDoctor and
   this filter, so the slot stays bookable during the payment window; both
   customers pay and the second iDoctor push fails.

9. **Free-flow bookings are not recorded locally.** `bookSlotAction` inserts
   the `pending_bookings` row only when `durationMin` *and* a dentist are set,
   so other free bookings never appear in the admin queue or the customer's
   account page.

### Medium

10. `/api/upload` has no authorization — anyone can push images into the
    clinic's Cloudinary account and host arbitrary content on its delivery URLs.
11. `/api/qpay/callback` verifies nothing about the caller and has no rate limit.
12. `submitFeedbackAction` has no length cap or throttle.
13. Admin cancel acts on `processing` rows, racing an in-flight fulfil, and
    re-cancels already-`cancelled` rows.

## Design

### A. One authorization helper (fixes 2, 3)

`src/lib/auth.ts` exposes three entry points:

- `requireAdminUser()` — for pages; redirects to `/admin/login` (unchanged).
- `assertAdmin()` — **new**; for server actions. Returns a Mongolian error
  string when unauthorized, `null` when authorized. Actions start with
  `const authErr = await assertAdmin(); if (authErr) return { error: authErr };`
  and void actions with `if (await assertAdmin()) return;`.
- `isDevAdminAllowed()` — becomes opt-**in**:
  `ALLOW_DEV_ADMIN === "true" && NODE_ENV !== "production"`.

The dev-admin cookie value is HMAC-signed with `DEV_ADMIN_COOKIE_SECRET`
(falling back to a value derived from `SUPABASE_SERVICE_ROLE_KEY`), so a forged
`Cookie` header no longer authenticates. When no secret is available the dev
bypass is disabled rather than degraded.

Files gated: `services.ts`, `team.ts`, `departments.ts`, `branches.ts`,
`bot.ts`, `clinic.ts`, `sync.ts`, and `resolveFeedbackAction` in `feedback.ts`.

### B. Customer session (fixes 4)

`getCurrentUser()` consults the dev cookie only when
`!isSupabaseConfigured() && NODE_ENV !== "production"`, and only accepts a
signed value. With Supabase configured the cookie is ignored entirely, so the
phone number backing ownership checks always comes from a real session.

### C. Migration `supabase/31_pending_bookings_hardening.sql` (fixes 1)

```sql
alter table public.pending_bookings enable row level security;
revoke all on public.pending_bookings from anon, authenticated;
-- deliberately no policies: only service_role (which bypasses RLS) may access
alter table public.pending_bookings add column if not exists last_error text;
alter table public.pending_bookings
  alter column expires_at set default (now() + interval '5 minutes');
create index if not exists idx_pending_bookings_hold
  on public.pending_bookings (branch_id, slot_datetime);
```

The `feedback` table is not defined in any migration (created by hand), so the
same hardening is applied to it inside an `if exists` guard.

**This file is run by the operator in the Supabase SQL editor.** The application
code does not depend on it having run, except that `last_error` writes are
best-effort.

### D. Sync (fixes 5)

- Rows with `itdoctor_*_id IS NULL` are never touched — hand-authored content
  is off limits.
- Only rows that *have* an upstream id which no longer appears upstream are
  deactivated.
- If iDoctor returns an empty list, abort with an error instead of deactivating
  everything, so an upstream blip cannot empty the catalog.
- The result reports which records were deactivated, by name.

### E. Feedback (fixes 6)

- Insert through `createSupabaseAdmin()` so an RLS policy gap cannot swallow
  submissions.
- If both the database and the file fallback fail, return a real error telling
  the sender to phone the clinic — never `success`.
- The `/tmp` store stays a development convenience and logs at error level in
  production.

### F. Payment → booking recovery (fixes 7)

- **Stale-lock reclaim:** a row stuck in `processing` for more than two minutes
  can be re-locked, so the next poll or callback resumes it automatically.
- A failed status write *after* a successful iDoctor push logs at error level
  with the `booking_reference`, which is currently lost silently.
- `failed` rows record the reason in `last_error` for the admin retry button.
- The amount reported paid is checked against `amount_cents`.

### G. Slot holding (fixes 8)

`getLongBookings` returns `paid` rows plus unexpired `pending`/`processing`
rows, and the two are filtered differently:

- `paid` — iDoctor already blocks the start cell, so only trailing cells are
  removed (current behaviour).
- `pending`/`processing` — iDoctor knows nothing about them, so the start cell
  is removed too.

The payment window is **5 minutes** (see C), which bounds how long a slot is
held by an unpaid attempt.

### H. Free-flow record (fixes 9)

Drop the `durationMin && dentistId > 0` condition so a local row is always
written, keeping the admin queue and the customer's account page complete.

### I–M. Medium fixes

- `/api/upload` requires admin; returns 401 otherwise (10).
- The QPay callback URL carries `QPAY_CALLBACK_TOKEN` and the route verifies it.
  With the variable unset, behaviour is unchanged apart from a warning log (11).
- Feedback caps message length at 2000 characters and throttles to 3
  submissions per IP per 60 seconds. The throttle is per instance — documented
  as partial mitigation, not a guarantee (12).
- Admin cancel refuses `processing` rows and no-ops on `cancelled` ones (13).
- The slots route clamps a propagated upstream status into 400–599 so a
  `status: 0` transport error cannot crash the handler.
- `pay_15min` copy becomes a 5-minute deadline in both dictionaries, matching C.

## Out of scope

Visual design, i18n coverage, performance, and the overall
Supabase + iDoctor + QPay architecture are untouched.

## Verification

`npm run lint` and `npm run build` must pass. The RLS migration is verified by
the operator against Supabase; every other change is verified by reading the
resulting code paths, since the project has no test suite.
