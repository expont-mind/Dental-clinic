# Needs-human queue + bot insights on the admin dashboard — design

**Date:** 2026-07-30
**Contract:** [docs/dentexgo-admin-api-contract.md](../../dentexgo-admin-api-contract.md) (Dentexgo Public API v1)

## Goal

When Dentexgo's bot hands a Messenger conversation to a human, nothing in the
clinic's admin shows it. `needs_human` lives in Dentexgo's database, so the
escalation is invisible in the Meta/Messenger inbox too — a patient can sit
waiting while staff have no signal at all. Worse, the escalation auto-expires:
the bot resumes after **30 minutes** unhandled.

This spec puts that queue on the first screen staff see (`/admin`), with a
one-click jump into the Messenger thread and the two control actions that let
staff clear the queue without leaving the page. It also surfaces the bot
insights the contract already exposes.

## Gap against the contract

Our client implements 6 of the contract's endpoints:

| Implemented | Missing |
| --- | --- |
| `whoami`, `GET/POST/PATCH/DELETE /faqs`, `GET /bot`, `PATCH /bot/persona` | `GET /conversations`, `GET /conversations/{id}`, `PATCH /conversations/{id}`, `insights/*` (6), `credits/*` (4) |

Bot persona is already current with the contract — `show_duration_in_cards`,
`custom_rules` and `featured_services` are all wired through
`BotConfigForm` and `patchBotPersonaAction`. Persona v2's removal of
`signature` needs no action (we never sent it).

## Scope

**In:** conversations (needs-human queue, take-over, hand-back, Messenger deep
link) and insights.

**Out, for a later spec:** AI Credits (`balance`, `topup`, `topup/:invoiceId`,
`transactions` — a full QPay invoice + polling flow), `GET /conversations/export`
transcripts, a sidebar unread badge, and a page for non-escalated conversations.

## Design

### 1. Client layer, split by domain

`src/lib/dentexgo/client.ts` is 217 lines. Adding conversations plus insights
would push it past 400 and mix three unrelated concerns, so the shared core
stays and each domain gets its own file:

- **`client.ts`** — unchanged: `apiFetch`, `DentexgoError`, `isConfigured`, and
  the existing FAQ + bot calls.
- **`conversations.ts`** — types plus:
  - `listConversations(opts: { needsHuman?: boolean; limit?: number })`
  - `getConversation(idOrPsid: string)`
  - `patchConversation(idOrPsid, { needs_human?, pause_bot_hours? })`
- **`insights.ts`** — types plus `getInsightsSummary(days?: number)`.

`apiFetch` already carries Bearer auth, `cache: "no-store"`, and error mapping;
the new modules import it rather than repeating any of that.

**Only `/insights/summary` is implemented.** The contract describes it as a
"bundle of every insight in one round-trip. Useful for clinic-admin dashboards"
and it returns the same payloads as the five individual endpoints
(`intents`, `languages`, `needs-human-rate`, `faq-gaps`, `usage`). Implementing
those separately would add five call sites with no new data. If a future screen
needs one dimension at a different `days` window, add it then.

### 2. Conversation types

Mirrors the contract's response-field table:

```ts
type ConversationChannel = "messenger" | "instagram";

interface DentexgoConversation {
  id: string;
  psid: string;
  channel: ConversationChannel;
  patient_name: string | null;
  needs_human: boolean;
  needs_human_at: string | null;
  bot_paused_until: string | null;
  bot_paused_active: boolean;
  last_message_at: string;
  messenger_thread_id: string | null;
  messenger_deep_link: string | null;
}
```

`patient_name` is typed nullable even though the contract types it `string` —
the name comes from Meta and may be absent.

### 3. Messenger link — `src/lib/messenger/link.ts`

Dentexgo resolves the PSID to a Graph thread id server-side and returns both
`messenger_thread_id` (`t_…`, documented as "stable and API-supported") and a
ready-made `messenger_deep_link` into Meta Business Suite. We therefore need no
Meta app, no Page Access Token, no Graph call and no PSID→thread cache.

One small helper, because the contract warns that `messenger_deep_link` is an
**unofficial URL** Meta may change without notice and recommends building your
own from `messenger_thread_id`:

```ts
threadUrl(c: Pick<DentexgoConversation, "messenger_thread_id" | "messenger_deep_link">): string | null
```

- If `MESSENGER_DEEP_LINK_TEMPLATE` is set, build the URL from it, substituting
  `{threadId}` and `{pageId}` (the latter from `FACEBOOK_PAGE_ID`). This is the
  escape hatch: when Meta changes the shape, the fix is an env change, not a
  deploy.
- Otherwise return `messenger_deep_link` as-is.
- Return `null` when `messenger_thread_id` is `null`.

Both env vars are optional and neither is a credential — `FACEBOOK_PAGE_ID` is
just a number that appears in the URL. With neither set, the server-provided
link is used as-is.

