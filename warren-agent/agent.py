import asyncio
import json
import re
from datetime import datetime
from strands import Agent
from tools.technicals import get_price_and_technicals
from tools.screener import fetch_screener
from tools.web_search import search_web
from tools.file_storage import save_research_file, get_existing_context
from prompts import WARREN_SYSTEM_PROMPT, build_prompt


def resolve_symbol(raw: str) -> str:
    """Auto-append .NS; preserve explicit .NS or .BO suffixes."""
    s = raw.strip().upper()
    if s.endswith(".NS") or s.endswith(".BO"):
        return s
    return f"{s}.NS"


_PILLAR_RE = re.compile(
    r'^\{"pillar"[^\n]+\}$',
    re.MULTILINE,
)
_VERDICT_RE = re.compile(
    r'^\{"verdict"[^\n]+\}$',
    re.MULTILINE,
)
_FILE_RE = re.compile(
    r'=== FILE:\s*(\S+\.md)\s*===\s*(.*?)(?==== FILE:|$)',
    re.DOTALL,
)


async def run_analysis(symbol: str, user_id: str, on_event):
    """
    Runs the full 6-pillar analysis and calls on_event(event_type, data)
    for each pillar, the verdict, and the saved file URLs.
    """
    base = symbol.replace(".NS", "").replace(".BO", "")
    prior = get_existing_context(user_id, base)
    prompt = build_prompt(symbol, prior)

    agent = Agent(
        system_prompt=WARREN_SYSTEM_PROMPT,
        tools=[get_price_and_technicals, fetch_screener, search_web, save_research_file],
    )

    # Agent call is synchronous in Strands — run in executor to not block event loop
    # Use __call__ explicitly so unit-test mocks that patch __call__ are honoured.
    loop = asyncio.get_event_loop()
    response_text = await loop.run_in_executor(None, lambda: str(agent.__call__(prompt)))

    # Emit pillar events
    for match in _PILLAR_RE.finditer(response_text):
        try:
            data = json.loads(match.group())
            await on_event("pillar", data)
            await asyncio.sleep(0.25)
        except json.JSONDecodeError:
            continue

    # Emit verdict event
    v_match = _VERDICT_RE.search(response_text)
    if v_match:
        try:
            await on_event("verdict", json.loads(v_match.group()))
        except json.JSONDecodeError:
            pass

    # Save research files to Supabase Storage
    date_str = datetime.now().strftime("%Y%m%d")
    file_urls: dict[str, str] = {}

    for m in _FILE_RE.finditer(response_text):
        filename = m.group(1).strip()
        content = m.group(2).strip()
        if content:
            try:
                url = save_research_file(
                    user_id=user_id,
                    symbol=base,
                    filename=filename,
                    content=f"# {filename.replace('.md','').replace('_',' ').title()} — {datetime.now().strftime('%Y-%m-%d')}\n\n{content}",
                )
                file_urls[filename] = url
            except Exception:
                pass

    if file_urls:
        await on_event("files", {
            "urls": file_urls,
            "symbol": base,
            "date": date_str,
        })
