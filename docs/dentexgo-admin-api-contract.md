# Dentexgo Public API — v1

> Audience: developers building the clinic's own web admin who want to manage FAQ rows and read bot insights without leaving their UI.
> Version: 1.0 (initial release).
> Stable until breaking changes. Breaking changes ship as `/api/v2/...` with a 30-day overlap.

This is the API **Dentexgo exposes to the clinic**, not the integration contract the clinic exposes to us (that lives in [integration-contract.md](integration-contract.md)).

## What this is

Most clinics already run a custom dental-clinic admin website. Rather than ask staff to context-switch into Dentexgo's `/dashboard/[slug]` UI, this REST API lets the clinic's own admin manage the FAQ knowledge base and pull bot-conversation insights directly.

16 endpoints. All return JSON. All require a Bearer token. CORS-enabled (wildcard origin).

## Base URL

```
https://dentexgo.mn/api/v1/clinics/<your-clinic-slug>
```

For local development against your own Dentexgo instance: `http://localhost:3000/api/v1/clinics/<slug>`.

## Authentication

Every request must include:

```
Authorization: Bearer <shared_secret>
```

Where `<shared_secret>` is the same per-clinic secret you use to authenticate Dentexgo's calls to your own `/api/dentexgo/*` endpoints (see [integration-contract.md](integration-contract.md)). One secret, two directions: clinic → Dentexgo (this API, Bearer) and Dentexgo → clinic (integration contract, Bearer).

### Rotating the secret

The platform operator rotates secrets from the Dentexgo operator console (`/operator/clinics/<slug>` → "rotate secret"). On rotation, the old secret is invalidated immediately and the new one is displayed once. Re-deploy your admin with the new value.

### Errors from auth

| HTTP | `code`                  | When                                                            |
| ---- | ----------------------- | --------------------------------------------------------------- |
| 401  | `UNAUTHENTICATED`       | Missing or malformed `Authorization` header                     |
| 401  | `INVALID_TOKEN`         | Bearer token doesn't match this clinic's shared secret          |
| 404  | `CLINIC_NOT_FOUND`      | Slug doesn't resolve to an active clinic                        |
| 409  | `CLINIC_NOT_CONFIGURED` | Clinic exists but has no shared secret (operator action needed) |

## Error response shape

Every non-2xx response has the same body:

```json
{
  "error": "Human-readable message.",
  "code": "MACHINE_CODE",
  "details": {
    /* optional, only for validation errors */
  }
}
```

Don't parse the `error` string for branching; use `code`. Codes are stable across versions.

## Endpoints

### `GET /whoami`

Probe. Confirms your token works and returns minimal clinic info.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://dentexgo.mn/api/v1/clinics/dentaris/whoami
```

```json
{
  "clinic": { "id": "uuid", "slug": "dentaris", "name": "Dentaris" },
  "apiVersion": "v1"
}
```

---

### FAQ management

#### `GET /faqs`

List every FAQ row for this clinic.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://dentexgo.mn/api/v1/clinics/dentaris/faqs
```

```json
{
  "items": [
    {
      "source_id": "csv-12",
      "q_mn": "Та хэдэн цагт ажилладаг вэ?",
      "a_mn": "Бид 09:00–19:00 цагт ажилладаг.",
      "q_en": "What are your hours?",
      "a_en": "We're open 09:00–19:00."
    }
  ]
}
```

#### `POST /faqs`

Create a new FAQ row. Mongolian fields are required; English is auto-translated via LLM if omitted. Re-embeds both locales into the knowledge base immediately.

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rowId": "ui-2026-05-18-01",
    "qMn": "Та зээлээр төлүүлэх боломжтой юу?",
    "aMn": "Тийм, бид 3 хүртэлх сар хуваан төлүүлэх боломжтой."
  }' \
  https://dentexgo.mn/api/v1/clinics/dentaris/faqs
