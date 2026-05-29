# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AGentX — persona-driven AI SaaS platform + portfolio. Three AI agents (Warren, Sherlock, Harvey) backed by real Claude API (`claude-sonnet-4-6`) with Supabase auth, DB, server-side paywall, Razorpay payments, and 30-day subscription lifecycle.

**Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Framer Motion, Supabase SSR, Anthropic SDK, Razorpay, Nodemailer.

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
- **`proxy.ts`** (project root) — Next.js 16 middleware. Must be `proxy.ts` + `export async function proxy()` — NOT `middleware.ts`. Refreshes Supabase session; redirects unauthenticated users from `/agents/*`, `/admin/*`, `/dashboard/*`, `/api/agents/*`.
- **`lib/mock-auth.ts`** — `useMockAuth()` hook (legacy name, real Supabase). Returns `user: User | null`, `login()` (Google OAuth), `logout()`. Use `user.user_metadata?.full_name` / `user.user_metadata?.avatar_url` — not `user.name`.
- **`lib/supabase/client.ts`** — `createBrowserSupabaseClient()` for client components.
- **`lib/supabase/server.ts`** — `createServerSupabaseClient()` (async, uses `cookies()`) for server components and API routes.
- **`lib/supabase/admin.ts`** — `supabaseAdmin` service-role client — bypasses RLS, never use client-side.

### User Roles (stored in `auth.users.raw_user_meta_data`)

| Flag | Purpose | How to set |
|------|---------|-----------|
| `is_admin: true` | Access `/admin` dashboard | SQL or already set on ankitgoyal473@gmail.com |
| `is_premium: true` | Fast-check flag for subscription | Set by verify route on payment; cleared when subscription expires |

Both flags require re-login (JWT refresh). `is_premium` is a cache — the stream routes always verify against the `subscriptions` table.

### Agent System

| Agent | Color | Icon | Route | Free limit |
|-------|-------|------|-------|-----------|
| **WARRen** | `#f0b429` | TrendingUp | `/agents/warren` | 1 run |
| **Sherlock** | `#4a9eff` | Search | `/agents/sherlock` | 1 run |
| **Harvey** | `#00c896` | Mail | `/agents/harvey` | 10 runs |

- **`lib/agents.ts`** — Agent data (colors, personalities, UI config) + `AGENT_ICONS` map.
- **`lib/agent-types.ts`** — Shared structured output types: `Pillar`, `CaseFileData`, `CaseFileSection`, `Prospect`.
- **`persona.md`** — Canonical voice/copy rules. Read before editing agent messages.
- Never call them "tools", "bots", or "features" — use their names.

#### Critical: Agent icons are NOT on the Agent type

`agent.icon` does **not** exist. Icons are a separate export:

```ts
// lib/agents.ts
export const AGENT_ICONS: Record<string, LucideIcon> = {
  warren: TrendingUp,
  sherlock: Search,
  harvey: Mail,
};
```

**Why:** The `Agent` interface is passed as props from Server Components to Client Components. React serializes these props — LucideIcon (a function) cannot be serialized. Always import `AGENT_ICONS` directly in client components and look up by `agent.slug`.

### Agent Stream Routes — Full Logic

`POST /api/agents/{agent}/stream` — runs in this order:

```
1. Auth check → 401 if no user
2. isPremium = user.user_metadata?.is_premium
3. If isPremium:
     Query subscriptions table for active row (status=active, expires_at > now)
     If found → subscriptionActive = true
               → check 7-day reminder (send once, mark reminder_sent_at)
     If not found → clear is_premium via supabaseAdmin → fall through to paywall
4. If !subscriptionActive:
     Query agent_usage for count
     If count >= LIMITS[agent] → 403 paywall
     Else → increment usage
5. Call Claude API → stream SSE events
```

**Key invariant:** `is_premium` in user_metadata is a cache hint, not authoritative. The `subscriptions` table is authoritative.

