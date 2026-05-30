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
