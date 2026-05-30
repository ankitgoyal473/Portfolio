# WARRen Strands Microservice — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Python Strands Agent microservice that gives WARRen real 6-pillar Buffett-style analysis of Indian equities using yfinance, Screener.in (Jina Reader), and Tavily.

**Architecture:** Python FastAPI service (`warren-agent/`) deployed on Railway. The existing Next.js `/api/agents/warren/stream` route proxies requests to it. The Strands Agent orchestrates 4 tools sequentially, emitting SSE pillar events as each completes. Research files are saved to Supabase Storage.

**Tech Stack:** Python 3.11+, Strands Agents SDK, FastAPI, yfinance, pandas-ta, httpx (Jina Reader), tavily-python, supabase-py, Next.js (proxy changes only)

**Spec:** `docs/superpowers/specs/2026-05-31-warren-strands-microservice-design.md`

---

## 📁 File Map

**New — Python microservice (`warren-agent/` at repo root, sibling to `portfolio-agentx/`):**

| File | Responsibility |
|------|---------------|
| `requirements.txt` | All Python dependencies |
| `.env.example` | Env var template |
| `main.py` | FastAPI app — `/health` + `/analyze` SSE endpoint |
| `agent.py` | Strands Agent definition, orchestration, SSE event emission, file saving |
| `prompts.py` | Warren system prompt + pillar output format instructions |
| `tools/__init__.py` | Empty |
| `tools/technicals.py` | `get_price_and_technicals()` via yfinance + pandas-ta |
| `tools/screener.py` | `fetch_screener()` via Jina Reader → screener.in |
| `tools/web_search.py` | `search_web()` via Tavily Python SDK |
| `tools/file_storage.py` | `save_research_file()` + `get_existing_context()` via Supabase Storage |
| `tests/__init__.py` | Empty |
| `tests/test_technicals.py` | Unit tests for technicals tool |
| `tests/test_screener.py` | Unit tests for screener tool |
| `tests/test_web_search.py` | Unit tests for web search tool |
| `tests/test_file_storage.py` | Unit tests for file storage tool |
| `tests/test_main.py` | Integration tests for FastAPI endpoints |

**Modified — Next.js (`portfolio-agentx/`):**

| File | Change |
|------|--------|
| `app/api/agents/warren/stream/route.ts` | Proxy to `WARREN_AGENT_URL` instead of direct Claude call |
| `components/agents/PillarCards.tsx` | 6 pillars + Global Impact row + FII/DII row + Verdict card |
| `components/agents/ChatThread.tsx` | Handle `files` SSE event → "📥 Download Research Pack" button |
| `app/agents/[name]/page.tsx` | Update `WARREN_THINKING` steps (9 steps) |

---

## Task 1: Project Scaffold

**Files:**
- Create: `warren-agent/requirements.txt`
- Create: `warren-agent/.env.example`
- Create: `warren-agent/tools/__init__.py`
- Create: `warren-agent/tests/__init__.py`

- [ ] **Step 1: Create the warren-agent directory and files**

```bash
cd "D:\2025-2030\2026\Claude Workspace\Portfolio"
mkdir warren-agent
mkdir warren-agent\tools
mkdir warren-agent\tests
```

Write `warren-agent/requirements.txt`:
```
strands-agents==0.1.6
fastapi==0.115.0
uvicorn[standard]==0.30.6
yfinance==0.2.51
pandas-ta==0.3.14b0
pandas==2.2.2
numpy==1.26.4
httpx==0.27.2
tavily-python==0.5.0
supabase==2.9.0
python-dotenv==1.0.1
pytest==8.3.2
pytest-asyncio==0.24.0
httpx==0.27.2
```

Write `warren-agent/.env.example`:
```
ANTHROPIC_API_KEY=sk-ant-...
TAVILY_API_KEY=tvly-...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Write `warren-agent/tools/__init__.py`: *(empty file)*

Write `warren-agent/tests/__init__.py`: *(empty file)*

- [ ] **Step 2: Create a `.env` from `.env.example` and fill in real values**

Copy `.env.example` to `.env` and add real keys. The `.env` file is never committed.

- [ ] **Step 3: Commit scaffold**

```bash
cd "D:\2025-2030\2026\Claude Workspace\Portfolio"
git add warren-agent/requirements.txt warren-agent/.env.example warren-agent/tools/__init__.py warren-agent/tests/__init__.py
git commit -m "feat(warren-agent): project scaffold — requirements and structure"
```

---

## Task 2: Technicals Tool (TDD)

**Files:**
- Create: `warren-agent/tools/technicals.py`
- Create: `warren-agent/tests/test_technicals.py`

- [ ] **Step 1: Write the failing tests**

Write `warren-agent/tests/test_technicals.py`:
```python
import pandas as pd
import numpy as np
from unittest.mock import patch, MagicMock


def _make_mock_hist(n=252):
    dates = pd.date_range("2025-01-01", periods=n, freq="B")
    prices = np.linspace(2100, 2900, n)
    return pd.DataFrame({
        "Open": prices * 0.99,
        "High": prices * 1.02,
        "Low": prices * 0.98,
        "Close": prices,
        "Volume": np.random.randint(500_000, 2_000_000, n),
    }, index=dates)


def _make_mock_info(price=2900.0):
    return {
        "currentPrice": price,
        "previousClose": 2850.0,
        "volume": 1_000_000,
        "averageVolume": 800_000,
        "fiftyTwoWeekHigh": 3100.0,
        "fiftyTwoWeekLow": 2100.0,
    }


def test_returns_price_in_output():
    with patch("tools.technicals.yf.Ticker") as mock_cls:
        t = MagicMock()
        t.info = _make_mock_info(2900.0)
        t.history.return_value = _make_mock_hist()
        mock_cls.return_value = t

        from tools.technicals import get_price_and_technicals
        result = get_price_and_technicals("RELIANCE.NS")

    assert "2900" in result


def test_returns_rsi_macd_ma():
    with patch("tools.technicals.yf.Ticker") as mock_cls:
        t = MagicMock()
        t.info = _make_mock_info()
        t.history.return_value = _make_mock_hist()
        mock_cls.return_value = t

        from tools.technicals import get_price_and_technicals
        result = get_price_and_technicals("RELIANCE.NS")

    assert "RSI" in result
    assert "MACD" in result
    assert "50-day MA" in result
    assert "200-day MA" in result
    assert "Support" in result
    assert "Resistance" in result


def test_empty_history_returns_error_message():
    with patch("tools.technicals.yf.Ticker") as mock_cls:
        t = MagicMock()
        t.info = {}
        t.history.return_value = pd.DataFrame()
        mock_cls.return_value = t

        from tools.technicals import get_price_and_technicals
        result = get_price_and_technicals("INVALID.NS")

    assert "No data" in result
```

- [ ] **Step 2: Run — expect ImportError (file doesn't exist yet)**

```bash
cd warren-agent
python -m pytest tests/test_technicals.py -v
```
Expected: `ModuleNotFoundError: No module named 'tools.technicals'`

- [ ] **Step 3: Install dependencies**

```bash
cd warren-agent
pip install -r requirements.txt
```

- [ ] **Step 4: Implement `tools/technicals.py`**

```python
import yfinance as yf
import pandas as pd
import pandas_ta as ta
from strands import tool


