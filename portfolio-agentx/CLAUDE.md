# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AGentX — persona-driven AI SaaS platform + portfolio. Three AI agents (Warren, Sherlock, Harvey) backed by real Claude API (`claude-sonnet-4-6`) with Supabase auth, DB, server-side paywall enforcement, and Razorpay payments.

**Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Framer Motion, Supabase SSR, Anthropic SDK, Razorpay.

**Live:** https://portfolio-one-topaz-65.vercel.app  
**Repo:** https://github.com/ankitgoyal473/Portfolio (root: `portfolio-agentx/`)

## Commands

```bash
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build (Turbopack)
npm run lint         # ESLint
npx tsc --noEmit    # Type check
```

Before marking any work done:
```bash
npx tsc --noEmit && npm run lint && npm run build
```

## Architecture

### Auth & Routing
- **`proxy.ts`** (project root) — Next.js 16 middleware. Must be named `proxy.ts` with `export async function proxy()` — NOT `middleware.ts`/`middleware()` (breaking change in Next.js 16). Refreshes Supabase session; redirects unauthenticated users away from `/agents/*`, `/admin/*`, `/dashboard/*`, `/api/agents/*`.
- **`lib/mock-auth.ts`** — `useMockAuth()` hook (legacy name, real Supabase). Returns `user: User | null`, `login()` (Google OAuth), `logout()`. Access name/avatar via `user.user_metadata?.full_name` and `user.user_metadata?.avatar_url`.
- **`lib/supabase/client.ts`** — `createBrowserSupabaseClient()` for client components.
- **`lib/supabase/server.ts`** — `createServerSupabaseClient()` (async, uses `cookies()`) for server components and API routes.
- **`lib/supabase/admin.ts`** — `supabaseAdmin` service-role client — bypasses RLS, API routes only, never client.
- **`app/auth/callback/route.ts`** — OAuth code exchange after Google login.

### User Roles (stored in `auth.users.raw_user_meta_data`)

| Flag | Purpose | How to set |
|------|---------|-----------|
| `is_admin: true` | Access `/admin` dashboard | SQL: `UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data \|\| '{"is_admin":true}' WHERE email='...'` |
| `is_premium: true` | Bypass paywall on all 3 agents | SQL above, or `/admin` → Users → "Grant Premium" toggle |

Both flags require re-login to take effect (JWT refresh). Check in code: `user?.user_metadata?.is_admin === true` / `user?.user_metadata?.is_premium === true`.

### Agent System
Three agents with distinct identities. Never call them "tools", "bots", or "features".

| Agent | Color | Icon | Route | Free limit |
|-------|-------|------|-------|-----------|
| **WARRen** | `#f0b429` | TrendingUp | `/agents/warren` | 1 run |
| **Sherlock** | `#4a9eff` | Search | `/agents/sherlock` | 1 run |
| **Harvey** | `#00c896` | Mail | `/agents/harvey` | 10 runs |

- **`lib/agents.ts`** — Agent data (colors, personalities, UI config).
- **`lib/agent-types.ts`** — Shared structured output types: `Pillar`, `CaseFileData`, `CaseFileSection`, `Prospect`.
- **`persona.md`** — Canonical voice/copy rules. Read before editing agent messages.

### Agent API Routes (SSE Streaming)
Each agent has two routes:
- `POST /api/agents/{agent}/stream` — **Primary.** Auth check → premium bypass check → paywall check → usage increment → Claude API → SSE stream.
- `POST /api/agents/{agent}` — Batch fallback.

**Premium bypass:** If `user.user_metadata?.is_premium === true`, the paywall gate is skipped entirely. Usage is still incremented (tracked but never blocked).

**Paywall gate:** `if (!isPremium && count >= LIMITS[agent]) → 403`. Server is authoritative — client usage state is read-only display.

SSE event types:
- **Warren:** `status`, `pillar` (×5), `verdict`, `done`
- **Sherlock:** `status`, `section` (×3), `threat`, `done`
- **Harvey:** `status`, `prospect` (×N), `done`

### Streaming Hook
**`lib/use-agent-stream.ts`** — `useAgentStream()` returns `{ stream, cancel }`. Reads SSE `event:` / `data:` lines, fires `onEvent({ event, data })` per event, `onDone()` on completion.

### Paywall System
**`lib/paywall.ts`** — Async Supabase-backed paywall.
- `getUsage(agentId, userId)` → `UsageState { used, limit, stage }`
- `incrementUsage(agentId, userId)` — server-side in stream routes only
- `resetUsage(agentId, userId)` — deletes usage row (used after payment)
- `isLocked(stage)` — returns `true` for `"warning"` OR `"locked"` (both block the chatbar)
- Stages: `fresh` → `aware` → `warning` → `locked`

**Important:** `isLocked` returns true at `"warning"` (count === limit) — this matches the server's `>= limit` gate. A common bug is treating warning as "not locked" — don't.

### Payment — Razorpay (₹999/month, Indian users)
Embedded checkout modal — no redirect, no new tab.

