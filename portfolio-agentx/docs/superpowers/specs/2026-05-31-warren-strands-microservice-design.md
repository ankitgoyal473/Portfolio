# 🧐 WARRen — Strands Microservice Design (Indian Equities)
**Date:** 2026-05-31  
**Status:** Approved — ready for implementation plan  
**Scope:** Upgrade WARRen from Claude-only hallucination → real 6-pillar Buffett-style research engine for Indian stocks, powered by a Python Strands Agent microservice

---

## 🎯 Goal

Replace WARRen's current fake analysis (Claude imagines stock data from training memory) with a real agentic research pipeline — **Indian equities only**:

- 📊 **Live price + technical indicators** via `yfinance` + `pandas-ta`
- 🏰 **Deep fundamentals** via Screener.in (fetched with Jina Reader)
- 📰 **News + analyst sentiment** via Screener.in news tab + 2 targeted Tavily searches
- 📈 **Option chain intel** (PCR, max pain, OI) via Tavily search of MoneyControl/Sensibull
- 🌍 **Global macro + India VIX** via Tavily search
- 💰 **FII/DII institutional flows** via Screener.in shareholding + Tavily market flows
- 💾 **Persistent research files** (9 files) saved to Supabase Storage per analysis
- ⚡ **Streaming pillar-by-pillar output** to the existing WARRen chat UI

---

## 🏗️ Section 1 — System Architecture

```
🖥️  Browser (AGentX Chat UI)
         │
         │  SSE stream  (event: pillar, event: verdict, event: files, event: done)
         ▼
⚡  Next.js  /api/agents/warren/stream       [existing route — modified to proxy]
         │
         │  HTTP POST with { ticker, userId } → SSE proxy
         ▼
🐍  Python FastAPI  warren-agent/            [new service — Railway / Render]
         │
         ▼
🤖  Strands Agent  (claude-sonnet-4-6)
         ├── 📊 tool: get_price_and_technicals(symbol)   → yfinance + pandas-ta
         ├── 🏰 tool: fetch_screener(symbol)             → Jina Reader → screener.in
         ├── 🔍 tool: search_web(query)                  → Tavily Python SDK
         └── 💾 tool: save_research_file(symbol, name, content) → Supabase Storage
```

### 🔄 Request Flow (step-by-step)

1. User types `RELIANCE` or `KPITTECH` in WARRen chat
2. **Auto-detect exchange**: append `.NS` → try yfinance; if not found fallback `.BO`
3. Next.js route performs **auth check + paywall** (unchanged), proxies `{ ticker: "RELIANCE.NS", userId }` to Python microservice
4. Strands agent runs tool-calling loop: fetches data → synthesises each pillar → emits SSE events
5. Next.js **forwards SSE stream** to browser — chat thread renders pillar cards as they arrive, one by one
6. After all 6 pillars + verdict: agent saves 9 research files to Supabase Storage, emits `files` event with signed download URLs (24h expiry)
7. WARRen chat shows **"📥 Download Research Pack"** button beneath the pillar cards

### 🇮🇳 Ticker Handling (Indian equities only)

| User types | Auto-resolved to | Exchange | Option Chain |
|------------|-----------------|----------|-------------|
| `RELIANCE` | `RELIANCE.NS` → fallback `RELIANCE.BO` | 🟢 NSE preferred | ✅ Full PCR + max pain |
| `KPITTECH` | `KPITTECH.NS` | 🟢 NSE | ✅ Full PCR + max pain |
| `RELIANCE.NS` | Used as-is | 🟢 NSE | ✅ |
| `RELIANCE.BO` | Used as-is | 🔵 BSE | ⚠️ Tavily only (BSE options limited) |

**Non-Indian ticker handling:** If yfinance returns no data for `.NS` or `.BO`, WARRen responds: *"I specialise in Indian equities. Try a NSE-listed stock like RELIANCE or INFY. — WARRen 🧐"*

---

## 🐍 Section 2 — Python Microservice Structure

```
warren-agent/
├── main.py                    # FastAPI app — /analyze SSE endpoint + health check
├── agent.py                   # Strands Agent definition, tool wiring, pillar orchestration
├── tools/
│   ├── 📊 technicals.py       # get_price_and_technicals() — yfinance OHLCV + pandas-ta
│   ├── 🏰 screener.py         # fetch_screener() — Jina Reader → screener.in/{symbol}
│   ├── 🔍 web_search.py       # search_web(query) — Tavily Python SDK
│   └── 💾 file_storage.py     # save_research_file() + get_existing_context() — Supabase
├── prompts.py                 # Warren system prompt + per-pillar synthesis instructions
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
numpy
httpx                  # for Jina Reader fetch
tavily-python
supabase
python-dotenv
```

### 🔗 Tool → Data Source Mapping

