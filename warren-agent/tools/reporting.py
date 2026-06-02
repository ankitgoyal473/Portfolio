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
    key_metrics: dict of the most important numbers e.g. {"rsi": 58, "pe": 25.3}
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
    next_review: when to re-analyse e.g. "7 days"
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


def emit_thinking(message: str) -> None:
    """Put a thinking event on the SSE queue (no-op if no queue active)."""
    q = getattr(_local, "q", None)
    if q is not None:
        q.put(("thinking", {"message": message}))