@tool
def get_price_and_technicals(symbol: str) -> str:
    """
    Fetches live NSE/BSE price data and computes technical indicators for an Indian stock.
    Returns current price, RSI(14), MACD(12/26/9), 50/200-day MA, support, resistance.
    """
    ticker = yf.Ticker(symbol)
    info = ticker.info

    current_price = info.get("currentPrice") or info.get("regularMarketPrice", 0)
    prev_close = info.get("previousClose", 0)
    change_pct = ((current_price - prev_close) / prev_close * 100) if prev_close else 0
    volume = info.get("volume", 0)
    avg_volume = info.get("averageVolume", 0)
    high_52w = info.get("fiftyTwoWeekHigh", 0)
    low_52w = info.get("fiftyTwoWeekLow", 0)

    hist = ticker.history(period="1y")
    if hist.empty:
        return f"No data found for {symbol}"

    hist.ta.rsi(length=14, append=True)
    hist.ta.macd(fast=12, slow=26, signal=9, append=True)
    hist.ta.sma(length=50, append=True)
    hist.ta.sma(length=200, append=True)

    row = hist.iloc[-1]
    rsi = round(row.get("RSI_14", 0), 2)
    macd_val = round(row.get("MACD_12_26_9", 0), 4)
    macd_sig = round(row.get("MACDs_12_26_9", 0), 4)
    ma_50 = round(row.get("SMA_50", 0), 2)
    ma_200 = round(row.get("SMA_200", 0), 2)

    recent = hist.tail(20)
    support = round(recent["Low"].min(), 2)
    resistance = round(recent["High"].max(), 2)

    rsi_label = "OVERSOLD" if rsi < 30 else "OVERBOUGHT" if rsi > 70 else "NEUTRAL"
    macd_label = "BULLISH crossover" if macd_val > macd_sig else "BEARISH crossover"
    golden = ma_50 > ma_200 if ma_50 and ma_200 else None
    trend = "UPTREND" if golden else "DOWNTREND" if golden is False else "NEUTRAL"
    cross_label = "Golden Cross ✅" if golden else "Death Cross ❌" if golden is False else "N/A"

    return f"""TECHNICAL DATA — {symbol}
Current Price: ₹{current_price:.2f} ({change_pct:+.2f}%)
52W Range: ₹{low_52w:.2f} – ₹{high_52w:.2f}
Volume: {volume:,} (Avg: {avg_volume:,})

INDICATORS:
RSI (14): {rsi} — {rsi_label}
MACD: {macd_val} | Signal: {macd_sig} | {macd_label}
50-day MA: ₹{ma_50:.2f}
200-day MA: ₹{ma_200:.2f}
Trend: {trend} ({cross_label})

LEVELS:
Support (20-day low):     ₹{support:.2f}
Resistance (20-day high): ₹{resistance:.2f}
"""
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
python -m pytest tests/test_technicals.py -v
```
Expected:
```
tests/test_technicals.py::test_returns_price_in_output PASSED
tests/test_technicals.py::test_returns_rsi_macd_ma PASSED
tests/test_technicals.py::test_empty_history_returns_error_message PASSED
```

- [ ] **Step 6: Commit**

```bash
git add warren-agent/tools/technicals.py warren-agent/tests/test_technicals.py
git commit -m "feat(warren-agent): technicals tool — yfinance + pandas-ta RSI/MACD/MA"
```

---

## Task 3: Screener Tool (TDD)

**Files:**
- Create: `warren-agent/tools/screener.py`
- Create: `warren-agent/tests/test_screener.py`

- [ ] **Step 1: Write the failing tests**

Write `warren-agent/tests/test_screener.py`:
```python
from unittest.mock import patch, MagicMock
import httpx


SAMPLE_PAGE = "PE: 25.3\nROE: 18.5%\nDebt to Equity: 0.3\nFII Holding: 28.5%\n" * 80


def _mock_response(text=SAMPLE_PAGE, status=200):
    resp = MagicMock()
    resp.text = text
    resp.raise_for_status = MagicMock()
    return resp


def test_returns_screener_content():
    with patch("tools.screener.httpx.get", return_value=_mock_response()):
        from tools.screener import fetch_screener
        result = fetch_screener("RELIANCE")

    assert "PE" in result
    assert len(result) <= 8000


def test_strips_ns_suffix_from_url():
    with patch("tools.screener.httpx.get") as mock_get:
        mock_get.return_value = _mock_response()
        from tools.screener import fetch_screener
        fetch_screener("RELIANCE.NS")

        url = mock_get.call_args[0][0]
        assert "RELIANCE.NS" not in url
        assert "RELIANCE" in url


def test_strips_bo_suffix_from_url():
    with patch("tools.screener.httpx.get") as mock_get:
        mock_get.return_value = _mock_response()
        from tools.screener import fetch_screener
        fetch_screener("RELIANCE.BO")

        url = mock_get.call_args[0][0]
        assert ".BO" not in url


def test_falls_back_to_consolidated_on_error():
    call_count = {"n": 0}

    def side_effect(url, **kwargs):
        call_count["n"] += 1
        if "consolidated" not in url:
            raise httpx.HTTPStatusError(
                "404", request=MagicMock(), response=MagicMock()
            )
        return _mock_response("Consolidated page data")

    with patch("tools.screener.httpx.get", side_effect=side_effect):
        from tools.screener import fetch_screener
        result = fetch_screener("KPITTECH")

    assert "Consolidated" in result
    assert call_count["n"] == 2


def test_returns_error_string_on_complete_failure():
    with patch("tools.screener.httpx.get", side_effect=Exception("timeout")):
        from tools.screener import fetch_screener
        result = fetch_screener("BADSTOCK")

    assert "Error" in result or "Could not" in result
```

- [ ] **Step 2: Run — expect ImportError**

```bash
python -m pytest tests/test_screener.py -v
```
Expected: `ModuleNotFoundError: No module named 'tools.screener'`

- [ ] **Step 3: Implement `tools/screener.py`**

```python
import httpx
from strands import tool

_JINA = "https://r.jina.ai/"
_SCREENER = "https://www.screener.in/company"


