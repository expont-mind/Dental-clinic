# Dentexgo ↔ Clinic Website — Integration Contract

> Audience: the developer building the clinic booking website.
> Version: 1.2 (adds branches; bilingual & soft-delete from v1.1 preserved).
> Matches `clinics.api_schema_version = '1'` in Dentexgo's DB (we keep `'1'` as
> the major version since this is additive — `branchIds` is optional, the
> `/branches` endpoint is optional for single-branch clinics).

## What this is

Dentexgo is the AI assistant that answers patient DMs on Messenger and Instagram for a clinic. It does **not** own services, staff, or bookings — the clinic website does. To answer accurately and route patients to bookings, Dentexgo needs a small, read-only API on the clinic website, plus a way for the website to notify Dentexgo when data changes.

The two systems share **one secret per clinic** for mutual authentication. Nothing else is shared — no database access, no shared schema, no shared codebase.

## System diagram

```
[ Clinic website ]                                  [ Dentexgo ]
  <clinic>.mn                                         dentexgo.com
  ├─ Booking flow (authoritative)                     ├─ Meta webhook
  ├─ Admin UI for services/staff                      ├─ LLM + RAG
  ├─ GET /api/dentexgo/* ◀─── pull (Bearer auth) ─── │
  └─ POST changes ── webhook (HMAC) ───────────────▶ /api/clinics/:slug/sync
```

## Authentication

- Per clinic, Dentexgo generates a random 256-bit secret (`shared_secret`) and gives it to the clinic site at onboarding.
- **Clinic website → Dentexgo (webhook out)**: include header
  `X-Dentexgo-Signature: sha256=<hex hmac of body using shared_secret>`.
- **Dentexgo → Clinic website (read API)**: include header
  `Authorization: Bearer <shared_secret>`.
- Both sides MUST reject requests with missing or mismatched secrets with `401 Unauthorized`.
- Rotation: when a secret rotates, Dentexgo updates `clinics.api_secret_encrypted` and the clinic site updates its env var. No grace period in v1 (we plan rotations).

## Localization

The clinic operates in Mongolia, where patients DM in both Mongolian and English (often code-switched in the same conversation). To support this without runtime translation, **every translatable string is returned as a nested object with both locales**:

```json
{ "mn": "Шүд цэвэрлэх", "en": "Teeth Cleaning" }
```

This applies to: `name`, `description`, `bio`, `role`, `insurance`, `address`, `hours` day-labels, and `bookingUrl` (which differs by locale prefix on the clinic site). Non-translatable fields (`slug`, `priceCents`, `durationMin`, `phone`, `photoUrl`, timestamps) stay flat.

If only one locale exists for a field, return it on both keys — never return `null` for either key, and never omit a key. Dentexgo embeds each locale as a separate RAG chunk, so missing one language degrades retrieval for patients writing in it.

## Endpoints the clinic website exposes

All under `https://<clinic>.mn/api/dentexgo/`. All responses are JSON. All timestamps are ISO 8601 UTC.

### `GET /api/dentexgo/health`
Sanity ping. No auth required (intentionally — used by uptime monitors too).
```json
{ "ok": true, "schemaVersion": "1", "clinicSlug": "aclinic" }
```

### `GET /api/dentexgo/branches` (v1.2, optional for single-branch clinics)
Lists the clinic's physical locations. Single-branch clinics may either return
a single-item array or omit this endpoint entirely (Dentexgo treats a missing
endpoint as "one implicit branch = the brand itself").

```json
{
  "items": [
    {
      "id": "br_tuv",
      "slug": "tuv",
      "name": { "mn": "Төв салбар", "en": "Central branch" },
      "address": {
        "mn": "Улаанбаатар, Сүхбаатар дүүрэг, Express Tower",
        "en": "Ulaanbaatar, Sukhbaatar district, Express Tower"
      },
      "phone": "+976 7700 0011",
      "hours": { "mon": "09:00-20:00", "sun": null },
      "timezone": "Asia/Ulaanbaatar",
      "isActive": true,
      "updatedAt": "2026-05-14T10:00:00Z"
    },
    {
      "id": "br_zaisan",
      "slug": "zaisan",
      "name": { "mn": "Зайсан салбар", "en": "Zaisan branch" },
      "address": { "mn": "Зайсан, ...", "en": "Zaisan, ..." },
      "phone": "+976 7700 0022",
      "hours": { "mon": "10:00-19:00", "sun": null },
      "timezone": "Asia/Ulaanbaatar",
      "isActive": true,
      "updatedAt": "2026-05-14T10:00:00Z"
    }
  ]
}
```

