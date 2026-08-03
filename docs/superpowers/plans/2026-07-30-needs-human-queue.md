# Needs-Human Queue + Bot Insights Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface Dentexgo's needs-human conversation queue on `/admin` with a one-click jump into the Messenger thread and take-over / hand-back controls, plus a bot-insights strip.

**Architecture:** Three new read-only client modules wrap Dentexgo endpoints we don't call yet (`conversations`, `insights`) plus a pure URL helper. Three admin-gated server actions sit between them and one polling client component that renders above the dashboard's stat cards. Every Dentexgo call is wrapped so a third-party outage degrades one section instead of breaking the clinic's home screen.

**Tech Stack:** Next.js 16 App Router (server components + server actions), React 19, TypeScript, Tailwind v4, `sonner` for toasts. No new dependencies.

**Spec:** [docs/superpowers/specs/2026-07-30-needs-human-queue-design.md](../specs/2026-07-30-needs-human-queue-design.md)
**Contract:** [docs/dentexgo-admin-api-contract.md](../../dentexgo-admin-api-contract.md)

## Global Constraints

- **No test runner exists in this repo.** `package.json` has `dev`, `build`, `start`, `lint` — no test script, no vitest/jest. Do **not** add one as part of this plan; the spec fixes verification as `npm run lint` + `npm run build` plus a described manual check. Every task below ends with `npx tsc --noEmit` and `npm run lint`, and the two client modules are additionally verified against the live API with `curl` (a real check that the contract's field names exist).
- **Every mutating or data-reading server action starts with `assertAdmin()`** from `@/lib/auth`, returning its error string rather than throwing. This is the established pattern across `src/lib/actions/*` — see `src/lib/actions/services.ts`.
- **Server-only modules** (`src/lib/dentexgo/*`, `src/lib/messenger/link.ts`) must not be imported by client components except for `import type`. `client.ts` already carries `import "server-only"`.
- **Admin UI copy is Mongolian.** The admin panel is single-language; no i18n dictionary lookups.
- `/insights/summary` is the **only** insights endpoint to implement. Do not add `intents`, `languages`, `needs-human-rate`, `faq-gaps` or `usage` as separate calls — `summary` returns all of them.
- **No `fb-messenger://` or `messenger.com/t/` links.** A PSID is not a thread id; those URLs do not resolve. The only working destination is `messenger_deep_link` (Meta Business Suite, web).
- Tailwind colour tokens in use on admin pages: `#0f172a` (ink), `#6b7280` (muted), `#9ca3af` (muted-2), `border-line`, `text-danger`, `bg-danger/10`. Match them; don't introduce new hex values.
- Commit after each task with a `feat:` / `refactor:` prefixed message.

## File Structure

| File | Responsibility |
| --- | --- |
| `src/lib/dentexgo/client.ts` | **Modify**: export `apiFetch` so sibling modules reuse auth + error mapping. Everything else unchanged. |
| `src/lib/dentexgo/conversations.ts` | **Create**: conversation types + `listConversations`, `getConversation`, `patchConversation`. |
| `src/lib/dentexgo/insights.ts` | **Create**: insights types + `getInsightsSummary`. |
| `src/lib/messenger/link.ts` | **Create**: pure `threadUrl()` — prefers an env template over the server-provided deep link. |
| `src/lib/actions/dentexgo-conversations.ts` | **Create**: `fetchNeedsHumanAction`, `takeOverAction`, `handBackAction`. |
| `src/lib/queries/dentexgo-dashboard.ts` | **Create**: server-side loader that fetches the queue + insights for first paint and classifies failures. Keeps `admin/page.tsx` from growing a third concern. |
| `src/components/admin/NeedsHumanQueue.tsx` | **Create**: polling client component — the queue UI and its two actions. |
| `src/components/admin/BotInsightsStrip.tsx` | **Create**: server component rendering the insights summary. |
| `src/app/(admin)/admin/page.tsx` | **Modify**: mount both sections around the existing stat cards. |
| `src/app/(admin)/admin/bot/config/page.tsx` | **Modify**: read-only comment→DM badge. |
| `.env.example` | **Modify**: document the two optional link-override vars. |

Note on `src/lib/queries/dentexgo-dashboard.ts`: the spec described the dashboard fetching data directly. `admin/page.tsx` is already 241 lines and would otherwise gain two `Promise.allSettled` blocks plus error classification. Extracting the loader keeps the page a layout concern and matches how `src/lib/queries/admin.ts` already serves it.

---

### Task 1: Conversations client module

**Files:**
- Modify: `src/lib/dentexgo/client.ts:97` (export `apiFetch`)
- Create: `src/lib/dentexgo/conversations.ts`

**Interfaces:**
- Consumes: `apiFetch`, `DentexgoError` from `./client`.
- Produces: `ConversationChannel`, `DentexgoConversation`, `ConversationPatch`, `listConversations(opts)`, `getConversation(idOrPsid)`, `patchConversation(idOrPsid, patch)`.

- [ ] **Step 1: Export `apiFetch` from the shared client**

In `src/lib/dentexgo/client.ts`, change the declaration on line 97 from:

```ts
async function apiFetch<T>(
```

to:

```ts
/** Shared by the sibling domain modules (conversations.ts, insights.ts). */
export async function apiFetch<T>(
```

Change nothing else in the file.

- [ ] **Step 2: Create the conversations module**

Create `src/lib/dentexgo/conversations.ts`:

```ts
import "server-only";
import { apiFetch } from "./client";

// ---------- Types (mirrors the response-field table in
// docs/dentexgo-admin-api-contract.md § Conversation bot controls) ----------

export type ConversationChannel = "messenger" | "instagram";

export interface DentexgoConversation {
  /** Opaque internal conversation id. Accepted by GET/PATCH /conversations/{id}. */
  id: string;
  /** Meta Page-Scoped ID. Also accepted as {id} — resolves to the newest thread. */
  psid: string;
  channel: ConversationChannel;
  /**
   * Recipient's name from Meta. The contract types this `string`, but Meta does
   * not always supply one, so callers must handle absence.
   */
  patient_name: string | null;
  needs_human: boolean;
  needs_human_at: string | null;
  bot_paused_until: string | null;
  bot_paused_active: boolean;
  last_message_at: string;
  /**
   * Meta Graph thread id (`t_…`). Documented as stable and API-supported.
   * `null` for Instagram, or until the bot first escalates the thread.
   */
  messenger_thread_id: string | null;
  /**
   * One-click Meta Business Suite URL. The contract flags this as an
   * UNOFFICIAL url Meta may reshape without notice — see lib/messenger/link.ts
   * for the override path.
   */
  messenger_deep_link: string | null;
}

export interface ConversationPatch {
  /** `false` hands the thread back to the bot; `true` escalates it. */
  needs_human?: boolean;
  /** Hours to keep the bot quiet, or `null` to resume immediately. */
  pause_bot_hours?: number | null;
}

// ---------- Endpoints ----------

/**
 * The needs-human queue. With `needsHuman: true` the API returns escalated
 * conversations OLDEST ESCALATION FIRST — the longest-waiting patient is at
 * index 0, so callers should preserve this order rather than re-sorting.
 */
export async function listConversations(
  opts: { needsHuman?: boolean; limit?: number } = {},
): Promise<DentexgoConversation[]> {
  const data = await apiFetch<{
    conversations: DentexgoConversation[];
    count: number;
  }>("/conversations", {
    searchParams: {
      needs_human:
        opts.needsHuman === undefined ? undefined : String(opts.needsHuman),
      limit: opts.limit,
    },
  });
  return data.conversations ?? [];
}

/** `idOrPsid` accepts either our conversation UUID or the Messenger PSID. */
export async function getConversation(
  idOrPsid: string,
): Promise<DentexgoConversation> {
  const data = await apiFetch<{ conversation: DentexgoConversation }>(
    `/conversations/${encodeURIComponent(idOrPsid)}`,
  );
  return data.conversation;
}

export async function patchConversation(
  idOrPsid: string,
  patch: ConversationPatch,
): Promise<DentexgoConversation> {
  const data = await apiFetch<{ conversation: DentexgoConversation }>(
    `/conversations/${encodeURIComponent(idOrPsid)}`,
    { method: "PATCH", body: JSON.stringify(patch) },
  );
  return data.conversation;
}
```

`apiFetch`'s `searchParams` helper already drops `undefined` and empty values, so omitting `needs_human` yields the contract's "all conversations" behaviour.

- [ ] **Step 3: Verify the contract's field names against the live API**

This is the real check that the shapes above match production. Run:

```bash
set -a; . ./.env; set +a
curl -s -H "Authorization: Bearer $DENTEXGO_SHARED_SECRET" \
  "${DENTEXGO_API_BASE_URL:-https://dentexgo.mn}/api/v1/clinics/${CLINIC_SLUG:-dentaris}/conversations?limit=3" \
  | head -60
```

Expected: a JSON body with `conversations` and `count`. Confirm each key in
`DentexgoConversation` appears on a returned row, in particular
`messenger_thread_id` and `messenger_deep_link`.

If the response is `{"error":...,"code":"CLINIC_NOT_CONFIGURED"}` or the queue is
empty, note it and continue — the types come from the contract, and Task 5's
manual check exercises them again with real rows.

- [ ] **Step 4: Type-check and lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: `tsc` prints nothing. `npm run lint` reports no **new** problems — the
repo has 7 pre-existing errors (in `admin/login/page.tsx`, `PaymentPoller.tsx`,
`SlotPicker.tsx`) and 5 warnings. Your files must add none.

- [ ] **Step 5: Commit**

```bash
git add src/lib/dentexgo/client.ts src/lib/dentexgo/conversations.ts
git commit -m "feat: add Dentexgo conversations client module"
```

---

### Task 2: Insights client module

**Files:**
- Create: `src/lib/dentexgo/insights.ts`

**Interfaces:**
- Consumes: `apiFetch` from `./client` (exported in Task 1).
- Produces: `IntentCount`, `LanguageCount`, `NeedsHumanRate`, `FaqGap`, `UsageDay`, `InsightsSummary`, `getInsightsSummary(days?)`, `INTENT_LABELS_MN`.

- [ ] **Step 1: Create the insights module**

Create `src/lib/dentexgo/insights.ts`:

```ts
import "server-only";
import { apiFetch } from "./client";

// ---------- Types (mirrors docs/dentexgo-admin-api-contract.md § Insights) ----------

export interface IntentCount {
  intent: string;
  count: number;
}

export interface LanguageCount {
  /** "mn", "en", or "mn-Latn" (romanized Mongolian). */
  locale: string;
  count: number;
}

export interface NeedsHumanRate {
  needsHuman: number;
  total: number;
  /** needsHuman / total, clamped to 0..1. */
  rate: number;
}

export interface FaqGap {
  conversationId: string;
  text: string;
  locale: string;
  classifiedAt: string;
}

export interface UsageDay {
  day: string;
  inbound_count: number;
  bot_out_count: number;
  admin_out_count: number;
  tokens_in: number;
  tokens_out: number;
  est_cost_usd: number;
  /** null when there were no replies that day. */
  latency_p50_ms: number | null;
  latency_p95_ms: number | null;
}

export interface InsightsSummary {
  days: number;
  intents: IntentCount[];
  languages: LanguageCount[];
  needsHumanRate: NeedsHumanRate;
  faqGaps: FaqGap[];
  usage: UsageDay[];
}

/**
 * Mongolian labels for the contract's closed set of intent values. Unknown
 * intents fall through to the raw value so a new label added upstream still
 * renders rather than disappearing.
 */
export const INTENT_LABELS_MN: Record<string, string> = {
  service_inquiry: "Үйлчилгээний асуулт",
  price_question: "Үнийн асуулт",
  hours_location: "Цаг/хаяг",
  book: "Цаг захиалга",
  insurance: "Даатгал",
  complaint: "Гомдол",
  staff_question: "Эмчийн талаар",
  small_talk: "Энгийн яриа",
  unclear: "Тодорхойгүй",
  other: "Бусад",
};

// ---------- Endpoints ----------

/**
 * Every insight in one round-trip. The contract offers this specifically for
 * clinic-admin dashboards; the five per-dimension endpoints return the same
 * payloads and are intentionally not wrapped.
 *
 * `days` defaults to 30 upstream; max 365.
 */
export async function getInsightsSummary(
  days = 30,
): Promise<InsightsSummary> {
  return apiFetch<InsightsSummary>("/insights/summary", {
    searchParams: { days },
  });
}
```

- [ ] **Step 2: Verify against the live API**

```bash
set -a; . ./.env; set +a
curl -s -H "Authorization: Bearer $DENTEXGO_SHARED_SECRET" \
  "${DENTEXGO_API_BASE_URL:-https://dentexgo.mn}/api/v1/clinics/${CLINIC_SLUG:-dentaris}/insights/summary?days=30" \
  | head -40
```

Expected: JSON with `days`, `intents`, `languages`, `needsHumanRate`, `faqGaps`,
`usage`. A `409 NO_AI_MODULE` response is also a valid outcome — it means the
clinic has no `ai_chatbot` module, which Task 6 renders as a muted note. Record
which you got.

- [ ] **Step 3: Type-check and lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: no output from `tsc`; no new lint problems.

- [ ] **Step 4: Commit**

```bash
git add src/lib/dentexgo/insights.ts
git commit -m "feat: add Dentexgo insights client module"
```

---

### Task 3: Messenger thread-link helper

**Files:**
- Create: `src/lib/messenger/link.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `DentexgoConversation` from `@/lib/dentexgo/conversations` (type-only).
- Produces: `threadUrl(conversation)` returning `string | null`.

- [ ] **Step 1: Create the link helper**

Create `src/lib/messenger/link.ts`:

```ts
import type { DentexgoConversation } from "@/lib/dentexgo/conversations";

/**
 * Resolve the URL that opens a conversation for a staff member.
 *
 * Dentexgo does the hard part: it maps the PSID to a Meta Graph thread id
 * (`t_…`) server-side and hands us both that id and a ready-made
 * `messenger_deep_link` into Meta Business Suite. We hold no Page Access Token
 * and make no Graph calls.
 *
 * The contract flags `messenger_deep_link` as an UNOFFICIAL url — Meta may
 * change its shape without notice — and recommends building your own from
 * `messenger_thread_id` for long-term stability. Hence the template override:
 * when Meta breaks the shape, the fix is an env change, not a deploy.
 *
 * There is no mobile-app deep link. Per the contract the URL opens Meta
 * Business Suite on the web; a phone may hand it to the Business Suite app via
 * universal links, but that is not guaranteed and must not be promised in the
 * UI. A PSID is NOT a thread id, so `fb-messenger://` and `messenger.com/t/`
 * variants would not resolve and are deliberately absent.
 */
export function threadUrl(
  conversation: Pick<
    DentexgoConversation,
    "messenger_thread_id" | "messenger_deep_link"
  >,
): string | null {
  const threadId = conversation.messenger_thread_id;
  if (!threadId) return null;

  const template = process.env.MESSENGER_DEEP_LINK_TEMPLATE;
  if (template) {
    return template
      .replaceAll("{threadId}", encodeURIComponent(threadId))
      .replaceAll("{pageId}", encodeURIComponent(process.env.FACEBOOK_PAGE_ID ?? ""));
  }

  return conversation.messenger_deep_link;
}
```

Expected behaviour, to confirm by reading and again in Task 5's manual check:

| `messenger_thread_id` | `MESSENGER_DEEP_LINK_TEMPLATE` | Result |
| --- | --- | --- |
| `null` | anything | `null` (Instagram, or not yet escalated) |
| `t_123` | unset | the server's `messenger_deep_link` verbatim |
| `t_123` | `https://x/i?p={pageId}&t={threadId}` | `https://x/i?p=<FACEBOOK_PAGE_ID>&t=t_123` |
| `t_123` | set, `FACEBOOK_PAGE_ID` unset | same, with an empty `p=` — degraded but not a crash |

- [ ] **Step 2: Document the env vars**

In `.env.example`, immediately after the `QPAY_CALLBACK_TOKEN=` line, add:

```
# ---------------------------------------------------------------------------
# Messenger thread links for the admin needs-human queue.
#
# Dentexgo already returns a ready-made `messenger_deep_link` per conversation,
# so BOTH of these are optional and neither is a credential. Set them only if
# Meta changes the Business Suite URL shape and the built-in link stops
# working — then the fix is an env change instead of a deploy.
#
# Template placeholders: {threadId} (Meta Graph thread id, "t_…") and {pageId}.
MESSENGER_DEEP_LINK_TEMPLATE=
# Numeric Facebook Page ID. Only used to fill {pageId} in the template above.
FACEBOOK_PAGE_ID=
```

- [ ] **Step 3: Type-check and lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: no output from `tsc`; no new lint problems.

- [ ] **Step 4: Commit**

```bash
git add src/lib/messenger/link.ts .env.example
git commit -m "feat: add Messenger thread-link helper with env override"
```

---

### Task 4: Server actions

**Files:**
- Create: `src/lib/actions/dentexgo-conversations.ts`

**Interfaces:**
- Consumes: `assertAdmin` from `@/lib/auth`; `listConversations`, `patchConversation`, `DentexgoConversation` from `@/lib/dentexgo/conversations`; `DentexgoError`, `isConfigured` from `@/lib/dentexgo/client`; `threadUrl` from `@/lib/messenger/link`.
- Produces: `QueueResult`, `ConversationActionResult`, `fetchNeedsHumanAction()`, `takeOverAction(id)`, `handBackAction(id)`.

**Critical constraint:** a `"use server"` module may only export **async
functions**. `TAKE_OVER_HOURS` is therefore a module-private const, and the
number reaches the UI through the action's return value (`pausedHours`) rather
than an imported constant.

- [ ] **Step 1: Create the actions module**

Create `src/lib/actions/dentexgo-conversations.ts`:

```ts
"use server";

import { assertAdmin } from "@/lib/auth";
import { DentexgoError, isConfigured } from "@/lib/dentexgo/client";
import {
  listConversations,
  patchConversation,
  type DentexgoConversation,
} from "@/lib/dentexgo/conversations";
import { threadUrl } from "@/lib/messenger/link";

/**
 * Hours to silence the bot when staff take a conversation over. Matches the
 * "take over" example in the API contract.
 *
 * NOT exported: a "use server" module may only export async functions. The
 * value reaches the UI via takeOverAction's `pausedHours`.
 */
const TAKE_OVER_HOURS = 12;

export type QueueResult =
  | {
      ok: true;
      conversations: DentexgoConversation[];
      /**
       * Resolved thread URLs by conversation id. Built here because threadUrl()
       * reads env vars the browser can't see — otherwise a poll would replace
       * env-templated links with the raw server-provided ones.
       */
      threadUrls: Record<string, string>;
    }
  | { ok: false; error: string; code?: string };

export type ConversationActionResult =
  | { ok: true; conversation: DentexgoConversation; pausedHours?: number }
  | { ok: false; error: string };

/** Turn any thrown value into a Mongolian message plus the machine code, so
 * callers can branch on `code` without parsing prose. */
function describe(e: unknown): { error: string; code?: string } {
  if (e instanceof DentexgoError) {
    if (e.code === "CLINIC_NOT_CONFIGURED") {
      return { error: "Dentexgo тохиргоо ороогүй байна.", code: e.code };
    }
    if (e.code === "NO_AI_MODULE") {
      return { error: "AI модуль активгүй байна.", code: e.code };
    }
    return { error: `${e.code}: ${e.message}`, code: e.code };
  }
  return {
    error: "Dentexgo-той холбогдож чадсангүй.",
    code: "NETWORK_ERROR",
  };
}

/**
 * The needs-human queue. Polled every 30s by NeedsHumanQueue — a server action
 * rather than a route handler so the Bearer secret stays server-side and no new
 * endpoint needs its own auth gate.
 *
 * Rows come back oldest-escalation-first from the API; the order is preserved.
 */
export async function fetchNeedsHumanAction(): Promise<QueueResult> {
  const authErr = await assertAdmin();
  if (authErr) return { ok: false, error: authErr, code: "FORBIDDEN" };
  if (!isConfigured()) {
    return {
      ok: false,
      error: "Dentexgo тохиргоо ороогүй байна.",
      code: "CLINIC_NOT_CONFIGURED",
    };
  }
  try {
    const conversations = await listConversations({
      needsHuman: true,
      limit: 100,
    });
    const threadUrls: Record<string, string> = {};
    for (const c of conversations) {
      const url = threadUrl(c);
      if (url) threadUrls[c.id] = url;
    }
    return { ok: true, conversations, threadUrls };
  } catch (e) {
    console.error("[fetchNeedsHumanAction]", e);
    return { ok: false, ...describe(e) };
  }
}

/** Staff will reply themselves — keep the bot quiet for TAKE_OVER_HOURS. */
export async function takeOverAction(
  id: string,
): Promise<ConversationActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return { ok: false, error: authErr };
  if (!id) return { ok: false, error: "ID байхгүй байна." };
  try {
    const conversation = await patchConversation(id, {
      pause_bot_hours: TAKE_OVER_HOURS,
    });
    return { ok: true, conversation, pausedHours: TAKE_OVER_HOURS };
  } catch (e) {
    console.error("[takeOverAction]", e);
    return { ok: false, error: describe(e).error };
  }
}

/** Hand the thread back to the bot, clearing BOTH guards in one PATCH as the
 * contract prescribes. */
export async function handBackAction(
  id: string,
): Promise<ConversationActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return { ok: false, error: authErr };
  if (!id) return { ok: false, error: "ID байхгүй байна." };
  try {
    const conversation = await patchConversation(id, {
      needs_human: false,
      pause_bot_hours: null,
    });
    return { ok: true, conversation };
  } catch (e) {
    console.error("[handBackAction]", e);
    return { ok: false, error: describe(e).error };
  }
}
```

- [ ] **Step 2: Type-check and lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: no output from `tsc`; no new lint problems.

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/dentexgo-conversations.ts
git commit -m "feat: add admin-gated Dentexgo conversation actions"
```

---

### Task 5: Needs-human queue on the dashboard

**Files:**
- Create: `src/lib/queries/dentexgo-dashboard.ts`
- Create: `src/components/admin/NeedsHumanQueue.tsx`
- Modify: `src/app/(admin)/admin/page.tsx`

**Interfaces:**
- Consumes: `listConversations`, `DentexgoConversation`; `getInsightsSummary`, `InsightsSummary`; `DentexgoError`, `isConfigured`; `threadUrl`; `fetchNeedsHumanAction`, `takeOverAction`, `handBackAction`, `ConversationActionResult` (type-only).
- Produces: `BotSectionError`, `BotDashboardData`, `loadBotDashboardData()`; the `<NeedsHumanQueue>` component with props `initialConversations`, `initialError`, `initialThreadUrls`, `serverNow`.

- [ ] **Step 1: Create the server-side loader**

Create `src/lib/queries/dentexgo-dashboard.ts`:

```ts
import "server-only";
import { DentexgoError, isConfigured } from "@/lib/dentexgo/client";
import {
  listConversations,
  type DentexgoConversation,
} from "@/lib/dentexgo/conversations";
import {
  getInsightsSummary,
  type InsightsSummary,
} from "@/lib/dentexgo/insights";

export type BotSectionError = {
  message: string;
  code: string;
};

export type BotDashboardData = {
  /** false → the clinic has no Dentexgo secret; hide both sections entirely. */
  configured: boolean;
  queue: DentexgoConversation[];
  queueError: BotSectionError | null;
  insights: InsightsSummary | null;
  insightsError: BotSectionError | null;
};

function toSectionError(e: unknown): BotSectionError {
  if (e instanceof DentexgoError) {
    if (e.code === "NO_AI_MODULE") {
      return { message: "AI модуль активгүй байна.", code: e.code };
    }
    return { message: `${e.code}: ${e.message}`, code: e.code };
  }
  return {
    message: "Dentexgo-той холбогдож чадсангүй.",
    code: "NETWORK_ERROR",
  };
}

/**
 * First-paint data for the dashboard's bot sections. Both calls are settled
 * independently: Dentexgo sits on the critical path of the clinic's home
 * screen, so one failing section must never take the other — or the booking
 * stats — down with it.
 */
export async function loadBotDashboardData(): Promise<BotDashboardData> {
  if (!isConfigured()) {
    return {
      configured: false,
      queue: [],
      queueError: null,
      insights: null,
      insightsError: null,
    };
  }

  const [queueRes, insightsRes] = await Promise.allSettled([
    listConversations({ needsHuman: true, limit: 100 }),
    getInsightsSummary(30),
  ]);

  if (queueRes.status === "rejected") {
    console.error("[loadBotDashboardData] queue failed:", queueRes.reason);
  }
  if (insightsRes.status === "rejected") {
    console.error("[loadBotDashboardData] insights failed:", insightsRes.reason);
  }

  return {
    configured: true,
    queue: queueRes.status === "fulfilled" ? queueRes.value : [],
    queueError:
      queueRes.status === "rejected" ? toSectionError(queueRes.reason) : null,
    insights: insightsRes.status === "fulfilled" ? insightsRes.value : null,
    insightsError:
      insightsRes.status === "rejected"
        ? toSectionError(insightsRes.reason)
        : null,
  };
}
```

- [ ] **Step 2: Create the queue component**

Create `src/components/admin/NeedsHumanQueue.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchNeedsHumanAction,
  handBackAction,
  takeOverAction,
  type ConversationActionResult,
} from "@/lib/actions/dentexgo-conversations";
import type { DentexgoConversation } from "@/lib/dentexgo/conversations";