```

Body schema:

| Field   | Type         | Required | Notes                                                                                              |
| ------- | ------------ | -------- | -------------------------------------------------------------------------------------------------- |
| `rowId` | string ≤128  | no       | Stable id you choose. Auto-generated as `api-<ts>-<rand>` if omitted. Used for later PATCH/DELETE. |
| `qMn`   | string ≤1000 | **yes**  | Mongolian question                                                                                 |
| `aMn`   | string ≤4000 | **yes**  | Mongolian answer                                                                                   |
| `qEn`   | string ≤1000 | no       | English question. Auto-translated if blank.                                                        |
| `aEn`   | string ≤4000 | no       | English answer. Auto-translated if blank.                                                          |

Response: `201 Created`

```json
{
  "item": {
    "source_id": "ui-2026-05-18-01",
    "q_mn": "Та зээлээр төлүүлэх боломжтой юу?",
    "a_mn": "Тийм, бид 3 хүртэлх сар хуваан төлүүлэх боломжтой.",
    "q_en": "Do you offer installment plans?",
    "a_en": "Yes, we offer up to 3-month installment plans."
  }
}
```

#### `PATCH /faqs/:rowId`

Update an existing row. Same body schema as POST (minus `rowId`). Re-embeds.

```bash
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "qMn": "Шинэчилсэн асуулт", "aMn": "Шинэчилсэн хариулт" }' \
  https://dentexgo.mn/api/v1/clinics/dentaris/faqs/ui-2026-05-18-01
```

Returns `200 OK` with the same `{ "item": {...} }` shape. `404 NOT_FOUND` if `rowId` doesn't exist.

#### `DELETE /faqs/:rowId`

Removes the row and both locale chunks from the bot's knowledge base.

```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  https://dentexgo.mn/api/v1/clinics/dentaris/faqs/ui-2026-05-18-01
```

Returns `204 No Content`.

---

### Insights

All insights endpoints accept a `?days=N` query param (default `30`, max `365`).
Endpoints that return lists also accept `?limit=N` (default `10`, max `100`).

#### `GET /insights/intents?days=30&limit=10`

Top patient-message intent labels in the window.

```json
{
  "items": [
    { "intent": "price_question", "count": 47 },
    { "intent": "service_inquiry", "count": 31 },
    { "intent": "hours_location", "count": 18 },
    { "intent": "book", "count": 12 }
  ]
}
```

Possible `intent` values: `service_inquiry`, `price_question`, `hours_location`, `book`, `insurance`, `complaint`, `staff_question`, `small_talk`, `unclear`, `other`.

#### `GET /insights/languages?days=30`

Conversation language mix.

```json
{
  "items": [
    { "locale": "mn", "count": 84 },
    { "locale": "en", "count": 12 },
    { "locale": "mn-Latn", "count": 5 }
  ]
}
```

`mn-Latn` is romanized Mongolian (Cyrillic letters typed in Latin script — common on phones without a Mongolian keyboard).

#### `GET /insights/needs-human-rate?days=30`

Share of conversations that escalated to needs-human within the window.

```json
{ "needsHuman": 7, "total": 134, "rate": 0.0522 }
```

`rate` is `needsHuman / total`, clamped to 0..1.

#### `GET /insights/faq-gaps?days=30&limit=10`

Heuristic candidates to add to your FAQ. Surfaces patient questions about services / prices / staff / insurance that the bot escalated to needs-human (i.e. didn't have a confident KB answer).

```json
{
  "items": [
    {
      "conversationId": "uuid",
      "text": "Та дижитал рентген хийдэг үү? Үнэ нь хэд вэ?",
      "locale": "mn",
      "classifiedAt": "2026-05-15T08:42:01Z"
    }
  ]
}
```

Workflow: review → click "Add to FAQ" in your admin → POST the new question to `/faqs`.

#### `GET /insights/faq-gaps/clusters?days=30&limit=20`

The same escalated FAQ/service questions as `/faq-gaps`, but **grouped by meaning** so you see which topics recur (e.g. 9 people asking about braces pricing in different words collapse into one row). Embedding-based; no LLM. Sorted by `count` desc.

```json
{
  "clusters": [
    {
      "topic": "Шүдний аппаратын үнэ хэд вэ?",
      "count": 9,
      "examples": ["аппратны үнэ", "aprat une", "braces price?"],
      "conversationIds": ["uuid", "uuid"],
      "locale": "mn"
    }
  ]
}
```

- `topic` — the cluster's representative question (closest to the group centroid).
- `count` — how many escalated questions fell into this topic.
- `examples` — up to 5 distinct member phrasings.
- `conversationIds` — the conversations behind the cluster (drill-in).
- `locale` — the dominant locale in the cluster.

#### `POST /insights/faq-gaps/draft`

Turn one cluster into a clean FAQ question. Send the cluster's `examples` (or any phrasings). Returns a normalized bilingual **question only** — no answer, because the bot escalated precisely because it lacked the answer; you supply it, then POST to `/faqs`.

Body: `{ "questions": string[] }` (1–20 items, each ≤1000 chars).

```json
{
  "draft": {
    "qMn": "Шүдний аппаратын үнэ хэд вэ?",
    "qEn": "How much do dental braces cost?"
  }
}
```

`400 INVALID_BODY` if `questions` is empty or malformed. Workflow: `clusters` → pick a topic → `draft` → fill `aMn`/`aEn` → `POST /faqs`.

#### `GET /insights/usage?days=30`

Daily activity rollup. Same shape as the Dentexgo operator console's "usage" table.

```json
{
  "items": [
    {
      "day": "2026-05-17",
      "inbound_count": 14,
      "bot_out_count": 18,
      "admin_out_count": 1,
      "tokens_in": 7321,
      "tokens_out": 4108,
      "est_cost_usd": 0.0231,
      "latency_p50_ms": 2840,
      "latency_p95_ms": 5912
    }
  ]
}
```

Sorted newest-first. `latency_*` may be `null` if no replies on that day.

#### `GET /insights/summary?days=30`

Bundle of every insight in one round-trip. Useful for clinic-admin dashboards that show the full picture above the fold.

```json
{
  "days": 30,
  "intents": [
    /* same as /insights/intents */
  ],
  "languages": [
    /* same as /insights/languages */
  ],
  "needsHumanRate": {
    /* same as /insights/needs-human-rate */
  },
  "faqGaps": [
    /* same as /insights/faq-gaps */
  ],
  "usage": [
    /* same as /insights/usage */
  ]
}
```

---

### AI Credits

The AI chatbot is metered in MNT. Each AI reply consumes credit proportional to tokens used. Each billing period, your AI tier grants you a fresh credit allowance (Starter ~₮50K, Growth ~₮150K, Scale ~₮400K). When the balance reaches zero, **the bot stops auto-replying** — patient messages still land in your inbox so staff can respond manually. Top up via QPay at any time to buy headroom.

> Endpoints in this section require an **active `ai_chatbot` subscription module**. Website-only clinics get `409 NO_AI_MODULE` on every call.

#### `GET /credits/balance`

Current MNT balance + recent burn + pause state.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://dentexgo.mn/api/v1/clinics/dentaris/credits/balance
```