Slugs must be `[a-z0-9-]+`, unique within the clinic. Used in URL paths
(e.g. `/<clinic>.mn/<lang>/branches/<branchSlug>`) and as the disambiguation
token Dentexgo's bot uses when calling `set_conversation_branch`.

### `GET /api/dentexgo/clinic`
```json
{
  "slug": "lumen",
  "name": { "mn": "Люмен шүдний эмнэлэг", "en": "Lumen Dental Clinic" },
  "localeDefault": "mn",
  "timezone": "Asia/Ulaanbaatar",
  "hours": { "mon": "09:00-18:00", "tue": "09:00-18:00", "sun": null },
  "address": {
    "mn": "Улаанбаатар, Сүхбаатар дүүрэг, 14-р байр, 3-р давхар",
    "en": "Ulaanbaatar, Sukhbaatar district, Building 14, Floor 3"
  },
  "phone": "+976 7700 0000",
  "insurance": {
    "mn": "ACME, Баянмод, Засгийн газрын даатгал хүлээн авна.",
    "en": "ACME, Bayanmod, Government insurance accepted."
  },
  "updatedAt": "2026-05-12T10:00:00Z"
}
```

### `GET /api/dentexgo/services`
```json
{
  "items": [
    {
      "id": "svc_abc123",
      "slug": "orthodontics-metal-braces",
      "name": { "mn": "Металл бракет", "en": "Metal Braces" },
      "description": {
        "mn": "Уламжлалт металл бракетийн систем...",
        "en": "Traditional metal bracket system..."
      },
      "category": "orthodontics",
      "priceCents": 144000000,
      "currency": "MNT",
      "durationMin": 60,
      "bookingUrl": {
        "mn": "https://lumen.mn/mn/book/orthodontics",
        "en": "https://lumen.mn/en/book/orthodontics"
      },
      "branchIds": ["br_tuv", "br_zaisan"],
      "isActive": true,
      "updatedAt": "2026-05-12T10:00:00Z"
    }
  ]
}
```

**v1.2 — `branchIds` (optional array of branch source-ids):**
- Omit or send `[]` to mean "available at all branches" (default).
- Send a subset to limit a service to specific branches.
- Single-branch clinics should omit the field.

Notes:
- `bookingUrl` can use whatever URL pattern the clinic site already uses (`/{lang}/book/{deptSlug}` is fine). Return both locale variants.
- `category` is non-translated — it groups services on Dentexgo's side and is exposed to the LLM as a tool filter (`list_services(category)`). Use the department slug or another stable English-ish identifier.

### `GET /api/dentexgo/services/:idOrSlug`
Single service, same shape as one `items[]` entry. `404` if not found.

### `GET /api/dentexgo/staff`
```json
{
  "items": [
    {
      "id": "stf_42",
      "name": { "mn": "Доктор Баяр-Эрдэнэ", "en": "Dr. Bayar Erdene" },
      "role": { "mn": "Ахлах эмч", "en": "Senior Dentist" },
      "specialties": ["orthodontics"],
      "languages": [],
      "bio": {
        "mn": "12 жилийн туршлагатай...",
        "en": "12 years of experience..."
      },
      "photoUrl": "https://res.cloudinary.com/.../bayar.jpg",
      "branchIds": ["br_tuv"],
      "isActive": true,
      "updatedAt": "2026-05-12T10:00:00Z"
    }
  ]
}
```

**v1.2 — `branchIds` (optional):** same semantics as services. Omit or `[]`
for "works at all branches". Use a subset when a doctor only sees patients
at specific branches.

Notes:
- `specialties` can be derived from the doctor's department slug for v1 (e.g. `["orthodontics"]`). Add explicit columns later if admins want overrides.
- `languages` may be `[]` in v1 — Dentexgo will assume MN+EN by default.

### `GET /api/dentexgo/staff/:id`
Single staff member. `404` if not found.

### Conventions across all read endpoints

