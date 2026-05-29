# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AGentX — persona-driven AI SaaS platform + portfolio. Three AI agents (Warren, Sherlock, Harvey) backed by real Claude API (`claude-sonnet-4-6`) with Supabase auth, DB, and server-side paywall enforcement.

**Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Framer Motion, Supabase SSR, Anthropic SDK.

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
- **`proxy.ts`** (project root) — Next.js 16 middleware. Named `proxy` + `export async function proxy()` (not `middleware` — breaking change in Next.js 16). Refreshes Supabase session on every request; redirects unauthenticated users away from `/agents/*`, `/admin/*`, `/dashboard/*`, `/api/agents/*`.
- **`lib/mock-auth.ts`** — `useMockAuth()` hook. Name is legacy; it's a real Supabase implementation. Returns `user: User | null` (Supabase type), `login()` (Google OAuth), `logout()`. Use `user.user_metadata?.full_name` and `user.user_metadata?.avatar_url` — not `user.name` or `user.avatar`.
- **`lib/supabase/client.ts`** — `createBrowserSupabaseClient()` for client components.
- **`lib/supabase/server.ts`** — `createServerSupabaseClient()` (async, uses `cookies()`) for server components and API routes.
- **`lib/supabase/admin.ts`** — `supabaseAdmin` service-role client for API routes that need to bypass RLS.
- **`app/auth/callback/route.ts`** — OAuth code exchange after Google login.

### Agent System
Three agents with distinct identities. Never call them "tools", "bots", or "features".

| Agent | Color | Icon | Route | Free limit |
|-------|-------|------|-------|-----------|
| **WARRen** | `#f0b429` | TrendingUp | `/agents/warren` | 1 run |
| **Sherlock** | `#4a9eff` | Search | `/agents/sherlock` | 1 run |
| **Harvey** | `#00c896` | Mail | `/agents/harvey` | 10 runs |

- **`lib/agents.ts`** — Agent data (colors, personalities, pricing copy, UI config).
- **`lib/agent-types.ts`** — Shared structured output types: `Pillar`, `CaseFileData`, `CaseFileSection`, `Prospect`.
- **`persona.md`** — Canonical voice/copy rules. Read before editing agent messages.

### Agent API Routes (SSE Streaming)
Each agent has two routes:
- `POST /api/agents/{agent}/stream` — **Primary.** Auth check → server-side paywall increment → Claude API call → SSE stream of typed events.
- `POST /api/agents/{agent}` — Batch (non-streaming) fallback.

SSE event types per agent:
- **Warren:** `status`, `pillar` (×5), `verdict`, `done`
- **Sherlock:** `status`, `section` (×3), `threat`, `done`
- **Harvey:** `status`, `prospect` (×N), `done`

The stream route increments usage server-side (authoritative). Client calls `getUsage()` after `done` to refresh UI state.

### Streaming Hook
**`lib/use-agent-stream.ts`** — `useAgentStream()` returns `{ stream, cancel }`. Reads SSE `event:` / `data:` lines, fires `onEvent({ event, data })` per event, `onDone()` on completion. Used in `app/agents/[name]/page.tsx`.

### Paywall System
**`lib/paywall.ts`** — Async Supabase-backed paywall.
- `getUsage(agentId, userId)` → `UsageState { used, limit, stage }`
- `incrementUsage(agentId, userId)` — called server-side in stream routes only
- `resetUsage(agentId, userId)` — deletes the usage row
- `isLocked(stage: PaywallStage)` — takes stage string, not agentId
- Stages: `fresh` → `aware` → `warning` → `locked`

Usage is stored in `agent_usage` table (RLS: users own their rows). Usage increment happens in the streaming API route, not the client.

### Supabase DB Schema
```
leads           — id, created_at, problem, workflow, budget, timeline, complexity,
                  delivery, stack, estimate_low, estimate_high, user_email, notes,
                  status (default 'pending'), ankit_note
agent_sessions  — id, user_id (→ auth.users), agent_id, created_at, title, messages (jsonb)
agent_usage     — user_id, agent_id, count (pk: user_id+agent_id)
```
RLS: `leads` = service role only. `agent_sessions` + `agent_usage` = users own their rows.

