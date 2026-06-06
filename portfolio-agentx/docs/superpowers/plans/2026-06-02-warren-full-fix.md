# Warren Full Fix — Implementation Plan

> **For agentic workers:** Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Warren fully functional before and after premium access. Fix all 9 issues surfaced by the code review + UI analysis.

**Context:** Issues found via `/code-review high` on 2026-06-02 after testing https://portfolio-one-topaz-65.vercel.app/agents/warren. Premium granted by admin was self-destructing on first use. Sessions never saved. Free runs were being burned on bad requests. `/api/send-reminder` was publicly accessible.

---

## 📁 File Map

| File | Action | Purpose |
|------|--------|---------|
| `portfolio-agentx/app/api/admin/set-premium/route.ts` | Modify | Create subscriptions row when granting premium |
| `portfolio-agentx/app/api/agents/warren/stream/route.ts` | Modify | Parse ticker before usage increment; add INTERNAL_SECRET header on reminder call |
| `portfolio-agentx/app/api/send-reminder/route.ts` | Modify | Add auth check (X-Internal-Token) + user_id ownership filter |
| `portfolio-agentx/app/api/razorpay/verify/route.ts` | Modify | Degrade gracefully if agent_usage reset fails |
| `portfolio-agentx/lib/mock-sessions.ts` | Modify | generateSessionId → crypto.randomUUID() |
| `portfolio-agentx/app/agents/[name]/page.tsx` | Modify | AAPL → Indian examples; handle `thinking` SSE events |
| `warren-agent/tools/reporting.py` | Modify | Add emit_thinking() helper |
| `warren-agent/tools/technicals.py` | Modify | Call emit_thinking() at start |
| `warren-agent/tools/screener.py` | Modify | Call emit_thinking() at start |
| `warren-agent/tools/web_search.py` | Modify | Call emit_thinking() with actual query |
| `warren-agent/agent.py` | Modify | get_running_loop(); fail-fast on empty API key |
| `.env.local` / Vercel env | Add | INTERNAL_SECRET env var |

---

## Task 1 — Fix `set-premium`: create subscriptions row

**Problem:** `set-premium` sets `is_premium: true` in user_metadata but never creates a `subscriptions` row. On first Warren use, the stream route queries subscriptions, finds nothing, and immediately clears `is_premium` back to `false`. Premium lasts 0 runs.

**Files:** `portfolio-agentx/app/api/admin/set-premium/route.ts`

- [ ] **Replace the entire file with:**

```ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.is_admin !== true) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, premium } = await request.json();
  if (!userId || typeof premium !== "boolean") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Update user_metadata flag
  const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { is_premium: premium },
  });
  if (metaError) {
    return NextResponse.json({ error: metaError.message }, { status: 500 });
  }

  if (premium) {
    // Create a permanent admin-granted subscription row so the stream route
    // finds an active subscription and does NOT clear is_premium on first use.
    const { error: subError } = await supabaseAdmin
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: "2099-12-31T23:59:59.000Z",
          amount: 0,
          currency: "INR",
          razorpay_payment_id: "admin_grant",
          razorpay_order_id: "admin_grant",
        },
        { onConflict: "user_id", ignoreDuplicates: false }
      );
    if (subError) {
      console.error("set-premium: failed to upsert subscription", subError);
    }
  } else {
    // Revoke: mark the admin-granted subscription as expired
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("user_id", userId)
      .eq("razorpay_payment_id", "admin_grant");
  }

  return NextResponse.json({ success: true, userId, premium });
}
```

- [ ] **Verify:** Grant premium to a test user in admin dashboard, run Warren → should NOT hit paywall.

---

## Task 2 — Stream route: parse ticker BEFORE usage increment

**Problem:** Usage count is incremented (line ~83) before `request.json()` is called (line ~88). A missing/invalid ticker returns 400 but the free-tier run is already consumed.

**Files:** `portfolio-agentx/app/api/agents/warren/stream/route.ts`

- [ ] **Move ticker parsing to the top** — right after auth, before any DB writes:

```ts
// After auth check, before isPremium block — add:
const body = await request.json().catch(() => ({}));
const { ticker } = body as { ticker?: string };
if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });

const agentUrl = process.env.WARREN_AGENT_URL;
if (!agentUrl) return NextResponse.json({ error: "WARREN_AGENT_URL not configured" }, { status: 500 });
```

- [ ] **Remove** the duplicate `const { ticker } = await request.json()` block near the bottom (it will now be dead code).

