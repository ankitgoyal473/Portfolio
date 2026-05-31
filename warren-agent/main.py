import asyncio
import json
import os

import yfinance as yf
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

load_dotenv()

from agent import run_analysis, resolve_symbol  # noqa: E402

app = FastAPI(title="WARRen Agent", version="1.0.0")


class AnalyzeRequest(BaseModel):
    ticker: str
    user_id: str


@app.get("/health")
async def health():
    return {"status": "ok", "agent": "warren", "market": "NSE/BSE"}


def _symbol_is_valid(symbol: str) -> bool:
    try:
        info = yf.Ticker(symbol).info
        return bool(info.get("currentPrice") or info.get("regularMarketPrice"))
    except Exception:
        return False


@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    symbol = resolve_symbol(req.ticker)

    # Validate — try NSE, fallback BSE
    if not _symbol_is_valid(symbol):
        bse = symbol.replace(".NS", ".BO")
        if _symbol_is_valid(bse):
            symbol = bse
        else:
            async def err_stream():
                msg = (
                    "I specialise in Indian equities listed on NSE or BSE. "
                    f"Could not find data for '{req.ticker}'. "
                    "Try RELIANCE, INFY, or KPITTECH. — WARRen"
                )
                yield f"event: error\ndata: {json.dumps({'message': msg})}\n\n"
                yield "event: done\ndata: {}\n\n"

            return StreamingResponse(err_stream(), media_type="text/event-stream")

    queue: asyncio.Queue = asyncio.Queue()

    async def on_event(event_type: str, data: dict):
        await queue.put((event_type, data))

    async def stream_generator():
        task = asyncio.create_task(
            _run_and_signal(symbol, req.user_id, on_event, queue)
        )
        deadline = asyncio.get_event_loop().time() + 300.0  # 5 min hard cap
        while True:
            now = asyncio.get_event_loop().time()
            if now >= deadline:
                yield f"event: error\ndata: {json.dumps({'message': 'Analysis timed out'})}\n\n"
                task.cancel()
                break
            try:
                # Short wait so we can send keepalives while the agent is thinking
                item = await asyncio.wait_for(queue.get(), timeout=15.0)
                if item is None:
                    break
                event_type, data = item
                yield f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
            except asyncio.TimeoutError:
                # Send a keepalive comment to prevent Railway edge from dropping the connection
                yield ": keepalive\n\n"
        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(
        stream_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


async def _run_and_signal(symbol, user_id, on_event, queue):
    try:
        await run_analysis(symbol, user_id, on_event)
    except Exception as e:
        await queue.put(("error", {"message": str(e)}))
    finally:
        await queue.put(None)