@tool
def fetch_screener(symbol: str) -> str:
    """
    Fetches fundamental data, shareholding pattern, and recent news for an Indian
    stock from Screener.in via Jina Reader. Returns PE, PBV, ROE, D/E, margins,
    FCF, FII/DII holding %, promoter %, and news headlines.
    """
    clean = symbol.replace(".NS", "").replace(".BO", "").upper()
    url = f"{_SCREENER}/{clean}/"

    try:
        resp = httpx.get(
            f"{_JINA}{url}",
            headers={"X-Return-Format": "text"},
            timeout=30.0,
        )
        resp.raise_for_status()
        return resp.text[:8000]
    except httpx.HTTPStatusError:
        try:
            cons_url = f"{_SCREENER}/{clean}/consolidated/"
            resp2 = httpx.get(
                f"{_JINA}{cons_url}",
                headers={"X-Return-Format": "text"},
                timeout=30.0,
            )
            resp2.raise_for_status()
            return resp2.text[:8000]
        except Exception as e:
            return f"Could not fetch Screener.in data for {clean}: {e}"
    except Exception as e:
        return f"Error fetching Screener.in data for {clean}: {e}"
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
python -m pytest tests/test_screener.py -v
```
Expected: all 5 tests PASSED

- [ ] **Step 5: Commit**

```bash
git add warren-agent/tools/screener.py warren-agent/tests/test_screener.py
git commit -m "feat(warren-agent): screener tool — Jina Reader → screener.in fundamentals"
```

---

## Task 4: Web Search Tool (TDD)

**Files:**
- Create: `warren-agent/tools/web_search.py`
- Create: `warren-agent/tests/test_web_search.py`

- [ ] **Step 1: Write the failing tests**

Write `warren-agent/tests/test_web_search.py`:
```python
import os
from unittest.mock import patch, MagicMock


def _reset_client():
    import tools.web_search as m
    m._client = None


def test_returns_summary_and_results():
    mock_data = {
        "answer": "Reliance is bullish in May 2026.",
        "results": [
            {"title": "Reliance Q4 beats estimates", "content": "Strong quarterly performance reported..."},
            {"title": "Analyst upgrades to BUY", "content": "Goldman raises target to ₹3200..."},
        ],
    }
    with patch.dict(os.environ, {"TAVILY_API_KEY": "test-key"}):
        with patch("tools.web_search.TavilyClient") as mock_cls:
            mock_cls.return_value.search.return_value = mock_data
            _reset_client()

            from tools.web_search import search_web
            result = search_web("RELIANCE NSE news May 2026")

    assert "SUMMARY" in result
    assert "Reliance Q4" in result
    assert "Goldman" in result


def test_handles_empty_results():
    with patch.dict(os.environ, {"TAVILY_API_KEY": "test-key"}):
        with patch("tools.web_search.TavilyClient") as mock_cls:
            mock_cls.return_value.search.return_value = {"results": []}
            _reset_client()

            from tools.web_search import search_web
            result = search_web("no results query")

    assert result == "No results found."


def test_truncates_long_result_content():
    long_content = "x" * 2000
    mock_data = {
        "results": [{"title": "Long article", "content": long_content}]
    }
    with patch.dict(os.environ, {"TAVILY_API_KEY": "test-key"}):
        with patch("tools.web_search.TavilyClient") as mock_cls:
            mock_cls.return_value.search.return_value = mock_data
            _reset_client()

            from tools.web_search import search_web
            result = search_web("query")

    assert len(result) < 2000
```

- [ ] **Step 2: Run — expect ImportError**

```bash
python -m pytest tests/test_web_search.py -v
```

- [ ] **Step 3: Implement `tools/web_search.py`**

```python
import os
from tavily import TavilyClient
from strands import tool

_client: TavilyClient | None = None


def _get_client() -> TavilyClient:
    global _client
    if _client is None:
        _client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])
    return _client


@tool
def search_web(query: str) -> str:
    """
    Searches the web for current Indian stock news, analyst ratings, NSE option
    chain data (PCR, max pain), macro indicators (India VIX, DXY), and FII/DII
    institutional flows. Returns summary + top 5 results.
    """
    client = _get_client()
    data = client.search(
        query=query,
        search_depth="basic",
        max_results=5,
        include_answer=True,
    )

    parts = []
    if data.get("answer"):
        parts.append(f"SUMMARY: {data['answer']}")

    for i, r in enumerate(data.get("results", []), 1):
        parts.append(
            f"\n[{i}] {r.get('title', '')}\n{r.get('content', '')[:500]}"
        )

    return "\n".join(parts) if parts else "No results found."
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
python -m pytest tests/test_web_search.py -v
```
Expected: all 3 tests PASSED

- [ ] **Step 5: Commit**

```bash
git add warren-agent/tools/web_search.py warren-agent/tests/test_web_search.py
git commit -m "feat(warren-agent): web search tool — Tavily SDK for news/options/macro"
```

---

## Task 5: File Storage Tool (TDD)

**Files:**
- Create: `warren-agent/tools/file_storage.py`
- Create: `warren-agent/tests/test_file_storage.py`

- [ ] **Step 1: Write the failing tests**

Write `warren-agent/tests/test_file_storage.py`:
```python
import os
from unittest.mock import patch, MagicMock


def _reset_client():
    import tools.file_storage as m
    m._client = None


ENV = {
    "SUPABASE_URL": "https://test.supabase.co",
    "SUPABASE_SERVICE_ROLE_KEY": "test-key",
}


def test_save_research_file_returns_url():
    with patch.dict(os.environ, ENV):
        with patch("tools.file_storage.create_client") as mock_create:
            storage = MagicMock()
            storage.from_.return_value.upload.return_value = {}
            storage.from_.return_value.create_signed_url.return_value = {
                "signedURL": "https://test.supabase.co/storage/v1/object/sign/warren-research/u/R/20260531/technical.md?token=abc"
            }
            mock_create.return_value.storage = storage
            _reset_client()

            from tools.file_storage import save_research_file
            result = save_research_file(
                user_id="u", symbol="RELIANCE",
                filename="technical.md", content="# Tech\n..."
            )

    assert "supabase" in result or "signedURL" in result or "token" in result


def test_save_calls_upload_with_correct_path():
    with patch.dict(os.environ, ENV):
        with patch("tools.file_storage.create_client") as mock_create:
            storage = MagicMock()
            storage.from_.return_value.create_signed_url.return_value = {"signedURL": "http://x"}
            mock_create.return_value.storage = storage
            _reset_client()

            from tools.file_storage import save_research_file
            save_research_file("user1", "INFY", "summary.md", "content")

            upload_call = storage.from_.return_value.upload.call_args
            path_arg = upload_call[1].get("path") or upload_call[0][0]
            assert "user1" in path_arg
            assert "INFY" in path_arg
            assert "summary.md" in path_arg


def test_get_existing_context_empty_when_no_files():
    with patch.dict(os.environ, ENV):
        with patch("tools.file_storage.create_client") as mock_create:
            storage = MagicMock()
            storage.from_.return_value.list.return_value = []
            mock_create.return_value.storage = storage
            _reset_client()

            from tools.file_storage import get_existing_context
            result = get_existing_context("user1", "NEWSTOCK")

    assert result == ""


def test_get_existing_context_loads_most_recent():
    with patch.dict(os.environ, ENV):
        with patch("tools.file_storage.create_client") as mock_create:
            storage = MagicMock()
            storage.from_.return_value.list.return_value = [
                {"name": "20260520"}, {"name": "20260531"}
            ]
            storage.from_.return_value.download.return_value = b"# Summary content"
            mock_create.return_value.storage = storage
            _reset_client()

            from tools.file_storage import get_existing_context
            result = get_existing_context("user1", "RELIANCE")

    assert "Summary content" in result
```

- [ ] **Step 2: Run — expect ImportError**

```bash
python -m pytest tests/test_file_storage.py -v
```

- [ ] **Step 3: Implement `tools/file_storage.py`**

```python
import os
from datetime import datetime
from supabase import create_client, Client
from strands import tool