### Paywall System
**`lib/paywall.ts`** — Async Supabase-backed.
- `getUsage(agentId, userId)` → `UsageState { used, limit, stage }`
- `isLocked(stage)` — returns `true` for `"warning"` OR `"locked"` (both block the chatbar)
- **Common bug:** treating `"warning"` as unlocked — don't. The server blocks at `count >= limit`.
- Stages: `fresh` → `aware` → `warning` → `locked`

### Subscription System

**`subscriptions` table:**
```
id, user_id, status (active|expired|cancelled),
started_at, expires_at, reminder_sent_at,
razorpay_payment_id, razorpay_order_id,
amount (100 paise currently = ₹1 test; normally 99900 = ₹999), currency (INR)
```
RLS: users read own rows, service role has full access.

**Lifecycle:**
1. User pays → `POST /api/razorpay/verify` → inserts subscription (expires_at = now + 30 days) + sets `is_premium: true` + resets `agent_usage`
2. Each stream request: checks subscription table → if expired, clears `is_premium`
3. 7 days before expiry: lazy reminder email sent once (tracked via `reminder_sent_at`)
4. After expiry: user hits paywall again on next agent run

**⚠️ Current test state:** Amount is set to ₹1 (100 paise) in `app/api/razorpay/create-order/route.ts`. Change back to `99900` before going live.

### Payment — Razorpay
Embedded checkout modal (no redirect). Flow:
1. `POST /api/razorpay/create-order` → creates order, returns `{ orderId, amount, currency, keyId }`
2. Frontend loads `checkout.razorpay.com/v1/checkout.js` dynamically, opens modal
3. User pays → handler fires with `{ razorpay_payment_id, razorpay_order_id, razorpay_signature }`
4. `POST /api/razorpay/verify` → HMAC-SHA256 verification → inserts subscription → sends emails → resets usage

**Test mode UPI:** Use VPA `success@razorpay` (typed, not QR scan). Test card: `4111 1111 1111 1111`, OTP `1234`.

### Email System
**`lib/email.ts`** — Nodemailer + Gmail SMTP. Graceful no-op if `GMAIL_USER`/`GMAIL_APP_PASSWORD` not set.

Exports:
- `sendEmail({ to, subject, html })` — core sender
- `buyerConfirmationEmail(opts)` — sent to buyer on payment
- `adminNotificationEmail(opts)` — sent to `GMAIL_USER` on new payment
- `expiryReminderEmail(opts)` — sent 7 days before expiry (once per subscription)

All email sends are fire-and-forget — never throw, just log errors.

### Session Persistence
- Auto-restores most recent session on page mount (loads from `agent_sessions`, skips `startNewSession()` if sessions exist)
- `?unlocked=1` on URL → shows unlock message, refreshes usage, clears URL
- Sessions continue (new runs append to same session ID via `sessionRef`)

### Supabase DB Schema
```
leads           — id, created_at, problem, workflow, budget, timeline, complexity,
                  delivery, stack, estimate_low, estimate_high, user_email, notes,
                  status (default 'pending'), ankit_note
agent_sessions  — id, user_id, agent_id, created_at, title, messages (jsonb)
agent_usage     — user_id, agent_id, count (pk: user_id+agent_id)
subscriptions   — id, user_id, status, started_at, expires_at, reminder_sent_at,
                  razorpay_payment_id, razorpay_order_id, amount, currency
```
RLS: `leads` = service role only. `agent_sessions`, `agent_usage`, `subscriptions` = users own rows.

