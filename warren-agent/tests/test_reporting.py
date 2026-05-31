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
    assert data["target"] == "Rs.1600"
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
