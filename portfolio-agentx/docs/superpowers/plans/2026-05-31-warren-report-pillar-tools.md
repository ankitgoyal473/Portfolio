# WARRen report_pillar Tools — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 5 missing pillar cards by replacing text-based JSON parsing with Strands tool calls — Claude calls `report_pillar()` and `report_verdict()` instead of printing JSON that the extractor then misses.

**Architecture:** Two new `@tool` functions (`report_pillar`, `report_verdict`) write structured events onto a `threading.Queue` that is injected via thread-local storage before the Strands agent runs in an executor. After the agent completes, `run_analysis()` drains the queue and emits SSE events. No text parsing required.

**Tech Stack:** Python 3.12, Strands Agents SDK, `threading.local`, `queue.Queue`, pytest

---

## 📁 File Map

| File | Action | Purpose |
|------|--------|---------|
| `warren-agent/tools/reporting.py` | Create | `report_pillar()` + `report_verdict()` tools with thread-local queue wiring |
| `warren-agent/tests/test_reporting.py` | Create | Unit tests for both reporting tools |
| `warren-agent/prompts.py` | Modify | Replace JSON output instructions with tool-call instructions |
| `warren-agent/agent.py` | Modify | Add reporting tools, inject thread-local queue, drain queue after agent run, remove `extract_json_objects` for pillar/verdict |
| `warren-agent/tests/test_agent.py` | Modify | Update mocks: simulate tool calls via queue instead of parsing response text |

---

## Task 1: `tools/reporting.py` (TDD)

**Files:**
- Create: `warren-agent/tools/reporting.py`
- Create: `warren-agent/tests/test_reporting.py`

- [ ] **Step 1: Write the failing tests**

Write `warren-agent/tests/test_reporting.py`:

```python
import queue
import pytest


def _set_queue(q):
    from tools.reporting import _local
    _local.q = q


def _clear_queue():
    from tools.reporting import _local
    _local.q = None


def test_report_pillar_puts_event_on_queue():
    q = queue.Queue()
    _set_queue(q)

    from tools.reporting import report_pillar
    result = report_pillar(
        pillar="Technical",
        score=3,
        signal="BULLISH",
        summary="Strong uptrend. RSI at 58.",
        key_metrics={"rsi": 58, "trend": "UPTREND"},
    )

    assert not q.empty()
    event_type, data = q.get_nowait()
    assert event_type == "pillar"
    assert data["pillar"] == "Technical"
    assert data["score"] == 3
    assert data["signal"] == "BULLISH"
    assert data["summary"] == "Strong uptrend. RSI at 58."
    assert data["keyMetrics"] == {"rsi": 58, "trend": "UPTREND"}
    assert "Technical" in result


def test_report_pillar_key_metrics_none_becomes_empty_dict():
    q = queue.Queue()
    _set_queue(q)

    from tools.reporting import report_pillar
    report_pillar("Sentiment", 3, "BULLISH", "Positive news.", None)

    _, data = q.get_nowait()
    assert data["keyMetrics"] == {}


def test_report_pillar_no_queue_does_not_crash():
    _clear_queue()

    from tools.reporting import report_pillar
    result = report_pillar("Technical", 3, "BULLISH", "Text.", None)
    assert "Technical" in result


def test_report_pillar_score_can_be_none():
    q = queue.Queue()
    _set_queue(q)

    from tools.reporting import report_pillar
    report_pillar("GlobalImpact", None, "POSITIVE", "Macro is favourable.", None)

    _, data = q.get_nowait()
    assert data["score"] is None
    assert data["signal"] == "POSITIVE"


def test_report_verdict_puts_event_on_queue():
    q = queue.Queue()
    _set_queue(q)

    from tools.reporting import report_verdict
    result = report_verdict(
        verdict="ACCUMULATE",
        conviction="MEDIUM",
        avg_score=2.5,
        entry="Rs.1290-1320",
        target="Rs.1600",
        stop_loss="Rs.1230",
        risk_reward="2.8:1",
        next_review="7 days",
    )

    assert not q.empty()
    event_type, data = q.get_nowait()
    assert event_type == "verdict"
    assert data["verdict"] == "ACCUMULATE"
    assert data["conviction"] == "MEDIUM"
    assert data["avgScore"] == 2.5
    assert data["entry"] == "Rs.1290-1320"
    assert data["stopLoss"] == "Rs.1230"
    assert "ACCUMULATE" in result


def test_report_verdict_default_next_review():
    q = queue.Queue()
    _set_queue(q)

    from tools.reporting import report_verdict
    report_verdict("HOLD", "LOW", 1.8, "Rs.1300", "Rs.1500", "Rs.1250", "2:1")

    _, data = q.get_nowait()
    assert data["nextReview"] == "7 days"


def test_report_verdict_no_queue_does_not_crash():
    _clear_queue()

    from tools.reporting import report_verdict
    result = report_verdict("EXIT", "AVOID", 1.2, "-", "-", "-", "-")
    assert "EXIT" in result
```

