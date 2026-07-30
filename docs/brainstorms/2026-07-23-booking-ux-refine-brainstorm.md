# Brainstorm: Booking flow UX/UI refine + mobile responsiveness

**Date:** 2026-07-23
**Status:** Explored — ready for planning

## What We're Building

A **refine-and-unify** pass over the customer-facing experience — no rebrand, no funnel
restructure. We keep the existing teal/forest + rounded-card identity and raise execution
quality, with a strong focus on **mobile** (most users) and on making the flow feel **trustworthy
and current** now that customers have accounts and can self-cancel.

Scope, in build order (**foundation → funnel sweep**):

1. **Foundation** — tighten the shared building blocks so every screen inherits consistency:
   - A single spacing/typography rhythm (page padding, section gaps, font sizes for mobile).
   - Polished shared primitives: `Button`, `Badge`, `Card`, `Input`, empty/loading states.
   - A reusable **mobile pattern kit**: a thumb-reachable **sticky action bar** (primary CTA
     pinned to the bottom on phones) and a consistent page shell.

2. **Funnel sweep** — apply the foundation across the booking money-path and adjacent pages:
   `book → [deptSlug] → [doctorId] (slot) → confirm → payment → success`, plus `account` & header.

Key experience upgrades layered in during the sweep:
- **Persistent booking summary** — a running "what you're booking" card (service · doctor ·
  duration · price · time) visible at each step, so users always know what they're committing to.
- **Payment & cancellation reassurance** — make the 15-min pay window, "what happens after you
  pay", and the self-cancel policy explicit at the payment step to reduce hesitation.
- **Revamped success page** — clear confirmation + appointment summary card + "Manage in My
  Bookings" CTA + "you can cancel anytime from your account". Closes the loop with the new
  account/self-cancel features so the post-booking moment no longer feels outdated.
- **Mobile fixes across the board** — slot picker (date strip + time grid tap targets, per-row
  count, selected state), forms & inputs (sizing, keyboard, thumb-reachable submit), header &
  nav (spacing/reachability of logo tab, menu, account/lang), and overall density/rhythm.

## Why This Approach

- **Refine, not redesign** — the brand and funnel already work; the gap is execution
  consistency and mobile. Lowest risk, fastest perceived-quality jump. (YAGNI: no single-page
  stepper rewrite, no new aesthetic.)
- **Foundation-first** — fixing shared primitives + one mobile pattern once means every later
  screen gets easier and automatically consistent, instead of hand-tuning each page.
- **Trust upgrades ride along** — the summary card, reassurance copy, and success revamp reuse
  the same primitives, so they cost little extra once the foundation exists.

## Key Decisions

| Decision | Choice |
| --- | --- |
| Visual ambition | **Refine & unify** existing teal/rounded identity (no refresh, no restructure) |
| Sequencing | **Foundation → funnel sweep** |
| Top pains to fix | Mobile roughness (all areas), visual inconsistency, low trust, **outdated success page** |
| Trust elements | Revamped success page · persistent funnel summary · payment/cancellation reassurance |
| Mobile targets | Slot picker grid · forms & inputs · header & nav · overall spacing/density (all) |
| Post-booking | Integrate new **account + self-cancel** into success + reassurance copy |

## Open Questions (for planning)

- **Price display** — is a reliable price available at booking time to show in the summary/pay
  step? (Services have `price_cents` / `price_text_*`, but not all may be set.) If unreliable,
  show duration only and omit price to avoid wrong numbers.
- **Sticky action bar** — apply only within the booking funnel, or site-wide? (Lean: funnel +
  key CTAs only.)
- **Add-to-calendar / share on success** — nice-to-have; include now or defer? (Lean: defer.)
- **Motion** — any micro-interactions desired within "refine", or keep strictly static? (Lean:
  minimal, tasteful transitions only.)
- **Scope guardrail** — public/customer surfaces only; admin panel is out of scope.

## Out of Scope

Funnel restructure (single-page stepper), aesthetic refresh, admin panel, QPay refunds,
new features beyond the account/cancel integration already shipped.
