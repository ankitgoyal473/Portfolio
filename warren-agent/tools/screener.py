import httpx
from strands import tool
from tools.reporting import emit_thinking

_JINA = "https://r.jina.ai/"
_SCREENER = "https://www.screener.in/company"


@tool
def fetch_screener(symbol: str) -> str:
    """
    Fetches fundamental data, shareholding pattern, and recent news for an Indian
    stock from Screener.in via Jina Reader. Returns PE, PBV, ROE, D/E, margins,
    FCF, FII/DII holding %, promoter %, and news headlines.
    """
    emit_thinking(f"Reading Screener.in fundamentals for {symbol}…")
    clean = symbol.replace(".NS", "").replace(".BO", "").upper()
    url = f"{_SCREENER}/{clean}/"

    try:
        resp = httpx.get(
            f"{_JINA}{url}",
            headers={"X-Return-Format": "text"},
            timeout=30.0,
        )
        resp.raise_for_status()
        return resp.text[:4000]
    except httpx.HTTPStatusError:
        try:
            cons_url = f"{_SCREENER}/{clean}/consolidated/"
            resp2 = httpx.get(
                f"{_JINA}{cons_url}",
                headers={"X-Return-Format": "text"},
                timeout=30.0,
            )
            resp2.raise_for_status()
            return resp2.text[:4000]
        except Exception as e:
            return f"Could not fetch Screener.in data for {clean}: {e}"
    except Exception as e:
        return f"Error fetching Screener.in data for {clean}: {e}"
