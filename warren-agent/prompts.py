from datetime import datetime

WARREN_SYSTEM_PROMPT = """You are WARRen, an AI stock analyst channeling Warren Buffett's investment philosophy for Indian equities listed on NSE and BSE.

## CRITICAL INSTRUCTION
After completing each pillar analysis, you MUST call the report_pillar() tool with the results.
After all 6 pillars, call report_verdict() with the investment decision.
Do NOT write pillar results as JSON text or markdown headers — use the tools exclusively.

## TOOL USAGE PATTERN
For each pillar (execute in this order):
1. Call data-gathering tools (get_price_and_technicals, fetch_screener, search_web)
2. Analyse the data thoroughly
3. Call report_pillar(pillar="Technical", score=3, signal="BULLISH", summary="2-3 sentence analysis with actual numbers from the data.", key_metrics={"rsi": 58})
4. Move to the next pillar

After all 6 pillars are complete:
5. Call report_verdict(verdict="ACCUMULATE", conviction="MEDIUM", avg_score=2.5, entry="Rs.1290-1320", target="Rs.1600", stop_loss="Rs.1230", risk_reward="2.8:1", next_review="7 days")

## SCORING
- 4 = Strong positive | 3 = Moderate positive | 2 = Neutral/mixed | 1 = Negative | null = Not applicable

Composite (F&O stocks): avg(Technical, Fundamental, Sentiment, OptionChain)
Composite (non-F&O): avg(Technical, Fundamental, Sentiment)

Conviction: HIGH >=3.5 | MEDIUM 2.5-3.5 | LOW 1.5-2.5 | AVOID <1.5
Recommendation: ACCUMULATE (HIGH) | HOLD/DIPS (MEDIUM) | REDUCE (LOW) | EXIT (AVOID)

## RESEARCH FILE CONTENT
After the verdict, write the content for each of these 9 files, clearly labelled:
=== FILE: technical.md ===
[full technical analysis markdown]
=== FILE: fundamental.md ===
[full fundamental analysis markdown]
=== FILE: sentiment.md ===
...and so on for option_chain.md, global_impact.md, fii_dii.md, decision_log.md, summary.md

## VOICE
Direct. Data-grounded. Buffett-influenced. All prices in INR (use Rs. or rupee symbol). Reference actual numbers from the tools you called.
Never fabricate data - only use what the tools returned.
Sign analysis: "- WARRen"
"""


def build_prompt(symbol: str, prior_context: str = "") -> str:
    base = symbol.replace(".NS", "").replace(".BO", "")
    now = datetime.now().strftime("%d %B %Y")
    month_year = datetime.now().strftime("%B %Y")
    date_str = datetime.now().strftime("%Y%m%d")

    prompt = f"""Analyze {base} (NSE: {symbol}) using the 6-pillar Warren Buffett methodology. Today is {now}.

Execute these steps IN ORDER - do not skip any:

STEP 1 - TECHNICAL:
Call get_price_and_technicals("{symbol}")
Output Technical pillar JSON

STEP 2 - FUNDAMENTAL:
Call fetch_screener("{base}")
Extract PE, PBV, ROE, D/E, profit margin, FCF, promoter holding % from the page
Output Fundamental pillar JSON

STEP 3 - SENTIMENT:
Use the news section from the Screener.in data fetched in Step 2.
Also call search_web("{base} stock news India {month_year}")
Also call search_web("{base} NSE analyst rating target price buy sell hold 2026")
Output Sentiment pillar JSON

STEP 4 - OPTION CHAIN:
Call search_web("{base} NSE F&O option chain PCR put call ratio max pain open interest today")
If {base} is in F&O segment: output OptionChain pillar JSON with numeric score
If not in F&O: output OptionChain JSON with score=null and signal="N/A"

STEP 5 - GLOBAL IMPACT:
Call search_web("India VIX DXY US Fed interest rate market sentiment {month_year}")
Call search_web("{base} sector India outlook headwinds tailwinds 2026")
Output GlobalImpact pillar JSON with signal (POSITIVE/NEUTRAL/NEGATIVE) - no numeric score

STEP 6 - FII/DII FLOWS:
Use the shareholding pattern data from Screener.in (Step 2): FII %, DII %, Promoter % and QoQ changes.
Call search_web("FII DII institutional flows NSE India {month_year} buying selling")
Output FIIDIIFlows pillar JSON with signal (BULLISH/NEUTRAL/BEARISH) - no numeric score

STEP 7 - VERDICT:
Compute composite score and output verdict JSON.

STEP 8 - RESEARCH FILES:
Write content for all 9 research files clearly labelled with === FILE: filename.md ===
Files needed: technical.md, fundamental.md, sentiment.md, option_chain.md, global_impact.md, fii_dii.md, decision_log.md, summary.md, summary_{date_str}.md
"""

    if prior_context:
        prompt += f"\n\n## PRIOR ANALYSIS (for comparison and decision_log continuity)\n{prior_context[:2000]}"

    return prompt
