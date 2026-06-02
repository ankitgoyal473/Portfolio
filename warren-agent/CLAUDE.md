# CLAUDE.md — warren-agent

Python FastAPI microservice. Powers WARRen stock analysis on portfolio-agentx.
Deployed on Railway. Proxied by Next.js `/api/agents/warren/stream/` in portfolio-agentx.

## Relationship to Other Projects
- **This service** → `https://warren-agent-production.up.railway.app`
- **portfolio-agentx** → proxies `/api/agents/warren/stream/` to this service
- **claude-stock-research-memory** → separate Claude Desktop memory store. Unrelated. Do NOT read from or write to it from here.

## Commands
```bash
pip install -r requirements.txt     # Python 3.12+
uvicorn main:app --reload           # Dev — localhost:8000
python -m pytest tests/ -v          # All 32 tests
python -m pytest tests/test_technicals.py -v  # Single module
```

## Architecture
```
main.py           FastAPI — /health + /analyze (SSE, 20-min deadline, keepalive every 15s)
agent.py          Strands orchestration — AnthropicModel (always explicit)
prompts.py        WARREN_SYSTEM_PROMPT + build_prompt()
tools/
  technicals.py   get_price_and_technicals() — yfinance + pandas-ta (RSI, MACD, MA)
  screener.py     fetch_screener() — Jina Reader → screener.in/{SYMBOL}/
  web_search.py   search_web() — Tavily Python SDK
  file_storage.py save_research_file() + get_existing_context() — Supabase Storage
  reporting.py    report_pillar() + report_verdict() — SSE via thread-local queue
```

## SSE Event Contract
| Event | Payload |
|-------|---------|
| `pillar` | `{ pillar, score, signal, summary, keyMetrics }` |
| `verdict` | `{ verdict, conviction, avgScore, entry, target, stopLoss, riskReward }` |
| `files` | `{ urls: Record<filename, signedUrl>, symbol, date }` |
| `error` | `{ message }` |

## Critical Rules
1. **Always pass `AnthropicModel` explicitly** — `Agent(model=AnthropicModel(...), ...)`. Strands defaults to AWS Bedrock without this.
2. **Thread-local queue is the SSE bridge** — `_reporting_local.q`. New tools emitting SSE events must follow this pattern.
3. **32 tests must pass** before any Railway deploy.
4. **Ticker resolution** — auto-appends `.NS`, falls back to `.BO`. Invalid tickers emit an error SSE event.

## SSE: `thinking` events
Tools can emit live progress updates via `emit_thinking(message)` from `tools/reporting.py`. The frontend renders these as a scrolling `✦ message…` log during the 8–12 min analysis. Call it at the start of each tool function body.

Currently wired: `get_price_and_technicals`, `fetch_screener`, `search_web`.

## Environment Variables
```
ANTHROPIC_API_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
TAVILY_API_KEY
```

## Session End Rule
Update `CURRENT_STATE.md` before ending your session.
