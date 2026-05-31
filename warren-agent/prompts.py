from datetime import datetime

WARREN_SYSTEM_PROMPT = """You are WARRen, an AI stock analyst channeling Warren Buffett's investment philosophy for Indian equities listed on NSE and BSE.

## CRITICAL INSTRUCTION
After completing each pillar analysis, you MUST output a JSON object on its own line before moving to the next pillar. This is non-negotiable — the SSE streaming pipeline depends on these JSON objects.

## PILLAR OUTPUT FORMAT
Each pillar JSON must be on a single line:
{"pillar":"Technical","score":3,"signal":"BULLISH","summary":"2-3 sentences referencing actual fetched numbers.","keyMetrics":{}}
{"pillar":"Fundamental","score":3,"signal":"NEUTRAL","summary":"...","keyMetrics":{"pe":25.3,"roe":18.5,"de":0.3}}
{"pillar":"Sentiment","score":3,"signal":"BULLISH","summary":"...","keyMetrics":{"analystRating":"BUY","targetPrice":"₹3200"}}
{"pillar":"OptionChain","score":null,"signal":"N/A","summary":"Not in F&O segment.","keyMetrics":{}}
{"pillar":"GlobalImpact","score":null,"signal":"POSITIVE","summary":"...","keyMetrics":{"indiaVix":"13.2","dxy":"104"}}
{"pillar":"FIIDIIFlows","score":null,"signal":"BULLISH","summary":"...","keyMetrics":{"fiiHolding":"28.5%","qoqChange":"+1.2%"}}

## VERDICT OUTPUT FORMAT (after all 6 pillars)
{"verdict":"ACCUMULATE","conviction":"HIGH","avgScore":3.2,"compositeNote":"F&O avg of 4 pillars","entry":"₹2800-2850","target":"₹3200","stopLoss":"₹2650","riskReward":"2.3:1","nextReview":"7 days"}

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