- [ ] **Verify:** POST to stream with no body → 400, usage count unchanged.

---

## Task 3 — Session IDs: use `crypto.randomUUID()`

**Problem:** `generateSessionId()` returns `sess_TIMESTAMP_RANDOM` (not a UUID). If `agent_sessions.id` is UUID type in Postgres, every upsert fails with 400. The `.then()` silently swallows the error, `reloadSessionsFromSupabase` never fires, sidebar always shows "No sessions yet".

**Files:** `portfolio-agentx/lib/mock-sessions.ts`

- [ ] **Replace `generateSessionId`:**

```ts
export function generateSessionId(): string {
  return crypto.randomUUID();
}
```

- [ ] **Verify:** Run a Warren analysis → session appears in sidebar after completion.

> **Note:** If sessions still 400 after this fix, the `id` column may be `text` type and the bug is elsewhere (likely messages JSONB size or RLS). Check Supabase Table Editor → agent_sessions → id column type.

---

## Task 4 — `send-reminder`: add auth + ownership filter

**Problem:** `/api/send-reminder` is publicly callable (not in `protectedPaths`). Any caller can trigger emails to arbitrary addresses and overwrite `reminder_sent_at` on any subscription.

**Files:** `portfolio-agentx/app/api/send-reminder/route.ts`, `portfolio-agentx/app/api/agents/warren/stream/route.ts`

**Step 1:** Add `INTERNAL_SECRET` env var to Vercel + `.env.local`:
```
INTERNAL_SECRET=<generate with: openssl rand -hex 32>
```

**Step 2:** Update `send-reminder/route.ts`:

```ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail, expiryReminderEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Internal-only endpoint — requires secret header set by edge stream route
  const token = request.headers.get("x-internal-token");
  if (!token || token !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subscriptionId, userId, userEmail, userName, expiresAt, daysLeft, appUrl } =
    await request.json();

  if (!subscriptionId || !userId || !userEmail) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  try {
    const reminderEmail = expiryReminderEmail({ name: userName ?? "there", expiresAt, daysLeft, appUrl });
    await sendEmail({ to: userEmail, ...reminderEmail });
    // Ownership filter: only update the subscription belonging to this user
    await supabaseAdmin
      .from("subscriptions")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", subscriptionId)
      .eq("user_id", userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-reminder error:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
```

**Step 3:** Update the `void fetch` call in `stream/route.ts` to pass the header and userId:

```ts
void fetch(new URL("/api/send-reminder", request.url).toString(), {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-internal-token": process.env.INTERNAL_SECRET ?? "",
  },
  body: JSON.stringify({
    subscriptionId: sub.id,
    userId: user.id,
    userEmail: user.email,
    userName: user.user_metadata?.full_name ?? user.email ?? "there",
    expiresAt: sub.expires_at,
    daysLeft,
    appUrl,
  }),
});
```

- [ ] **Verify:** Unauthenticated POST to `/api/send-reminder` → 401.

---

## Task 5 — Razorpay verify: don't 500 if usage reset fails

**Problem:** `verify/route.ts` inserts the subscription + sets `is_premium` THEN deletes `agent_usage`. If the delete fails, it returns 500 — telling the user their payment failed when their money was actually taken.

**Files:** `portfolio-agentx/app/api/razorpay/verify/route.ts`

- [ ] **Wrap the usage reset in try/catch, always return 200:**

```ts
// Replace the agent_usage delete + its error handling with:
try {
  await supabaseAdmin
    .from("agent_usage")
    .delete()
    .eq("user_id", payload.userId);
} catch (resetErr) {
  // Non-critical — subscription is active. Log and continue.
  console.error("verify: failed to reset agent_usage (non-fatal)", resetErr);
}

return NextResponse.json({ success: true });
```

- [ ] **Verify:** Payment flow completes successfully; frontend shows success state.

---

## Task 6 — Per-tool live thinking SSE

**Problem:** Warren takes 8–12 minutes. Users see static thinking steps and a spinner with no real-time feedback about what's happening.

**Goal:** Emit `thinking` SSE events from Railway as each tool is called, with the actual operation described (including Tavily search queries). Frontend displays a live scrolling log.

### Step A: Add `emit_thinking()` to `warren-agent/tools/reporting.py`

```python
def emit_thinking(message: str) -> None:
    """Put a thinking event on the SSE queue (no-op if no queue active)."""
    q = getattr(_local, "q", None)
    if q is not None:
        q.put(("thinking", {"message": message}))
```