**There is no mobile-app deep link.** The contract is explicit: the URL opens
Meta Business Suite on the web. On a phone the same URL may be intercepted by
the Business Suite app through universal links, but that is not guaranteed and
we do not claim it in the UI. Inventing `fb-messenger://` or `messenger.com/t/`
alternatives was considered and rejected — a PSID is not a thread id, so those
URLs would not resolve, and offering three buttons where two are broken is
worse than offering one that works.

Each row therefore gets one primary link plus copy-to-clipboard buttons for
`messenger_thread_id` and `psid`, so staff can find the thread by hand if Meta
breaks the URL shape.

### 4. Server actions — `src/lib/actions/dentexgo-conversations.ts`

Every action starts with `assertAdmin()`, matching the authorization pattern
established across `src/lib/actions/*`:

| Action | Call | Used by |
| --- | --- | --- |
| `fetchNeedsHumanAction()` | `GET /conversations?needs_human=true&limit=100` | the 30s poll |
| `takeOverAction(id)` | `PATCH { pause_bot_hours: 12 }` | "Би хариулна" |
| `handBackAction(id)` | `PATCH { needs_human: false, pause_bot_hours: null }` | "Бот руу буцаах" |

Polling goes through a server action rather than a new route handler so the
Bearer secret stays server-side and no new endpoint needs its own auth gate.
Each action returns a discriminated result (`{ ok: true, … }` or
`{ ok: false, error }`) so the client can show a message without throwing.

`takeOverAction` uses 12 hours, matching the contract's own "take over" example.
Handing back clears both guards in one PATCH, as the contract prescribes.

### 5. Dashboard

`/admin` stays a server component. It fetches the queue and the insights
summary server-side so the first paint has real data, then hands the queue to a
client component that polls.

**`NeedsHumanQueue` (client), above the stat cards.** This is the most
time-sensitive thing on the page — a patient is waiting — so it comes before the
booking counters.

- Rows in the order the API returns them: oldest escalation first, longest-waiting
  patient at the top.
- Per row: `patient_name` or, failing that, the PSID; a channel badge; "N минут
  хүлээж байна" derived from `needs_human_at`; the Messenger button; copy buttons;
  and the two actions.
- `bot_paused_active` rows show a "Ажилтан хариулж байна" badge and disable
  "Би хариулна".
- Polls every 30 seconds, shows a last-updated time, and offers a manual refresh.
  The 30-minute auto-return makes freshness matter.
- After a successful action the row updates locally (hand-back removes it,
  take-over re-badges it) — no full page reload.
- Empty state is deliberately quiet: "Хүлээгдэж байгаа яриа байхгүй".

**Insights strip, below the stat cards.** Server-rendered from
`getInsightsSummary(30)`: needs-human rate, top three intents, language mix, and
FAQ gaps. Each gap links to `/admin/bot/faqs/new?q=<question>` so the page opens
pre-filled — the workflow the contract itself suggests ("review → click 'Add to
FAQ' in your admin → POST the new question to /faqs"). The new-FAQ form reads
the `q` param as the Mongolian question's default value.

### 6. Bot config page

`commentToDmEnabled` is already fetched by `getBot()` but rendered nowhere. Add
it as a read-only badge on `/admin/bot/config`, with a one-line note that
enabling it is an operator action and cannot be done through the API. Staff
otherwise have no way to tell why comment→DM is inactive.

### 7. Error handling — the dashboard never breaks

Dentexgo is a third party on the critical path of the clinic's home screen, so
every call is wrapped and each section degrades on its own:

| Condition | Behaviour |
| --- | --- |
| `CLINIC_NOT_CONFIGURED` / no shared secret | hide the queue and insights entirely — not an error the clinic can act on |
| `NO_AI_MODULE` | show a muted "AI модуль активгүй" note in place of insights |
| any other error, or a timeout | small "Dentexgo-той холбогдож чадсангүй" notice with a retry, scoped to that section |
| a poll fails | keep the rows already on screen; never blank the list |
| `messenger_thread_id` is `null` | no button; channel badge plus copyable PSID |

Booking stats and the rest of the dashboard render regardless of Dentexgo's
state.

## Contract gaps to raise with the platform team

Neither blocks this work:

1. **`GET /conversations/export` is undocumented.** Referenced three times but
   has no section, so its parameters and response shape are unknown.
2. **`400 INVALID_QUERY` is missing from the errors reference table** though
   `GET /conversations` can return it. Our code branches on `code` generically,
   so it degrades to the generic-error path.

## Verification

`npm run lint` and `npm run build` must pass. There is no test suite, so
behaviour is verified by exercising the admin dashboard against a live Dentexgo
instance:

- with a valid secret and at least one escalated conversation: the row appears,
  the Messenger button opens the correct thread, "Би хариулна" sets the paused
  badge, "Бот руу буцаах" removes the row;
- with `DENTEXGO_SHARED_SECRET` unset: both sections are absent and the booking
  stats still render;
- with an unreachable API base URL: each section shows its retry notice and the
  page is otherwise intact.
