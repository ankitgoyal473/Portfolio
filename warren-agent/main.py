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
    api_key: str = ""  # forwarded from Next.js proxy; falls back to env var
    test_mode: bool = False  # emit mock pillar events using real yfinance data; skips LLM


@app.get("/health")
async def health():
    return {"status": "ok", "agent": "warren", "market": "NSE/BSE"}


def _symbol_is_valid(symbol: str) -> bool:
    try:
        info = yf.Ticker(symbol).info
        # yfinance returns different price fields depending on market state;
        # check multiple candidates so valid tickers aren't rejected
        return bool(
            info.get("currentPrice")
            or info.get("regularMarketPrice")
            or info.get("previousClose")
            or info.get("ask")
            or info.get("bid")
        )
    except Exception:
        return False


@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    if not req.ticker or not req.ticker.strip():
        async def empty_stream():
            yield f"event: error\ndata: {json.dumps({'message': 'Please enter a ticker symbol (e.g. RELIANCE, INFY, TCS). — WARRen'})}\n\n"
            yield "event: done\ndata: {}\n\n"
        return StreamingResponse(empty_stream(), media_type="text/event-stream")

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

    effective_key = req.api_key.strip() or os.environ.get("ANTHROPIC_API_KEY", "")
    queue: asyncio.Queue = asyncio.Queue()

    async def on_event(event_type: str, data: dict):
        await queue.put((event_type, data))

    async def stream_generator():
        run_fn = _run_test_mode if req.test_mode else _run_and_signal
        task = asyncio.create_task(
            run_fn(symbol, req.user_id, on_event, queue, effective_key)
        )
        deadline = asyncio.get_event_loop().time() + 1200.0  # 20 min hard cap
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


async def _run_and_signal(symbol, user_id, on_event, queue, api_key: str = ""):
    try:
        await run_analysis(symbol, user_id, on_event, api_key=api_key)
    except Exception as e:
        await queue.put(("error", {"message": str(e)}))
    finally:
        await queue.put(None)


async def _run_test_mode(symbol, user_id, on_event, queue, api_key: str = ""):
    """Emit real yfinance data as mock pillar events — no LLM call, tests full SSE pipeline."""
    import asyncio as _a
    try:
        base = symbol.replace(".NS", "").replace(".BO", "")
        try:
            info = yf.Ticker(symbol).info
            price = info.get("currentPrice") or info.get("regularMarketPrice") or info.get("previousClose") or 0.0
            pe = info.get("trailingPE") or info.get("forwardPE") or 0.0
            roe = info.get("returnOnEquity") or 0.0
        except Exception:
            price, pe, roe = 0.0, 0.0, 0.0

        price_str = f"Rs.{price:.0f}" if price else "N/A"
        pillars = [
            ("Technical", 3, "BULLISH", f"{base} trades at {price_str}. Price above 50-day MA; RSI in mid-range. Momentum positive. [TEST MODE]", {"price": price}),
            ("Fundamental", 3, "NEUTRAL", f"PE ratio {pe:.1f}x, ROE {roe*100:.1f}%. Fundamentals in line with sector peers.", {"pe": round(pe,1), "roe": round(roe*100,1)}),
            ("Sentiment", 2, "NEUTRAL", f"News flow mixed for {base}. Analyst consensus cautiously positive.", {}),
            ("OptionChain", 2, "NEUTRAL", f"PCR near 1.0 for {base}. No extreme positioning detected.", {"pcr": 1.0}),
            ("GlobalImpact", None, "POSITIVE", "India VIX stable. US Fed rate trajectory supportive for EM flows.", {}),
            ("FIIDIIFlows", None, "BULLISH", f"FII net buyers in {base}'s sector this month. DII flows stable.", {}),
        ]

        for pillar, score, signal, summary, metrics in pillars:
            await on_event("thinking", {"message": f"[TEST MODE] Analysing {pillar} pillar for {base}…"})
            await _a.sleep(1)
            await on_event("pillar", {"pillar": pillar, "score": score, "signal": signal, "summary": summary, "keyMetrics": metrics})
            await _a.sleep(0.5)

        await on_event("verdict", {
            "verdict": "ACCUMULATE", "conviction": "MEDIUM", "avgScore": 2.5,
            "entry": f"Rs.{price*0.98:.0f}-{price:.0f}", "target": f"Rs.{price*1.15:.0f}",
            "stopLoss": f"Rs.{price*0.92:.0f}", "riskReward": "2.1:1", "nextReview": "7 days"
        })
    except Exception as e:
        await on_event("error", {"message": f"Test mode error: {e}"})
    finally:
        await queue.put(None)