### Step B: Emit thinking in `warren-agent/tools/technicals.py`

At the top of `get_price_and_technicals()`:
```python
from tools.reporting import emit_thinking

@tool
def get_price_and_technicals(symbol: str) -> dict:
    emit_thinking(f"Fetching live price & technical data for {symbol}…")
    # ... rest of function unchanged
```

### Step C: Emit thinking in `warren-agent/tools/screener.py`

```python
from tools.reporting import emit_thinking

@tool
def fetch_screener(symbol: str) -> str:
    emit_thinking(f"Reading Screener.in fundamentals for {symbol}…")
    # ... rest of function unchanged
```

### Step D: Emit thinking in `warren-agent/tools/web_search.py`

```python
from tools.reporting import emit_thinking

@tool
def search_web(query: str) -> str:
    emit_thinking(f"Searching: '{query}'…")
    # ... rest of function unchanged
```

### Step E: Handle `thinking` events in `portfolio-agentx/app/agents/[name]/page.tsx`

In the Warren SSE event handler, add a case for `thinking`:
```ts
} else if (eventType === "thinking") {
  const { message } = data as { message: string };
  // Append to a live thinking log (stored in message metadata)
  setMessages((prev) => {
    const last = prev[prev.length - 1];
    if (last?.metadata?.type === "thinking-log") {
      return prev.map((m, i) =>
        i === prev.length - 1
          ? { ...m, metadata: { ...m.metadata, lines: [...(m.metadata.lines ?? []), message] } }
          : m
      );
    }
    return [...prev, createMessage("agent", "", {
      type: "thinking-log",
      lines: [message],
    })];
  });
}
```

The `thinking-log` message renders as a live scrolling list of `✦ message…` lines above the pillar cards. When the first `pillar` event arrives, the thinking-log message is replaced/completed.

- [ ] **Verify:** Run RELIANCE analysis — see real-time tool activity log updating live in the UI.

---

## Task 7 — Fix AAPL examples (2 lines)

**Files:** `portfolio-agentx/app/agents/[name]/page.tsx`

- [ ] Line 71: `return "Ask WARRen... (e.g. AAPL)";` → `return "Ask WARRen... (e.g. RELIANCE, INFY)";`
- [ ] Line 641: `"I work best with stock tickers. Try typing AAPL or RELIANCE.NS"` → `"I work best with Indian stock tickers (NSE/BSE). Try RELIANCE, INFY, or TCS."`

---

## Task 8 — `asyncio.get_running_loop()` (1 line)

**Files:** `warren-agent/agent.py`

- [ ] Line 99: `loop = asyncio.get_event_loop()` → `loop = asyncio.get_running_loop()`

---

## Task 9 — Fail-fast on missing `ANTHROPIC_API_KEY` (1 line)

**Files:** `warren-agent/agent.py`

- [ ] Line 85: `client_args={"api_key": os.environ.get("ANTHROPIC_API_KEY", "")}` → `client_args={"api_key": os.environ["ANTHROPIC_API_KEY"]}`

---

## Deploy Checklist

- [ ] Add `INTERNAL_SECRET` to Vercel env vars (Settings → Environment Variables)
- [ ] `npx tsc --noEmit && npm run lint` in `portfolio-agentx/`
- [ ] `python -m pytest tests/ -v` in `warren-agent/`
- [ ] Commit all changes, push to main
- [ ] Wait for Vercel + Railway auto-deploy
- [ ] Manually verify: grant premium in admin panel → run Warren → 6 pillar cards render → sessions appear in sidebar

---

## Code Review Findings Reference

| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|
| 1 | set-premium/route.ts | 21 | No subscriptions row on grant → immediate self-revoke | CRITICAL |
| 2 | send-reminder/route.ts | 5 | No auth → email spoofing | HIGH |
| 3 | send-reminder/route.ts | 16 | No ownership filter | HIGH |
| 4 | stream/route.ts | 83 | Usage before ticker parse → burned free run | HIGH |
| 5 | razorpay/verify/route.ts | 55 | 500 after payment succeeds | HIGH |
| 6 | stream/route.ts | 63 | Non-atomic paywall check race | MEDIUM |
| 7 | page.tsx | 347 | Non-UUID session IDs → 400 on upsert | MEDIUM |
| 8 | agent.py | 85 | Silent empty API key | MEDIUM |
| 9 | agent.py | 99 | get_event_loop() deprecated in Python 3.12 | LOW |
