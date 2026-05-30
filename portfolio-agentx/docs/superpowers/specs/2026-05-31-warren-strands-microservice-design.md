# 🧐 WARRen — Strands Microservice Design
**Date:** 2026-05-31  
**Status:** Approved  
**Scope:** Upgrade WARRen from Claude-only hallucination → real 6-pillar stock research powered by a Python Strands Agent microservice

---

## 🎯 Goal

Replace WARRen's current fake analysis (Claude imagines stock data from training memory) with a real agentic research pipeline:

- **Live financial data** via `yfinance`
- **Real news, sentiment & macro** via Tavily Python SDK
- **Buffett 6-pillar methodology** from `warren-analysis-updated.md`
- **Persistent research files** saved to Supabase Storage
- **Streaming pillar-by-pillar output** to the existing chat UI

---

## 🏗️ Section 1 — System Architecture

```
🖥️  Browser (AGentX Chat UI)
         │
         │  SSE stream  (event: pillar, event: verdict, event: files, event: done)
         ▼
⚡  Next.js  /api/agents/warren/stream   [existing route — modified to proxy]
         │
         │  HTTP POST → SSE proxy
         ▼
🐍  Python FastAPI  warren-agent/        [new service — Railway / Render]
         │
         ▼
🤖  Strands Agent  (claude-sonnet-4-6)
         ├── 📊 tool: get_stock_data(ticker)             → yfinance
         ├── 📐 tool: compute_indicators(ticker)         → pandas-ta on OHLCV
         ├── 🔍 tool: search_web(query)                  → Tavily Python SDK
         └── 💾 tool: save_research_file(symbol, file)  → Supabase Storage
```

### 🔄 Request Flow (step-by-step)

1. User types `AAPL` or `RELIANCE.NS` in WARRen chat
2. Next.js route performs **auth check + paywall** (unchanged), then proxies to Python microservice
3. Strands agent runs tool-calling loop: fetches data → synthesizes each pillar → emits SSE events
4. Next.js **forwards SSE stream** to browser — chat thread renders pillar cards as they arrive
5. After all 6 pillars: agent saves 9 research files to Supabase Storage, emits a `files` event with signed download URLs (24h expiry)
6. WARRen chat shows **"📥 Download Research Pack"** button beneath the pillar cards

### 🌐 Ticker Handling

| Format | Exchange | Option Chain |
|--------|----------|-------------|
| `AAPL`, `MSFT`, `TSLA` | 🇺🇸 NYSE / NASDAQ | Included if listed |
| `RELIANCE.NS`, `KPITTECH.NS` | 🇮🇳 NSE | Full PCR + max pain via Tavily |
| `RELIANCE.BO` | 🇮🇳 BSE | No option chain |

---

## 🐍 Section 2 — Python Microservice Structure

```
warren-agent/
├── main.py                  # FastAPI app — /analyze SSE endpoint
├── agent.py                 # Strands Agent definition + tool wiring
├── tools/
│   ├── 📊 stock_data.py     # get_stock_data() via yfinance
│   ├── 📐 indicators.py     # compute_indicators() via pandas-ta (RSI, MACD, MA)
│   ├── 🔍 web_search.py     # search_web() via Tavily Python SDK
│   └── 💾 file_storage.py   # save_research_file() + get_existing_context() via Supabase Python SDK
├── prompts.py               # Warren system prompt + per-pillar instructions
└── requirements.txt
```

### 📦 Dependencies (`requirements.txt`)

```
strands-agents
fastapi
uvicorn
yfinance
pandas-ta
pandas
tavily-python
supabase
python-dotenv
```

### 🔗 Tool → Source Mapping

| Personal Skill MCP | Strands Tool | Data Source |
|---|---|---|
| `Filesystem:write_file` | `save_research_file()` | ☁️ Supabase Storage |
| `Filesystem:read_text_file` | `get_existing_context()` | ☁️ Supabase Storage |
| *(web browsing)* | `search_web()` | 🔍 Tavily Python SDK |
| *(implied)* | `get_stock_data()` | 📊 yfinance |
| *(implied)* | `compute_indicators()` | 📐 pandas-ta |

---

## 📋 Section 3 — 6-Pillar Execution Flow

Warren executes the full Buffett methodology in sequence. Each pillar emits an SSE event the moment it completes, so the UI streams in results live.

