import yfinance as yf
import pandas as pd
import pandas_ta as ta
from strands import tool
from tools.reporting import emit_thinking


@tool
def get_price_and_technicals(symbol: str) -> str:
    """
    Fetches live NSE/BSE price data and computes technical indicators for an Indian stock.
    Returns current price, RSI(14), MACD(12/26/9), 50/200-day MA, support, resistance.
    """
    emit_thinking(f"Fetching live price & technical data for {symbol}…")
    ticker = yf.Ticker(symbol)
    info = ticker.info

    current_price = info.get("currentPrice") or info.get("regularMarketPrice", 0)
    prev_close = info.get("previousClose", 0)
    change_pct = ((current_price - prev_close) / prev_close * 100) if prev_close else 0
    volume = info.get("volume", 0)
    avg_volume = info.get("averageVolume", 0)
    high_52w = info.get("fiftyTwoWeekHigh", 0)
    low_52w = info.get("fiftyTwoWeekLow", 0)

    hist = ticker.history(period="1y")
    if hist.empty:
        return f"No data found for {symbol}"

    hist.ta.rsi(length=14, append=True)
    hist.ta.macd(fast=12, slow=26, signal=9, append=True)
    hist.ta.sma(length=50, append=True)
    hist.ta.sma(length=200, append=True)

    row = hist.iloc[-1]
    rsi = round(row.get("RSI_14", 0), 2)
    macd_val = round(row.get("MACD_12_26_9", 0), 4)
    macd_sig = round(row.get("MACDs_12_26_9", 0), 4)
    ma_50 = round(row.get("SMA_50", 0), 2)
    ma_200 = round(row.get("SMA_200", 0), 2)

    recent = hist.tail(20)
    support = round(recent["Low"].min(), 2)
    resistance = round(recent["High"].max(), 2)

    rsi_label = "OVERSOLD" if rsi < 30 else "OVERBOUGHT" if rsi > 70 else "NEUTRAL"
    macd_label = "BULLISH crossover" if macd_val > macd_sig else "BEARISH crossover"
    golden = ma_50 > ma_200 if ma_50 and ma_200 else None
    trend = "UPTREND" if golden else "DOWNTREND" if golden is False else "NEUTRAL"
    cross_label = "Golden Cross ✅" if golden else "Death Cross ❌" if golden is False else "N/A"

    return f"""TECHNICAL DATA — {symbol}
Current Price: ₹{current_price:.2f} ({change_pct:+.2f}%)
52W Range: ₹{low_52w:.2f} – ₹{high_52w:.2f}
Volume: {volume:,} (Avg: {avg_volume:,})

INDICATORS:
RSI (14): {rsi} — {rsi_label}
MACD: {macd_val} | Signal: {macd_sig} | {macd_label}
50-day MA: ₹{ma_50:.2f}
200-day MA: ₹{ma_200:.2f}
Trend: {trend} ({cross_label})

LEVELS:
Support (20-day low):     ₹{support:.2f}
Resistance (20-day high): ₹{resistance:.2f}
"""