### API Routes Reference

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/agents/{agent}/stream` | POST | Required | SSE streaming with subscription check |
| `/api/razorpay/create-order` | POST | Required | Create Razorpay order |
| `/api/razorpay/verify` | POST | Required | Verify payment + insert subscription + send emails |
| `/api/submit-lead` | POST | None | Insert lead (validates problem + userEmail) |
| `/api/update-lead` | PATCH | None | Update lead status/note |
| `/api/leads` | GET | None | All leads for admin dashboard |
| `/api/admin/users` | GET | Admin | List all auth users with premium/admin flags |
| `/api/admin/set-premium` | POST | Admin | Toggle `is_premium` on a user |
| `/api/admin/subscriptions` | GET | Admin | All subscriptions enriched with user email/name |

### Admin Dashboard
- `/admin` — gated by `is_admin === true`. Sections: Leads, Stats, Users (premium toggle), Subscribers (subscription history).
- Entry: `/dashboard` shows "Admin Panel" card when `is_admin === true`.
- `supabaseAdmin.auth.admin.listUsers()` used for user management.
- `supabaseAdmin.auth.admin.updateUserById()` used to toggle `is_premium`.

### Pro UI
- **Dashboard:** Subscription card (expiry date, days remaining, Renew button if ≤7 days). `AgentUsageCard` shows `limit: 999` for Pro users (displays "Unlimited").
- **WelcomeHeader:** "✦ Pro" gold badge when `plan === "pro"`.
- **Agent page:** Amber warning banner above chatbar when subscription ≤7 days left.

---

## Shared Components

### AgentXLogo (`components/shared/agentx-logo.tsx`)
Custom SVG geometric mark — hexagon + triangle of 3 node dots (representing the 3 agents). Replaces `Sparkles` icon everywhere.

```tsx
<AgentXLogo size="sm" />   // navbar
<AgentXLogo size="md" />   // footer
<AgentXLogo size="lg" />   // login page
<AgentXLogo size="md" showText={false} />  // icon only
```

Used in: `components/layout/navbar.tsx`, `components/layout/footer.tsx`, `app/login/page.tsx`.

### CosmicBackground (`components/shared/cosmic-background.tsx`)
CSS/SVG deep space animation — aurora blobs (3 drifting color orbs) + rotating SVG accretion disk ring. Replaces the deleted `blackhole-ring.tsx` canvas component.

```tsx
// Parent MUST have `relative overflow-hidden`
<CosmicBackground ringSize="lg" />   // 700×265px ring — homepage hero
<CosmicBackground ringSize="md" />   // 500×190px ring — login, agents
<CosmicBackground ringSize="sm" />   // 320×120px ring
```

- Always `absolute inset-0`, `pointer-events-none`, `aria-hidden`
- Aurora colors tie to agents: Warren gold `#f0b429`, Sherlock blue `#4a9eff`, Harvey green `#00c896`
- Ring spins via `ring-spin` CSS keyframe (24s linear). Blobs drift via `aurora-1/2/3` keyframes.
- Keyframes defined in `app/globals.css` — do NOT inline them in the component.
- **Only used on 3 pages:** homepage hero, login left panel, agents hero. No other pages.

---

## Pages

| Route | Type | Notes |
|-------|------|-------|
| `/` | Server | Home: Hero + SocialProof + ToolsPreview + CtaSection |
| `/agents` | Server | 3-column agent card grid + CosmicBackground hero |
| `/agents/[name]` | Client | Full chat interface, session restore, paywall |
| `/tools` | Server | 6-card grid (2 live + 4 coming-soon), no pricing |
| `/tools/[slug]` | Server | Tool detail + demo; coming-soon slugs redirect to /tools |
| `/mcp` | Server | Platform stack (8 tech cards) + MCPs Ankit built |
| `/projects` | Server | 4 real projects, all private, filter by category |
| `/hire` | Server | Dual audience (freelance + full-time), no rate shown |
| `/login` | Client | Split-screen: brand panel (agents, tagline) + auth form |
| `/dashboard` | Client | Usage cards, subscription info, admin entry |
| `/admin` | Client | Leads, Stats, Users (premium toggle), Subscribers |

### Tools Page (`/tools`)
- 2 live tools: Report Bot (`reports`), AI Chatbot Builder (`chatbot`)
- 4 coming-soon tools: Data Insights Bot, Resume Screener AI, Contract Reviewer, Meeting Notes Summariser
- `Tool` type in `lib/constants.ts` has `comingSoon?: boolean` — live cards get colored top border + CTA; coming-soon cards get `opacity-50 grayscale` + "Coming Soon" badge
- No pricing section — removed. Bottom CTA links to `/hire`.
- Tool demos: `reports` → typewriter terminal, `chatbot` → mock chat UI, others → "Demo Coming Soon"

