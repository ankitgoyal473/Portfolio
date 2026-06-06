# Warren Haiku Fix & Streaming UX Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix Warren analysis hanging silently with Haiku (tool-call chain fails after data gathering), reduce token cost by ~40%, and give users live feedback during the 8–12 min analysis via elapsed timer, synthesis-phase thinking events, and keepalive messages.

**Architecture:** Two independent workstreams — backend (`warren-agent/`) fixes the Haiku compliance + token cost; frontend (`portfolio-agentx/`) adds the streaming UX. All backend changes are Python; frontend adds a `useEffect`-based elapsed timer and a conditional banner. No schema changes, no new dependencies.

**Tech Stack:** Python (Strands, FastAPI), React 19, TypeScript, Next.js 16, Framer Motion.

---

## Root Cause (read before touching code)

`build_prompt()` already says "call report_pillar(...)" at each step. Haiku **does** execute the data-gathering tools (yfinance, screener, Tavily ×4) but then fails to call `report_pillar()` 6 times in sequence. Likely causes:

1. **Context overload**: screener returns 8,000 chars + 4 × 5 Tavily results × 500 chars = ~18,000 chars of tool results fed back into the context. Haiku gets confused.
2. **No synthesis-phase signal**: After the last Tavily search, `emit_thinking` goes silent for 8+ min — the model is processing but the user sees nothing.
3. **Weak tool-call enforcement**: Haiku sometimes treats "call report_pillar(...)" as descriptive text, not an imperative.

---

## File Map

| File | Change |
|------|--------|
| `warren-agent/prompts.py` | Add force-tool-call guard at top of `build_prompt()` |
| `warren-agent/tools/reporting.py` | Add `emit_thinking` to `report_pillar` and `report_verdict` |
| `warren-agent/tools/screener.py` | Truncate from 8,000 → 4,000 chars |
| `warren-agent/tools/web_search.py` | Reduce `max_results` 5→3, content slice 500→300 |
| `warren-agent/agent.py` | Emit keepalive thinking event every 2 min of silence |
| `portfolio-agentx/components/agents/ThinkingBubble.tsx` | Accept + display `elapsedSeconds` prop |
| `portfolio-agentx/app/agents/[name]/page.tsx` | Wire elapsed timer + "still working" banner |

---

## Task 1: Strengthen build_prompt for Haiku Tool Compliance

**Problem:** After gathering data, Haiku skips `report_pillar()` calls and writes text instead.

**Fix:** Add an explicit MANDATORY block at the very top of the user prompt that fires before any steps. This overrides Haiku's tendency to write text.

**Files:**
- Modify: `warren-agent/prompts.py` — `build_prompt()` function (line 51, start of the `prompt = f"""` block)

- [ ] **Step 1: Add force-tool-call block at the top of the prompt string**

In `warren-agent/prompts.py`, find the `prompt = f"""Analyze {base}...` line (line 51). Insert this block immediately after the first line of the f-string, before "Execute these steps IN ORDER":

```python
    prompt = f"""Analyze {base} (NSE: {symbol}) using the 6-pillar Warren Buffett methodology. Today is {now}.

MANDATORY RULE — READ BEFORE PROCEEDING:
You MUST call report_pillar() and report_verdict() as tool calls.
Writing pillar results as text is WRONG and will break the system.
After each data-gathering step, immediately call the report_pillar tool.
Do NOT explain what you are about to do. Just call the tool.

Execute these steps IN ORDER - do not skip any:
...
```

The full replacement for the prompt assignment (lines 51–92):

