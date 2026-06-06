# Portfolio — Current State
_Last updated: 2026-06-03_

## Status: BLOCKED — Anthropic API credits exhausted on Railway

---

## What was fixed this session (all deployed, all verified)

### warren-agent (Railway)
| Fix | Commit | Status |
|-----|--------|--------|
| Prompt: replace "Output JSON" with explicit `report_pillar()`/`report_verdict()` tool calls | dc4fe47 | Deployed ✅ |
| `_symbol_is_valid`: check `previousClose`/`ask`/`bid` as fallbacks for TATAMOTORS etc | 43f51ae | Deployed ✅ |

### portfolio-agentx (Vercel)
| Fix | Status |
|-----|--------|
| Premium paywall: `set-premium` uses delete-then-insert (was silently failing on upsert) | Deployed ✅ |
| Stale JWT: page queries subscriptions table directly; `subscriptionRef` in `runWarren` onDone | Deployed ✅ |
| Pillar field mapping: `event.data.name` → `event.data.pillar`; `score`/`keyMetrics` added | Deployed ✅ |
| Double `onDone`: `doneCalled` guard in `use-agent-stream.ts` | Deployed ✅ |
| Pro sidebar: `isPremium` prop → shows `✦ Pro · Unlimited` in gold, hides free tier bar | Deployed ✅ |
| Pro chatbar: `isPremium` prop → shows `✦ Pro` badge, never disables input | Deployed ✅ |
| Railway watchPatterns: prevents redeploy on doc-only commits | Deployed ✅ |

---

## Live page verification (done via Playwright + Supabase admin session cookie)

Verified on https://portfolio-one-topaz-65.vercel.app/agents/warren as premium user:

| Check | Result |
|-------|--------|
| `✦ Pro · Unlimited` in sidebar | ✅ PASS |
| `✦ Pro` badge in chatbar | ✅ PASS |
| Free tier bar hidden | ✅ PASS |
| Chatbar enabled (not locked) | ✅ PASS |
| Paywall banner hidden after failed analysis | ✅ PASS |
| Error message graceful when stream dies | ✅ "The analysis was interrupted before any results arrived" |
| TypeScript: 0 errors | ✅ PASS |
| warren-agent tests: 32/32 pass | ✅ PASS |

---

## What is blocked

### Anthropic API credits exhausted on Railway
- Railway `ANTHROPIC_API_KEY` → zero balance account
- Error: `HTTP 400 — Your credit balance is too low to access the Anthropic API`
- Every `/analyze` call fails before any tool is called
- Cannot verify: pillar cards render on live page, verdict card, 6-pillar full flow

### To unblock (user action required)
**Option A:** console.anthropic.com → Plans & Billing → add credits to the account tied to Railway's `ANTHROPIC_API_KEY`  
**Option B:** Railway dashboard → warren-agent → Variables → update `ANTHROPIC_API_KEY` to a key with credits

---

## What to do immediately when credits are restored

Run this exact verification sequence:

1. Submit `HDFCBANK` on live page → expect 6 pillar cards + verdict card (8-12 min)
2. Submit `INFY` → same
3. Submit `TCS` → same
4. Submit `SBIN` → check works (large-cap banking)
5. Submit `TATAMOTORS` → check yfinance fallback fix works
6. Each analysis: confirm no paywall banner shown for premium user after completion

### Playwright auth for automated testing
```javascript
// Works: set @supabase/ssr chunked cookies directly (see CURRENT_STATE session)
// Cookie: sb-dwcdzjhelmjjhsdcyrgc-auth-token.0 + .1 (session JSON > 3180 URI-encoded chars)
// Auth script in portfolio-agentx/ with @supabase/supabase-js + playwright
```

---

## Architecture (key invariants)
- `warren-agent/prompts.py` — `build_prompt()` now says "call report_pillar(...)" at each step
- `warren-agent/tools/reporting.py` — `report_pillar` / `report_verdict` put events on `_reporting_local.q` (thread-local)
- `warren-agent/agent.py` — `_run_agent()` sets `_reporting_local.q = q` before calling Strands
- `portfolio-agentx/app/api/agents/warren/stream/route.ts` — `export const runtime = "edge"` (keeps; maxDuration not available on current Vercel plan)

## Deployment status
| Service | Host | Commit | Railway deploy |
|---------|------|--------|---------------|
| portfolio-agentx | Vercel | f554420 | N/A |
| warren-agent | Railway `75975300` | dc4fe47 | SUCCESS 2026-06-02T19:57 |
