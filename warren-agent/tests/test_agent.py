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
