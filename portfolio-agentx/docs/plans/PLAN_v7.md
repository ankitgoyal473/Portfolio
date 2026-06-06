# PLAN_v7 — Paywall Lock + Session Persistence + Stripe Webhook

**Date:** 2026-05-29  
**Status:** Awaiting Stripe setup from user before Phase 2+3 build

---

## Context

- Live at: https://portfolio-one-topaz-65.vercel.app
- Supabase project: dwcdzjhelmjjhsdcyrgc
- 3 users already signed in and hit Warren paywall (Prachi Jain + Ankit x2)
- PaywallSheet UI exists but Unlock button does `console.log` only
- Sessions save/load from Supabase but page refresh resets thread to greeting

---

## Decisions Made

| Decision | Choice |
|----------|--------|
| Paywall popup behavior | Keep aggressive (auto-open on page load if locked) |
| Session replay | Continue same session (append to it in Supabase) |
| Post-unlock resume | Resume locked session exactly where left off |
| Stripe unlock | Automatic via webhook (not manual) |
| Pricing model | Bundle-only $79/mo (1 Stripe product, all 3 agents) |
| Stripe link open | New tab (user stays on agent page) |
| Per-agent pricing | Defer — add later when users ask |

---

## Phase 1 — Session Persistence (code only, no Stripe needed)

**Problems:**
1. Page refresh resets thread to greeting — last session not auto-loaded
2. "Replaying session from..." system message is noisy
3. Replayed sessions already continue (sessionRef wired) but UX is unclear

**Changes:**
- `app/agents/[name]/page.tsx` → on mount, after `loadSessions()`, auto-load most recent session into thread instead of always calling `startNewSession()`
- Only call `startNewSession()` if no sessions exist for this user+agent
- Remove "Replaying session from {date}" system message in `handleSelectSession`
- Sessions continue on new runs via existing `sessionRef` logic

---

## Phase 2 — Stripe Webhook (user sets up, I build code)

### User steps (one-time, ~10 min):
1. stripe.com → Create account
2. Products → Add product: "AGentX Pro" → Price: $79/month recurring
3. Payment Links → Create → select AGentX Pro → After payment redirect to:
   `https://portfolio-one-topaz-65.vercel.app/agents/warren?unlocked=1`
4. Copy the payment link URL (`https://buy.stripe.com/xxxxx`)
5. Developers → API keys → copy Secret key (`sk_live_...`)
6. Developers → Webhooks → Add endpoint:
   `https://portfolio-one-topaz-65.vercel.app/api/stripe/webhook`
   → select event: `checkout.session.completed`
   → copy Signing secret (`whsec_...`)
7. Add to Vercel env vars:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
   - `NEXT_PUBLIC_STRIPE_PAYMENT_LINK=https://buy.stripe.com/xxxxx`

### Code to build:
- `app/api/stripe/webhook/route.ts`
  - Verify Stripe signature with `STRIPE_WEBHOOK_SECRET`
  - On `checkout.session.completed`:
    - Read `client_reference_id` (= Supabase user ID)
    - Delete rows from `agent_usage` for all 3 agents for that user (resets counts to 0)
    - Optionally: insert into a `subscriptions` table for future cancellation tracking
- Install: `npm install stripe`

---

## Phase 3 — PaywallSheet Wiring

**Changes:**
- `lib/paywall.ts` → add `STRIPE_PAYMENT_LINK` export (reads `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`)
- `components/agents/PaywallSheet.tsx`
  - Accept `userId` prop
  - Unlock button: `window.open(`${STRIPE_PAYMENT_LINK}?client_reference_id=${userId}`, '_blank')`
  - Bundle CTA: "Unlock All 3 Agents — $79/month"
  - Keep "Cancel anytime · No contracts" copy
- `app/agents/[name]/page.tsx`
  - Pass `userId={user?.id}` to `PaywallSheet`
  - On mount: check `?unlocked=1` query param → show toast "You're unlocked. Welcome back." → reload usage from Supabase

---

## Post-Payment Flow (end-to-end)

```
User hits paywall
  → PaywallSheet opens (aggressive, immediate)
  → Clicks "Unlock All 3 — $79/month"
  → Stripe opens in new tab with client_reference_id=userId
  → User pays
  → Stripe webhook fires → resets agent_usage for all 3 agents
  → Stripe redirects to /agents/warren?unlocked=1
  → Page loads → sees toast "You're unlocked"
  → Last session auto-loads in thread
  → Chatbar is unlocked → continues where they left off
```

---

## Files to Change

| File | Change |
|------|--------|
| `app/agents/[name]/page.tsx` | Auto-load last session on mount; handle `?unlocked=1` toast |
| `components/agents/PaywallSheet.tsx` | Real Stripe link, userId prop, new copy |
| `lib/paywall.ts` | Export `STRIPE_PAYMENT_LINK` constant |
| `app/api/stripe/webhook/route.ts` | New file — Stripe webhook handler |
| `package.json` | Add `stripe` package |

---

## Not in this plan (defer)
- Per-agent pricing ($19/$49/$29)
- Subscription cancellation auto-relock
- Resend email on payment confirmation
- Stripe customer portal