| 🛠️ Strands Tool | 📡 Data Source | 🎯 Used For |
|---|---|---|
| `get_price_and_technicals()` | 📊 yfinance + pandas-ta | Current price, RSI, MACD, 50/200-day MA, volume, support/resistance |
| `fetch_screener()` | 🏰 `https://r.jina.ai/https://www.screener.in/company/{symbol}/` | PE, PBV, ROE, D/E, margins, FCF, promoter holding, FII/DII %, news tab |
| `search_web(query)` | 🔍 Tavily Python SDK | Sentiment news, analyst ratings, option chain, global macro, FII/DII market flows |
| `save_research_file()` | ☁️ Supabase Storage | Write 9 `.md` research files per analysis |
| `get_existing_context()` | ☁️ Supabase Storage | Load prior summary.md + decision_log.md for the same symbol |

---

## 📋 Section 3 — 6-Pillar Execution Flow

Warren executes the full Buffett methodology in sequence. Each pillar emits an SSE event the moment it completes.

### Pillar Summary Table

| # | 🏛️ Pillar | 🔧 Tools Called | 📡 SSE Event |
|---|---|---|---|
| 1 | 📊 **Technical** | `get_price_and_technicals` | `pillar:Technical` |
| 2 | 🏰 **Fundamental** | `fetch_screener` | `pillar:Fundamental` |
| 3 | 📰 **Sentiment** | `fetch_screener` (news tab) + `search_web` × 2 | `pillar:Sentiment` |
| 4 | 📈 **Option Chain** | `search_web` (PCR + max pain query) | `pillar:OptionChain` |
| 5 | 🌍 **Global Impact** | `search_web` (India VIX, macro, sector) | `pillar:GlobalImpact` |
| 6 | 💰 **FII/DII Flows** | `fetch_screener` (shareholding %) + `search_web` (market flows) | `pillar:FIIDIIFlows` |
| — | 🎯 **Verdict** | Claude synthesises composite score | `verdict` |
| — | 💾 **File Save** | `save_research_file` × 9 | `files` (signed URLs) |

---

### 📊 Pillar 1 — Technical

**Tool:** `get_price_and_technicals(symbol)`  
**Data fetched from yfinance:**
- Current price, day change %, volume
- 1-year OHLCV history for indicator computation

**Indicators computed with pandas-ta:**
- RSI (14) — oversold <30, overbought >70
- MACD (12/26/9) — signal crossover
- 50-day MA, 200-day MA — golden/death cross
- Support (recent 20-day low), Resistance (recent 20-day high)

**Score 1–4:** trend strength + momentum + volume confirmation

---

### 🏰 Pillar 2 — Fundamental

**Tool:** `fetch_screener(symbol)`  
**URL pattern:** `https://r.jina.ai/https://www.screener.in/company/{SYMBOL}/`  
**Data extracted by Claude from Screener.in page:**
- PE ratio, PBV, Market Cap (₹ Cr)
- ROE %, ROCE %, Profit After Tax margin %
- Debt-to-Equity ratio
- Revenue growth (TTM vs prior year)
- Free Cash Flow (positive/negative)
- Promoter holding %
- Buffett Checklist: consistent earnings 5yr, low D/E, high ROE, MOS ≥30%

**Score 1–4:** valuation vs intrinsic value (DCF-estimated) + moat quality

---

### 📰 Pillar 3 — Sentiment

**Three data pulls:**

1. **Screener.in news tab** (free — same page already fetched for Pillar 2)  
   → Recent company-specific news headlines

2. **Tavily search:** `"{company name} stock news India {current month} {year}"`  
   → ET Markets, MoneyControl, Business Standard coverage

3. **Tavily search:** `"{NSE symbol} analyst rating target price buy sell hold 2026"`  
   → Broker upgrades/downgrades, consensus target price, BUY/HOLD/SELL ratio

**Score 1–4:** news sentiment polarity + analyst consensus direction

---

### 📈 Pillar 4 — Option Chain

**Tool:** `search_web(query)`  
**Query:** `"{NSE symbol} NSE option chain PCR put call ratio max pain open interest today"`  
**Sources:** MoneyControl, Sensibull, Optionstrat pages indexed by Tavily

**Data extracted:**
- Put-Call Ratio (PCR) — >1.2 bullish, <0.8 bearish
- Max Pain level (₹)
- OI concentration at key strikes
- IV percentile (high/normal/low)

**Score 1–4 or N/A** (N/A if stock not in F&O segment)

---

### 🌍 Pillar 5 — Global Impact

**Tool:** `search_web(query)`  
**Two searches:**

1. `"India VIX DXY US Fed rate market sentiment {current month} 2026"`
2. `"{sector of stock} sector India outlook headwinds tailwinds 2026"`

**Data analysed:**
- India VIX (fear level) — low <15, elevated 15–25, high >25
- DXY trend (strong USD = FII outflows from India)
- Fed policy stance (hawkish = risk-off)
- Sector tailwinds / headwinds

**Output:** Strong Positive / Positive / Neutral / Negative / Strong Negative (qualitative, no numeric score)

---

### 💰 Pillar 6 — FII/DII Flows

**Two data pulls:**

1. **`fetch_screener(symbol)`** — shareholding pattern section (already fetched)  
   → FII holding %, DII holding %, Promoter % — QoQ changes

2. **`search_web`:** `"FII DII flows India NSE {current month} 2026 institutional buying selling"`  
   → Aggregate market-level smart money direction

