# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AGentX — AI SaaS portfolio platform. Two deployable services in one repo:

| Service | Directory | Stack | Host |
|---------|-----------|-------|------|
| Next.js frontend + API | `portfolio-agentx/` | Next.js 16, React 19, TypeScript, Supabase | Vercel |
| Warren Python microservice | `warren-agent/` | FastAPI, Strands, Python 3.12 | Railway |

**Live:** https://portfolio-one-topaz-65.vercel.app  
**Warren API:** https://warren-agent-production.up.railway.app

---

## Detailed Guidance

Each service has its own CLAUDE.md with full architecture details:

- **`portfolio-agentx/CLAUDE.md`** — Next.js architecture, auth, paywall, agent stream routes, component structure, Supabase schema, all known quirks
- **`warren-agent/CLAUDE.md`** — FastAPI architecture, Strands agent wiring, SSE event contract, Railway deployment, test commands

Read those before working in either service.

---

## Cross-Service Flow (Warren)

```
Browser → POST /api/agents/warren/stream (Vercel, edge runtime)
         → Auth check + subscription check (Supabase)
         → POST warren-agent/analyze (Railway, SSE proxy)
              → Strands agent runs tools in executor thread
              → report_pillar/report_verdict → thread-local queue
              → async drain loop → SSE events forwarded in real time
         → SSE: pillar × 6 → verdict → files → done
```

**Key invariant:** The Next.js route owns auth and paywall. Railway has no auth — it's a trusted internal service. Never expose Railway's `/analyze` to the public without the Next.js proxy.

---

## Cross-Service Commands

```bash
# Next.js (run from portfolio-agentx/)
npm run dev          # localhost:3000
npx tsc --noEmit    # type check (run before every commit)
npm run lint         # ESLint (~30s on OneDrive paths)

# Warren agent (run from warren-agent/)
uvicorn main:app --reload           # localhost:8000
python -m pytest tests/ -v          # must be 32/32 before Railway deploy

# Deploy both (from repo root)
git push origin main                # triggers Vercel + Railway auto-deploy
```

---

## Environment Variables

### portfolio-agentx/.env.local
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
NEXT_PUBLIC_APP_URL
RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET
GMAIL_USER / GMAIL_APP_PASSWORD
WARREN_AGENT_URL=http://localhost:8000   # points to Railway in production via Vercel env
INTERNAL_SECRET                          # shared secret for /api/send-reminder auth
```

### warren-agent/.env (Railway)
```
ANTHROPIC_API_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
TAVILY_API_KEY
```

---

## Supabase Schema (key tables)

```
agent_sessions   — id (uuid), user_id, agent_id, title, messages (jsonb)
agent_usage      — user_id + agent_id (pk), count
subscriptions    — id, user_id, status, expires_at, razorpay_payment_id, amount
```

**Premium grant:** `POST /api/admin/set-premium` sets `user_metadata.is_premium` AND inserts a `subscriptions` row with `razorpay_payment_id='admin_grant'`, `expires_at='2099-12-31'`. Both must exist — the stream route verifies against the table, not the JWT.

**`user_id` is NOT unique in subscriptions** — users accumulate rows per payment cycle. The `set-premium` route uses delete-then-insert (not upsert) for the admin grant row.

---

## Known Cross-Service Issues

| Issue | Status | Fix |
|-------|--------|-----|
| Vercel 300s proxy timeout | Fixed | `export const runtime = "edge"` on stream route |
| Premium self-destructs after grant | Fixed | `set-premium` now inserts subscriptions row |
| Sessions not saving | Fixed | `generateSessionId()` → `crypto.randomUUID()` |
| Usage burns on bad ticker | Fixed | Ticker parsed before usage increment |
| Premium chatbar locked despite grant | Fixed | Client queries subscriptions table directly, not just JWT |

---

## Deploy Checklist

Before pushing to main (triggers both deploys):
1. `npx tsc --noEmit` in `portfolio-agentx/` — zero errors
2. `python -m pytest tests/ -v` in `warren-agent/` — 32/32 pass
3. Verify `INTERNAL_SECRET` is set in Vercel env vars (added once, persists)
4. Razorpay amount in `create-order/route.ts` — currently `100` paise (₹1 test). Change to `99900` before going live.
