# CLAUDE.md — warren-agent

Python FastAPI microservice. Powers Warren stock analysis on portfolio-agentx.
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
5. **`build_prompt()` must say `call report_pillar(...)` at each step** — NOT "Output JSON". The LLM follows user-prompt instructions over system prompt; "Output JSON" caused 0/6 pillars.

## SSE: `thinking` events
Tools emit live progress via `emit_thinking(message)` from `tools/reporting.py`. Frontend renders as scrolling `✦ message…` log. Call at the start of each tool function body.

Currently wired: `get_price_and_technicals`, `fetch_screener`, `search_web`.

## Test Mode (pipeline testing without LLM)
`AnalyzeRequest` accepts `test_mode: bool = False` and `api_key: str = ""`.

When `test_mode=True` (or `WARREN_TEST_MODE=true` env var), `_run_test_mode()` emits all 6 pillar events + verdict using real yfinance data, bypassing the LLM entirely. Use this to verify the SSE pipeline and UI rendering without Anthropic API credits.

```bash
# Test pipeline directly
curl -X POST https://warren-agent-production.up.railway.app/analyze \
  -H "Content-Type: application/json" \
  -d '{"ticker":"HDFCBANK","user_id":"test","test_mode":true}'
```

The `api_key` field is forwarded by the Next.js proxy from its own `ANTHROPIC_API_KEY` env var. Railway falls back to its own `ANTHROPIC_API_KEY` if the forwarded key is empty.

## Environment Variables
```
ANTHROPIC_API_KEY          # LLM calls (falls back to api_key from request body)
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
TAVILY_API_KEY
WARREN_TEST_MODE           # Set "true" to force test_mode on all requests (useful when credits exhausted)
```

## Session End Rule
Update `CURRENT_STATE.md` before ending your session.
