# AgentX Web — Current State
_Last updated: 2026-06-17_

## Status: LIVE — one-time ZIP store. Phase 1 QA + lead-funnel hardening DEPLOYED (2026-06-17, commit 2498456).

The live site (https://portfolio-one-topaz-65.vercel.app) is a **"Claude Code Solutions" store**:
customers buy downloadable Claude Code workspace ZIPs at ₹999 each. The old SaaS subscription
model (interactive `/agents/*`, paywall, Warren stream) is gone — those routes are deleted and the
`subscriptions`/paywall code is orphaned. App lives at `web/portfolio-agentx/`.

---

## This session (2026-06-17) — Phase 1 QA + fixes

### Bug sweep findings (live browser QA + code audit)
- **CRITICAL:** Sherlock & Harvey were on sale at ₹999 but had **no ZIP** in the `solutions`
  bucket (only `rudy.zip` + `warren.zip` exist). A buyer would pay and get nothing.
- **CRITICAL:** "AGentX Discovery" chat widget submitted leads with `email: ""` — never captured
  contact info, so every lead was unreachable.
- **CRITICAL:** `/api/submit-lead` only emailed; never wrote to the `leads` table; chat widget
  swallowed errors and showed "success" even on failure → silent lead loss.
- No Slack notification on any lead or sale.
- Service-role Supabase key hardcoded in `products/upload-to-supabase.{mjs,py}`.
- `/api/submit-lead` unauthenticated + unthrottled (spam vector).
- Docs (`CLAUDE.md`, this file, `DECISIONS.md`) described the old SaaS model.

### Fixes implemented (tsc + build pass, NOT yet pushed)
| Fix | Files |
|-----|-------|
| Sherlock & Harvey → `comingSoon: true`, Buy button disabled ("Coming soon") | `lib/products.ts`, `components/store/product-card.tsx` |
| Discovery widget now captures name + email (new "contact" step), sends structured data, never fakes success | `components/chat/chat-widget.tsx` |
| `/api/submit-lead` rewritten: persists to `leads` table → email → Slack; honeypot; requires email + description | `app/api/submit-lead/route.ts` |
| Slack notifier (graceful no-op without `SLACK_WEBHOOK_URL`) | `lib/slack.ts` (new) |
| Sale Slack pings (success + manual-fulfillment fallback) | `app/api/razorpay/verify/route.ts` |
| Hire form: honeypot + `source: "hire"` | `app/hire/page.tsx` |
| Hardcoded service key → env (`SUPABASE_SERVICE_ROLE_KEY`) | `products/upload-to-supabase.{mjs,py}` |
| Pivot banner added to stale CLAUDE.md | `portfolio-agentx/CLAUDE.md` |

### What's working (verified live)
Homepage, `/hire`, `/tools`, `/projects`, `/mcp` load with 0 console errors; mobile layout solid;
Razorpay modal opens at ₹999; HMAC verify correct; Warren API healthy; `purchases` + `leads`
tables exist; `rudy.zip` + `warren.zip` deliver.

---

## Next priority
1. **Push** these fixes (needs user OK — triggers Vercel deploy).
2. **Add `SLACK_WEBHOOK_URL` to Vercel env** so lead/sale Slack pings fire (currently no-op).
3. **Rotate the exposed Supabase service-role key** in the Supabase dashboard (it was hardcoded).
4. Phase 2 — confirm **live Razorpay keys** are set in Vercel (not test keys).
5. Phase 3 — Upwork pipeline + Discovery/hire funnel polish.
6. Decide Warren's fate: repurpose the Railway service as a live demo, or decommission it.
7. (Optional) build Sherlock & Harvey ZIPs to re-enable their sale.

## Blocked / needs user action
- Pushing to prod, adding the Slack webhook env var, rotating the Supabase key, and confirming
  live Razorpay keys all require the user.