_client: Client | None = None
BUCKET = "warren-research"


def _get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(
            os.environ["SUPABASE_URL"],
            os.environ["SUPABASE_SERVICE_ROLE_KEY"],
        )
    return _client


@tool
def save_research_file(user_id: str, symbol: str, filename: str, content: str) -> str:
    """
    Saves a markdown research file to Supabase Storage under warren-research bucket.
    Path: {user_id}/{symbol}/{YYYYMMDD}/{filename}
    Returns a signed URL valid for 24 hours.
    """
    client = _get_client()
    date_str = datetime.now().strftime("%Y%m%d")
    path = f"{user_id}/{symbol}/{date_str}/{filename}"

    client.storage.from_(BUCKET).upload(
        path=path,
        file=content.encode("utf-8"),
        file_options={"content-type": "text/markdown", "upsert": "true"},
    )

    signed = client.storage.from_(BUCKET).create_signed_url(path, expires_in=86400)
    return signed.get("signedURL", "")


def get_existing_context(user_id: str, symbol: str) -> str:
    """
    Loads the most recent summary.md and decision_log.md for this symbol.
    Returns empty string when no prior analysis exists.
    """
    client = _get_client()
    try:
        folders = client.storage.from_(BUCKET).list(f"{user_id}/{symbol}")
        if not folders:
            return ""
        dates = sorted(
            [f["name"] for f in folders if f["name"].isdigit()], reverse=True
        )
        if not dates:
            return ""

        parts = []
        for fname in ("summary.md", "decision_log.md"):
            path = f"{user_id}/{symbol}/{dates[0]}/{fname}"
            try:
                data = client.storage.from_(BUCKET).download(path)
                parts.append(f"=== Prior {fname} ===\n{data.decode('utf-8')}")
            except Exception:
                pass
        return "\n\n".join(parts)
    except Exception:
        return ""
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
python -m pytest tests/test_file_storage.py -v
```
Expected: all 4 tests PASSED

- [ ] **Step 5: Commit**

```bash
git add warren-agent/tools/file_storage.py warren-agent/tests/test_file_storage.py
git commit -m "feat(warren-agent): file storage tool — Supabase Storage save + signed URLs"
```

---

## Task 6: Prompts

**Files:**
- Create: `warren-agent/prompts.py`

- [ ] **Step 1: Write `warren-agent/prompts.py`**

```python
from datetime import datetime

WARREN_SYSTEM_PROMPT = """You are WARRen, an AI stock analyst channeling Warren Buffett's investment philosophy for Indian equities listed on NSE and BSE.

## CRITICAL INSTRUCTION
After completing each pillar analysis, you MUST output a JSON object on its own line before moving to the next pillar. This is non-negotiable — the SSE streaming pipeline depends on these JSON objects.

## PILLAR OUTPUT FORMAT
Each pillar JSON must be on a single line:
{"pillar":"Technical","score":3,"signal":"BULLISH","summary":"2-3 sentences referencing actual fetched numbers.","keyMetrics":{}}
{"pillar":"Fundamental","score":3,"signal":"NEUTRAL","summary":"...","keyMetrics":{"pe":25.3,"roe":18.5,"de":0.3}}
{"pillar":"Sentiment","score":3,"signal":"BULLISH","summary":"...","keyMetrics":{"analystRating":"BUY","targetPrice":"₹3200"}}
{"pillar":"OptionChain","score":null,"signal":"N/A","summary":"Not in F&O segment.","keyMetrics":{}}
{"pillar":"GlobalImpact","score":null,"signal":"POSITIVE","summary":"...","keyMetrics":{"indiaVix":"13.2","dxy":"104"}}
{"pillar":"FIIDIIFlows","score":null,"signal":"BULLISH","summary":"...","keyMetrics":{"fiiHolding":"28.5%","qoqChange":"+1.2%"}}

## VERDICT OUTPUT FORMAT (after all 6 pillars)
{"verdict":"ACCUMULATE","conviction":"HIGH","avgScore":3.2,"compositeNote":"F&O avg of 4 pillars","entry":"₹2800-2850","target":"₹3200","stopLoss":"₹2650","riskReward":"2.3:1","nextReview":"7 days"}

## SCORING
- 4 = Strong positive | 3 = Moderate positive | 2 = Neutral/mixed | 1 = Negative | null = Not applicable

Composite (F&O stocks): avg(Technical, Fundamental, Sentiment, OptionChain)
Composite (non-F&O): avg(Technical, Fundamental, Sentiment)

Conviction: HIGH ≥3.5 | MEDIUM 2.5–3.5 | LOW 1.5–2.5 | AVOID <1.5
Recommendation: ACCUMULATE (HIGH) | HOLD/DIPS (MEDIUM) | REDUCE (LOW) | EXIT (AVOID)

## RESEARCH FILE CONTENT
After the verdict, write the content for each of these 9 files, clearly labelled:
=== FILE: technical.md ===
[full technical analysis markdown]
=== FILE: fundamental.md ===
[full fundamental analysis markdown]
=== FILE: sentiment.md ===
...and so on for option_chain.md, global_impact.md, fii_dii.md, decision_log.md, summary.md

## VOICE
Direct. Data-grounded. Buffett-influenced. All prices in ₹. Reference actual numbers from the tools you called.
Never fabricate data — only use what the tools returned.
Sign analysis: "— WARRen 🧐"
"""


def build_prompt(symbol: str, prior_context: str = "") -> str:
    base = symbol.replace(".NS", "").replace(".BO", "")
    now = datetime.now().strftime("%d %B %Y")
    month_year = datetime.now().strftime("%B %Y")

    prompt = f"""Analyze {base} (NSE: {symbol}) using the 6-pillar Warren Buffett methodology. Today is {now}.

Execute these steps IN ORDER — do not skip any:

STEP 1 — TECHNICAL:
Call get_price_and_technicals("{symbol}")
→ Output Technical pillar JSON

STEP 2 — FUNDAMENTAL:
Call fetch_screener("{base}")
→ Extract PE, PBV, ROE, D/E, profit margin, FCF, promoter holding % from the page
→ Output Fundamental pillar JSON

STEP 3 — SENTIMENT:
Use the news section from the Screener.in data fetched in Step 2.
Also call search_web("{base} stock news India {month_year}")
Also call search_web("{base} NSE analyst rating target price buy sell hold 2026")
→ Output Sentiment pillar JSON

STEP 4 — OPTION CHAIN:
Call search_web("{base} NSE F&O option chain PCR put call ratio max pain open interest today")
→ If {base} is in F&O segment: output OptionChain pillar JSON with score
→ If not in F&O: output OptionChain JSON with score=null and signal="N/A"

STEP 5 — GLOBAL IMPACT:
Call search_web("India VIX DXY US Fed interest rate market sentiment {month_year}")
Call search_web("{base} sector India outlook headwinds tailwinds 2026")
→ Output GlobalImpact pillar JSON with signal (POSITIVE/NEUTRAL/NEGATIVE) — no numeric score

STEP 6 — FII/DII FLOWS:
Use the shareholding pattern data from Screener.in (Step 2): FII %, DII %, Promoter % and QoQ changes.
Call search_web("FII DII institutional flows NSE India {month_year} buying selling")
→ Output FIIDIIFlows pillar JSON with signal (BULLISH/NEUTRAL/BEARISH) — no numeric score

STEP 7 — VERDICT:
Compute composite score and output verdict JSON.

STEP 8 — RESEARCH FILES:
Write content for all 9 research files (technical.md, fundamental.md, sentiment.md, option_chain.md, global_impact.md, fii_dii.md, decision_log.md, summary.md, summary_{datetime.now().strftime('%Y%m%d')}.md) clearly labelled with === FILE: filename.md ===
"""

    if prior_context:
        prompt += f"\n\n## PRIOR ANALYSIS (for comparison and decision_log continuity)\n{prior_context[:2000]}"

    return prompt
