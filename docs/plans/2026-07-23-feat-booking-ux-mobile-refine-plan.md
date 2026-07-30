---
title: Refine & unify booking flow UX/UI + mobile responsiveness
type: feat
date: 2026-07-23
brainstorm: docs/brainstorms/2026-07-23-booking-ux-refine-brainstorm.md
revised: 2026-07-23 (post plan-review — DHH / Kieran / Simplicity)
---

# ✨ Refine & unify booking flow UX/UI + mobile responsiveness

## Overview

A **refine-and-unify** pass over the customer-facing experience — keep the teal/forest +
rounded-card identity, raise execution quality, fix mobile, and add three trust upgrades
(persistent booking summary, revamped success page, payment reassurance). No funnel restructure,
no rebrand, no admin work.

> **Revised after review.** The original plan proposed *creating* `Card`/`EmptyState` and a
> `PageShell`/`Section`/`StickyActionBar` foundation. Grounding proved that wrong: `Card`,
> `EmptyState`, and `Skeleton` **already exist and are imported nowhere** (dead code), padding is
> already near-uniform, and `StepIndicator` already has `aria-current`. So the real work is
> **adoption + a small set of genuinely-new pieces**, shipped as **2 slices**, not a 4-phase
> foundation build.

## Problem Statement / Motivation

Confirmed pains (brainstorm): mobile is rough (slot grid, forms, header, density); visual
inconsistency; low trust (no running summary, thin payment reassurance); and an **outdated
success page** ([success/page.tsx](src/app/(public)/[lang]/book/success/page.tsx)) that predates
the account + self-cancel features and only offers a "Home" button.

## Current-State Findings (corrected & verified)

| Area | File | Reality |
| --- | --- | --- |
| **Card / EmptyState / Skeleton** | [ui/Card.tsx](src/components/ui/Card.tsx), [ui/EmptyState.tsx](src/components/ui/EmptyState.tsx), [ui/Skeleton.tsx](src/components/ui/Skeleton.tsx) | **Already exist, token-based, good — and imported by ZERO files.** `Card` has `variant` + `CardBody`/`CardHeader`; `EmptyState` already has `icon/title/description/action`. Work = **adopt**, not create. |
| Button / Input / Badge | [ui/Button.tsx](src/components/ui/Button.tsx), [ui/Input.tsx](src/components/ui/Input.tsx), [ui/Badge.tsx](src/components/ui/Badge.tsx) | Solid. `Button` merges `className` (so `w-full` works — no `fullWidth` prop) and `size="lg"`=h-14 / `md`=h-11(44px) already meet touch size. Reuse as-is. |
| Confirm summary | [confirm/page.tsx](src/app/(public)/[lang]/book/[deptSlug]/[doctorId]/confirm/page.tsx) (~L84–120) | **Already renders an inline "what you're booking" card** (dentist avatar, dept, datetime, timezone, multi-visit banner). `BookingSummary` = **extract this**, not green-field. |
| Step bar a11y | [StepIndicator.tsx](src/components/booking/StepIndicator.tsx) (L38) | **`aria-current="step"` already present.** Remove from a11y scope. Carries a `pt-16 sm:pt-20` hack to clear the floating logo tab (coupled to Header). |
| Slot picker | [SlotPicker.tsx](src/components/booking/SlotPicker.tsx) | Date strip (h-scroll) + `grid-cols-3` `h-12` grid. Hand-rolls its own empty state (L200–204) → replace with `EmptyState`. Slot buttons render only `{time}` (no `aria-label`); date/selected states are color-only (no `aria-pressed`). |
| Price/duration source | [book/page.tsx](src/app/(public)/[lang]/book/page.tsx) | Resolved **server-side** from the service (`price_cents`, `minPrice`), **not in the URL**. Reuse this resolver; don't re-derive. |
| Payment data | [payment/page.tsx](src/app/(public)/[lang]/book/payment/page.tsx) | Receives only `?id`; selects `qr_image, amount_cents, service_name, status`. **No doctor/date/duration** → a summary here needs a **widened select** (columns `slot_datetime`, `duration_min` exist; doctor name needs a `dentist_id` lookup since `booking_result` is null pre-payment). Data change, not presentational. |
| Success data | [success/page.tsx](src/app/(public)/[lang]/book/success/page.tsx) | Fed by URL params (`ref, dentist, service, branch, date, name, phone`). Code already warns long URLs caused **HTTP 431** — **do not** add price/duration to the URL. |
| Padding | (funnel pages) | Already near-uniform `px-5 sm:px-8`; one outlier. A `Container` (or shared className) + fixing the outlier is enough — **not** `PageShell`+`Section`. |
| Inline i18n | confirm (L127–138 banner), payment (L49–93) | Hardcoded `lang === "mn" ? … : …` ternaries. Sweep should **retire** these into the dictionary, add none. |

