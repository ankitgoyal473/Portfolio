# warren-agent — Current State

Last updated: 2026-06-02

## Status: Deployed on Railway

**Live URL:** https://warren-agent-production.up.railway.app
**Python:** 3.12
**Tests:** 32 passing

## What's Working
- `/health` endpoint
- `/analyze` SSE endpoint — full 5-pillar analysis (8–12 min per symbol)
- Pillar + verdict SSE events stream in real-time
- **`thinking` SSE events** — live progress updates via `emit_thinking(message)` in `tools/reporting.py`. Frontend renders as scrolling `✦ message…` log during analysis. Currently wired: `get_price_and_technicals`, `fetch_screener`, `search_web`.
- Supabase Storage research file saves (`warren-research/{user_id}/{SYMBOL}/{YYYYMMDD}/`)
- Ticker resolution: auto-appends `.NS`, falls back to `.BO`
- Data sources: yfinance (technicals), screener.in via Jina (fundamentals), Tavily ×4 (news/context)

## Known Issues
- **Vercel 300s proxy timeout** — Warren analysis takes ~655s. The proxy in portfolio-agentx's `/api/agents/warren/stream/route.ts` dies at 300s. This is a portfolio-agentx bug, not this service.
  - **Fix identified:** Add `export const runtime = 'edge'` to that route.
  - **Status:** Not yet applied.

## In Progress
- Waiting on portfolio-agentx to apply edge runtime fix

## Next Priority
1. Coordinate edge runtime fix with portfolio-agentx
2. Add caching for screener.in responses to reduce analysis time
3. More test coverage for ticker edge cases (delistings, suspended stocks)

## Key Files
```
agent.py          — Strands agent, AnthropicModel config
prompts.py        — system prompt (WARREN_SYSTEM_PROMPT)
tools/reporting.py — SSE event bridge (thread-local queue)
requirements.txt  — Python deps
tests/            — 32 tests
```