**Combined output:**
- Stock-level: FII/DII holding % + QoQ change (increasing = bullish signal)
- Market-level: overall institutional tone (buying / neutral / selling)

**Output:** Bullish / Neutral / Bearish (qualitative)

---

### 🔢 Composite Scoring

```
F&O stocks:     Avg Score = (Technical + Fundamental + Sentiment + OptionChain) / 4
Non-F&O stocks: Avg Score = (Technical + Fundamental + Sentiment) / 3

Conviction:
  3.5 – 4.0 → 🔥 HIGH      ACCUMULATE  (max 10% portfolio allocation)
  2.5 – 3.5 → ✅ MEDIUM    HOLD/DIPS   (max 6% portfolio allocation)
  1.5 – 2.5 → ⚠️  LOW       REDUCE      (max 3% portfolio allocation)
  < 1.5     → ❌ AVOID      EXIT
```

---

### ⏳ Chat UI — Thinking Steps (updated for Indian equities)

```
📊 Fetching live NSE price data...
📐 Computing RSI, MACD & moving averages...
🏰 Reading Screener.in fundamentals...
📰 Scanning news & analyst sentiment...
📈 Checking option chain & PCR...
🌍 Assessing India VIX & global macro...
💰 Tracking FII/DII institutional flows...
🎯 Forming conviction & verdict...
💾 Saving research files...
```

---

## 💾 Section 4 — Research Files & Frontend Changes

### 📁 Supabase Storage Structure

All 9 research files saved per analysis (mirrors personal skill methodology):

```
supabase-storage/
└── warren-research/
    └── {user_id}/
        └── {NSE_SYMBOL}/           e.g. RELIANCE
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

- Files saved **after** all 6 pillars complete + verdict formed
- `files` SSE event carries **signed URLs** (24h expiry) for all 9 files
- WARRen chat renders **"📥 Download Research Pack"** button — premium differentiator
- `get_existing_context()` loads prior `summary.md` + `decision_log.md` at session start so WARRen can reference past analyses of the same stock

### ⚡ Next.js Changes (minimal)

| 📄 File | 🔧 Change |
|---------|-----------|
| `app/api/agents/warren/stream/route.ts` | Replace direct Claude call with HTTP SSE proxy to `WARREN_AGENT_URL`; auth + paywall unchanged |
| `components/agents/PillarCards.tsx` | Extend from 5 to 6 pillars; add Global Impact qualitative row; add FII/DII row; add Verdict card |
| `components/agents/ChatThread.tsx` | Handle `files` SSE event → render "📥 Download Research Pack" button |
| `app/agents/[name]/page.tsx` | Update `WARREN_THINKING` steps array with 9 Indian-specific steps |

### 🔑 Environment Variables

**Next.js (Vercel) — add one:**
```
WARREN_AGENT_URL=https://warren-agent.railway.app
```

**Python Microservice (Railway) — all four required:**
```
ANTHROPIC_API_KEY=sk-ant-...
TAVILY_API_KEY=tvly-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 🚀 Deployment Plan

| 🛠️ Service | 🌐 Platform | 📝 Notes |
|------------|-------------|---------|
| 🐍 Python microservice | Railway (free tier → Hobby if needed) | Deploy `warren-agent/` as separate Railway service |
| ⚡ Next.js app | Vercel (existing) | Add `WARREN_AGENT_URL` env var only |
| ☁️ Supabase Storage | Supabase (existing project) | Create `warren-research` bucket; RLS policy: users access own `{user_id}/` prefix |

---

## ✅ Success Criteria

- [ ] User types `RELIANCE` → auto-resolved to `RELIANCE.NS`, full 6-pillar analysis returns
- [ ] Technical pillar shows real current NSE price, computed RSI and MACD (not training-data estimates)
- [ ] Fundamental pillar pulls real PE, ROE, D/E from Screener.in
- [ ] Sentiment pillar references actual headlines from the last 7 days
- [ ] Option chain pillar returns real PCR and max pain level from MoneyControl/Sensibull via Tavily
- [ ] FII/DII pillar shows QoQ shareholding changes from Screener.in
- [ ] All 9 research files saved to Supabase Storage; "📥 Download Research Pack" button appears in chat
- [ ] Pillar cards stream into the chat one by one — not all at once
- [ ] Non-Indian ticker → graceful refusal message in Warren's voice
- [ ] Paywall + auth enforced in Next.js — microservice never called for locked users
- [ ] `warren-research` Supabase Storage bucket created with per-user RLS
- [ ] Build passes: `npx tsc --noEmit && npm run lint && npm run build`

---

## 📚 References

| 📖 Resource | 🔗 |
|-------------|---|
| Methodology source | `D:\2025-2030\claude-stock-research-memory\warren-analysis-updated.md` |
| Agent framework | Strands Agents SDK |
| Fundamentals data | `https://www.screener.in/company/{SYMBOL}/` via Jina Reader |
| Price + indicators | yfinance + pandas-ta |
| News + search | Tavily Python SDK |
| Model | `claude-sonnet-4-6` |
