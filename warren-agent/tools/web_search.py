import os
from tavily import TavilyClient
from strands import tool
from tools.reporting import emit_thinking

_client: TavilyClient | None = None


def _get_client() -> TavilyClient:
    global _client
    if _client is None:
        _client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])
    return _client


@tool
def search_web(query: str) -> str:
    """
    Searches the web for current Indian stock news, analyst ratings, NSE option
    chain data (PCR, max pain), macro indicators (India VIX, DXY), and FII/DII
    institutional flows. Returns summary + top 5 results.
    """
    emit_thinking(f"Searching: '{query}'…")
    client = _get_client()
    data = client.search(
        query=query,
        search_depth="basic",
        max_results=3,
        include_answer=True,
    )

    parts = []
    if data.get("answer"):
        parts.append(f"SUMMARY: {data['answer']}")

    for i, r in enumerate(data.get("results", []), 1):
        parts.append(
            f"\n[{i}] {r.get('title', '')}\n{r.get('content', '')[:300]}"
        )

    return "\n".join(parts) if parts else "No results found."