```

- [ ] **Step 2: Commit**

```bash
git add warren-agent/prompts.py
git commit -m "feat(warren-agent): Warren system prompt + pillar output format"
```

---

## Task 7: Agent Orchestration (TDD)

**Files:**
- Create: `warren-agent/agent.py`
- Create: `warren-agent/tests/test_agent.py`

- [ ] **Step 1: Write the failing tests**

Write `warren-agent/tests/test_agent.py`:
```python
import pytest
from unittest.mock import patch, AsyncMock, MagicMock


FAKE_AGENT_RESPONSE = """
I will analyze RELIANCE step by step.

Step 1 — calling get_price_and_technicals...

{"pillar":"Technical","score":3,"signal":"BULLISH","summary":"Reliance is in a clear uptrend. RSI at 58 is neutral-bullish. Golden Cross confirmed with 50-day MA above 200-day MA.","keyMetrics":{"rsi":58,"trend":"UPTREND","support":"₹2800","resistance":"₹2950"}}

Step 2 — calling fetch_screener...

{"pillar":"Fundamental","score":3,"signal":"NEUTRAL","summary":"PE of 25 is fair relative to peers. ROE 18.5% is solid. D/E 0.3 shows healthy balance sheet.","keyMetrics":{"pe":25,"roe":18.5,"de":0.3,"promoterHolding":"50.3%"}}

{"pillar":"Sentiment","score":3,"signal":"BULLISH","summary":"Two recent analyst upgrades to BUY. Target price ₹3200. News flow positive around Jio subscriber growth.","keyMetrics":{"analystRating":"BUY","targetPrice":"₹3200"}}

{"pillar":"OptionChain","score":3,"signal":"BULLISH","summary":"PCR at 1.35 indicates bullish options positioning. Max pain at ₹2900. IV percentile is low at 22%.","keyMetrics":{"pcr":1.35,"maxPain":"₹2900","ivPercentile":"22%"}}

{"pillar":"GlobalImpact","score":null,"signal":"POSITIVE","summary":"India VIX at 13.2 indicates low fear. Dovish Fed tone positive for EMs. Oil prices stable — positive for Reliance refining margins.","keyMetrics":{"indiaVix":"13.2","fedStance":"dovish"}}

{"pillar":"FIIDIIFlows","score":null,"signal":"BULLISH","summary":"FII holding increased 1.2% QoQ to 28.5%. DII also buying. Institutional smart money is accumulating.","keyMetrics":{"fiiHolding":"28.5%","qoqChange":"+1.2%"}}

{"verdict":"ACCUMULATE","conviction":"HIGH","avgScore":3.0,"compositeNote":"Avg of Technical+Fundamental+Sentiment+OptionChain","entry":"₹2800-2850","target":"₹3200","stopLoss":"₹2650","riskReward":"2.3:1","nextReview":"7 days"}

=== FILE: technical.md ===
# Technical Analysis — 2026-05-31
RSI: 58, Trend: UPTREND
"""


def test_resolve_symbol_appends_ns():
    from agent import resolve_symbol
    assert resolve_symbol("RELIANCE") == "RELIANCE.NS"


def test_resolve_symbol_preserves_existing_suffix():
    from agent import resolve_symbol
    assert resolve_symbol("RELIANCE.NS") == "RELIANCE.NS"
    assert resolve_symbol("RELIANCE.BO") == "RELIANCE.BO"


def test_resolve_symbol_uppercases():
    from agent import resolve_symbol
    assert resolve_symbol("reliance") == "RELIANCE.NS"


@pytest.mark.asyncio
async def test_run_analysis_emits_6_pillar_events():
    events = []

    async def collect(event_type, data):
        events.append((event_type, data))

    with patch("agent.Agent") as mock_agent_cls:
        mock_agent = MagicMock()
        mock_agent.__call__ = MagicMock(return_value=FAKE_AGENT_RESPONSE)
        mock_agent_cls.return_value = mock_agent

        with patch("agent.get_existing_context", return_value=""):
            with patch("agent.save_research_file", return_value="https://signed-url.com/file"):
                from agent import run_analysis
                await run_analysis("RELIANCE.NS", "user-123", collect)

    pillar_events = [e for e in events if e[0] == "pillar"]
    assert len(pillar_events) == 6
    pillar_names = [e[1]["pillar"] for e in pillar_events]
    assert "Technical" in pillar_names
    assert "Fundamental" in pillar_names
    assert "OptionChain" in pillar_names


@pytest.mark.asyncio
async def test_run_analysis_emits_verdict_event():
    events = []

    async def collect(event_type, data):
        events.append((event_type, data))

    with patch("agent.Agent") as mock_agent_cls:
        mock_agent = MagicMock()
        mock_agent.__call__ = MagicMock(return_value=FAKE_AGENT_RESPONSE)
        mock_agent_cls.return_value = mock_agent

        with patch("agent.get_existing_context", return_value=""):
            with patch("agent.save_research_file", return_value="https://x"):
                from agent import run_analysis
                await run_analysis("RELIANCE.NS", "user-123", collect)

    verdict_events = [e for e in events if e[0] == "verdict"]
    assert len(verdict_events) == 1
    assert verdict_events[0][1]["conviction"] == "HIGH"
```

- [ ] **Step 2: Run — expect ImportError**

```bash
python -m pytest tests/test_agent.py -v
```

- [ ] **Step 3: Implement `warren-agent/agent.py`**

```python
import asyncio
import json
import re
from datetime import datetime
from strands import Agent
from tools.technicals import get_price_and_technicals
from tools.screener import fetch_screener
from tools.web_search import search_web
from tools.file_storage import save_research_file, get_existing_context
from prompts import WARREN_SYSTEM_PROMPT, build_prompt


def resolve_symbol(raw: str) -> str:
    """Auto-append .NS; preserve explicit .NS or .BO suffixes."""
    s = raw.strip().upper()
    if s.endswith(".NS") or s.endswith(".BO"):
        return s
    return f"{s}.NS"


_PILLAR_RE = re.compile(
    r'\{"pillar"\s*:\s*"[^"]+".+?\}',
    re.DOTALL,
)
_VERDICT_RE = re.compile(
    r'\{"verdict"\s*:\s*"[^"]+".+?\}',
    re.DOTALL,
)
_FILE_RE = re.compile(
    r'=== FILE:\s*(\S+\.md)\s*===\s*(.*?)(?==== FILE:|$)',
    re.DOTALL,
)