- Always include `updatedAt`. Dentexgo uses it to skip re-embedding unchanged rows.
- `isActive: false` means "do not surface to patients" — Dentexgo will hide it.
- Pagination is not required for v1 (clinics have tens, not thousands, of services/staff). Return the full list.
- On error: HTTP status + `{ "error": { "code": "...", "message": "..." } }`.

## Webhook the clinic website calls

When a service, staff member, or clinic profile is created/updated/deleted in your admin UI, fire an HTTP POST to Dentexgo so it can re-embed promptly. If you can't deliver a webhook, Dentexgo's daily resync will eventually catch up — webhooks are optimization, not correctness.

### `POST https://dentexgo.com/api/clinics/:slug/sync`

Headers:
```
Content-Type: application/json
X-Dentexgo-Signature: sha256=<hex HMAC-SHA256 of raw body using shared_secret>
```

Body:
```json
{
  "kind": "service",          // "service" | "staff" | "clinic" | "branch" (v1.2)
  "action": "upsert",         // only "upsert" — see Soft delete below
  "id": "svc_abc123",         // omit when kind = "clinic"
  "occurredAt": "2026-05-12T10:00:00Z"
}
```

**v1.2 — `kind: "branch"`:** fire whenever a branch is created or edited.
Dentexgo re-fetches `/api/dentexgo/branches` and updates its cache.

### Soft delete (no hard deletes)

When a service or staff member is removed from the admin UI, **do not send `action: "delete"`** and do not actually delete the row in your DB. Instead, set `isActive: false` on the row and send `action: "upsert"` as usual. Dentexgo will see `isActive: false` on the next fetch, deactivate the corresponding `kb_chunks` (so the LLM stops surfacing it), and keep the cached row for audit purposes.

This avoids dangling foreign keys (your `appointments` may still reference an old service or doctor) and matches how `doctors.is_active` already works.

Response:
- `202 Accepted` — queued, will re-embed asynchronously.
- `400` / `401` — request rejected; do not retry without fixing.
- `5xx` — Dentexgo error; retry with exponential backoff up to 5 times.

Idempotency: send the same `(kind, id, occurredAt)` and Dentexgo will dedupe by `occurredAt`.

## What the clinic website does **not** have to do

- No vector embeddings, no AI calls, no pgvector — that all lives in Dentexgo's DB.
- No knowledge of Meta, Messenger, or Instagram.
- No knowledge of chat history or patient identifiers.
- No exposure of internal booking state (calendars, slots) — Dentexgo only hands patients the URL.

## Local dev

- Each environment (dev / preview / prod) gets its own `shared_secret`.
- For local Dentexgo dev, expose your local clinic site via ngrok and put the ngrok URL into `clinics.api_base_url`. Or use seed fixtures.

## Schema versioning

`schemaVersion: "1"` on every response and on `clinics.api_schema_version`. When the contract changes backward-incompatibly, bump to `"2"` and run both versions in parallel for at least 30 days. Backward-compat additions (new optional fields) don't require a bump.

## Resolved in v1.2 (2026-05-14)

- **Branches** are first-class entities. New `GET /api/dentexgo/branches`
  endpoint; optional `branchIds` on services and staff; new webhook `kind: "branch"`.
- Single-branch clinics may omit the new endpoint and field — Dentexgo treats
  that as one implicit branch (the brand itself).

## Resolved in v1.1 (2026-05-12)

- Bilingual response shape (§ Localization) replaces single-string fields.
- `bookingUrl` is bilingual; pattern is whatever the clinic site uses.
- Soft delete only — `action: "delete"` removed from webhook payload.
- `specialties` may be derived from department slug for v1; `languages` may be empty.
- `categories` are non-translated identifiers (use department slug or equivalent).
- Secret storage: one `DENTEXGO_SHARED_SECRET` env var per environment.
- Webhook trigger: fire-and-forget inside server action (Next.js `after()`); daily resync covers failures.

## Open questions for the clinic site dev to confirm

- [ ] Endpoints behind bearer auth only (no IP allowlist)? OK to go public-but-authenticated.
- [ ] Time-to-implement estimate so Dentexgo M2/M3 can sequence against your work.
- [ ] Which slug is canonical: `lumen` or `dentaris`? It must match Dentexgo's `clinics.slug` row.
