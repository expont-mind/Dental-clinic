# Services — Data Model & How to Add One

A short reference for editors who need to add or organize services in the admin.

## The 5 fields that control "where this service appears"

Every service has these five columns. Their interaction is the whole game.

| Column | What it controls | Example |
|---|---|---|
| `is_active` | If false, hidden from the public site (still visible in admin). | `true` |
| `parent_id` | NULL = appears on the listing page. Set = appears only inside the parent's detail page. | NULL for "Orthodontics"; set to Orthodontics's id for "Metal braces" |
| `category` | The chip label on the listing page (free text). Services with the same category group under one chip. | `"Cosmetic"`, `"Orthodontics"`, `"Surgical"` |
| `department_id` | Clinical department for internal routing (links doctors to services). Not visible to patients directly. | "restorative", "cosmetic" |
| `itdoctor_service_id` | If set, this service is linked to the external IT Doctor booking system. **Public listing hides services with this set.** Admin still shows them with an amber badge. | `35` |

## Decision tree when adding a new service

1. **Is this a top-level service or a sub-service?**
   - Top-level (shown on `/services`): leave `parent_id` empty.
   - Sub-service (only shown inside a parent's detail page): pick the parent from the "Эцэг ангилал" dropdown.

2. **What chip should it sit under on the listing page?**
   - Type a `Category` value (e.g. `Cosmetic`). Chips are auto-generated from distinct category values across all parent services.
   - Multiple services with the same `Category` group under one chip.

3. **What clinical department?**
   - Pick from the `Тасаг` dropdown. This is mostly internal — it controls which doctors can be linked to this service.

4. **Is this booked through IT Doctor?**
   - If yes: enter the IT Doctor Service ID (multiple services can share the same ID).
   - If no: leave it blank.

5. **Active?**
   - Tick the box if you want the service to show on the public site.

## Two-level hierarchy in practice

```
Listing page (/services)
├── Orthodontics                    ← parent_id NULL, category "Orthodontics"
│   ├── Metal braces               ← parent_id = Orthodontics.id
│   ├── Ceramic braces             ← parent_id = Orthodontics.id
│   └── Clear aligners (Invisalign)
├── Implant                         ← parent_id NULL, category "Implant"
│   ├── Single implant             ← parent_id = Implant.id
│   └── Full-mouth implant
└── Cosmetic                        ← parent_id NULL, category "Cosmetic"
    ├── Teeth whitening
    └── Veneers
```

The listing page only shows **parent** rows. The detail page for a parent shows its **children** as a list.

## Filling in the detail-page sections

On the admin form's **"Дэлгэрэнгүй агуулга"** section, every block is optional and renders only if non-empty:

| Block | Renders as | Use it for |
|---|---|---|
| **Treatments** | "What to expect" fallback (if no timeline) | Quick bullet list of what's included |
| **Benefits** | Numbered "Why we're different" cards | 2–4 differentiators with title + body |
| **Timeline** | Numbered step-by-step process with icons | The patient journey (consultation → planning → procedure → follow-up). 3–5 steps recommended. |
| **FAQ** | Animated accordion at bottom of detail page | Common questions patients ask |
| **Pricing** | Pricing table | Detailed price rows (label, price, optional note) |
| **Testimonials** | Quote carousel | Real patient quotes specific to this service |

## Where to find a service that "disappeared"

If a service is missing from the public site:

1. Check the **admin services list**. With this update it shows ALL services regardless of state.
2. Filter chips at top — try **"Идэвхгүй"** (inactive) or **"Гадаад холбоост"** (externally linked).
3. If it has an amber `IT Doctor N` badge, the public site is hiding it on purpose — open it and clear the IT Doctor Service ID field if you want it back.

## Recovery: the "where did it go" SQL one-liner

If a service vanished entirely from the listing, run this in the Supabase SQL editor:

```sql
SELECT slug, name_mn, parent_id, is_active, itdoctor_service_id
FROM public.services
WHERE slug = 'implant';   -- or whatever you're hunting for
```

You'll see exactly which flag is hiding it.
