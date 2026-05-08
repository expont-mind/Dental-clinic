# Lumen Hospital — Booking + Marketing Site

Орчин үеийн жижиг эмнэлгийн онлайн цаг захиалга + танилцуулга вэбсайт.
Modern small-hospital online booking + marketing site.

- **Stack:** Next.js 16.2.5 (App Router) · React 19.2.4 · Tailwind CSS v4 · Supabase (Postgres + Auth) · TypeScript
- **i18n:** Mongolian (default) ↔ English, route-segment based (`/mn/...`, `/en/...`)
- **Booking:** Department → Doctor → Time slot → Patient form → Confirmation. Anonymous (guest) booking.
- **Admin:** Email/password login, dashboard, appointments list with status updates, bulk slot generator.
- **Demo mode:** runs without Supabase via in-memory seed data — booking action redirects to a "DEMO" success page until env is wired.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000); you'll be redirected to `/mn` (Mongolian) or `/en` based on `Accept-Language`.

## Wire up Supabase

Demo data renders out of the box. To turn on the real database:

1. Follow [supabase/README.md](supabase/README.md) — creates the project, applies `supabase/schema.sql` (4 tables, RLS, the `book_slot` race-safe RPC, and `generate_slots` admin helper) plus `supabase/seed.sql` (5 departments, 9 doctors, 14 days of slots).
2. Copy `.env.local.example` → `.env.local` and paste your Project URL + anon key.
3. Create an admin user from Supabase Dashboard → Authentication → Users.
4. Restart `npm run dev`. The Supabase queries replace the fallback automatically.

## Project structure

```
src/
├── proxy.ts                      # Locale redirect + admin route gate (replaces Next 15's middleware.ts)
├── app/
│   ├── globals.css               # Tailwind v4 @theme tokens (soft-medical palette)
│   ├── (public)/[lang]/          # Marketing site + booking flow (lang ∈ mn|en)
│   │   ├── layout.tsx            # Root #1: html lang, fonts (Manrope + Fraunces), header/footer
│   │   ├── page.tsx              # Home (Hero, TrustStrip, ServicesGrid, DoctorsPreview, CTABand)
│   │   ├── about/, doctors/, services/, contact/
│   │   └── book/                 # Multi-step booking flow
│   └── (admin)/admin/            # Single-language Mongolian admin
│       ├── layout.tsx            # Root #2: html lang="mn", admin shell
│       ├── login/, page.tsx (dashboard), appointments/, slots/
│       └── api/sign-out/route.ts
├── components/
│   ├── layout/   (Header, Footer, LangToggle)
│   ├── marketing/ (Hero, ServicesGrid, DoctorsPreview, TrustStrip, CTABand)
│   ├── booking/  (StepIndicator, SlotPicker, PatientForm)
│   ├── admin/    (LoginForm, SlotGenerator)
│   └── ui/       (Button, Input, Card, Badge, Skeleton, EmptyState)
└── lib/
    ├── supabase/ (client, server, types)
    ├── i18n/     (dictionaries.ts + dictionaries/{mn,en}.json)
    ├── queries/  (catalog.ts with Supabase ↔ fallback switch, seed-fallback.ts)
    ├── actions/  (booking.ts — `book_slot` RPC, admin.ts — auth + slot-gen)
    ├── utils/    (datetime.ts in Asia/Ulaanbaatar, phone.ts validates +976, cn.ts)
    └── auth.ts   (requireAdminUser server helper)
```

## Notes on Next.js 16 specifics that bit us

- `middleware.ts` is gone — `src/proxy.ts` exports a named `proxy` function. Used here for `/` → `/mn` redirect.
- `params` and `searchParams` are async Promises now: every page does `const { lang } = await params`.
- Multiple root layouts via route groups: `(public)` and `(admin)` each own their `<html>` because admin is single-language Mongolian and public is bilingual.
- `cacheComponents: true` (the v16 PPR flag) requires every dynamic data fetch to live inside `<Suspense>`. Off for MVP velocity; turn it on when adding Suspense boundaries.
- `next/font/google` rejects `weight + axes` together for variable fonts — drop `weight` when you want axes.
- `Geist` does NOT cover Cyrillic. Body uses `Manrope` and display uses `Fraunces`, both with `subsets: ["latin", "cyrillic"]`.

## Booking concurrency

Two patients can attempt the same slot at the same instant. Application-level checks (`SELECT … then INSERT`) cannot fix this. The guard is a `UNIQUE (time_slot_id)` constraint on `appointments` plus an `INSERT … ON CONFLICT DO NOTHING RETURNING id` inside the `book_slot` Postgres function. If `RETURNING id` is null, the second patient gets a friendly "slot just taken" toast and the slot list re-renders.

## Available scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — eslint

## Roadmap (not in MVP)

- Email/SMS confirmation (Resend or Supabase Auth email)
- Admin CRUD for departments and doctors (currently edit via Supabase dashboard)
- Patient login & visit history
- Doctor schedule preview on detail page
- A11y axe audit + Lighthouse pass
- Re-enable `cacheComponents: true` after wrapping queries in Suspense
# Dental-clinic
