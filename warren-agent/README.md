# warren-agent

FastAPI microservice powering Warren — the stock analysis agent on AGentX. Deployed on Railway, proxied by `portfolio-agentx` after auth and paywall checks.

**Live:** https://warren-agent-production.up.railway.app  
**Proxied by:** https://portfolio-one-topaz-65.vercel.app → `/api/agents/warren/stream`

---

## What it does

Runs a 5-pillar deep research analysis on any NSE/BSE-listed stock:

1. **Technicals** — RSI, MACD, moving averages via yfinance + pandas-ta
2. **Fundamentals** — P/E, ROE, debt ratios via Screener.in (Jina Reader)
3. **News & Sentiment** — recent headlines via Tavily
4. **Management & Governance** — promoter activity, pledges via Tavily
5. **Macro & Sector** — sector tailwinds/headwinds via Tavily

Streams results as SSE events (`pillar`, `verdict`, `files`, `done`) while the agent runs. Full analysis takes 8–12 minutes.

---

## Stack

| Component | Tech |
|-----------|------|
| Framework | FastAPI |
| Agent | Strands + `AnthropicModel(model_id="claude-sonnet-4-6")` |
| Data | yfinance, Screener.in via Jina Reader, Tavily |
| Storage | Supabase Storage (`warren-research/` bucket) |
| Runtime | Python 3.12, Railway |

---

## Local Development

```bash
pip install -r requirements.txt
uvicorn main:app --reload     # http://localhost:8000
```

### Environment variables (`.env`)

```env
ANTHROPIC_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
TAVILY_API_KEY=
WARREN_TEST_MODE=    # Set "true" to bypass LLM and emit mock pillar events
```

---

## Running tests

```bash
python -m pytest tests/ -v          # all 32 tests
python -m pytest tests/test_technicals.py -v   # single module
```

All 32 tests must pass before deploying to Railway.

---

## SSE Event Contract

| Event | Key fields |
|-------|-----------|
| `pillar` | `pillar, score, signal, summary, keyMetrics` |
| `verdict` | `verdict, conviction, avgScore, entry, target, stopLoss, riskReward` |
| `files` | `urls: Record<filename, signedUrl>, symbol, date` |
| `thinking` | `message` — live progress log rendered by the frontend |
| `error` | `message` |

Keepalive comments (`: keepalive`) are sent every 15 seconds to prevent Railway edge timeouts.

---

## Test Mode

When `test_mode=true` in the request body (or `WARREN_TEST_MODE=true` env var), `_run_test_mode()` emits all 6 real pillar events using actual yfinance data — no Anthropic API call. Use this to test the SSE pipeline and frontend rendering without credits.

```bash
curl -X POST https://warren-agent-production.up.railway.app/analyze \
  -H "Content-Type: application/json" \
  -d '{"ticker":"HDFCBANK","user_id":"test","test_mode":true}'
```

---

## Architecture

```
main.py            FastAPI — /health, /analyze (SSE, 20-min deadline)
agent.py           Strands orchestration — resolve_symbol(), run_analysis()
prompts.py         WARREN_SYSTEM_PROMPT + build_prompt()
tools/
  technicals.py    get_price_and_technicals() — yfinance + pandas-ta
  screener.py      fetch_screener() — Jina → screener.in/{SYMBOL}/
  web_search.py    search_web() — Tavily Python SDK
  file_storage.py  save_research_file() — Supabase Storage
  reporting.py     report_pillar() / report_verdict() / emit_thinking() — SSE via thread-local queue
```

The SSE bridge uses a `threading.Queue` stored in thread-local storage (`_reporting_local.q`). Tool functions write events to the queue; the async event loop in `run_analysis()` polls every 0.5 s and forwards them as SSE.

---

## Deploy

Push to `main` — Railway auto-deploys from GitHub. Verify with:

```bash
curl https://warren-agent-production.up.railway.app/health
```
