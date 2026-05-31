# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

Two services live at the repo root:

```
Portfolio/
├── portfolio-agentx/   # Next.js 16 frontend + API (deployed on Vercel)
└── warren-agent/       # Python FastAPI + Strands Agent microservice (deployed on Railway)
```

Each has its own CLAUDE.md / guidance. This file covers the root-level view and cross-service concerns.

---

## portfolio-agentx (Next.js)

**Full guidance:** `portfolio-agentx/CLAUDE.md` — read it before touching anything in that directory.

### Commands

```bash
cd portfolio-agentx
npm run dev           # Dev server — localhost:3000
npm run build         # Production build (Turbopack)
npm run lint          # ESLint
npx tsc --noEmit      # Type check
```

**Before marking any work done:**
```bash
npx tsc --noEmit && npm run lint && npm run build
```

### Key facts
- **Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS v4, Framer Motion, Supabase SSR, Razorpay, Nodemailer
- **Live:** https://portfolio-one-topaz-65.vercel.app
- **Middleware:** `proxy.ts` at repo root (NOT `middleware.ts`) — exports `proxy()` not `middleware()`
- **Tailwind config:** in `app/globals.css` via `@theme inline`, not `tailwind.config.js`
- **Agent icons:** NOT on the `Agent` type — use `AGENT_ICONS` from `lib/agents.ts` by slug (RSC serialization constraint)
- **WARRen ticker regex:** `app/agents/[name]/page.tsx` — `{1,15}` chars to support long Indian tickers

---

## warren-agent (Python Strands Microservice)

Indian equity research agent. Receives a ticker, runs a 6-pillar Buffett-style analysis, streams SSE events back to the Next.js app.

### Commands

```bash
cd warren-agent
pip install -r requirements.txt   # Install deps (Python 3.12+)
uvicorn main:app --reload          # Dev server — localhost:8000
python -m pytest tests/ -v         # Run all 23 tests
python -m pytest tests/test_technicals.py -v   # Single test file
```

### Architecture

```
main.py          FastAPI app — /health + /analyze SSE endpoint
agent.py         Strands Agent orchestration — resolve_symbol(), extract_json_objects(), run_analysis()
prompts.py       WARREN_SYSTEM_PROMPT + build_prompt()
tools/
  technicals.py  get_price_and_technicals() — yfinance + pandas-ta
  screener.py    fetch_screener() — Jina Reader → screener.in/{SYMBOL}/
  web_search.py  search_web() — Tavily Python SDK
  file_storage.py save_research_file() + get_existing_context() — Supabase Storage
```

### Request flow

1. `POST /analyze { ticker, user_id }` → `resolve_symbol()` auto-appends `.NS`, falls back to `.BO`
2. `_symbol_is_valid()` validates via yfinance; invalid ticker → error SSE stream
3. `run_analysis()` creates a Strands `Agent` with `AnthropicModel` (must be explicit — Strands defaults to AWS Bedrock)
4. Agent makes tool calls: yfinance → Screener.in → Tavily ×4
5. `extract_json_objects()` (brace-balanced extractor) parses pillar/verdict JSON from agent response
6. SSE events emitted: `pillar`, `verdict`, `files`, `done`; `: keepalive` comments every 15s prevent Railway edge timeout
7. Research files saved to Supabase Storage at `warren-research/{user_id}/{SYMBOL}/{YYYYMMDD}/`

### Critical quirks

- **Strands ≠ Bedrock by default** — always create `AnthropicModel(client_args={"api_key": ...}, model_id="claude-sonnet-4-6")` explicitly and pass to `Agent(model=model, ...)`
- **Analysis takes 3–5 minutes** — the full tool call loop (yfinance + Screener.in + 4× Tavily + Claude synthesis) is slow. This is expected.
- **Pillar JSON format** — the prompt instructs Claude to output pillar objects as single-line JSON; `extract_json_objects()` handles multi-line too
- **Supabase Storage bucket** — `warren-research` (private); RLS policy `warren_research_user_isolation` enforces `{user_id}/` prefix per user

### Environment variables

```
ANTHROPIC_API_KEY
TAVILY_API_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

---

## Cross-service: Warren SSE handoff

`portfolio-agentx/app/api/agents/warren/stream/route.ts` handles auth + paywall, then proxies to:
```
process.env.WARREN_AGENT_URL/analyze   # e.g. https://warren-agent-production.up.railway.app
```

The Next.js route owns auth/paywall enforcement. The Python service is intentionally auth-free — it trusts the proxy.

### SSE event types (warren)

| Event | Payload | UI action |
|-------|---------|-----------|
| `pillar` | `{ pillar, score, signal, summary, keyMetrics }` | Render `PillarCards` |
| `verdict` | `{ verdict, conviction, avgScore, entry, target, stopLoss, riskReward }` | Render `VerdictCard` |
| `files` | `{ urls: Record<filename, signedUrl>, symbol, date }` | Show download button |
| `error` | `{ message }` | Show error in chat |
| `done` | `{}` | End stream |
| `: keepalive` | (SSE comment) | Keep connection alive |

---

## Deployment

| Service | Platform | Trigger |
|---------|----------|---------|
| `portfolio-agentx` | Vercel | Auto on `main` push |
| `warren-agent` | Railway | Auto on `main` push (root dir: `warren-agent`) |

**Vercel env var to add after Railway deploy:** `WARREN_AGENT_URL=https://warren-agent-production.up.railway.app`

**Supabase project:** `agentx-portfolio` (`dwcdzjhelmjjhsdcyrgc`) — India South region

## Design spec & plans

- Spec: `portfolio-agentx/docs/superpowers/specs/2026-05-31-warren-strands-microservice-design.md`
- Implementation plan: `portfolio-agentx/docs/superpowers/plans/2026-05-31-warren-strands-microservice.md`