## Proposed Solution — 2 slices

### Slice 1 — the felt win (ship first)

1. **Adopt existing primitives** across the funnel + account: replace hand-rolled
   `rounded-*/bg-white/shadow` clusters with `Card`, the SlotPicker empty state (and dept/doctor
   empties) with `EmptyState`, and loading blocks with `Skeleton`. Zero new primitives.
2. **`BookingSummary`** — `src/components/booking/BookingSummary.tsx`: **extract** the confirm
   page's inline card into a dumb, server-safe component taking **already-formatted string props**
   (no data-fetching inside). Reconcile the multi-visit banner + timezone cell so confirm doesn't
   ship two summaries. Render it on:
   - **slot step**: service · doctor · duration · price(if set) — **no date/time** (picking a slot
     navigates immediately; there's no selected-but-unnavigated state).
   - **confirm step**: full summary (replaces the inline card).
   - Price shown only when `price_cents`/`price_text_*` is set; duration-only fallback.
3. **SlotPicker mobile + a11y**: larger, evenly-spaced tap targets, `grid-cols-3` breathing at
   360px, clearer selected/disabled states; add `aria-label` (full date + time) to slot buttons
   and `aria-pressed` to date-strip + slot selection. Leave the `duration` filtering untouched.
4. **Success page revamp** ([success/page.tsx](src/app/(public)/[lang]/book/success/page.tsx)):
   confirmation + appointment `Card` (from existing URL params only) + primary **"Manage in My
   Bookings"** CTA (`/${lang}/account`) + cancel-anytime note + secondary "Book another"/"Home".
   Works logged-out (routes through login). Add-to-calendar deferred.
5. **`Container`** — one dumb page-shell wrapper (or an exported className constant) for
   `mx-auto max-w-* px-5 sm:px-8` rhythm; fix the single padding outlier. **No `Section`.**

**Slice-1 acceptance:** funnel + account share consistent surfaces via the existing primitives;
`BookingSummary` correct on slot/confirm (right fields per step); success page links to My
Bookings + mentions cancel; SlotPicker comfortable and screen-reader-legible at 360px; tsc +
eslint + next build clean.

### Slice 2 — fast-follow

6. **Payment step summary + reassurance**: widen the `pending_bookings` select in
   [payment/page.tsx](src/app/(public)/[lang]/book/payment/page.tsx) to include `slot_datetime`,
   `duration_min` (+ resolve `dentist_id`→name if we want doctor); render `BookingSummary`
   (service · time · duration · amount). Add reassurance **copy in the dictionary** (15-min window,
   what happens after paying, "manage/cancel anytime in My Bookings"); retire the inline ternaries.
7. **Account + header polish**, and fix the `StepIndicator` `pt-16` logo-tab hack **together with**
   the header restyle (they touch the same overlap — sequencing them apart risks a double-fix).
8. **`StickyActionBar`** (`src/components/ui/StickyActionBar.tsx`) — bottom-pinned mobile CTA. Only
   build once these are specified: (a) a scroll-container spacer/`padding-bottom` = bar height +
   `env(safe-area-inset-bottom)` so it never covers content; (b) how it submits the confirm form —
   the CTA lives inside `PatientForm` under `useActionState`, so the bar must render **inside** the
   form or use the HTML `form="<id>"` association and lift `pending`. Prop shape = `children` slot,
   not `label`+`onClick`.
9. **Formal a11y/QA pass** at 320/360/390px (minus already-satisfied `aria-current`): focus-visible
   everywhere, no horizontal scroll, targets ≥44px, safe-area respected.

## Component Inventory

- **Adopt (exist, unused):** `Card` (+`CardBody`/`CardHeader`), `EmptyState`, `Skeleton`.
- **New — Slice 1:** `src/components/booking/BookingSummary.tsx` (extracted from confirm);
  `src/components/ui/Container.tsx` (or a className constant).
- **New — Slice 2 (deferred):** `src/components/ui/StickyActionBar.tsx`.
- **Changed (representative):** `SlotPicker.tsx`, confirm/success/payment pages, `account/page.tsx`,
  `Header.tsx`/`MobileMenu.tsx`, `StepIndicator.tsx`; `mn.json`+`en.json` (summary labels, success
  CTAs, reassurance copy). No new `Button/Input/Badge` props unless the sweep proves a concrete gap.

## Acceptance Criteria

### Functional
- [ ] Existing `Card`/`EmptyState`/`Skeleton` adopted across funnel + account (no new duplicate
      surface primitives; SlotPicker's hand-rolled empty state replaced).
- [ ] `BookingSummary` extracted from confirm; shows correct fields per step (slot = no date/time);
      price only when available; single summary on confirm (no duplicate).
- [ ] Success page: appointment card + working "Manage in My Bookings" CTA + cancel note + "Book
      another"/"Home"; no rich data added to the URL.
- [ ] Payment (Slice 2): summary via widened select + dictionary-based reassurance copy.
- [ ] All new/retired copy lives in both `mn.json` and `en.json`; no new inline `lang==="mn"?…` copy.

### Non-functional (mobile / a11y / consistency)
- [ ] No horizontal scroll at 320/360/390px on any funnel screen; targets ≥44px.
- [ ] Slot buttons have `aria-label` (full date+time); date/slot selection uses `aria-pressed`;
      focus-visible states present. (Do NOT re-add `aria-current` — already there.)
- [ ] `BookingSummary` stays server-safe and receives only already-formatted strings (no data
      fetching inside the component).
- [ ] Consistent page rhythm via `Container`/shared class; single padding outlier fixed.
- [ ] `npx tsc --noEmit`, `npx eslint`, `npx next build` all clean.

## SpecFlow — edge cases
- **Logged-out success**: My Bookings CTA → `/account` → login redirect (fine; label still valid).
- **Missing price**: duration-only; never fabricate a number.
- **Free flow (amount 0)**: skips payment → success summary uses URL params; verify sufficiency.
- **Slot step**: no date/time in summary (immediate navigate on pick).
- **Payment doctor name**: `booking_result` is null pre-payment → doctor requires a `dentist_id`
  lookup; treat as optional, ship service·time·duration·amount first.
- **Long-duration services**: don't touch the `duration` param or hidden-cell logic.

## Dependencies & Risks
- **Low risk** — presentational, plus one narrow read-widening on the payment page (Slice 2). No
  QPay logic, iDoctor, or auth changes.
- Touches many files → land Slice 1 first, each PR building clean.
- **Header ↔ StepIndicator overlap** (floating logo tab) — fix in one change, not split across steps.

## Out of Scope
Funnel restructure, aesthetic refresh, motion beyond tasteful transitions, add-to-calendar/share,
admin panel, QPay refunds, new `Button/Input/Badge` API surface.

## References
- Brainstorm: [2026-07-23-booking-ux-refine-brainstorm.md](docs/brainstorms/2026-07-23-booking-ux-refine-brainstorm.md)
- Review consensus (DHH / Kieran / Simplicity): adopt-don't-create, cut `PageShell`/`Section`,
  defer `StickyActionBar`, extract `BookingSummary` from confirm, correct payment/success data facts.
- Implementation-guidance skills to load during work: `web-design-guidelines`, `frontend-design`.
