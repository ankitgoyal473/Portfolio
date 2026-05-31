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
