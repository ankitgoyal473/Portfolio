# portfolio-agentx — Current State

Last updated: 2026-06-06

## Status: Live — Claude Code Solutions Storefront (PIVOT COMPLETE)

**Live URL:** https://portfolio-one-topaz-65.vercel.app

Pivoted from hosted SaaS (Warren/Sherlock/Harvey agents with subscriptions) to a one-time ZIP download storefront for Claude Code-native solutions.

---

## What's Live & Working

- **Storefront**: Hero, Explainer, Products grid (2×2), How it works, FAQ, Footer
- **4 products**: Rudy (purple/job search), Warren (gold/stocks), Sherlock (blue/research), Harvey (green/email)
- **Buy modal**: Email input → Razorpay create-order → Razorpay checkout → verify → signed URL
- **Verify route**: HMAC-SHA256 → upsert `purchases` (idempotent) → Supabase signed URL → email delivery
- **Success page**: Download button + "also sent to [email]" message
- **Font**: Plus Jakarta Sans
- **Persona colors**: Rudy `#a855f7`, Warren `#f0b429`, Sherlock `#4a9eff`, Harvey `#00c896`, CTA `#F97316`

---

## LAUNCH BLOCKERS

1. **ZIP files not yet uploaded to Supabase Storage** — `solutions` bucket needs:
   - `rudy.zip`, `warren.zip`, `sherlock.zip`, `harvey.zip`
   - Until uploaded, verify route will fail on `storage.createSignedUrl()` (no file exists)
   - Write CLAUDE.md files for Warren, Harvey, Sherlock (Claude Code-native versions first)

2. **Razorpay is LIVE MODE** — real payments will be charged. Only test with ₹999 real payment until ZIPs are ready.

---

## What Was Deleted

- All agent pages (`app/agents/`)
- All agent API routes (`app/api/agents/`)
- Warren Railway proxy
- Auth middleware, admin dashboard, login page, dashboard
- Subscription system (verify route rewritten for one-time purchase)
- `lib/paywall.ts`, `lib/agents.ts`, `lib/agent-types.ts`, `lib/mock-auth.ts`

---

## Key Files

```
app/page.tsx                              — storefront homepage (5 sections)
app/success/page.tsx                      — post-payment download page
app/api/razorpay/create-order/route.ts   — creates Razorpay order
app/api/razorpay/verify/route.ts         — HMAC verify + signed URL + email
lib/products.ts                          — 4 products with prices, slugs, colors
lib/email.ts                             — downloadEmail() + adminSaleEmail()
components/store/                        — all storefront components
  buy-modal.tsx                          — email → create-order → Razorpay → verify
  product-card.tsx                       — persona color card with Buy button
  hero-section.tsx
  explainer-section.tsx
  products-section.tsx
  how-it-works-section.tsx
  faq-section.tsx
SUPABASE_SETUP.md                        — SQL for purchases table + storage instructions
docs/superpowers/specs/2026-06-06-agentx-pivot-design.md — full pivot spec
docs/superpowers/plans/2026-06-06-agentx-storefront.md   — implementation plan
```

---

## Supabase Tables

```
purchases   — id, email, product_slug, razorpay_payment_id (unique), razorpay_order_id, created_at
```

Old tables (`subscriptions`, `agent_sessions`, `agent_usage`, `leads`) still exist but unused.

---

## Supabase Storage

- Bucket: `solutions` (private)
- Files needed: `rudy.zip`, `warren.zip`, `sherlock.zip`, `harvey.zip`
- Verify route generates 24h signed URLs

---

## Environment Variables (Vercel Production)

```
NEXT_PUBLIC_SUPABASE_URL        ✅ set
NEXT_PUBLIC_SUPABASE_ANON_KEY   ✅ set
SUPABASE_SERVICE_ROLE_KEY       ✅ set
RAZORPAY_KEY_ID                 ✅ set (live key rzp_live_...)
RAZORPAY_KEY_SECRET             ✅ set (live key)
GMAIL_USER                      ✅ set
GMAIL_APP_PASSWORD              ✅ set
NEXT_PUBLIC_APP_URL             ✅ set
```

No longer needed (can clean up): `ANTHROPIC_API_KEY`, `WARREN_AGENT_URL`, `INTERNAL_SECRET`

---

## Next Priority

1. Write CLAUDE.md content for Warren, Harvey, Sherlock (Claude Code-native versions)
2. Package into ZIPs + upload to Supabase `solutions` bucket
3. Test full purchase flow end-to-end with real ₹999 payment
4. Clean up stale Vercel env vars (`ANTHROPIC_API_KEY`, `WARREN_AGENT_URL`, `INTERNAL_SECRET`)
