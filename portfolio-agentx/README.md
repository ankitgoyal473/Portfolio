# AGentX — AI SaaS Portfolio

Live AI agent platform featuring three persona-driven Claude agents backed by real APIs, Supabase auth, a 30-day subscription lifecycle, and a Python microservice for stock analysis.

**Live:** https://portfolio-one-topaz-65.vercel.app  
**Warren API:** https://warren-agent-production.up.railway.app

---

## Agents

| Agent | Role | Free Limit |
|-------|------|-----------|
| **WARRen** | Stock analysis — 5-pillar deep research via yfinance, Screener.in, Tavily | 1 run |
| **Sherlock** | Research & investigation assistant | 1 run |
| **Harvey** | Professional email & communication drafter | 10 runs |

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion |
| Auth & DB | Supabase (SSR auth, RLS, Storage) |
| Payments | Razorpay (30-day subscription, ₹999/month) |
| AI | Anthropic SDK — `claude-sonnet-4-6` |
| Warren backend | FastAPI + Strands + yfinance + Tavily — deployed on Railway |
| Email | Nodemailer + Gmail SMTP |
| Hosting | Vercel (Next.js), Railway (Warren Python service) |

---

## Architecture

```
Browser
  └─ POST /api/agents/warren/stream   (Vercel edge runtime)
       ├─ Auth check (Supabase)
       ├─ Subscription check (subscriptions table)
       ├─ Usage gate (agent_usage table)
       └─ SSE proxy → warren-agent on Railway
              └─ Strands agent: yfinance → Screener.in → Tavily ×4
                   └─ SSE: pillar×6 → verdict → files → done
```

Sherlock and Harvey run Claude API calls directly in the stream route (no external service).

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev       # http://localhost:3000

# Type check (run before every commit)
npx tsc --noEmit

# Lint
npm run lint
```

### Environment variables

Copy and populate `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
GMAIL_USER=
GMAIL_APP_PASSWORD=
WARREN_AGENT_URL=http://localhost:8000
INTERNAL_SECRET=
WARREN_TEST_MODE=        # Set "true" to test Warren UI without Anthropic credits
```

### Warren backend (local)

```bash
cd ../warren-agent
pip install -r requirements.txt
uvicorn main:app --reload    # http://localhost:8000
```

Set `WARREN_AGENT_URL=http://localhost:8000` in `.env.local` to point at the local service.

---

## Supabase Schema

```
agent_sessions   — per-user conversation history
agent_usage      — free-tier counter (user_id + agent_id)
subscriptions    — subscription lifecycle (status, expires_at, razorpay_*)
leads            — freelance project inquiries from /hire
```

---

## Deploy Checklist

Before pushing to `main` (triggers Vercel auto-deploy):

- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] Razorpay amount in `app/api/razorpay/create-order/route.ts` is `99900` (₹999) — currently `100` (₹1 test)
- [ ] `WARREN_TEST_MODE` is unset or `"false"` in Vercel env vars

---

## Test Mode

Set `WARREN_TEST_MODE=true` in Vercel environment variables to make Warren emit all 6 pillar SSE events using real yfinance data without an Anthropic API call. Use this when credits are exhausted or to verify the SSE pipeline.

---

## Admin

`/admin` — gated by `is_admin: true` in Supabase user metadata. Sections: Leads, Stats, Users, Subscribers.

Grant premium access: `POST /api/admin/set-premium` with `{ userId, premium: true }`.