- [ ] **Step 2: Run — expect ImportError**

```bash
cd warren-agent
python -m pytest tests/test_reporting.py -v 2>&1 | head -10
```
Expected: `ModuleNotFoundError: No module named 'tools.reporting'`

- [ ] **Step 3: Implement `warren-agent/tools/reporting.py`**

```python
import threading
import queue as _queue_module
from strands import tool

_local = threading.local()


@tool
def report_pillar(
    pillar: str,
    score: int | None,
    signal: str,
    summary: str,
    key_metrics: dict | None = None,
) -> str:
    """
    Report a completed pillar analysis to the SSE stream.
    Call this ONCE immediately after analysing each pillar.

    pillar: one of Technical, Fundamental, Sentiment, OptionChain, GlobalImpact, FIIDIIFlows
    score: 1-4 for scored pillars, None for qualitative pillars (GlobalImpact, FIIDIIFlows)
    signal: BULLISH, BEARISH, NEUTRAL, POSITIVE, NEGATIVE, or N/A
    summary: 2-3 sentence analysis grounded in the data you fetched
    key_metrics: dict of the most important numbers (e.g. {"rsi": 58, "pe": 25.3})
    """
    q = getattr(_local, "q", None)
    if q is not None:
        q.put(("pillar", {
            "pillar": pillar,
            "score": score,
            "signal": signal,
            "summary": summary,
            "keyMetrics": key_metrics or {},
        }))
    return f"Pillar '{pillar}' reported."


@tool
def report_verdict(
    verdict: str,
    conviction: str,
    avg_score: float,
    entry: str,
    target: str,
    stop_loss: str,
    risk_reward: str,
    next_review: str = "7 days",
) -> str:
    """
    Report the final investment verdict to the SSE stream.
    Call this ONCE after all 6 pillars are complete.

    verdict: BUY, ACCUMULATE, HOLD, REDUCE, or EXIT
    conviction: HIGH (>=3.5), MEDIUM (2.5-3.5), LOW (1.5-2.5), or AVOID (<1.5)
    avg_score: composite score (avg of scored pillars)
    entry: entry price range e.g. "Rs.1290-1320"
    target: target price e.g. "Rs.1600"
    stop_loss: stop loss price e.g. "Rs.1230"
    risk_reward: ratio e.g. "2.8:1"
    next_review: when to re-analyse e.g. "7 days" or "Post AGM — 20 Jun 2026"
    """
    q = getattr(_local, "q", None)
    if q is not None:
        q.put(("verdict", {
            "verdict": verdict,
            "conviction": conviction,
            "avgScore": avg_score,
            "entry": entry,
            "target": target,
            "stopLoss": stop_loss,
            "riskReward": risk_reward,
            "nextReview": next_review,
        }))
    return f"Verdict '{verdict}' ({conviction} conviction) reported."
```

- [ ] **Step 4: Run tests — expect all 7 PASS**