const POLL_MS = 30_000;

/**
 * How long this patient has been waiting. An escalation auto-returns to the bot
 * after 30 minutes unhandled, so the elapsed time is the whole point of the row.
 */
function waitingLabel(since: string | null, now: number): string {
  if (!since) return "";
  const mins = Math.max(0, Math.floor((now - new Date(since).getTime()) / 60_000));
  if (mins < 1) return "дөнгөж сая";
  if (mins < 60) return `${mins} минут хүлээж байна`;
  const hours = Math.floor(mins / 60);
  return `${hours} цаг ${mins % 60} минут хүлээж байна`;
}

function timeLabel(ts: number): string {
  return new Date(ts).toLocaleTimeString("mn-MN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function copyToClipboard(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} хуулагдлаа`);
  } catch {
    toast.error("Хуулж чадсангүй");
  }
}

export function NeedsHumanQueue({
  initialConversations,
  initialError,
  /** Resolved server-side: threadUrl() reads env, which the browser can't. */
  initialThreadUrls,
  /**
   * The server's clock at render time. Passed in rather than read with
   * Date.now() during render, which the repo's react-hooks/purity rule rejects.
   */
  serverNow,
}: {
  initialConversations: DentexgoConversation[];
  initialError: string | null;
  initialThreadUrls: Record<string, string>;
  serverNow: number;
}) {
  const [rows, setRows] = useState(initialConversations);
  const [threadUrls, setThreadUrls] = useState(initialThreadUrls);
  const [error, setError] = useState(initialError);
  const [now, setNow] = useState(serverNow);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const res = await fetchNeedsHumanAction();
    setRefreshing(false);
    // Inside a callback, not render — Date.now() is fine here.
    setNow(Date.now());
    if (!res.ok) {
      // Keep whatever is on screen — a failed poll must never blank the queue.
      setError(res.error);
      return;
    }
    setError(null);
    setRows(res.conversations);
    setThreadUrls(res.threadUrls);
    setLastSync(Date.now());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  async function run(
    id: string,
    fn: (id: string) => Promise<ConversationActionResult>,
  ): Promise<ConversationActionResult> {
    setBusyId(id);
    const res = await fn(id);
    setBusyId(null);
    if (!res.ok) toast.error(res.error);
    return res;
  }

  function handleTakeOver(id: string) {
    void run(id, takeOverAction).then((res) => {
      if (!res.ok) return;
      setRows((prev) => prev.map((r) => (r.id === id ? res.conversation : r)));
      toast.success(`Бот ${res.pausedHours ?? 12} цаг чимээгүй болно.`);
    });
  }

  function handleHandBack(id: string) {
    void run(id, handBackAction).then((res) => {
      if (!res.ok) return;
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("Бот руу буцаагдлаа.");
    });
  }

  return (
    <section className="rounded-[16px] bg-white p-5 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.15)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="font-display text-[15px] font-extrabold text-[#0f172a]">
            Хүн шаардсан яриа
          </h2>
          {rows.length > 0 && (
            <span className="inline-flex min-w-[22px] justify-center rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-bold text-danger">
              {rows.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastSync && (
            <span className="text-[10px] text-[#9ca3af]">
              {timeLabel(lastSync)}-д шинэчилсэн
            </span>
          )}
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            className="text-[11px] font-bold text-[#0c7b6e] hover:underline disabled:opacity-50"
          >
            {refreshing ? "Шинэчилж байна…" : "Шинэчлэх"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-[11px] text-danger">
          {error}
        </p>
      )}

      {rows.length === 0 && !error && (
        <p className="mt-4 text-[12px] text-[#9ca3af]">
          Хүлээгдэж байгаа яриа байхгүй.
        </p>
      )}

      <ul className="mt-3 space-y-2.5">
        {rows.map((c) => {
          const url = threadUrls[c.id];
          const busy = busyId === c.id;
          return (
            <li
              key={c.id}
              className="rounded-[14px] border border-line px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[13px] font-bold text-[#0f172a]">
                      {c.patient_name || c.psid}
                    </p>
                    <span className="rounded-full bg-[#f3f4f6] px-2 py-0.5 text-[10px] font-semibold text-[#6b7280]">
                      {c.channel === "instagram" ? "Instagram" : "Messenger"}
                    </span>
                    {c.bot_paused_active && (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                        Ажилтан хариулж байна
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-[#6b7280]">
                    {waitingLabel(c.needs_human_at, now)}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {c.messenger_thread_id && (
                      <button
                        type="button"
                        onClick={() =>
                          void copyToClipboard(
                            c.messenger_thread_id!,
                            "Thread ID",
                          )
                        }
                        className="text-[10px] text-[#9ca3af] hover:text-[#6b7280] hover:underline"
                      >
                        Thread ID хуулах
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void copyToClipboard(c.psid, "PSID")}
                      className="text-[10px] text-[#9ca3af] hover:text-[#6b7280] hover:underline"
                    >
                      PSID хуулах
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full bg-[#0f172a] px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-[#1e293b]"
                    >
                      Messenger дээр хариулах
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleTakeOver(c.id)}
                    disabled={busy || c.bot_paused_active}
                    className="inline-flex items-center rounded-full bg-[#f3f4f6] px-3 py-1.5 text-[11px] font-bold text-[#0f172a] transition-colors hover:bg-[#e5e7eb] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Би хариулна
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHandBack(c.id)}
                    disabled={busy}
                    className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-bold text-[#6b7280] transition-colors hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Бот руу буцаах
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
```

- [ ] **Step 3: Mount the queue on the dashboard**

In `src/app/(admin)/admin/page.tsx`, add these imports below the existing
`import { getAdminBookingStats } from "@/lib/queries/admin";`:

```ts
import { loadBotDashboardData } from "@/lib/queries/dentexgo-dashboard";
import { threadUrl } from "@/lib/messenger/link";
import { NeedsHumanQueue } from "@/components/admin/NeedsHumanQueue";
```

Inside `AdminDashboardPage`, directly after the existing `try { stats = await
getAdminBookingStats(); } catch { … }` block, add:

```ts
  const bot = await loadBotDashboardData();
  // threadUrl() reads env vars, so the URL has to be resolved on the server and
  // handed to the client component as data.
  const threadUrls: Record<string, string> = {};
  for (const c of bot.queue) {
    const url = threadUrl(c);
    if (url) threadUrls[c.id] = url;
  }
  // Baseline for the "waiting N minutes" labels. Read here, not in the client
  // component's render, which react-hooks/purity forbids — the same reason
  // src/app/(public)/[lang]/account/page.tsx carries this disable comment.
  // eslint-disable-next-line react-hooks/purity
  const serverNow = Date.now();
```

Then, in the returned JSX, insert the queue **between** the greeting `</section>`
and the `{/* Stats */}` comment — a waiting patient outranks the booking
counters:

```tsx
        {bot.configured && (
          <NeedsHumanQueue
            initialConversations={bot.queue}
            initialError={bot.queueError?.message ?? null}
            initialThreadUrls={threadUrls}
            serverNow={serverNow}
          />
        )}
```

- [ ] **Step 4: Type-check, lint, and build**

```bash
npx tsc --noEmit && npm run lint && npm run build
```

Expected: `tsc` silent; no new lint problems; build completes with `/admin`
listed as a dynamic (`ƒ`) route.

- [ ] **Step 5: Manual verification**

Start the dev server with `npm run dev` and open `http://localhost:3001/admin`.
Check each of these:

1. **With `DENTEXGO_SHARED_SECRET` set and at least one escalated conversation:**
   the queue renders above the stat cards, longest-waiting row first, showing the
   patient name (or PSID), a Messenger badge, and a waiting time.
2. **"Messenger дээр хариулах"** opens Meta Business Suite on the correct thread
   in a new tab.
3. **"Би хариулна"** shows the "Ажилтан хариулж байна" badge and disables itself.
4. **"Бот руу буцаах"** removes the row and toasts.
5. **Copy buttons** put the thread id / PSID on the clipboard.
6. **Empty queue:** the quiet "Хүлээгдэж байгаа яриа байхгүй." line, not an error.
7. **Comment out `DENTEXGO_SHARED_SECRET` in `.env` and restart:** the section is
   absent and the booking stats still render. Restore the value afterwards.
8. **Set `DENTEXGO_API_BASE_URL=http://localhost:9999` and restart:** the section
   shows "Dentexgo-той холбогдож чадсангүй." and the rest of the page is intact.
   Restore the value afterwards.

- [ ] **Step 6: Commit**

```bash
git add src/lib/queries/dentexgo-dashboard.ts \
        src/components/admin/NeedsHumanQueue.tsx \
        "src/app/(admin)/admin/page.tsx"
git commit -m "feat: show needs-human queue on the admin dashboard"
```

---

### Task 6: Bot insights strip

**Files:**
- Create: `src/components/admin/BotInsightsStrip.tsx`
- Modify: `src/app/(admin)/admin/page.tsx`

**Interfaces:**
- Consumes: `InsightsSummary`, `INTENT_LABELS_MN` from `@/lib/dentexgo/insights`; `BotSectionError` from `@/lib/queries/dentexgo-dashboard`.
- Produces: the `<BotInsightsStrip>` server component.

- [ ] **Step 1: Create the strip**

Create `src/components/admin/BotInsightsStrip.tsx`:

```tsx
import Link from "next/link";
import {
  INTENT_LABELS_MN,
  type InsightsSummary,
} from "@/lib/dentexgo/insights";
import type { BotSectionError } from "@/lib/queries/dentexgo-dashboard";

const LOCALE_LABELS_MN: Record<string, string> = {
  mn: "Монгол",
  en: "Англи",
  "mn-Latn": "Монгол (латин)",
};

/**
 * Read-only rollup from GET /insights/summary. Server-rendered — insights move
 * slowly, so unlike the needs-human queue this needs no polling.
 */
export function BotInsightsStrip({
  insights,
  error,
}: {
  insights: InsightsSummary | null;
  error: BotSectionError | null;
}) {
  if (error) {
    return (
      <section className="rounded-[16px] bg-white p-5 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.15)]">
        <h2 className="font-display text-[15px] font-extrabold text-[#0f172a]">
          Ботын тойм
        </h2>
        <p className="mt-2 text-[11px] text-[#9ca3af]">{error.message}</p>
      </section>
    );
  }
  if (!insights) return null;

  const ratePct = Math.round((insights.needsHumanRate.rate ?? 0) * 100);
  const topIntents = insights.intents.slice(0, 3);
  const gaps = insights.faqGaps.slice(0, 3);

  return (
    <section className="rounded-[16px] bg-white p-5 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.15)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-[15px] font-extrabold text-[#0f172a]">
          Ботын тойм
        </h2>
        <span className="text-[10px] text-[#9ca3af]">
          Сүүлийн {insights.days} хоног
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {/* Needs-human rate */}
        <div>
          <p className="text-[11px] font-medium text-[#6b7280]">
            Хүн рүү шилжсэн
          </p>
          <p className="mt-1 font-display text-[22px] font-extrabold leading-none text-[#0f172a]">
            {ratePct}%
          </p>
          <p className="mt-1 text-[10px] text-[#9ca3af]">
            {insights.needsHumanRate.needsHuman} / {insights.needsHumanRate.total} яриа
          </p>
        </div>

        {/* Top intents */}
        <div>
          <p className="text-[11px] font-medium text-[#6b7280]">
            Хамгийн их асуусан
          </p>
          {topIntents.length === 0 ? (
            <p className="mt-1 text-[11px] text-[#9ca3af]">Мэдээлэл байхгүй</p>
          ) : (
            <ul className="mt-1.5 space-y-1">
              {topIntents.map((i) => (
                <li
                  key={i.intent}
                  className="flex items-baseline justify-between gap-2 text-[11px]"
                >
                  <span className="truncate text-[#374151]">
                    {INTENT_LABELS_MN[i.intent] ?? i.intent}
                  </span>
                  <span className="font-bold text-[#0f172a]">{i.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Languages */}
        <div>
          <p className="text-[11px] font-medium text-[#6b7280]">Хэл</p>
          {insights.languages.length === 0 ? (
            <p className="mt-1 text-[11px] text-[#9ca3af]">Мэдээлэл байхгүй</p>
          ) : (
            <ul className="mt-1.5 space-y-1">
              {insights.languages.map((l) => (
                <li
                  key={l.locale}
                  className="flex items-baseline justify-between gap-2 text-[11px]"
                >
                  <span className="truncate text-[#374151]">
                    {LOCALE_LABELS_MN[l.locale] ?? l.locale}
                  </span>
                  <span className="font-bold text-[#0f172a]">{l.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* FAQ gaps — questions the bot couldn't answer confidently */}
      {gaps.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-[11px] font-medium text-[#6b7280]">
            FAQ-д нэмэх санал
          </p>
          <ul className="mt-2 space-y-2">
            {gaps.map((g) => (
              <li
                key={g.conversationId + g.classifiedAt}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="min-w-0 flex-1 truncate text-[11px] text-[#374151]">
                  {g.text}
                </span>
                <Link
                  href={`/admin/bot/faqs/new?q=${encodeURIComponent(g.text)}${
                    g.locale === "en" ? "&locale=en" : ""
                  }`}
                  className="shrink-0 text-[10px] font-bold text-[#0c7b6e] hover:underline"
                >
                  FAQ болгох →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
```

The `?q=` / `?locale=` params are already handled by
`src/app/(admin)/admin/bot/faqs/new/page.tsx`, which forwards them into
`FaqForm`'s `prefillQMn` / `prefillQEn` props — no change needed there.

- [ ] **Step 2: Mount the strip below the stat cards**

In `src/app/(admin)/admin/page.tsx`, add the import:

```ts
import { BotInsightsStrip } from "@/components/admin/BotInsightsStrip";
```

In the JSX, insert immediately **after** the stats `</section>` (the one closing
the six `StatCard`s) and before `{/* Bottom quick links */}`:

```tsx
        {bot.configured && (
          <BotInsightsStrip
            insights={bot.insights}
            error={bot.insightsError}
          />
        )}
```

- [ ] **Step 3: Type-check, lint, and build**

```bash
npx tsc --noEmit && npm run lint && npm run build
```

Expected: `tsc` silent; no new lint problems; build succeeds.

- [ ] **Step 4: Manual verification**

With `npm run dev`, open `http://localhost:3001/admin`:

1. The strip appears under the six stat cards, showing a percentage, up to three
   intents with Mongolian labels, and the language mix.
2. If the clinic has no `ai_chatbot` module, the strip instead reads
   "AI модуль активгүй байна." and nothing else on the page is affected.
3. Clicking a **"FAQ болгох →"** link opens `/admin/bot/faqs/new` with the
   Mongolian question field pre-filled with that patient's question.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/BotInsightsStrip.tsx "src/app/(admin)/admin/page.tsx"
git commit -m "feat: add bot insights strip to the admin dashboard"
```

---

### Task 7: Comment→DM status badge

**Files:**
- Modify: `src/app/(admin)/admin/bot/config/page.tsx`

**Interfaces:**
- Consumes: `data.commentToDmEnabled` from the existing `getBot()` call on that page.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Render the badge**

`getBot()` already returns `commentToDmEnabled` and the page already holds it in
`data`, but nothing displays it — so staff have no way to tell why comment→DM is
inactive. In `src/app/(admin)/admin/bot/config/page.tsx`, inside the
`{data && !errorMessage && ( <> … </> )}` fragment, add this **above** the
existing persona-form `<div>`:

```tsx
            {/* Comment → DM status. Read-only by design: the contract gates
                enabling it behind a platform-operator step (subscribing the
                Facebook Page to feed events), so there is no API to flip it. */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-white p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] sm:px-8">
              <div>
                <p className="text-[13px] font-bold text-[#0f172a]">
                  Facebook постын коммент → хувийн зурвас
                </p>
                <p className="mt-0.5 text-[11px] text-[#6b7280]">
                  {data.commentToDmEnabled
                    ? "Коммент бичсэн хүнд бот автоматаар хувийн зурвас илгээнэ."
                    : "Одоогоор унтраалттай. Асаахын тулд Dentexgo-ийн операторт хандана уу — API-аар нээх боломжгүй."}
                </p>
              </div>
              <span
                className={
                  "shrink-0 rounded-full px-3 py-1 text-[11px] font-bold " +
                  (data.commentToDmEnabled
                    ? "bg-success/10 text-success"
                    : "bg-[#f3f4f6] text-[#6b7280]")
                }
              >
                {data.commentToDmEnabled ? "Актив" : "Унтраалттай"}
              </span>
            </div>
```

- [ ] **Step 2: Type-check, lint, and build**

```bash
npx tsc --noEmit && npm run lint && npm run build
```

Expected: `tsc` silent; no new lint problems; build succeeds.

- [ ] **Step 3: Manual verification**

Open `http://localhost:3001/admin/bot/config`. The card appears above the persona
form, showing "Унтраалттай" with the operator note (the contract states the flag
defaults to `false` for every clinic).

- [ ] **Step 4: Commit**

```bash
git add "src/app/(admin)/admin/bot/config/page.tsx"
git commit -m "feat: show comment-to-DM status on the bot config page"
```

---

## Deferred (not in this plan)

Tracked in the spec's out-of-scope section: AI Credits (`balance`, `topup`,
`topup/:invoiceId`, `transactions` — a full QPay invoice + polling flow),
`GET /conversations/export` transcripts, a sidebar unread badge, and a page for
non-escalated conversations.

Two contract gaps to raise with the Dentexgo platform team:

1. `GET /conversations/export` is referenced three times in the contract but has
   no section — parameters and response shape are undocumented.
2. `400 INVALID_QUERY` can be returned by `GET /conversations` but is missing
   from the Errors reference table. Our `describe()` helper handles it via the
   generic branch.