```json
{
  "balanceMnt": 142000,
  "burn30dMnt": 312000,
  "estDaysRemaining": 14,
  "paused": false,
  "pausedReason": null
}
```

- `balanceMnt` — current credit, in MNT (integer).
- `burn30dMnt` — total debited over the last 30 days.
- `estDaysRemaining` — `floor(balanceMnt / (burn30dMnt / 30))`, or `null` if no recent activity.
- `paused` — `true` iff the bot is currently paused due to empty credit.
- `pausedReason` — `"credit_empty"` when paused; `null` otherwise. Operator-initiated pauses use a different mechanism.

#### `POST /credits/topup`

Create a QPay invoice for an MNT amount. Returns the QR + bank deep-links to render in your admin.

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "amountMnt": 200000, "customerName": "Dentaris admin" }' \
  https://dentexgo.mn/api/v1/clinics/dentaris/credits/topup
```

Body schema:

| Field          | Type       | Required | Notes                        |
| -------------- | ---------- | -------- | ---------------------------- |
| `amountMnt`    | integer    | yes      | Min `10000`, max `10000000`. |
| `customerName` | string ≤80 | no       | Shown to the payer in QPay.  |

Response: `201 Created`

```json
{
  "invoiceId": "9b1c...e8a7",
  "amountMnt": 200000,
  "qrImage": "data:image/png;base64,iVBOR...",
  "bankLinks": [
    { "name": "Khan Bank", "logo": "https://...", "link": "khanbank://..." },
    { "name": "TDB", "logo": "https://...", "link": "tdb://..." }
  ]
}
```

Render `qrImage` directly (`<img src={qrImage} />`); offer `bankLinks` as buttons. Most patients tap a bank deep-link on mobile; QR is the fallback for desktop.

Credit is **not** added immediately. When QPay confirms payment, the balance updates asynchronously (typically <30 s). Poll `GET /credits/topup/:invoiceId` to know when to refresh your UI.

#### `GET /credits/topup/:invoiceId`

Poll status for a top-up. Safe to call repeatedly.

```json
{
  "invoiceId": "9b1c...e8a7",
  "status": "paid",
  "amountMnt": 200000,
  "paidAt": "2026-05-29T11:24:13Z",
  "issuedAt": "2026-05-29T11:20:00Z"
}
```

`status` values: `"pending"`, `"paid"`, `"cancelled"`, `"expired"`.

#### `GET /credits/transactions?limit=&before=`

Append-only ledger of credits and debits.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://dentexgo.mn/api/v1/clinics/dentaris/credits/transactions?limit=25"
```