```bash
python -m pytest tests/test_reporting.py -v
```
Expected:
```
tests/test_reporting.py::test_report_pillar_puts_event_on_queue PASSED
tests/test_reporting.py::test_report_pillar_key_metrics_none_becomes_empty_dict PASSED
tests/test_reporting.py::test_report_pillar_no_queue_does_not_crash PASSED
tests/test_reporting.py::test_report_pillar_score_can_be_none PASSED
tests/test_reporting.py::test_report_verdict_puts_event_on_queue PASSED
tests/test_reporting.py::test_report_verdict_default_next_review PASSED
tests/test_reporting.py::test_report_verdict_no_queue_does_not_crash PASSED
```

- [ ] **Step 5: Commit**

```bash
git add warren-agent/tools/reporting.py warren-agent/tests/test_reporting.py
git commit -m "feat(warren-agent): report_pillar + report_verdict Strands tools — structured SSE output via thread-local queue"
```

---

## Task 2: Update System Prompt

**Files:**
- Modify: `warren-agent/prompts.py`

- [ ] **Step 1: Read current prompts.py**

Read `warren-agent/prompts.py` and locate the `CRITICAL INSTRUCTION` section and the `PILLAR OUTPUT FORMAT` section.

- [ ] **Step 2: Replace the output format instructions**

Find the block starting with `## CRITICAL INSTRUCTION` and ending before `## SCORING`. Replace it with:

```python
## CRITICAL INSTRUCTION
After completing each pillar analysis, you MUST call the report_pillar() tool with the results.
After all 6 pillars, call report_verdict() with the investment decision.
Do NOT write pillar results as JSON text or markdown — use the tools exclusively.

## TOOL USAGE PATTERN
For each pillar (in order):
1. Call data-gathering tools (get_price_and_technicals, fetch_screener, search_web)
2. Analyse the data
3. Call report_pillar(pillar="Technical", score=3, signal="BULLISH", summary="...", key_metrics={...})
4. Move to next pillar

After all 6:
5. Call report_verdict(verdict="ACCUMULATE", conviction="MEDIUM", avg_score=2.5, entry="Rs.1290", target="Rs.1600", stop_loss="Rs.1230", risk_reward="2.8:1")

## RESEARCH FILE CONTENT
After the verdict, write the content for each of these 9 files, clearly labelled:
=== FILE: technical.md ===
[full technical analysis markdown]
=== FILE: fundamental.md ===
...and so on for fundamental.md, sentiment.md, option_chain.md, global_impact.md, fii_dii.md, decision_log.md, summary.md
```

Also remove the old `## PILLAR OUTPUT FORMAT` section (the JSON example block) entirely since it no longer applies.

- [ ] **Step 3: Commit**

```bash
git add warren-agent/prompts.py
git commit -m "feat(warren-agent): update system prompt — report_pillar/report_verdict tool calls replace JSON text output"
```

---

## Task 3: Update `agent.py`

**Files:**
- Modify: `warren-agent/agent.py`

- [ ] **Step 1: Read the current `agent.py`**

Read `warren-agent/agent.py` in full.

- [ ] **Step 2: Rewrite `agent.py`**

Replace the entire file content with:

```python
import asyncio
import os
import queue as _sync_queue
import re
from datetime import datetime
from strands import Agent
from strands.models.anthropic import AnthropicModel
from tools.technicals import get_price_and_technicals
from tools.screener import fetch_screener
from tools.web_search import search_web
from tools.file_storage import save_research_file, get_existing_context
from tools.reporting import report_pillar, report_verdict, _local as _reporting_local
from prompts import WARREN_SYSTEM_PROMPT, build_prompt

_FILE_RE = re.compile(
    r'=== FILE:\s*(\S+\.md)\s*===\s*(.*?)(?==== FILE:|$)',
    re.DOTALL,
)


def resolve_symbol(raw: str) -> str:
    """Auto-append .NS; preserve explicit .NS or .BO suffixes."""
    s = raw.strip().upper()
    if s.endswith(".NS") or s.endswith(".BO"):
        return s
    return f"{s}.NS"


def _run_agent(agent, prompt, q):
    """Run Strands agent in a thread pool thread, with reporting queue wired in."""
    _reporting_local.q = q
    try:
        return str(agent.__call__(prompt))
    finally:
        _reporting_local.q = None


async def run_analysis(symbol: str, user_id: str, on_event):
    """
    Runs the full 6-pillar analysis and calls on_event(event_type, data)
    for each pillar, the verdict, and the saved file URLs.

    Pillar and verdict events are delivered via report_pillar / report_verdict
    tool calls made by the Strands agent. A sync queue bridges the executor
    thread to this async function.
    """
    base = symbol.replace(".NS", "").replace(".BO", "")
    prior = get_existing_context(user_id, base)
    prompt = build_prompt(symbol, prior)

    model = AnthropicModel(
        client_args={"api_key": os.environ["ANTHROPIC_API_KEY"]},
        model_id="claude-sonnet-4-6",
        max_tokens=8096,
    )
    agent = Agent(
        model=model,
        system_prompt=WARREN_SYSTEM_PROMPT,
        tools=[
            get_price_and_technicals,
            fetch_screener,
            search_web,
            save_research_file,
            report_pillar,
            report_verdict,
        ],
    )

    # Sync queue: reporting tools put events here from the executor thread
    q = _sync_queue.Queue()

    loop = asyncio.get_event_loop()
    response_text = await loop.run_in_executor(None, _run_agent, agent, prompt, q)

    # Drain all pillar/verdict events collected during the agent run
    while True:
        try:
            event_type, data = q.get_nowait()
            await on_event(event_type, data)
            await asyncio.sleep(0.25)
        except _sync_queue.Empty:
            break

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

- [ ] **Step 3: Commit**

```bash
git add warren-agent/agent.py
git commit -m "feat(warren-agent): wire report_pillar/verdict tools into run_analysis via sync queue"
```

---

## Task 4: Update `tests/test_agent.py`

**Files:**
- Modify: `warren-agent/tests/test_agent.py`

- [ ] **Step 1: Read the current `tests/test_agent.py`**

Read the file to understand the existing mocks (currently mocks `Agent.__call__` to return `FAKE_AGENT_RESPONSE` string, then asserts pillar events from that string).

- [ ] **Step 2: Rewrite `tests/test_agent.py`**

Replace the entire file content with:

```python
import pytest
import queue as _sync_queue
from unittest.mock import patch, MagicMock


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


def test_run_agent_sets_and_clears_thread_local():
    """_run_agent injects the queue into _reporting_local and clears it after."""
    from tools.reporting import _local as reporting_local
    from agent import _run_agent

    q = _sync_queue.Queue()
    mock_agent = MagicMock()
    mock_agent.__call__ = MagicMock(return_value="done")

    _run_agent(mock_agent, "prompt", q)

    # Queue should be cleared from thread-local after run
    assert getattr(reporting_local, "q", None) is None


@pytest.mark.asyncio
async def test_run_analysis_emits_6_pillar_events():
    """run_analysis emits one pillar event per pillar when tools are called."""
    events = []

    async def collect(event_type, data):
        events.append((event_type, data))

    PILLAR_NAMES = ["Technical", "Fundamental", "Sentiment", "OptionChain", "GlobalImpact", "FIIDIIFlows"]

    def mock_run_agent(agent, prompt, q):
        # Simulate 6 report_pillar tool calls
        for pillar in PILLAR_NAMES:
            q.put(("pillar", {
                "pillar": pillar,
                "score": 3 if pillar not in ("GlobalImpact", "FIIDIIFlows") else None,
                "signal": "BULLISH",
                "summary": f"{pillar} analysis text.",
                "keyMetrics": {},
            }))
        # Simulate report_verdict tool call
        q.put(("verdict", {
            "verdict": "ACCUMULATE",
            "conviction": "MEDIUM",
            "avgScore": 2.75,
            "entry": "Rs.1290",
            "target": "Rs.1600",
            "stopLoss": "Rs.1230",
            "riskReward": "2.8:1",
            "nextReview": "7 days",
        }))
        return "Agent completed."

    with patch("agent.Agent"):
        with patch("agent._run_agent", side_effect=mock_run_agent):
            with patch("agent.get_existing_context", return_value=""):
                with patch("agent.save_research_file", return_value="https://url"):
                    from agent import run_analysis
                    await run_analysis("RELIANCE.NS", "user-123", collect)

    pillar_events = [e for e in events if e[0] == "pillar"]
    assert len(pillar_events) == 6
    pillar_names_emitted = [e[1]["pillar"] for e in pillar_events]
    for name in PILLAR_NAMES:
        assert name in pillar_names_emitted