Flow:
1. User clicks Unlock in `PaywallSheet`
2. `POST /api/razorpay/create-order` — creates Razorpay order (99900 paise = ₹999), returns `{ orderId, amount, currency, keyId }`
3. Frontend loads `checkout.razorpay.com/v1/checkout.js` dynamically, opens modal
4. User pays → Razorpay calls `handler` with `{ razorpay_payment_id, razorpay_order_id, razorpay_signature }`
5. `POST /api/razorpay/verify` — HMAC-SHA256 signature verification → deletes `agent_usage` rows for all 3 agents → user is unlocked
6. `onUnlocked()` callback fires in agent page → refreshes usage, shows system message

**Key secret never reaches frontend** — `keyId` is returned by the server, secret stays server-side only.

**Test UPI:** Use VPA `success@razorpay` in the modal (type it — don't scan QR with real apps in test mode). Real GPay works in live mode.

### Session Persistence
- Sessions saved to `agent_sessions` (Supabase upsert) after each agent run
- On page mount: loads sessions → **auto-restores most recent session** into thread. Only calls `startNewSession()` if no sessions exist
- `?unlocked=1` query param: handled on mount — shows unlock message, refreshes usage, clears URL with `window.history.replaceState`
- Replaying a session from sidebar continues it (appends new runs to the same session ID)

### Supabase DB Schema
```
leads           — id, created_at, problem, workflow, budget, timeline, complexity,
                  delivery, stack, estimate_low, estimate_high, user_email, notes,
                  status (default 'pending'), ankit_note
agent_sessions  — id, user_id (→ auth.users), agent_id, created_at, title, messages (jsonb)
agent_usage     — user_id, agent_id, count (pk: user_id+agent_id)
```
RLS: `leads` = service role only. `agent_sessions` + `agent_usage` = users own their rows.

### Chat UI Components
- **`components/agents/ChatThread.tsx`** — Dispatches on `msg.metadata?.type`: renders `PillarCards`, `CaseFileCard`, or `ResultsTable`. Fallback: text.
- **`components/agents/AgentChatbar.tsx`** — `isLocked` prop disables textarea, shows lock icon button, placeholder "Upgrade to continue...".
- **`components/agents/PaywallSheet.tsx`** — Slide-up Razorpay checkout sheet. Props: `agentId`, `agentColor`, `isOpen`, `onClose`, `userId`, `userEmail`, `userName`, `onUnlocked`. Auto-opens aggressively when user is locked on page load.

### API Routes Reference

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/agents/{agent}/stream` | POST | Required | SSE streaming with paywall |
| `/api/razorpay/create-order` | POST | Required | Create ₹999 Razorpay order |
| `/api/razorpay/verify` | POST | Required | Verify payment + reset usage |
| `/api/submit-lead` | POST | None | Insert lead (validates problem + userEmail) |
| `/api/update-lead` | PATCH | None | Update lead status/note |
| `/api/leads` | GET | None | All leads (used by admin) |
| `/api/admin/users` | GET | Admin | List all auth users with premium/admin flags |
| `/api/admin/set-premium` | POST | Admin | Toggle `is_premium` on a user |

### Admin Dashboard
- `/admin` — gated by `is_admin === true`. Shows: leads list with accept/decline, stats row, Users section with premium toggles.
- Entry point: `/dashboard` shows an "Admin Panel" card only when `is_admin === true`.
- `GET /api/admin/users` uses `supabaseAdmin.auth.admin.listUsers()`.
- `POST /api/admin/set-premium` uses `supabaseAdmin.auth.admin.updateUserById()`.

## Design System

Tailwind v4 — theme in `app/globals.css` via `@theme inline`, **not** `tailwind.config.js`.

Key tokens: `bg-background` (#0A0A0A), `bg-background-card` (#1E1E1E), `text-foreground`, `text-foreground-secondary`, `text-foreground-muted`, `text-accent` (#E8D5B8), `border-border` (#27272A), `text-error`, `text-success`. Use semantic classes, not raw hex.

## Known Quirks

- **Next.js 16 middleware:** `proxy.ts` + `export async function proxy()`. `middleware.ts` triggers deprecation warning.
- **Next.js 16 dynamic params:** Server components: `params` is a Promise. Client components: use `useParams()`.
- **`useSearchParams()`:** Wrap in `<Suspense>` or build fails. Use `window.location.search` in `useEffect` instead to avoid this.
- **Lucide React v1:** `Github`, `Linkedin`, `Twitter` icons removed — use inline SVGs.
- **`useMockAuth` name:** Legacy. It's real Supabase auth.
- **`lib/mock-data.ts`:** Only re-exports Supabase `User` type and `mockUser = null`. Not a mock.
- **ESLint is slow** (~30s+) on OneDrive paths.
- **Razorpay test mode:** QR codes can't be scanned by real UPI apps. Use VPA `success@razorpay` typed manually, or use test card `4111 1111 1111 1111`.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # Server/API routes only
ANTHROPIC_API_KEY                # claude-sonnet-4-6 in stream routes
NEXT_PUBLIC_APP_URL              # OAuth redirect base URL
RAZORPAY_KEY_ID                  # Server-side only (returned to client via API response)
RAZORPAY_KEY_SECRET              # Server-side only, never frontend
```
