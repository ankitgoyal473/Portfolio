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