@pytest.mark.asyncio
async def test_run_analysis_emits_verdict_event():
    """run_analysis emits a verdict event with conviction=MEDIUM."""
    events = []

    async def collect(event_type, data):
        events.append((event_type, data))

    def mock_run_agent(agent, prompt, q):
        q.put(("verdict", {
            "verdict": "HOLD",
            "conviction": "MEDIUM",
            "avgScore": 2.5,
            "entry": "Rs.1300",
            "target": "Rs.1500",
            "stopLoss": "Rs.1250",
            "riskReward": "2:1",
            "nextReview": "7 days",
        }))
        return "done"

    with patch("agent.Agent"):
        with patch("agent._run_agent", side_effect=mock_run_agent):
            with patch("agent.get_existing_context", return_value=""):
                with patch("agent.save_research_file", return_value="https://url"):
                    from agent import run_analysis
                    await run_analysis("RELIANCE.NS", "user-123", collect)

    verdict_events = [e for e in events if e[0] == "verdict"]
    assert len(verdict_events) == 1
    assert verdict_events[0][1]["conviction"] == "MEDIUM"


@pytest.mark.asyncio
async def test_run_analysis_empty_queue_emits_no_pillar_events():
    """If agent makes no tool calls, no pillar/verdict events are emitted."""
    events = []

    async def collect(event_type, data):
        events.append((event_type, data))

    def mock_run_agent(agent, prompt, q):
        return "Agent produced no structured output."

    with patch("agent.Agent"):
        with patch("agent._run_agent", side_effect=mock_run_agent):
            with patch("agent.get_existing_context", return_value=""):
                from agent import run_analysis
                await run_analysis("RELIANCE.NS", "user-123", collect)

    assert not any(e[0] in ("pillar", "verdict") for e in events)
```

- [ ] **Step 3: Run all tests — expect all PASS**

```bash
cd warren-agent
python -m pytest tests/ -v
```

Expected: all tests pass (7 new in test_reporting.py + 6 updated in test_agent.py + existing tests in other files).

- [ ] **Step 4: Commit**

```bash
git add warren-agent/tests/test_agent.py
git commit -m "test(warren-agent): update test_agent — simulate tool calls via queue instead of response text parsing"
```

---

## Task 5: Deploy + Verify

- [ ] **Step 1: Push to main**

```bash
git push origin main
```

Railway auto-deploys from `main`. Wait for the build to reach `SUCCESS` (check with Railway MCP or `mcp__railway__list-deployments`).

- [ ] **Step 2: Smoke test the endpoint**

```bash
curl -s -N --max-time 300 \
  -X POST https://warren-agent-production.up.railway.app/analyze \
  -H "Content-Type: application/json" \
  -d '{"ticker":"INFY","user_id":"verify-pillar-fix"}' 2>&1 | grep "^event: pillar" | wc -l
```

Expected output: `6`

If fewer than 6, check Railway deploy logs:
```bash
# Via Railway MCP: mcp__railway__get-logs with types=["deploy"] and filter="report_pillar"
```

- [ ] **Step 3: Full browser verify via Playwright**

Reset usage:
```sql
-- In Supabase SQL Editor
UPDATE agent_usage SET count = 0
WHERE agent_id = 'warren'
  AND user_id = (SELECT id FROM auth.users WHERE email = 'ankitgoyal473@gmail.com');
```

Then via Playwright: navigate to `/agents/warren`, type `INFY`, submit, wait ~4 min, screenshot — confirm 6 pillar cards + verdict card render.

- [ ] **Step 4: Commit nothing (deploy already triggered by push in Step 1)**