async def run_analysis(symbol: str, user_id: str, on_event):
    """
    Runs the full 6-pillar analysis and calls on_event(event_type, data)
    for each pillar, the verdict, and the saved file URLs.
    """
    base = symbol.replace(".NS", "").replace(".BO", "")
    prior = get_existing_context(user_id, base)
    prompt = build_prompt(symbol, prior)

    agent = Agent(
        system_prompt=WARREN_SYSTEM_PROMPT,
        tools=[get_price_and_technicals, fetch_screener, search_web, save_research_file],
    )

    # Agent call is synchronous in Strands — run in executor to not block event loop
    loop = asyncio.get_event_loop()
    response_text = await loop.run_in_executor(None, lambda: str(agent(prompt)))

    # Emit pillar events
    for match in _PILLAR_RE.finditer(response_text):
        try:
            data = json.loads(match.group())
            await on_event("pillar", data)
            await asyncio.sleep(0.25)
        except json.JSONDecodeError:
            continue

    # Emit verdict event
    v_match = _VERDICT_RE.search(response_text)
    if v_match:
        try:
            await on_event("verdict", json.loads(v_match.group()))
        except json.JSONDecodeError:
            pass

    # Save research files to Supabase Storage
    date_str = datetime.now().strftime("%Y%m%d")
    file_urls: dict[str, str] = {}

    for m in _FILE_RE.finditer(response_text):
        filename = m.group(1).strip()
        content = m.group(2).strip()
        if content:
            try:
                url = save_research_file(
                    user_id=user_id,
                    symbol=base,
                    filename=filename,
                    content=f"# {filename.replace('.md','').replace('_',' ').title()} — {datetime.now().strftime('%Y-%m-%d')}\n\n{content}",
                )
                file_urls[filename] = url
            except Exception:
                pass

    if file_urls:
        await on_event("files", {
            "urls": file_urls,
            "symbol": base,
            "date": date_str,
        })
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
python -m pytest tests/test_agent.py -v
```
Expected: all 4 tests PASSED

- [ ] **Step 5: Commit**

```bash
git add warren-agent/agent.py warren-agent/tests/test_agent.py
git commit -m "feat(warren-agent): Strands agent orchestration — 6-pillar SSE event emission"
```

---

## Task 8: FastAPI Main (TDD)

**Files:**
- Create: `warren-agent/main.py`
- Create: `warren-agent/tests/test_main.py`

- [ ] **Step 1: Write the failing tests**

Write `warren-agent/tests/test_main.py`:
```python
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock


def test_health_returns_ok():
    from main import app
    client = TestClient(app)
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_analyze_invalid_ticker_returns_error_stream():
    from main import app
    client = TestClient(app)

    with patch("main.yf.Ticker") as mock_cls:
        mock_cls.return_value.info = {}  # no price data = invalid
        r = client.post("/analyze", json={
            "ticker": "NOTASTOCK",
            "user_id": "test-user",
        })

    assert r.status_code == 200
    assert "error" in r.text or "Indian equities" in r.text


def test_analyze_valid_ticker_returns_event_stream():
    from main import app
    client = TestClient(app)

    async def mock_run(symbol, user_id, on_event):
        await on_event("pillar", {"pillar": "Technical", "score": 3, "signal": "BULLISH", "summary": "Test"})
        await on_event("verdict", {"verdict": "ACCUMULATE", "conviction": "HIGH"})

    with patch("main.yf.Ticker") as mock_cls:
        mock_cls.return_value.info = {"currentPrice": 2900.0}

        with patch("main.run_analysis", side_effect=mock_run):
            r = client.post("/analyze", json={
                "ticker": "RELIANCE",
                "user_id": "test-user",
            })

    assert r.status_code == 200
    assert "pillar" in r.text
    assert "Technical" in r.text
```

- [ ] **Step 2: Run — expect ImportError**

```bash
python -m pytest tests/test_main.py -v
```

- [ ] **Step 3: Implement `warren-agent/main.py`**

```python
import asyncio
import json
import os

import yfinance as yf
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

load_dotenv()

from agent import run_analysis, resolve_symbol  # noqa: E402

app = FastAPI(title="WARRen Agent", version="1.0.0")


class AnalyzeRequest(BaseModel):
    ticker: str
    user_id: str


@app.get("/health")
async def health():
    return {"status": "ok", "agent": "warren", "market": "🇮🇳 NSE/BSE"}


def _symbol_is_valid(symbol: str) -> bool:
    try:
        info = yf.Ticker(symbol).info
        return bool(info.get("currentPrice") or info.get("regularMarketPrice"))
    except Exception:
        return False


