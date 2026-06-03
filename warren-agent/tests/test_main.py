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

    async def mock_run(symbol, user_id, on_event, api_key=""):
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
