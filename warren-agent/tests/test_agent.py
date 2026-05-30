import pytest
from unittest.mock import patch, MagicMock


FAKE_AGENT_RESPONSE = """
I will analyze RELIANCE step by step.

{"pillar":"Technical","score":3,"signal":"BULLISH","summary":"Reliance is in a clear uptrend. RSI at 58. Golden Cross confirmed.","keyMetrics":{"rsi":58,"trend":"UPTREND"}}

{"pillar":"Fundamental","score":3,"signal":"NEUTRAL","summary":"PE of 25 is fair. ROE 18.5% is solid. D/E 0.3 healthy.","keyMetrics":{"pe":25,"roe":18.5,"de":0.3}}

{"pillar":"Sentiment","score":3,"signal":"BULLISH","summary":"Two analyst upgrades to BUY. Target price Rs.3200.","keyMetrics":{"analystRating":"BUY","targetPrice":"Rs.3200"}}

{"pillar":"OptionChain","score":3,"signal":"BULLISH","summary":"PCR at 1.35 bullish. Max pain Rs.2900.","keyMetrics":{"pcr":1.35,"maxPain":"Rs.2900"}}

{"pillar":"GlobalImpact","score":null,"signal":"POSITIVE","summary":"India VIX at 13.2, low fear. Dovish Fed positive for EMs.","keyMetrics":{"indiaVix":"13.2"}}

{"pillar":"FIIDIIFlows","score":null,"signal":"BULLISH","summary":"FII holding increased 1.2% QoQ to 28.5%. Smart money accumulating.","keyMetrics":{"fiiHolding":"28.5%","qoqChange":"+1.2%"}}

{"verdict":"ACCUMULATE","conviction":"HIGH","avgScore":3.0,"compositeNote":"Avg of 4 pillars","entry":"Rs.2800-2850","target":"Rs.3200","stopLoss":"Rs.2650","riskReward":"2.3:1","nextReview":"7 days"}

=== FILE: technical.md ===
# Technical Analysis
RSI: 58, Trend: UPTREND

=== FILE: fundamental.md ===
# Fundamental Analysis
PE: 25, ROE: 18.5%
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