```json
{
  "items": [
    {
      "id": "tx_...",
      "kind": "ai_reply_debit",
      "amountMnt": -120,
      "balanceAfterMnt": 141880,
      "createdAt": "2026-05-29T11:23:01Z",
      "meta": { "tokens_in": 412, "tokens_out": 188, "messageId": "..." }
    },
    {
      "id": "tx_...",
      "kind": "period_grant",
      "amountMnt": 150000,
      "balanceAfterMnt": 150000,
      "createdAt": "2026-05-29T00:00:00Z",
      "meta": { "period": "2026-06", "tier": "growth" }
    },
    {
      "id": "tx_...",
      "kind": "topup_qpay",
      "amountMnt": 200000,
      "balanceAfterMnt": 142000,
      "createdAt": "2026-05-29T11:24:13Z",
      "meta": { "invoiceId": "..." }
    }
  ]
}
```

Pagination: pass `?before=<createdAt>` for the next page. Default `limit=25`, max `100`.

`kind` values:

| `kind`           | Meaning                                                   |
| ---------------- | --------------------------------------------------------- |
| `period_grant`   | Monthly tier allowance auto-credited at period start.     |
| `topup_qpay`     | Paid top-up via QPay (this API).                          |
| `manual_grant`   | Operator added credit (trade settlement, goodwill, etc.). |
| `manual_adjust`  | Operator corrected a balance (signed).                    |
| `ai_reply_debit` | Bot reply consumed credit. One row per reply.             |
| `refund`         | Operator refunded a top-up.                               |

#### Pricing reference (informational)

| Item                           | ~MNT      |
| ------------------------------ | --------- |
| 1,000 tokens of patient input  | ~1        |
| 1,000 tokens of bot output     | ~3        |
| Typical AI reply (~600 tokens) | 80–250    |
| Typical busy clinic / month    | 150K–500K |

Server-side rates can shift if our model pricing or MNT/USD FX moves materially. We will give 30 days' notice via the operator console before rate changes.

#### Credit errors

| HTTP | `code`             | When                                                                        |
| ---- | ------------------ | --------------------------------------------------------------------------- |
| 400  | `INVALID_AMOUNT`   | `amountMnt` outside `[10000, 10000000]`.                                    |
| 409  | `NO_AI_MODULE`     | Clinic has no active `ai_chatbot` subscription module.                      |
| 502  | `QPAY_UNAVAILABLE` | QPay upstream failure when creating an invoice — retry after a short delay. |

---

### Bot configuration

The bot's voice and operational behavior are per-clinic. All fields are optional — empty values fall back to defaults baked into the system prompt.

**Persona v2 (2026-05-25):** `signature` was removed (no clinic used it). The schema strips unknown keys silently on read, so any old `signature` value in your stored config is just dropped — no breaking change on your side.

