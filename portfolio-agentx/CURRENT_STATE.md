# portfolio-agentx — Current State

Last updated: 2026-06-02

## Status: Live (Test Mode — NOT production-ready)

**Live URL:** https://portfolio-one-topaz-65.vercel.app
**GitHub:** https://github.com/ankitgoyal473/Portfolio (root: `portfolio-agentx/`)

## CRITICAL — Do Before Production Launch
- **Razorpay amount is ₹1 (100 paise) — TEST MODE.**
  Change to `99900` (₹999) in `app/api/razorpay/create-order/route.ts`.

## What's Working
- Google OAuth via Supabase SSR
- 3 agents: WARRen (gold), Sherlock (blue), Harvey (green)
- Free tier limits enforced per agent (paywall at count >= limit)
- 30-day subscription: Razorpay payment → verify → activate → auto-expiry
- 7-day expiry reminder email (sent once per subscription)
- Admin dashboard `/admin` — leads, users, subscribers
- Email: buyer confirmation + admin notification + expiry reminder (Nodemailer + Gmail SMTP)
- Warren proxied to Railway microservice (search works; stream has 300s timeout issue)
- Session persistence: sessions restore on page mount from `agent_sessions` table

## Known Issues
- **Warren stream Vercel timeout** — Warren analysis takes ~655s; Vercel kills at 300s.
  **Fix:** Add `export const runtime = 'edge'` to `app/api/agents/warren/stream/route.ts`.
  **Status:** Fix identified, not yet applied.

## In Progress
- Warren edge runtime fix

## Next Priority
1. Apply `export const runtime = 'edge'` to Warren stream route
2. Change Razorpay amount to `99900` before launch
3. End-to-end subscription lifecycle test (pay → activate → expire → re-gate)
4. Performance: Warren stream UX improvement (progress indicator during 655s wait)

## Key Files
```
CLAUDE.md             — complete architecture reference
proxy.ts              — Next.js 16 middleware (NOT middleware.ts)
lib/agents.ts         — agent data + AGENT_ICONS (separate from Agent type)
lib/paywall.ts        — usage state (warning = locked, not just aware)
lib/mock-auth.ts      — useMockAuth() hook (real Supabase despite legacy name)
persona.md            — voice/copy rules for agent messages
app/api/agents/warren/stream/route.ts  — Warren proxy (needs edge runtime)
app/api/razorpay/create-order/route.ts — Payment amount (needs 99900)
docs/plans/           — archived plan versions (PLAN_v1 through PLAN_v14)
```

## Supabase Tables
```
leads           — freelance project inquiries
agent_sessions  — per-user conversation history
agent_usage     — free tier usage counter per user+agent
subscriptions   — subscription lifecycle
```

## Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
NEXT_PUBLIC_APP_URL
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
GMAIL_USER
GMAIL_APP_PASSWORD
WARREN_AGENT_URL=https://warren-agent-production.up.railway.app
```
