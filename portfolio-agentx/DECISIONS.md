# portfolio-agentx — Architectural Decisions

---

## 2026-06-02 — Next.js 16 App Router over Pages Router

**Decision:** Full App Router with React Server Components throughout.
**Why:** RSC enables auth-aware page rendering without client-side loading states. Server-side Supabase session validation on every request. Better performance for the agent chat interface.

---

## 2026-06-02 — `proxy.ts` instead of `middleware.ts`

**Decision:** Auth middleware lives in `proxy.ts` with `export async function proxy()`.
**Why:** Next.js 16 deprecates the `middleware.ts` / `export function middleware()` convention. Using the new form avoids build warnings.

---

## 2026-06-02 — `is_premium` as cache, `subscriptions` table as authoritative

**Decision:** `user.user_metadata.is_premium` is a fast-check hint only. All stream routes verify against the `subscriptions` table before granting access.
**Why:** JWT metadata can be stale if a subscription expired between logins. Database is always current. Relying only on the JWT flag allows expired subscribers to continue accessing paid features.

---

## 2026-06-02 — Razorpay over Stripe for payments

**Decision:** Razorpay embedded checkout modal for Indian payments.
**Why:** Razorpay is the Indian market standard (UPI, cards, netbanking all work). Stripe India has limitations with UPI. Test VPA: `success@razorpay`.

---

## 2026-06-02 — Agent icons NOT on Agent type (separate AGENT_ICONS export)

**Decision:** `AGENT_ICONS: Record<string, LucideIcon>` is a separate export from the `Agent` interface.
**Why:** `Agent` objects are passed as props from Server Components to Client Components. React serializes these props — a LucideIcon (a function) cannot be serialized. Keeping icons in a separate client-side map prevents serialization errors. Always import `AGENT_ICONS` in client components and look up by `agent.slug`.

---

## 2026-06-02 — WARRen as external Railway microservice (not inline Next.js)

**Decision:** WARRen stock analysis runs as a separate Python service on Railway, proxied by Next.js.
**Why:** WARRen uses Python-native tools (yfinance, pandas-ta, Strands) that cannot run in a Next.js serverless function. Railway allows long-running async processes. The proxy approach keeps the Next.js app stateless.
**Known issue:** Vercel serverless 300s timeout kills the proxy for long analyses. Fix: `export const runtime = 'edge'` on the Warren stream route.

---

## 2026-06-02 — Paywall: `warning` stage is locked, not just `aware`

**Decision:** `isLocked(stage)` returns `true` for both `"warning"` and `"locked"` stages.
**Why:** This is a common bug — treating `"warning"` as still-unlocked lets users exceed the intended free tier. The server also blocks at `count >= limit` regardless of frontend stage, but the UI should be consistent.

---

## Template

## YYYY-MM-DD — [Short title]

**Decision:** [What was decided]
**Why:** [Reason / tradeoff / constraint]