```python
    prompt = f"""Analyze {base} (NSE: {symbol}) using the 6-pillar Warren Buffett methodology. Today is {now}.

MANDATORY RULE — READ BEFORE PROCEEDING:
You MUST call report_pillar() and report_verdict() as tool calls — not as text output.
Writing pillar analysis as plain text is a critical failure. Use the tools exclusively.
After each data-gathering step, immediately call the report_pillar tool with the results.

Execute these steps IN ORDER - do not skip any:

STEP 1 - TECHNICAL:
Call get_price_and_technicals("{symbol}")
Immediately call: report_pillar(pillar="Technical", score=<1-4>, signal=<"BULLISH"|"BEARISH"|"NEUTRAL">, summary="2-3 sentences with actual numbers from the tool output", key_metrics={{...}})

STEP 2 - FUNDAMENTAL:
Call fetch_screener("{base}")
Extract PE, PBV, ROE, D/E, profit margin, FCF, promoter holding % from the response.
Immediately call: report_pillar(pillar="Fundamental", score=<1-4>, signal=<"BULLISH"|"BEARISH"|"NEUTRAL">, summary="2-3 sentences with actual numbers", key_metrics={{...}})

STEP 3 - SENTIMENT:
Call search_web("{base} stock news India {month_year}")
Call search_web("{base} NSE analyst rating target price buy sell hold 2026")
Immediately call: report_pillar(pillar="Sentiment", score=<1-4>, signal=<"BULLISH"|"BEARISH"|"NEUTRAL">, summary="2-3 sentences", key_metrics={{...}})

STEP 4 - OPTION CHAIN:
Call search_web("{base} NSE F&O option chain PCR put call ratio max pain open interest today")
If {base} is in F&O segment: immediately call report_pillar(pillar="OptionChain", score=<1-4>, signal=<"BULLISH"|"BEARISH"|"NEUTRAL">, summary="...", key_metrics={{...}})
If not in F&O: immediately call report_pillar(pillar="OptionChain", score=None, signal="N/A", summary="Not in F&O segment", key_metrics={{}})

STEP 5 - GLOBAL IMPACT:
Call search_web("India VIX DXY US Fed interest rate market sentiment {month_year}")
Call search_web("{base} sector India outlook headwinds tailwinds 2026")
Immediately call: report_pillar(pillar="GlobalImpact", score=None, signal=<"POSITIVE"|"NEUTRAL"|"NEGATIVE">, summary="2-3 sentences", key_metrics={{}})

STEP 6 - FII/DII FLOWS:
Use shareholding data from screener (Step 2): FII %, DII %, Promoter % and QoQ changes.
Call search_web("FII DII institutional flows NSE India {month_year} buying selling")
Immediately call: report_pillar(pillar="FIIDIIFlows", score=None, signal=<"BULLISH"|"NEUTRAL"|"BEARISH">, summary="2-3 sentences", key_metrics={{}})

STEP 7 - VERDICT:
Compute composite score from the scored pillars.
Immediately call: report_verdict(verdict=<"BUY"|"ACCUMULATE"|"HOLD"|"REDUCE"|"EXIT">, conviction=<"HIGH"|"MEDIUM"|"LOW"|"AVOID">, avg_score=<float>, entry="Rs.XXXX-YYYY", target="Rs.XXXX", stop_loss="Rs.XXXX", risk_reward="X:1", next_review="7 days")

STEP 8 - RESEARCH FILES:
Write content for all 9 research files clearly labelled with === FILE: filename.md ===
Files needed: technical.md, fundamental.md, sentiment.md, option_chain.md, global_impact.md, fii_dii.md, decision_log.md, summary.md, summary_{date_str}.md
"""
```

- [ ] **Step 2: Commit**

```bash
cd warren-agent
git add prompts.py
git commit -m "fix(warren): strengthen build_prompt tool-call compliance for Haiku"
```

---

## Task 2: Add emit_thinking to report_pillar and report_verdict

**Problem:** After the last Tavily search, the thinking log goes completely silent for 8+ min. Users see only `• • •` with no progress. When the model DOES call `report_pillar()`, there is no thinking event to signal it.

**Fix:** Add `emit_thinking` at the start of `report_pillar()` and `report_verdict()` so users see live progress during synthesis.

**Files:**
- Modify: `warren-agent/tools/reporting.py` — `report_pillar` and `report_verdict` functions

- [ ] **Step 1: Add emit_thinking calls to both tool functions**

In `warren-agent/tools/reporting.py`:

Replace the `report_pillar` function body:

```python
@tool
def report_pillar(
    pillar: str,
    score: int | None,
    signal: str,
    summary: str,
    key_metrics: dict | None = None,
) -> str:
    """
    Report a completed pillar analysis to the SSE stream.
    Call this ONCE immediately after analysing each pillar.

    pillar: one of Technical, Fundamental, Sentiment, OptionChain, GlobalImpact, FIIDIIFlows
    score: 1-4 for scored pillars, None for qualitative pillars (GlobalImpact, FIIDIIFlows)
    signal: BULLISH, BEARISH, NEUTRAL, POSITIVE, NEGATIVE, or N/A
    summary: 2-3 sentence analysis grounded in the data you fetched
    key_metrics: dict of the most important numbers e.g. {"rsi": 58, "pe": 25.3}
    """
    emit_thinking(f"Reporting {pillar} pillar — {signal}…")
    q = getattr(_local, "q", None)
    if q is not None:
        q.put(("pillar", {
            "pillar": pillar,
            "score": score,
            "signal": signal,
            "summary": summary,
            "keyMetrics": key_metrics or {},
        }))
    return f"Pillar '{pillar}' reported."
```

