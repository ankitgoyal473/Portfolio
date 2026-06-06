# AGentX Pivot — Claude Code Solutions Storefront

**Date:** 2026-06-06  
**Status:** Draft  
**Replaces:** AGentX hosted SaaS (Warren/Sherlock/Harvey on Vercel + Railway + Supabase)

---

## What We're Building

Replace the current AGentX portfolio with a storefront that sells Claude Code-native solutions as one-time ZIP purchases. Buyers are non-technical professionals (recruiters, investors, researchers) who have Claude Code or are willing to install it. No accounts, no subscriptions, no hosted AI infrastructure.

**4 products at launch:**

| Slug | Name | What it does |
|------|------|--------------|
| `rudy` | Rudy | Autonomous job search + apply pipeline across LinkedIn, Naukri, Indeed |
| `warren` | Warren | Stock research agent — fundamentals, technicals, web search |
| `harvey` | Harvey | Email and outreach agent — drafts, follow-ups, prospecting |
| `sherlock` | Sherlock | Deep research and investigation agent — web + document analysis |

Price placeholder: **₹999 each** (configurable in `lib/products.ts` — change before launch).

---

## Architecture

**Stack:** Next.js 16 App Router + TypeScript + Tailwind v4 + Razorpay + Supabase Storage + Nodemailer  
**Deployment:** Vercel (same project, same URL)  
**Database:** Supabase (one table: `purchases`)  
**No auth. No sessions. No Railway. No Anthropic API calls server-side.**

### Pages

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Server | Full storefront — hero, explainer, products, how it works, FAQ |
| `/success` | Client | Post-payment — download button + email confirmation message |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/razorpay/create-order` | POST | Accepts `{ product_slug, email }`, creates Razorpay order, returns `{ orderId, amount, currency, keyId, productName }` |
| `/api/razorpay/verify` | POST | HMAC-SHA256 verify → insert purchase → generate signed URL → send email → return `{ downloadUrl, productSlug }` |

### Database

One Supabase table — **`purchases`**:

```sql
create table purchases (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  product_slug text not null,
  razorpay_payment_id text not null unique,  -- unique: idempotent verify
  razorpay_order_id text not null,
  created_at timestamptz default now()
);
```

Service role only. No RLS needed — buyers never query this directly.

### File Delivery

- Supabase Storage bucket: `solutions` (private)
- Files: `solutions/rudy.zip`, `solutions/warren.zip`, `solutions/harvey.zip`, `solutions/sherlock.zip`
- On successful payment: generate signed URL with **24h expiry**
- Shown on `/success` page AND emailed to buyer

---

## Product Data (`lib/products.ts`)

```ts
type Product = {
  slug: string
  name: string
  tagline: string
  description: string
  price: number          // in paise (99900 = ₹999)
  whatYouGet: string[]   // bullet list shown on product card
}
```

Each product card on the homepage renders from this constant — no CMS, no database.

---

## Homepage Sections (`/`)

Six sections, top to bottom:

1. **Hero** — Headline, one-line subhead, CTA button scrolls to products
2. **What is Claude Code?** — 3-bullet explainer for non-technical buyers: what it is, how to install, why it's powerful. Keeps jargon out.
3. **Products** — 4 cards in a grid. Each card: name, tagline, 3-line description, "what you get" bullets, price, Buy button
4. **How it works** — 3 steps: Buy → Unzip → Run Claude. Visual step indicators.
5. **FAQ** — 6 questions covering: Do I need to code? What is Claude Code? What happens after purchase? Can I get a refund? Will it work on Windows/Mac? What if I need help?
6. **Footer** — AGentX name, links to individual product anchors

---

## Buy Flow

1. Buyer clicks **Buy** on a product card
2. A small modal collects their **email address** (needed for delivery)
3. `/api/razorpay/create-order` called with `{ product_slug, email }`
4. Razorpay checkout modal opens (pre-filled with product name + amount)
5. Buyer pays (UPI, card, netbanking)
6. On success: Razorpay fires `onSuccess({ razorpay_payment_id, razorpay_order_id, razorpay_signature })`
7. Client POSTs to `/api/razorpay/verify` with all three + `{ product_slug, email }`
8. Server: HMAC verify → insert purchase → generate signed URL → send email → return `{ downloadUrl }`
9. Client redirects to `/success?url=<encoded-signed-url>&product=<slug>` (signed URL already has 24h expiry, so URL exposure in query param is acceptable)
10. `/success` shows: download button (24h link), "also sent to [email]" message

---

## ZIP Contents

Each ZIP is a self-contained Claude Code workspace:

**rudy.zip:**
```
CLAUDE.md                    ← operating manual (the product)
buyer-config.example.json    ← template — buyer fills this in
docs/pipeline.md
docs/portals.md
docs/setup-flow.md
docs/services.md
state/                       ← empty (populated at runtime)
README.md                    ← setup instructions for non-technical buyers
```

**warren.zip / harvey.zip / sherlock.zip:**
```
CLAUDE.md                    ← operating manual (the product)
config.example.json          ← template — buyer fills this in
README.md                    ← setup instructions
```

Warren/Harvey/Sherlock need their CLAUDE.md files written from scratch (the Claude Code-native versions, not the current hosted-agent prompts). **These must be written and ZIPs uploaded to Supabase Storage before the site goes live — this is a launch blocker.**

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| HMAC verify fails | 400, no purchase inserted, client shows "Payment verification failed, contact support" |
| Supabase Storage error generating URL | Log error, show fallback: "Download link will be emailed within 5 minutes" — manual fallback |
| Email send fails | Log only — download still shown on `/success` page, buyer is not blocked |
| Duplicate payment ID | `INSERT ... ON CONFLICT (razorpay_payment_id) DO NOTHING` — idempotent |
| Product slug not found | 400 from create-order route |

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
GMAIL_USER
GMAIL_APP_PASSWORD
NEXT_PUBLIC_APP_URL
```

Removed vs current: `ANTHROPIC_API_KEY`, `WARREN_AGENT_URL`, `INTERNAL_SECRET`, `WARREN_TEST_MODE`

---

## What Gets Deleted from Current Codebase

- All agent pages (`app/agents/`)
- All agent API routes (`app/api/agents/`)
- Warren stream proxy
- Auth middleware (`proxy.ts`)
- Admin dashboard (`app/admin/`)
- Dashboard page (`app/dashboard/`)
- Login page (`app/login/`)
- Subscription system (`app/api/razorpay/verify` kept but rewritten)
- `lib/paywall.ts`, `lib/agents.ts`, `lib/agent-types.ts`, `lib/mock-auth.ts`
- Supabase tables: `agent_sessions`, `agent_usage`, `subscriptions`, `leads`

**Kept:** Design system (`globals.css`, Tailwind tokens), `lib/email.ts` (reused for download emails), Razorpay integration pattern, Supabase client setup.

---

## Out of Scope

- Admin dashboard (purchase history) — add later if needed
- Refund automation — handle manually via Razorpay dashboard
- Re-download portal — buyer emails for a new link if theirs expires
- Multiple licenses / team pricing
- Warren/Harvey/Sherlock CLAUDE.md content — separate task, written before upload
