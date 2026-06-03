import asyncio
import json
import os
import queue as _sync_queue
import re
from datetime import datetime
from strands import Agent
from strands.models.anthropic import AnthropicModel
from tools.technicals import get_price_and_technicals
from tools.screener import fetch_screener
from tools.web_search import search_web
from tools.file_storage import save_research_file, get_existing_context
from tools.reporting import report_pillar, report_verdict, _local as _reporting_local
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


_SENTINEL = object()  # signals agent thread is done


def _run_agent(agent, prompt: str, q: _sync_queue.Queue) -> str:
    """
    Run the Strands agent synchronously in a worker thread.
    Injects the SSE queue into thread-local storage so report_pillar /
    report_verdict tool calls can enqueue events, then clears it when done.
    Puts a _SENTINEL sentinel onto the queue when finished.
    """
    _reporting_local.q = q
    try:
        return str(agent(prompt))
    finally:
        _reporting_local.q = None
        q.put(_SENTINEL)  # signal the async drainer that we're done


async def run_analysis(symbol: str, user_id: str, on_event, api_key: str = ""):
    """
    Runs the full 6-pillar analysis and calls on_event(event_type, data)
    for each pillar, the verdict, and the saved file URLs.
    Events are forwarded to on_event in real-time as the agent produces them.
    api_key: forwarded from the Next.js proxy; falls back to ANTHROPIC_API_KEY env var.
    """
    base = symbol.replace(".NS", "").replace(".BO", "")
    prior = get_existing_context(user_id, base)
    prompt = build_prompt(symbol, prior)

    effective_key = api_key.strip() or os.environ["ANTHROPIC_API_KEY"]
    model = AnthropicModel(
        client_args={"api_key": effective_key},
        model_id="claude-sonnet-4-6",
        max_tokens=8096,
    )
    agent = Agent(
        model=model,
        system_prompt=WARREN_SYSTEM_PROMPT,
        tools=[get_price_and_technicals, fetch_screener, search_web, save_research_file,
               report_pillar, report_verdict],
    )

    # Agent call is synchronous in Strands — run in executor to not block event loop.
    # _run_agent injects the sync queue into thread-local so tool calls can enqueue events.
    q: _sync_queue.Queue = _sync_queue.Queue()
    loop = asyncio.get_running_loop()

    # Start the agent in a thread; drain events in real-time on the async side.
    future = loop.run_in_executor(None, _run_agent, agent, prompt, q)

    # Forward events from sync queue to on_event callback as they arrive.
    # Poll every 0.5s so the event loop stays responsive.
    response_text = None
    while True:
        try:
            item = q.get_nowait()
            if item is _SENTINEL:
                break
            event_type, data = item
            await on_event(event_type, data)
        except _sync_queue.Empty:
            if future.done():
                # Agent finished — drain any remaining events
                while True:
                    try:
                        item = q.get_nowait()
                        if item is _SENTINEL:
                            break
                        event_type, data = item
                        await on_event(event_type, data)
                    except _sync_queue.Empty:
                        break
                break
            await asyncio.sleep(0.5)

    response_text = await future

    # Save research files to Supabase Storage (parsed from markdown text response)
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