Replace the `report_verdict` function body:

```python
@tool
def report_verdict(
    verdict: str,
    conviction: str,
    avg_score: float,
    entry: str,
    target: str,
    stop_loss: str,
    risk_reward: str,
    next_review: str = "7 days",
) -> str:
    """
    Report the final investment verdict to the SSE stream.
    Call this ONCE after all 6 pillars are complete.

    verdict: BUY, ACCUMULATE, HOLD, REDUCE, or EXIT
    conviction: HIGH (>=3.5), MEDIUM (2.5-3.5), LOW (1.5-2.5), or AVOID (<1.5)
    avg_score: composite score (avg of scored pillars)
    entry: entry price range e.g. "Rs.1290-1320"
    target: target price e.g. "Rs.1600"
    stop_loss: stop loss price e.g. "Rs.1230"
    risk_reward: ratio e.g. "2.8:1"
    next_review: when to re-analyse e.g. "7 days"
    """
    emit_thinking(f"Forming verdict — {verdict} ({conviction} conviction)…")
    q = getattr(_local, "q", None)
    if q is not None:
        q.put(("verdict", {
            "verdict": verdict,
            "conviction": conviction,
            "avgScore": avg_score,
            "entry": entry,
            "target": target,
            "stopLoss": stop_loss,
            "riskReward": risk_reward,
            "nextReview": next_review,
        }))
    return f"Verdict '{verdict}' ({conviction} conviction) reported."
```

Note: `emit_thinking` is already imported and defined in the same file — no import change needed.

- [ ] **Step 2: Commit**

```bash
git add tools/reporting.py
git commit -m "fix(warren): emit thinking events during report_pillar and report_verdict"
```

---

## Task 3: Truncate screener.py Output (8,000 → 4,000 chars)

**Problem:** `fetch_screener()` returns up to 8,000 chars of Screener.in HTML. The key financial ratios are in the first ~3,000 chars. The rest is noise that inflates the LLM context.

**Files:**
- Modify: `warren-agent/tools/screener.py` — two slices on lines 27 and 37

- [ ] **Step 1: Change both [:8000] slices to [:4000]**

In `warren-agent/tools/screener.py`:

Replace line 27:
```python
        return resp.text[:8000]
```
With:
```python
        return resp.text[:4000]
```

Replace line 37 (the consolidated fallback):
```python
            return resp2.text[:8000]
```
With:
```python
            return resp2.text[:4000]
```

- [ ] **Step 2: Commit**

```bash
git add tools/screener.py
git commit -m "fix(warren): truncate screener.in response 8k→4k chars to reduce LLM context"
```

---

## Task 4: Reduce web_search.py Token Output (max_results 5→3, content 500→300)

**Problem:** Each `search_web()` call returns up to 5 results × 500 chars = 2,500 chars. Warren calls it 4 times = 10,000 chars. Reducing to 3 results × 300 chars = ~3,600 chars total — a 64% reduction in Tavily token cost.

**Files:**
- Modify: `warren-agent/tools/web_search.py` — two values on lines 26 and 38

- [ ] **Step 1: Change max_results and content slice**

In `warren-agent/tools/web_search.py`:

Replace line 26:
```python
        max_results=5,
```
With:
```python
        max_results=3,
```

Replace line 38 (inside the results loop):
```python
            f"\n[{i}] {r.get('title', '')}\n{r.get('content', '')[:500]}"
```
With:
```python
            f"\n[{i}] {r.get('title', '')}\n{r.get('content', '')[:300]}"
```

- [ ] **Step 2: Commit**

```bash
git add tools/web_search.py
git commit -m "fix(warren): reduce Tavily results 5→3 and content 500→300 chars per result"
```

---

## Task 5: Add Keepalive Thinking Events in agent.py

**Problem:** After all data-gathering tool calls finish, the LLM enters a long silent synthesis phase. If it takes >2 min with no thinking event, users assume the analysis has crashed.