> **⚠ FAQ vs Behavior rules (`custom_rules`) — read this once before you write rules.**
>
> The bot has TWO sources of instructions that can look similar but differ in authority:
>
> 1. **FAQ knowledge base** ([POST/PATCH /faqs](#post-faqs)) — for **facts**: prices, hours, policies, age limits, insurance coverage. **Highest** authority. The bot quotes FAQ verbatim when relevant.
> 2. **Behavior rules** (`persona.custom_rules`) — for **behaviors**: HOW the bot replies. Examples: _"Always offer a free consultation."_ / _"If a patient mentions kids under 7, suggest Dr. Bat-Erdene."_
>
> **If a behavior rule restates or contradicts a fact also in the FAQ, the FAQ wins** — the rule becomes dead weight, or worse, makes replies inconsistent. Put **prices in FAQ rows**, not in behavior rules.

#### `GET /bot`

Returns the full bot config + the comment→DM opt-in flag in one round-trip.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://dentexgo.mn/api/v1/clinics/dentaris/bot
```

```json
{
  "persona": {
    "tone": "friendly",
    "greeting": {
      "mn": "Сайн байна уу 👋 Дентарис эмнэлэгт тавтай морил.",
      "en": "Hi 👋 Welcome to Dentaris."
    },
    "ai_disclosure": {
      "mn": "Би таны клиникийн AI туслах.",
      "en": "I'm your clinic's AI assistant."
    },
    "off_hours": {
      "greeting": {
        "mn": "Сайн байна уу. Бид одоо хаалттай байна.",
        "en": "Hi. We are closed right now."
      },
      "closer": {
        "mn": "Маргааш 09:00 цагт холбогдох болно.",
        "en": "We will respond at 09:00."
      },
      "emergency_phone": "99001122"
    },
    "fallback_message": {
      "mn": "Энэ асуултанд тулгуурлахгүй байна. 77000022 руу залгана уу.",
      "en": "I can't answer this with confidence. Please call 77000022."
    },
    "featured_services": ["whitening-zoom", "restorative-zircon"],
    "phone_in_replies": "when_uncertain",
    "custom_rules": [
      "Always offer a free consultation at the end of every reply."
    ]
  },
  "commentToDmEnabled": false
}
```

The `commentToDmEnabled` field is **read-only via this API**. Enabling it requires a platform-operator step (subscribing the Facebook Page to feed events) — coordinate with us before flipping it on for production. See the Comment → DM section below.

#### `PATCH /bot/persona`

Partial update. Send only the fields you want to change; absent top-level fields preserve current values.

```bash
# Update just the MN greeting (English stays as-is — but see warning below)
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "greeting": {
      "mn": "Сайн байна уу 👋 Манай клиникт хүрэлцэн ирсэнд баярлалаа.",
      "en": "Hi 👋 Welcome to our clinic."
    }
  }' \
  https://dentexgo.mn/api/v1/clinics/dentaris/bot/persona
```

Body schema (all fields optional):

| Field                    | Type                                                  | Notes                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------ | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tone`                   | `"formal"` &#124; `"friendly"` &#124; `"casual"`      | Sets the overall tone instruction in the system prompt                                                                                                                                                                                                                                                                                                    |
| `greeting`               | `{ mn?, en? }`                                        | Opening line on the first reply per conversation. Combined with the AI disclosure when both are set.                                                                                                                                                                                                                                                      |
| `ai_disclosure`          | `{ mn?, en? }`                                        | Overrides the default disclosure text. **The disclosure is prepended automatically on the first message of every conversation — you do not write it into individual replies.** Required by Meta App Review; the system enforces this even if `ai_disclosure` is empty (default text is used).                                                             |
| `off_hours`              | `{ greeting?, closer?, emergency_phone? }`            | Copy used when the patient DMs **outside** the clinic's open hours. Schedule comes from `branches.hours_json` automatically — you only set the closed-hours copy here. `greeting` overrides `persona.greeting` during off-hours. `emergency_phone` defaults to the clinic profile phone if unset.                                                         |
| `fallback_message`       | `{ mn?, en? }`                                        | Used **verbatim** when the bot can't answer confidently. Replaces the LLM's own hedge.                                                                                                                                                                                                                                                                    |
| `featured_services`      | `string[]` (max 8)                                    | Array of `services_cache.source_id` values. Services in this list get pinned to the **top** of `list_services` results, in the order given. Stale ids (deleted services) silently no-op.                                                                                                                                                                  |
| `phone_in_replies`       | `"always"` &#124; `"never"` &#124; `"when_uncertain"` | When the bot mentions the clinic phone. Default: `"when_uncertain"` (phone in escalation + low-confidence replies). `"always"` ends every reply with phone. `"never"` never volunteers phone (still given on escalation).                                                                                                                                 |
| `show_duration_in_cards` | `boolean`                                             | When `true`, Messenger service-carousel cards include duration alongside price in the subtitle (e.g. `2,400,000₮ · 60 минут`). Default: `false` — most patient-discovery contexts (dental, beauty, spa) care about price, not appointment-slot length. Turn on for verticals where duration IS the headline (fitness classes, courses, therapy sessions). |
| `custom_rules`           | `string[]`                                            | **Behavior rules** — see the callout at the top. HOW the bot replies, not WHAT it knows.                                                                                                                                                                                                                                                                  |

Response: `200 OK` with the resulting full persona (same shape as `GET /bot.persona`).

**Bilingual gotcha:** top-level fields like `greeting` are replaced as a whole. To update only `greeting.mn` without touching `greeting.en`, send both: `GET /bot` → grab the existing en → PATCH with both. This is intentional — keeps the API surface small.

#### What the bot does with each persona field

A worked example for clinic `dentaris` with this persona:

```json
{
  "tone": "friendly",
  "greeting": { "mn": "Сайн байна уу 👋 Дентарис эмнэлэгт тавтай морил." },
  "ai_disclosure": { "mn": "Би таны клиникийн AI туслах." }
}
```

A patient DMs `"Шүд цайруулалт хэдэн төгрөг вэ?"` (first message of the conversation). The bot replies:

```
Би таны клиникийн AI туслах.

Сайн байна уу 👋 Дентарис эмнэлэгт тавтай морил. Шүд цайруулалт нь
80,000₮-өөс эхэлдэг. Доорх товчоор цаг авах боломжтой.

http://localhost:3001/mn/book/whitening
```

The disclosure goes first (system-prepended, atomic via `conversations.first_ai_reply_sent`), then the greeting from your persona, then the actual reply.

On the **second** message in that conversation, neither the disclosure nor the greeting is repeated — both fire once per thread.

---

### Comment → DM (Facebook posts)

When a patient comments on your clinic's Facebook post with a real question, the bot can detect the comment, post a short public acknowledgment, and send a Private Reply DM that answers the question with awareness of the original post's content.

#### Trigger conditions

The bot processes a comment when **all** of these are true:

1. The comment is a top-level comment-add event (replies to comments and edits are ignored)
2. The commenter is **not** the Page itself (loop avoidance)
3. The comment has at least 3 characters of text (drops emoji-only and one-letter reactions)
4. Your clinic's `commentToDmEnabled` flag is `true` (operator-managed; see below)
5. Our intent classifier identifies the comment as one of: `service_inquiry`, `price_question`, `hours_location`, `book`, `insurance`, `staff_question`, `complaint`. Generic praise like "Goyu shdee!" is classified as `small_talk` and dropped — no DM sent.
6. The triage classifier doesn't flag the comment as needs_human (severe pain, anger, explicit "talk to staff" — those bypass auto-DM so your staff can handle them directly).

#### What the patient sees

Two messages, in parallel:

1. **Public acknowledgment** under the original comment thread:

   - MN: `"Бид танд хувийн зурвас илгээлээ 👋"`
   - EN: `"We've sent you a private message 👋"`

2. **Private Reply DM** in Messenger:
   - Line 1: the AI disclosure (from `persona.ai_disclosure` or default)
   - Line 2+: the bot's actual answer, referencing what the patient was reacting to ("I see you commented on our whitening special — yes, ₮80,000 includes…"), with the booking URL inline if a specific service is mentioned

Meta's Private Reply mechanism allows exactly **one** DM per comment within **7 days** of the comment being posted. After that initial DM lands, the patient becomes a regular Messenger contact and follow-up messages use the standard Messenger Send API (carousels, button templates, quick replies — same as DM-originated threads).

#### Enabling for your clinic

`commentToDmEnabled` defaults to `false` for every clinic. Enabling it requires:

1. Your Facebook Page must be subscribed to `feed` webhook events (in addition to `messages`, `messaging_postbacks`).
2. The platform operator flips the flag via the operator console.

**You cannot enable this feature via the public API** — it's intentionally operator-gated because step 1 requires a coordinated subscribe call against your Page Access Token. To enable for your clinic, contact the platform operator. The current state is visible at `GET /bot.commentToDmEnabled`.

#### Customizing the disclosure / acknowledgment copy

The public acknowledgment ("We've sent you a private message 👋") is fixed; we don't expose it as a customizable field in v1 (it's intentionally generic so other commenters see the question is being handled without context-leaking).