Set admin: `UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"is_admin":true}' WHERE email='ankitgoyal473@gmail.com'`

Admin check in code: `user?.user_metadata?.is_admin === true`. Requires re-login after SQL update.

### Chat Session Persistence
Sessions saved to `agent_sessions` after each agent run (Supabase upsert on `id`). Loaded on mount filtered by `user_id + agent_id`. `SessionRecord` from `lib/mock-sessions.ts` maps to Supabase row shape. `ChatMessage.metadata` carries structured data: `type`, `pillars`, `caseFile`, `prospects`, `thinkingSteps`, `chips`, `ticker`, `url`.

### Chat UI Components
- **`components/agents/ChatThread.tsx`** — Dispatches on `msg.metadata?.type`: renders `PillarCards`, `CaseFileCard`, or `ResultsTable`. Fallback: renders `msg.content` as text.
- **`components/agents/PillarCards.tsx`** — Accepts `pillars?: Pillar[]`. Falls back to deterministic hash-based mock pillars when prop absent.
- **`components/agents/CaseFileCard.tsx`** — Accepts `caseFile?: CaseFileData`. Falls back to hardcoded when absent.
- **`components/agents/AgentChatbar.tsx`** — Accepts `isLocked` prop. When locked: disables textarea, shows lock icon button, placeholder = "Upgrade to continue...".
- **`components/agents/PaywallSheet.tsx`** — Slide-up bottom sheet. `onLockClick` in AgentChatbar triggers it. CTA button currently logs to console (Stripe integration pending — see PLAN_v7.md).

### Other API Routes
- `POST /api/submit-lead` — Validates `problem` + `userEmail`, inserts to `leads` via `supabaseAdmin`.
- `PATCH /api/update-lead` — Updates `leads` status/ankit_note via `supabaseAdmin`.
- `GET /api/leads` — Returns all leads ordered by `created_at desc` for admin dashboard.
- `POST /api/stripe/webhook` — Stripe webhook handler (in progress, see PLAN_v7.md).

### Admin Dashboard
`/admin` — gated by `user?.user_metadata?.is_admin`. Fetches leads from `GET /api/leads`. No password prompt (old `admin123` check removed).

## Design System

Tailwind v4 — theme defined in `app/globals.css` via `@theme inline`, **not** `tailwind.config.js`.

Key tokens: `bg-background` (#0A0A0A), `bg-background-card` (#1E1E1E), `text-foreground`, `text-foreground-secondary`, `text-foreground-muted`, `text-accent` (#E8D5B8), `border-border` (#27272A), `text-error`, `text-success`. Use semantic classes, not raw hex.

## Known Quirks

- **Next.js 16 middleware filename:** Must be `proxy.ts` with `export async function proxy()`. Using `middleware.ts`/`middleware()` triggers a deprecation build warning.
- **Next.js 16 dynamic params:** In server components, `params` is a Promise. In client components, use `useParams()` hook.
- **`useSearchParams()` in client components:** Must be wrapped in `<Suspense>` or build fails during static generation.
- **Lucide React v1:** Brand icons (`Github`, `Linkedin`, `Twitter`) removed — use inline SVGs for social icons.
- **`useMockAuth` name:** Legacy name kept for backward compatibility. It's a real Supabase auth hook.
- **`lib/mock-data.ts`:** Only re-exports `User` type from Supabase and exports `mockUser = null`. Not a real mock anymore.
- **ESLint is slow** (~30s+) on OneDrive paths. Don't use as a per-edit hook.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY      # API routes only (never client)
ANTHROPIC_API_KEY              # claude-sonnet-4-6 in stream routes
NEXT_PUBLIC_APP_URL            # Used in OAuth redirect
STRIPE_SECRET_KEY              # Pending — see PLAN_v7.md
STRIPE_WEBHOOK_SECRET          # Pending — see PLAN_v7.md
NEXT_PUBLIC_STRIPE_PAYMENT_LINK # Pending — see PLAN_v7.md
```

## Pending Work

See **PLAN_v7.md** for the next planned changes:
- Stripe webhook + PaywallSheet real payment link
- Session auto-restore on page load (last session loads into thread)
- Post-payment `?unlocked=1` toast + usage refresh