**Fix:** Track the last event timestamp in `run_analysis()`. If no event has been emitted for 120 seconds, emit `thinking: "Warren is synthesising the analysis — this takes a few minutes…"`.

**Files:**
- Modify: `warren-agent/agent.py` — the `while True:` loop in `run_analysis()` (lines 109–129)

- [ ] **Step 1: Add keepalive logic to the drain loop**

In `warren-agent/agent.py`, find the `while True:` loop (around line 109). Replace it with:

```python
    import time as _time
    response_text = None
    last_event_at = _time.monotonic()
    KEEPALIVE_INTERVAL = 120  # seconds

    while True:
        try:
            item = q.get_nowait()
            if item is _SENTINEL:
                break
            event_type, data = item
            await on_event(event_type, data)
            last_event_at = _time.monotonic()
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
            # Keepalive: emit a thinking event if silent for too long
            if _time.monotonic() - last_event_at > KEEPALIVE_INTERVAL:
                await on_event("thinking", {"message": "Warren is still analysing — synthesising 6 pillars takes a few minutes…"})
                last_event_at = _time.monotonic()
            await asyncio.sleep(0.5)
```

Note: `import time as _time` should go at the top of the file with the other imports, not inside the function. Add it to `agent.py` imports section (around line 6):

```python
import time as _time
```

- [ ] **Step 2: Commit**

```bash
git add agent.py
git commit -m "fix(warren): emit keepalive thinking event every 2min during silent synthesis phase"
```

---

## Task 6: Frontend — Elapsed Timer in ThinkingBubble

**Problem:** Users have no way to know how long an analysis has been running. After 3+ min with only `• • •`, they assume it crashed.

**Fix:** Add an `elapsedSeconds` prop to `ThinkingBubble`. When provided, render a small timer below the checklist: *"Analysing CDSL · 4m 12s"*.

**Files:**
- Modify: `portfolio-agentx/components/agents/ThinkingBubble.tsx` — add `elapsedSeconds` prop and timer render
- Modify: `portfolio-agentx/app/agents/[name]/page.tsx` — add `useEffect` timer, pass to ThinkingBubble

- [ ] **Step 1: Update ThinkingBubble to accept and display elapsed time**

In `portfolio-agentx/components/agents/ThinkingBubble.tsx`:

Change the props interface:
```tsx
interface ThinkingBubbleProps {
  steps: ThinkingStep[];
  agentColor: string;
  elapsedSeconds?: number;
  ticker?: string;
  onComplete?: () => void;
}
```

Update the function signature:
```tsx
export function ThinkingBubble({ steps, agentColor, elapsedSeconds, ticker, onComplete }: ThinkingBubbleProps) {
```

Add this helper function before the component (after the `ICON_MAP`):
```tsx
function formatElapsed(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
```

Add the timer display inside the returned JSX, after the closing `</div>` of the steps map (before the final `</div>`):
```tsx
      {elapsedSeconds !== undefined && elapsedSeconds > 0 && (
        <div className="mt-2 text-xs text-foreground-muted" style={{ color: agentColor }}>
          {ticker ? `Analysing ${ticker}` : "Analysing"} · {formatElapsed(elapsedSeconds)}
        </div>
      )}
```

- [ ] **Step 2: Add elapsed timer state in page.tsx**

In `portfolio-agentx/app/agents/[name]/page.tsx`:

Find where `isRunning` state is declared (somewhere near the top of the component). Add two new state declarations nearby:

```tsx
const [elapsedSeconds, setElapsedSeconds] = useState(0);
const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
```

Add a `useEffect` that starts/stops the timer based on `isRunning`:

```tsx
useEffect(() => {
  if (isRunning) {
    setElapsedSeconds(0);
    elapsedRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  } else {
    if (elapsedRef.current) {
      clearInterval(elapsedRef.current);
      elapsedRef.current = null;
    }
  }
  return () => {
    if (elapsedRef.current) clearInterval(elapsedRef.current);
  };
}, [isRunning]);
```

Make sure `useRef` is imported from React at the top of the file (it should already be).

Find where `<ThinkingBubble` is rendered in the JSX and add the new props:

```tsx
<ThinkingBubble
  steps={...}           {/* existing props */}
  agentColor={...}      {/* existing props */}
  elapsedSeconds={elapsedSeconds}
  ticker={agentSlug === "warren" ? currentTicker : undefined}
  onComplete={...}      {/* existing props */}
/>
```