The DM disclosure prefix **is** customizable via `PATCH /bot/persona` with the `ai_disclosure` field. Example: a formal clinic might want:

```json
{
  "ai_disclosure": {
    "mn": "Эрхэм үйлчлүүлэгч ээ, та манай клиникийн AI туслахтай яриа өрнүүлж байна.",
    "en": "Dear patient — you are messaging with our clinic's AI assistant."
  }
}
```

The disclosure goes through the same code path whether the conversation started as a DM or a comment, so customization applies to both flows.

#### What gets recorded

Each comment-originated DM creates one row in our `conversations` table with `origin_kind: "comment"`, `origin_post_id`, and `origin_comment_id` set. You can see these threads alongside DM-originated conversations in the (clinic-admin) inbox — they're tagged with a "From a comment" indicator. The originating post content is fetched on-demand from the Graph API and cached in our system for 5 minutes per post.

---

### Conversation bot controls

Control-plane only — pause/resume the bot and hand a conversation back to it from your own admin. (Reading message content stays out of scope; use `GET /conversations/export` for transcripts.)

`{id}` accepts **either** our conversation UUID **or** the Messenger **PSID**. A PSID resolves to that patient's most-recently-active conversation for the clinic.

State the bot uses to decide whether it replies:

- `needs_human` — `true` silences the bot until handed back. Set when the patient taps "talk to human" or AI triage flags urgency. Auto-returns to the bot after **30 minutes** unhandled (the bot resumes on the patient's next message).
- `bot_paused_until` — when in the future, the bot stays silent until that time.

#### `GET /conversations`

Lists conversations with their control state — the **needs-human queue**. Because `needs_human` lives in our system, an escalation is invisible in the Meta/Messenger inbox; poll this to find the conversations the bot has handed off.

Query params:

| Param         | Type              | Default           | Effect                                                                                                                                             |
| ------------- | ----------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `needs_human` | `true` \| `false` | _(omitted → all)_ | `true` returns only escalated conversations, **oldest escalation first** (longest-waiting patient at the top). `false` returns only non-escalated. |
| `limit`       | integer 1–100     | `50`              | Max rows returned.                                                                                                                                 |

```bash
curl -H "Authorization: Bearer <shared_secret>" \
  "https://dentexgo.mn/api/v1/clinics/dentaris/conversations?needs_human=true&limit=100"
```

```json
{
  "conversations": [
    {
      "id": "8f3c…",
      "psid": "36570716519209162",
      "channel": "messenger",
      "patient_name": "Bat-Erdene",
      "needs_human": true,
      "needs_human_at": "2026-06-04T03:10:00Z",
      "bot_paused_until": null,
      "bot_paused_active": false,
      "last_message_at": "2026-06-04T03:12:00Z",
      "messenger_inbox_link": "https://business.facebook.com/latest/inbox/all?asset_id=PAGE_ID&mailbox_id=PAGE_ID"
    }
  ],
  "count": 1
}
```

Response fields (`conversations[*]`):

| Field                  | Type                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                   | string                         | Opaque internal conversation ID.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `psid`                 | string                         | Meta Page-Scoped ID for the recipient.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `channel`              | `"messenger"` \| `"instagram"` | Platform the conversation originated on.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `patient_name`         | string \| null                 | Recipient's display name, enriched from Meta's Graph participants edge when the bot escalates the thread. `null` if not yet enriched (e.g. escalations that predate this feature, or Instagram).                                                                                                                                                                                                                                                                                                                                                      |
| `needs_human`          | boolean                        | Whether the bot has escalated the thread to staff.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `needs_human_at`       | string (ISO 8601) \| null      | Timestamp when escalation began, or `null` if not escalated.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `bot_paused_until`     | string (ISO 8601) \| null      | When the bot will resume, or `null` if not paused.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `bot_paused_active`    | boolean                        | Whether the bot is currently paused (i.e., paused_until is in the future).                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `last_message_at`      | string (ISO 8601)              | Timestamp of the most recent message in the thread.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `messenger_inbox_link` | string \| null                 | Link into the page's Meta Business Suite **inbox** (web): `https://business.facebook.com/latest/inbox/all?asset_id={PAGE_ID}&mailbox_id={PAGE_ID}`. `null` for Instagram or when the page id is unknown. It opens the inbox — **not** the specific thread: Meta Business Suite selects a thread by the person's real Facebook user id, which the Messenger Platform never exposes to apps (the Conversations, User Profile, and ID Matching APIs all return only the page-scoped PSID). Use `patient_name` to locate the thread once the inbox opens. |

Fetch a thread's transcript with `GET /conversations/export`, take over with `PATCH /conversations/{id}` (`pause_bot_hours`), and hand back with `PATCH … { "needs_human": false }`. There is no cursor: when `count` equals your `limit`, clear part of the queue (hand conversations back or take them over) and poll again. `400 INVALID_QUERY` if `needs_human` isn't `true`/`false` or `limit` is out of range.

#### `GET /conversations/{id}`

Returns the current control state.

```json
{
  "conversation": {
    "id": "8f3c…",
    "psid": "36570716519209162",
    "channel": "messenger",
    "needs_human": true,
    "needs_human_at": "2026-06-04T03:10:00Z",
    "bot_paused_until": null,
    "bot_paused_active": false,
    "last_message_at": "2026-06-04T03:12:00Z",
    "messenger_inbox_link": "https://business.facebook.com/latest/inbox/all?asset_id=PAGE_ID&mailbox_id=PAGE_ID"
  }
}
```

Response fields are the same as `GET /conversations` (see field table above). To let staff answer a handed-off conversation in Messenger (instead of your own admin UI), render `messenger_inbox_link` as a button on each `needs_human` row — it opens the page's Business Suite inbox (web), where staff find the thread by `patient_name`. A link straight to the exact thread isn't possible (see the field note above), and there is no mobile-app deep link.

#### `PATCH /conversations/{id}`

Body — send at least one field; omitted fields are unchanged:

| Field             | Type           | Effect                                                                             |
| ----------------- | -------------- | ---------------------------------------------------------------------------------- |
| `needs_human`     | boolean        | `false` = hand back to the bot; `true` = escalate (silence the bot, notify staff). |
| `pause_bot_hours` | number \| null | number = pause the bot that many hours; `null` = resume now.                       |

**Fully hand a conversation back to the bot** (clears both guards):

```bash
curl -X PATCH \
  -H "Authorization: Bearer <shared_secret>" \
  -H "Content-Type: application/json" \
  -d '{ "needs_human": false, "pause_bot_hours": null }' \
  https://dentexgo.mn/api/v1/clinics/dentaris/conversations/36570716519209162
```

**Take over** (you'll reply yourself; keep the bot quiet for 12h):

```bash
curl -X PATCH ... -d '{ "pause_bot_hours": 12 }' \
  https://dentexgo.mn/api/v1/clinics/dentaris/conversations/<psid-or-id>
```

Returns the updated `conversation` state (same shape as `GET`). `404 NOT_FOUND` if the conversation doesn't belong to your clinic. Rate limit: 60 writes/min/clinic.

---

## CORS

`Access-Control-Allow-Origin: *` on every response. Bearer auth is safe with wildcard CORS because the token is sent in a header, not a cookie — no CSRF risk.

You can call this API from a browser-side admin without registering your origin with us. If your security posture requires a tighter allowlist, contact the platform operator.

## Versioning

- `v1` is the current and only stable version.
- Breaking changes ship as `/api/v2/...` with a 30-day overlap during which both versions run.
- Additive changes (new optional fields, new endpoints) land on `v1` without version bump.

## Rate limiting

No client-side rate limits in v1. Server-side Vercel function limits provide a soft ceiling. Production rate limits are planned for v1.1 — expect a `429 RATE_LIMITED` response with `Retry-After` once that lands. Cache aggressively on your side.

## Conventions

- All timestamps are ISO 8601 with UTC `Z`.
- `clinicId` and `rowId` are opaque strings; don't parse their structure.
- Pagination is bounded by `?limit` only; no cursor/page params in v1. If you need >100 rows, paginate by date filtering (`?days=`).

## Out of scope for v1

Coming in later versions (let the platform team know your priorities):

- Conversation message-content read API (list + control state ship in v1 via `GET /conversations`; message content stays out — use `GET /conversations/export` for transcripts)
- Manual reply (send a Page message as the clinic)
- Toggling `commentToDmEnabled` via API (operator-gated; coordinate via the platform team)
- Customizable public-acknowledgment copy for the comment→DM flow (currently fixed bilingual string)
- Instagram comment→DM (separate Meta App Review bundle)
- Webhook subscriptions for inbound classified messages (push instead of pull)
- OpenAPI / Swagger spec generation
- Promotional / expiring credits (current credits never expire)
- Refund self-service for credit top-ups (operator-gated)
- Subscription module management via API (operator-gated; modules live on `clinics.subscriptions` and `subscription_modules`)

## Errors reference

| HTTP | `code`                  | When                                                                     |
| ---- | ----------------------- | ------------------------------------------------------------------------ |
| 400  | `INVALID_BODY`          | Zod validation failure on POST/PATCH body. `details` lists field errors. |
| 400  | `INVALID_AMOUNT`        | `amountMnt` for a top-up is outside `[10000, 10000000]`.                 |
| 401  | `UNAUTHENTICATED`       | Missing/malformed `Authorization` header                                 |
| 401  | `INVALID_TOKEN`         | Wrong Bearer token                                                       |
| 404  | `CLINIC_NOT_FOUND`      | Slug unknown or clinic inactive                                          |
| 404  | `NOT_FOUND`             | FAQ row or top-up invoice doesn't exist                                  |
| 409  | `CLINIC_NOT_CONFIGURED` | Clinic has no shared secret or subscription envelope yet                 |
| 409  | `NO_AI_MODULE`          | Clinic has no active `ai_chatbot` subscription module                    |
| 500  | `INTERNAL_ERROR`        | Unhandled. Try again; if it persists, alert the platform team.           |
| 502  | `QPAY_UNAVAILABLE`      | QPay upstream failure when creating a top-up invoice                     |

## Support

Open an issue on the Dentexgo GitHub repo or email the platform operator. Include your clinic slug + the request id from response headers (when we add it in v1.1).