| # | 🏛️ Pillar | 🔧 Tools Used | 📡 SSE Event |
|---|---|---|---|
| 1 | 📊 **Technical** | `get_stock_data` + `compute_indicators` | `pillar:Technical` |
| 2 | 🏰 **Fundamental** | `get_stock_data` (financials) | `pillar:Fundamental` |
| 3 | 📰 **Sentiment** | `search_web` (news, analyst ratings) | `pillar:Sentiment` |
| 4 | 📈 **Option Chain** | `search_web` (NSE PCR, max pain, OI) | `pillar:OptionChain` |
| 5 | 🌍 **Global Impact** | `search_web` (VIX, DXY, Fed, macro) | `pillar:GlobalImpact` |
| 6 | 💰 **FII/DII Flows** | `search_web` (institutional activity) | `pillar:FIIDIIFlows` |
| — | 🎯 **Verdict** | Claude synthesizes composite score | `verdict` |
| — | 💾 **File Save** | `save_research_file` × 9 | `files` (download URLs) |

### 🔢 Scoring Logic (from `warren-analysis-updated.md`)

```
Technical Score:    1–4   (trend, momentum, volume)
Fundamental Score:  1–4   (valuation, moat, MOS, ROE)
Sentiment Score:    1–4   (news, analyst, management tone)
Option Chain Score: 1–4 or N/A  (PCR, max pain, IV)
Global Impact:      qualitative  (Strong Positive → Strong Negative)
FII/DII Flows:      qualitative  (Bullish / Neutral / Bearish)

Composite Score (F&O):     avg(Technical, Fundamental, Sentiment, OptionChain)
Composite Score (non-F&O): avg(Technical, Fundamental, Sentiment)

Conviction:
  3.5–4.0 → 🔥 HIGH      (accumulate, max 10% portfolio)
  2.5–3.5 → ✅ MEDIUM    (hold or dips, max 6%)
  1.5–2.5 → ⚠️ LOW       (reduce / avoid, max 3%)
  < 1.5   → ❌ AVOID     (EXIT)
```

### ⏳ Chat UI Thinking Steps (updated labels)

```
📊 Fetching live price data...
📐 Computing RSI, MACD & moving averages...
🏰 Analysing fundamentals & moat...
📰 Scanning news & analyst sentiment...
📈 Reading option chain & PCR...
🌍 Assessing global macro & VIX...
💰 Tracking FII/DII institutional flows...
🎯 Forming conviction & verdict...
💾 Saving research files...
```

---

## 💾 Section 4 — Research Files & Frontend Changes

### 📁 Supabase Storage Structure

All 9 research files (from the personal skill methodology) are saved at:

```
supabase-storage/
└── warren-research/
    └── {user_id}/
        └── {symbol}/
            └── {YYYYMMDD}/
                ├── 📊 technical.md
                ├── 🏰 fundamental.md
                ├── 📰 sentiment.md
                ├── 📈 option_chain.md
                ├── 🌍 global_impact.md
                ├── 💰 fii_dii.md
                ├── 📋 decision_log.md
                ├── 📄 summary.md
                └── 📄 summary_YYYYMMDD.md
```

After all 9 files are saved, the microservice emits a `files` SSE event containing signed URLs (24h expiry). The WARRen chat thread renders a **"📥 Download Research Pack"** button — premium differentiator.

### ⚡ Next.js Changes (minimal surface area)

| File | Change |
|------|--------|
| `app/api/agents/warren/stream/route.ts` | Replace direct Claude call with HTTP + SSE proxy to `WARREN_AGENT_URL` |
| `components/agents/PillarCards.tsx` | Add FII/DII pillar card + Global Impact row + verdict card |
| `components/agents/ChatThread.tsx` | Handle `files` event → render "📥 Download Research Pack" button |

### 🔑 Environment Variables

**Next.js / Vercel:**
```
WARREN_AGENT_URL=https://warren-agent.railway.app
```

**Python Microservice / Railway:**
```
ANTHROPIC_API_KEY=...
TAVILY_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 🚀 Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| 🐍 Python microservice | Railway (free tier) | `warren-agent/` repo or subdirectory |
| ⚡ Next.js app | Vercel (existing) | Add `WARREN_AGENT_URL` env var |
| ☁️ Supabase Storage | Supabase (existing) | New `warren-research` bucket, RLS per user |

---

## ✅ Success Criteria

- [ ] `AAPL` returns real current price, RSI, MACD, PE, ROE from yfinance
- [ ] `RELIANCE.NS` returns full 6-pillar analysis including NSE option chain data
- [ ] News sentiment pillar references headlines from the last 7 days (Tavily)
- [ ] All 9 research files saved to Supabase Storage + download URLs in chat
- [ ] Pillar cards stream into the chat UI one by one (not all at once)
- [ ] Paywall + auth enforced by Next.js before the microservice is ever called
- [ ] `warren-research` Supabase Storage bucket created with per-user RLS policy
- [ ] Build passes: `npx tsc --noEmit && npm run lint && npm run build`

---

*Methodology source: `D:\2025-2030\claude-stock-research-memory\warren-analysis-updated.md`*  
*Agent framework: [Strands Agents SDK](https://strandsagents.com)*  
*Model: `claude-sonnet-4-6`*