To find `currentTicker`, check if the page already tracks the last submitted ticker. If not, add:
```tsx
const [currentTicker, setCurrentTicker] = useState<string>("");
```
And set it when the user submits:
```tsx
setCurrentTicker(userInput.trim().toUpperCase());
```
(Add this line in the submit handler, near where `isRunning` is set to `true`.)

- [ ] **Step 3: Type-check**

```bash
cd portfolio-agentx && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add portfolio-agentx/components/agents/ThinkingBubble.tsx portfolio-agentx/app/agents/[name]/page.tsx
git commit -m "feat(warren-ux): elapsed timer in ThinkingBubble during long analysis"
```

---

## Task 7: Frontend — "Still Working" Banner After 5 Min

**Problem:** Even with keepalive thinking events, users who leave the tab and return after 5+ min see no indication that the analysis is in progress and how long it's been running.

**Fix:** Show a dismissible amber banner above the chat thread when `isRunning && elapsedSeconds > 300` (5 min) and no pillar cards have arrived yet.

**Files:**
- Modify: `portfolio-agentx/app/agents/[name]/page.tsx` — add conditional banner in JSX

- [ ] **Step 1: Add the banner to the chat area**

In `portfolio-agentx/app/agents/[name]/page.tsx`, find the main chat area JSX (the scrollable div containing `ChatThread`). Add this banner immediately above the `ChatThread` component:

```tsx
{isRunning && elapsedSeconds > 300 && pillarCount === 0 && (
  <div className="mx-4 mb-3 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
    <span className="animate-pulse">●</span>
    <span>
      Warren is still working — deep analysis takes 8–12 minutes.
      {" "}Elapsed: <strong>{formatElapsed(elapsedSeconds)}</strong>
    </span>
  </div>
)}
```

Where `pillarCount` is the number of pillar cards received so far. Add this derived value near the other state:
```tsx
const pillarCount = messages.filter(
  (m) => m.type === "agent" && m.structured?.type === "pillars"
).length;
```

(Check the actual message type field name — look at how `PillarCards` messages are typed in `lib/mock-sessions.ts` and match the field name used there.)

Add the `formatElapsed` helper at the top of the component file (outside the component, since it's also used in ThinkingBubble — but ThinkingBubble is a separate file, so define it locally here too):

```tsx
function formatElapsed(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
```

- [ ] **Step 2: Type-check**

```bash
cd portfolio-agentx && npx tsc --noEmit
```

Expected: 0 errors. If `pillarCount` filter doesn't match, check `lib/mock-sessions.ts` for the `ChatMessage` type's `structured` field shape.

- [ ] **Step 3: Commit**

```bash
git add portfolio-agentx/app/agents/[name]/page.tsx
git commit -m "feat(warren-ux): show still-working amber banner after 5 min with no pillar cards"
```

---

## Expected Outcome

| Metric | Before | After |
|--------|--------|-------|
| Haiku tool call compliance | Fails after data gather | Forced by MANDATORY block |
| Screener token cost | 8,000 chars | 4,000 chars (−50%) |
| Tavily token cost | ~10,000 chars | ~3,600 chars (−64%) |
| Total input token reduction | baseline | ~35–40% |
| Thinking log gaps | 8+ min silent | 2 min max before keepalive |
| Synthesis visibility | None | "Reporting Technical pillar — BULLISH…" per pillar |
| Elapsed timer | None | Live counter in chat bubble |
| Long-wait UX | Blank `• • •` forever | Amber banner + keepalive at 5 min |

---

## Self-Review

**Spec coverage:**
| Requirement | Task |
|-------------|------|
| Fix Haiku tool-call failure | Task 1 ✓ |
| Add synthesis-phase thinking events | Task 2 ✓ |
| Truncate screener output | Task 3 ✓ |
| Truncate Tavily output | Task 4 ✓ |
| Keepalive events every 2 min | Task 5 ✓ |
| Elapsed timer | Task 6 ✓ |
| "Still working" banner at 5 min | Task 7 ✓ |

**Placeholder scan:** Task 6 has one conditional note ("check the actual message type field name") — this is not a placeholder, it's a verification instruction. The field is in `lib/mock-sessions.ts`.

**Type consistency:** `elapsedSeconds: number` defined in `page.tsx` state, passed as `elapsedSeconds?: number` to `ThinkingBubble` — matches. `formatElapsed(secs: number): string` defined locally in both files independently — no shared import needed.
