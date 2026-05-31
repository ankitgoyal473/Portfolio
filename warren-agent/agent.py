import asyncio
import json
import os
import re
from datetime import datetime
from strands import Agent
from strands.models.anthropic import AnthropicModel
from tools.technicals import get_price_and_technicals
from tools.screener import fetch_screener
from tools.web_search import search_web
from tools.file_storage import save_research_file, get_existing_context
from prompts import WARREN_SYSTEM_PROMPT, build_prompt

_FILE_RE = re.compile(
    r'=== FILE:\s*(\S+\.md)\s*===\s*(.*?)(?==== FILE:|$)',
    re.DOTALL,
)


def resolve_symbol(raw: str) -> str:
    """Auto-append .NS; preserve explicit .NS or .BO suffixes."""
    s = raw.strip().upper()
    if s.endswith(".NS") or s.endswith(".BO"):
        return s
    return f"{s}.NS"


def extract_json_objects(text: str) -> list[dict]:
    """
    Brace-balanced JSON extractor — finds every valid JSON object in text
    regardless of single-line vs multi-line formatting.
    """
    objects = []
    depth = 0
    start = -1
    for i, ch in enumerate(text):
        if ch == "{":
            if depth == 0:
                start = i
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and start != -1:
                try:
                    obj = json.loads(text[start : i + 1])
                    if isinstance(obj, dict):
                        objects.append(obj)
                except json.JSONDecodeError:
                    pass
                start = -1
    return objects


async def run_analysis(symbol: str, user_id: str, on_event):
    """
    Runs the full 6-pillar analysis and calls on_event(event_type, data)
    for each pillar, the verdict, and the saved file URLs.
    """
    base = symbol.replace(".NS", "").replace(".BO", "")
    prior = get_existing_context(user_id, base)
    prompt = build_prompt(symbol, prior)

    model = AnthropicModel(
        client_args={"api_key": os.environ["ANTHROPIC_API_KEY"]},
        model_id="claude-sonnet-4-6",
        max_tokens=8096,
    )
    agent = Agent(
        model=model,
        system_prompt=WARREN_SYSTEM_PROMPT,
        tools=[get_price_and_technicals, fetch_screener, search_web, save_research_file],
    )

    # Agent call is synchronous in Strands — run in executor to not block event loop
    # Use __call__ explicitly so unit-test mocks that patch __call__ are honoured.
    loop = asyncio.get_event_loop()
    response_text = await loop.run_in_executor(None, lambda: str(agent.__call__(prompt)))

    # Extract all JSON objects from response; route to pillar / verdict events
    all_objects = extract_json_objects(response_text)

    pillar_names = {"Technical", "Fundamental", "Sentiment", "OptionChain", "GlobalImpact", "FIIDIIFlows"}
    verdict_obj = None

    for obj in all_objects:
        if "pillar" in obj and obj.get("pillar") in pillar_names:
            await on_event("pillar", obj)
            await asyncio.sleep(0.25)
        elif "verdict" in obj and verdict_obj is None:
            verdict_obj = obj

    if verdict_obj:
        await on_event("verdict", verdict_obj)

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