@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    symbol = resolve_symbol(req.ticker)

    # Validate — try NSE, fallback BSE
    if not _symbol_is_valid(symbol):
        bse = symbol.replace(".NS", ".BO")
        if _symbol_is_valid(bse):
            symbol = bse
        else:
            async def err_stream():
                msg = (
                    "I specialise in Indian equities listed on NSE or BSE. "
                    f"Could not find data for '{req.ticker}'. "
                    "Try RELIANCE, INFY, or KPITTECH. — WARRen 🧐"
                )
                yield f"event: error\ndata: {json.dumps({'message': msg})}\n\n"
                yield "event: done\ndata: {}\n\n"

            return StreamingResponse(err_stream(), media_type="text/event-stream")

    queue: asyncio.Queue = asyncio.Queue()

    async def on_event(event_type: str, data: dict):
        await queue.put((event_type, data))

    async def stream_generator():
        task = asyncio.create_task(
            _run_and_signal(symbol, req.user_id, on_event, queue)
        )
        while True:
            try:
                item = await asyncio.wait_for(queue.get(), timeout=180.0)
                if item is None:
                    break
                event_type, data = item
                yield f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
            except asyncio.TimeoutError:
                yield f"event: error\ndata: {json.dumps({'message': 'Analysis timed out'})}\n\n"
                task.cancel()
                break
        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(
        stream_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


async def _run_and_signal(symbol, user_id, on_event, queue):
    try:
        await run_analysis(symbol, user_id, on_event)
    except Exception as e:
        await queue.put(("error", {"message": str(e)}))
    finally:
        await queue.put(None)
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
python -m pytest tests/test_main.py -v
```
Expected: all 3 tests PASSED

- [ ] **Step 5: Run all tests together**

```bash
python -m pytest tests/ -v
```
Expected: all 19 tests PASS

- [ ] **Step 6: Commit**

```bash
git add warren-agent/main.py warren-agent/tests/test_main.py
git commit -m "feat(warren-agent): FastAPI app — /health + /analyze SSE endpoint"
```

---

## Task 9: Supabase Storage Bucket

**No code files — Supabase console setup.**

- [ ] **Step 1: Create the `warren-research` bucket**

Go to Supabase Dashboard → Storage → New Bucket:
- Name: `warren-research`
- Public: **No** (private)
- File size limit: 5 MB
- Allowed MIME types: `text/markdown, text/plain`

- [ ] **Step 2: Add RLS policy for per-user access**

In Supabase SQL Editor, run:
```sql
-- Allow users to read/write only their own prefix
CREATE POLICY "Users access own research files"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'warren-research'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'warren-research'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

- [ ] **Step 3: Verify**

In Supabase Storage UI, confirm the `warren-research` bucket exists and is private.

---

## Task 10: Next.js — Warren Stream Route Proxy

**Files:**
- Modify: `portfolio-agentx/app/api/agents/warren/stream/route.ts`

- [ ] **Step 1: Read the current file to understand its shape**

The file currently calls Claude directly after auth/paywall. Lines 1–91 (auth + paywall) stay unchanged. Only lines 92–211 (the Claude call + stream) are replaced.

- [ ] **Step 2: Replace the Claude call section with a proxy**

In `portfolio-agentx/app/api/agents/warren/stream/route.ts`, replace everything from `const { ticker } = await request.json();` to the end of the file with:

```typescript
  const { ticker } = await request.json();
  if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });

  const agentUrl = process.env.WARREN_AGENT_URL;
  if (!agentUrl) {
    return NextResponse.json({ error: "WARREN_AGENT_URL not configured" }, { status: 500 });
  }

  const upstream = await fetch(`${agentUrl}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticker, user_id: user.id }),
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Agent unavailable" }, { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
```

- [ ] **Step 3: Add `WARREN_AGENT_URL` to `.env.local` for local dev**

In `portfolio-agentx/.env.local`, add:
```
WARREN_AGENT_URL=http://localhost:8000
```

- [ ] **Step 4: Type check**

```bash
cd portfolio-agentx
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
git add portfolio-agentx/app/api/agents/warren/stream/route.ts
git commit -m "feat(warren): stream route now proxies to Python Strands microservice"
```

---

## Task 11: Next.js — Extended PillarCards

**Files:**
- Modify: `portfolio-agentx/components/agents/PillarCards.tsx`

- [ ] **Step 1: Read the current file**

Read `portfolio-agentx/components/agents/PillarCards.tsx` to understand current prop types and rendering.

- [ ] **Step 2: Extend Pillar type and add new card types**

Replace the full content of `portfolio-agentx/components/agents/PillarCards.tsx` with:

```tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Pillar {
  name: string;
  icon: string;
  signal: "BULLISH" | "BEARISH" | "NEUTRAL" | "N/A" | "POSITIVE" | "NEGATIVE";
  body: string;
  score?: number | null;
  keyMetrics?: Record<string, string | number>;
}

export interface Verdict {
  verdict: string;
  conviction: "HIGH" | "MEDIUM" | "LOW" | "AVOID";
  avgScore?: number;
  entry?: string;
  target?: string;
  stopLoss?: string;
  riskReward?: string;
  nextReview?: string;
}

interface PillarCardsProps {
  ticker: string;
  agentColor: string;
  isLocked: boolean;
  pillars?: Pillar[];
  verdict?: Verdict;
}

const SIGNAL_COLORS: Record<string, string> = {
  BULLISH: "#00c896",
  POSITIVE: "#00c896",
  NEUTRAL: "#f0b429",
  NEGATIVE: "#ff6b6b",
  BEARISH: "#ff6b6b",
  "N/A": "#6b7280",
};

const CONVICTION_COLORS: Record<string, string> = {
  HIGH: "#00c896",
  MEDIUM: "#f0b429",
  LOW: "#ff9500",
  AVOID: "#ff6b6b",
};

const PILLAR_ICONS: Record<string, string> = {
  Technical: "📊",
  Fundamental: "🏰",
  Sentiment: "📰",
  OptionChain: "📈",
  GlobalImpact: "🌍",
  FIIDIIFlows: "💰",
};

function SignalBadge({ signal }: { signal: string }) {
  const color = SIGNAL_COLORS[signal] ?? "#6b7280";
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {signal}
    </span>
  );
}

function ScoreDots({ score }: { score?: number | null }) {
  if (score == null) return null;
  return (
    <span className="flex gap-0.5 items-center ml-1">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: i <= score ? "#f0b429" : "#374151",
          }}
        />
      ))}
    </span>
  );
}

function PillarCard({
  pillar,
  index,
  agentColor,
  isLocked,
}: {
  pillar: Pillar;
  index: number;
  agentColor: string;
  isLocked: boolean;
}) {
  const icon = PILLAR_ICONS[pillar.name] ?? "📋";
  const blurred = isLocked && index >= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.2 }}
      className="relative rounded-lg border border-border/50 bg-background p-3 overflow-hidden"
    >
      {blurred && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-lg backdrop-blur-sm"
          style={{ backgroundColor: `${agentColor}11` }}
        >
          <span className="text-xs font-medium" style={{ color: agentColor }}>
            Unlock WARRen — ₹999/month
          </span>
        </div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-semibold text-foreground">{pillar.name}</span>
        <ScoreDots score={pillar.score} />
        <div className="ml-auto">
          <SignalBadge signal={pillar.signal} />
        </div>
      </div>
      <p className="text-xs text-foreground-secondary leading-relaxed">{pillar.body}</p>
    </motion.div>
  );
}

