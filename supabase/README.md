# Supabase setup

## 1. Create a project
1. https://supabase.com → "New project". Region: `Asia Northeast Tokyo (ap-northeast-1)` is closest to Mongolia.
2. Save the database password in your password manager.

## 2. Apply schema
- Dashboard → SQL Editor → "New query" → paste the contents of `schema.sql` → Run.
- This creates: `departments`, `doctors`, `time_slots`, `appointments` + RLS policies + the `book_slot` RPC + the `generate_slots` admin helper.

## 3. Seed data
- New query → paste `seed.sql` → Run.
- Creates 5 departments, 9 doctors, and 2 weeks of 30-min slots per doctor (weekdays 09:00–17:00 Asia/Ulaanbaatar).

## 4. Wire up environment
- Project Settings → API → copy `URL` and `anon public` key.
- Copy `.env.local.example` to `.env.local` in the project root and paste them in.

## 5. Create the admin user
- Authentication → Users → "Add user" → email + password.
- Use that to log in at `/admin/login` once the admin panel ships.

## Notes
- The `book_slot` function is `security definer` — anonymous users invoke it, but every safety check runs inside Postgres (slot exists, not in the past, not already booked).
- The `appointments` table has **no anonymous read policy**. Patients can book but cannot list other patients' bookings. Admin reads via the authenticated session.
- Generated types: when ready, run `npx supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts` to replace the manually-authored types with the source-of-truth schema.