### MCP Page (`/mcp`)
- Section 1: "What Powers AGentX" — 8 tech cards (Claude API, Jina Reader, Strands, Supabase, Razorpay, Vercel, Nodemailer, Next.js 16)
- Section 2: "MCPs Ankit Built" — Developer MCP Suite (Live) + 2 Coming Soon
- CTA links to `/hire`

### Login Page (`/login`)
- Split-screen: left panel (`hidden md:flex`) has CosmicBackground, AgentXLogo (lg), tagline "Your AI squad grows with your ambition.", 3 agent orbs with connecting line, bottom stat
- Right panel: auth form, AgentXLogo (md, mobile-only), Google OAuth button

---

## Navigation

`navLinks` in `lib/constants.ts`:
```ts
[
  { label: "Agents",      href: "/agents" },
  { label: "Projects",    href: "/projects" },
  { label: "MCPs",        href: "/mcp" },
  { label: "Tools",       href: "/tools" },
  { label: "Work With Me", href: "/hire" },
]
```

---

## Design System

Tailwind v4 — theme in `app/globals.css` via `@theme inline`, **not** `tailwind.config.js`.

Key tokens: `bg-background` (#0A0A0A), `bg-background-card` (#1E1E1E), `text-foreground`, `text-foreground-secondary`, `text-foreground-muted`, `text-accent` (#E8D5B8), `border-border` (#27272A), `text-error`, `text-success`. Use semantic classes, not raw hex.

`app/globals.css` also contains animation keyframes at the bottom: `aurora-1`, `aurora-2`, `aurora-3`, `ring-spin`, `ring-spin-reverse`, `ring-pulse`. Used exclusively by `CosmicBackground`.

---

## Known Quirks

- **Next.js 16 middleware:** `proxy.ts` + `export async function proxy()`. `middleware.ts` triggers deprecation warning.
- **Next.js 16 dynamic params:** Server components: `params` is a Promise. Client components: use `useParams()`.
- **`useSearchParams()`:** Wrap in `<Suspense>` or build fails. Use `window.location.search` in `useEffect` to avoid this.
- **Lucide React v1:** `Github`, `Linkedin`, `Twitter` icons removed — use inline SVGs.
- **`useMockAuth` name:** Legacy name. Real Supabase auth.
- **`lib/mock-data.ts`:** Only re-exports Supabase `User` type, exports `mockUser = null`. Not a mock.
- **ESLint slow** (~30s+) on OneDrive paths.
- **Razorpay test QR:** Can't be scanned by real UPI apps. Type VPA manually or use test card.
- **`is_premium` is a cache:** Never rely on it alone in stream routes — always verify against `subscriptions` table.
- **Agent icons NOT on Agent type:** `agent.icon` doesn't exist. Import `AGENT_ICONS` from `lib/agents.ts` and look up by `agent.slug`. Reason: Agent objects are serialized as RSC props — functions can't serialize.
- **CosmicBackground keyframes:** Defined in `app/globals.css`, not inline. Don't move them or the animation breaks silently.
- **`disk-gradient` SVG id:** Used inside CosmicBackground's inline SVG. If you ever render two instances on the same page, the duplicate `id` will cause one to break — make ids unique or use a single instance per page.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # Server only
ANTHROPIC_API_KEY                # claude-sonnet-4-6 in stream routes
NEXT_PUBLIC_APP_URL              # OAuth redirect base URL
RAZORPAY_KEY_ID                  # Server only (returned to client via API response)
RAZORPAY_KEY_SECRET              # Server only, never frontend
GMAIL_USER                       # ankitgoyal473@gmail.com
GMAIL_APP_PASSWORD               # 16-char Gmail App Password (graceful skip if absent)
```

## Portfolio Content
- **Homepage stats:** 20+ AI Tools Shipped, 5,000+ Hours Automated, 3+ Enterprise Teams
- **Bio:** ML Engineer, 5 years, global investment bank (no Barclays mention), AWS/GenAI/Bedrock/MCPs
- **Projects (4, all private):** Enterprise RAG System, Hypothesis Testing Agent, QA Testing Agent, Developer MCP Suite
- **Hire page:** Project-based, dual audience (freelance + full-time), no rate shown
- **Availability:** Open to freelance & full-time