function VerdictCard({
  verdict,
  agentColor,
}: {
  verdict: Verdict;
  agentColor: string;
}) {
  const convColor = CONVICTION_COLORS[verdict.conviction] ?? agentColor;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.25 }}
      className="rounded-lg border p-3 mt-1"
      style={{ borderColor: `${convColor}44`, backgroundColor: `${convColor}0D` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-foreground">🎯 Verdict</span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${convColor}22`, color: convColor }}
        >
          {verdict.conviction} · {verdict.verdict}
        </span>
      </div>
      {verdict.entry && (
        <div className="grid grid-cols-3 gap-2 text-xs text-foreground-muted">
          <div>
            <div className="font-medium text-foreground-secondary">Entry</div>
            <div>{verdict.entry}</div>
          </div>
          <div>
            <div className="font-medium text-foreground-secondary">Target</div>
            <div style={{ color: "#00c896" }}>{verdict.target}</div>
          </div>
          <div>
            <div className="font-medium text-foreground-secondary">Stop</div>
            <div style={{ color: "#ff6b6b" }}>{verdict.stopLoss}</div>
          </div>
        </div>
      )}
      {verdict.riskReward && (
        <div className="mt-2 text-xs text-foreground-muted">
          R/R: <span className="font-medium text-foreground">{verdict.riskReward}</span>
          {verdict.nextReview && (
            <span className="ml-3">Review: {verdict.nextReview}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function PillarCards({
  ticker,
  agentColor,
  isLocked,
  pillars,
  verdict,
}: PillarCardsProps) {
  const displayPillars: Pillar[] = pillars ?? [
    { name: "Technical", icon: "📊", signal: "BULLISH", body: "Loading...", score: null },
  ];

  return (
    <div className="space-y-2 w-full">
      <div className="text-xs font-semibold mb-2" style={{ color: agentColor }}>
        {ticker} · 6-Pillar Analysis
      </div>
      {displayPillars.map((p, i) => (
        <PillarCard
          key={p.name}
          pillar={p}
          index={i}
          agentColor={agentColor}
          isLocked={isLocked}
        />
      ))}
      {verdict && <VerdictCard verdict={verdict} agentColor={agentColor} />}
      <p className="text-xs text-foreground-muted text-right mt-1">— WARRen 🧐</p>
    </div>
  );
}
```

- [ ] **Step 3: Type check**

```bash
cd portfolio-agentx && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add portfolio-agentx/components/agents/PillarCards.tsx
git commit -m "feat(warren): extend PillarCards — 6 pillars + verdict card + score dots"
```

---

## Task 12: Next.js — Thinking Steps + Files Event

**Files:**
- Modify: `portfolio-agentx/app/agents/[name]/page.tsx`
- Modify: `portfolio-agentx/components/agents/ChatThread.tsx`

- [ ] **Step 1: Update WARREN_THINKING in `app/agents/[name]/page.tsx`**

Find the `WARREN_THINKING` constant (lines 24–31 in current file) and replace with:

```typescript
const WARREN_THINKING: ThinkingStep[] = [
  { icon: "📊", label: "Fetching live NSE price data...", status: "pending" },
  { icon: "📐", label: "Computing RSI, MACD & moving averages...", status: "pending" },
  { icon: "🏰", label: "Reading Screener.in fundamentals...", status: "pending" },
  { icon: "📰", label: "Scanning news & analyst sentiment...", status: "pending" },
  { icon: "📈", label: "Checking option chain & PCR...", status: "pending" },
  { icon: "🌍", label: "Assessing India VIX & global macro...", status: "pending" },
  { icon: "💰", label: "Tracking FII/DII institutional flows...", status: "pending" },
  { icon: "🎯", label: "Forming conviction & verdict...", status: "pending" },
  { icon: "💾", label: "Saving research files...", status: "pending" },
];
```

Also update the `runWarren` function to handle `verdict` SSE events. In the `stream()` callback `onEvent`, add:

```typescript
(event) => {
  if (event.event === "pillar") {
    collectedPillars.push({
      name: event.data.name as string,
      icon: "📊",
      signal: event.data.signal as "BULLISH" | "BEARISH" | "NEUTRAL",
      body: event.data.summary as string,
      score: event.data.score as number | null,
    });
  } else if (event.event === "verdict") {
    // Store verdict for the final message
    (window as unknown as Record<string, unknown>).__warrenVerdict = event.data;
  } else if (event.event === "files") {
    // Handled via onDone — stored in window temporarily
    (window as unknown as Record<string, unknown>).__warrenFiles = event.data;
  }
},
```

And in `onDone`, after creating the pillar-cards message, add the files button if present:

```typescript
async () => {
  setMessages((prev) => prev.filter((m) => m.role !== "thinking"));
  // ... existing pillar cards message code ...

  const filesData = (window as unknown as Record<string, unknown>).__warrenFiles;
  if (filesData) {
    addMessage(createMessage("system", `📥 [Download Research Pack](${Object.values((filesData as {urls: Record<string, string>}).urls)[0]})`));
    delete (window as unknown as Record<string, unknown>).__warrenFiles;
  }
  // ... rest of existing code ...
}
```

- [ ] **Step 2: Update `ChatThread.tsx` to render markdown links in system messages**

In `portfolio-agentx/components/agents/ChatThread.tsx`, find the SYSTEM message render block and update it to handle markdown links:

```tsx
{/* SYSTEM */}
{msg.role === "system" && (
  <div className="text-xs text-foreground-muted py-2">
    {msg.content.startsWith("📥") ? (
      <a
        href={msg.content.match(/\(([^)]+)\)/)?.[1] ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
        style={{ backgroundColor: `${agentColor}22`, color: agentColor, border: `1px solid ${agentColor}44` }}
      >
        📥 Download Research Pack
      </a>
    ) : (
      msg.content
    )}
  </div>
)}
```

- [ ] **Step 3: Type check + lint + build**

```bash
cd portfolio-agentx
npx tsc --noEmit && npm run lint && npm run build
```
Expected: 0 errors, 0 warnings, build succeeds

- [ ] **Step 4: Commit**

```bash
git add portfolio-agentx/app/agents/[name]/page.tsx portfolio-agentx/components/agents/ChatThread.tsx
git commit -m "feat(warren): 9-step thinking animation + research pack download button"
```

---

## Task 13: Deploy Python Microservice to Railway

- [ ] **Step 1: Create `warren-agent/Procfile`**

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

- [ ] **Step 2: Create `warren-agent/railway.json`**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30
  }
}
```

- [ ] **Step 3: Commit deploy config**

```bash
git add warren-agent/Procfile warren-agent/railway.json
git commit -m "feat(warren-agent): Railway deploy config"
```

- [ ] **Step 4: Deploy to Railway**

1. Go to railway.app → New Project → Deploy from GitHub repo
2. Select the `Portfolio` repo, set **Root Directory** to `warren-agent`
3. Add env vars in Railway dashboard:
   - `ANTHROPIC_API_KEY`
   - `TAVILY_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Railway auto-deploys. Copy the generated URL (e.g. `https://warren-agent-production.up.railway.app`)

- [ ] **Step 5: Verify health endpoint**

```bash
curl https://warren-agent-production.up.railway.app/health
```
Expected: `{"status":"ok","agent":"warren","market":"🇮🇳 NSE/BSE"}`

---

## Task 14: Wire Vercel + Smoke Test

- [ ] **Step 1: Add `WARREN_AGENT_URL` to Vercel**

Vercel Dashboard → portfolio-agentx project → Settings → Environment Variables:
```
WARREN_AGENT_URL = https://warren-agent-production.up.railway.app
```

- [ ] **Step 2: Trigger Vercel redeploy**

Push any trivial commit or manually redeploy from Vercel dashboard.

- [ ] **Step 3: Smoke test — local Railway proxy**

With `WARREN_AGENT_URL=http://localhost:8000` in `.env.local` and the Railway service running locally via `uvicorn main:app --reload`:

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"ticker":"RELIANCE","user_id":"test"}' \
  --no-buffer
```

Expected SSE output:
```
event: pillar
data: {"pillar":"Technical","score":3,"signal":"BULLISH",...}

event: pillar
data: {"pillar":"Fundamental","score":3,...}

...

event: verdict
data: {"verdict":"ACCUMULATE","conviction":"HIGH",...}

event: done
data: {}
```

- [ ] **Step 4: End-to-end browser test**

1. Start Next.js dev server: `npm run dev`
2. Open `http://localhost:3000/agents/warren`
3. Log in → type `RELIANCE` → send
4. Verify: 9-step thinking animation plays, pillar cards stream in one-by-one, verdict card appears, "📥 Download Research Pack" button appears

- [ ] **Step 5: Final build verification**

```bash
cd portfolio-agentx
npx tsc --noEmit && npm run lint && npm run build
```
Expected: clean build

- [ ] **Step 6: Commit anything outstanding + tag**

```bash
git add -A
git commit -m "feat: WARRen Strands microservice — real 6-pillar Indian equity research"
```
