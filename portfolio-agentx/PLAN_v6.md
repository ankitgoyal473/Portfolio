# PLAN_v6 — Supabase Integration (Database + Auth)

## Goal
Replace all localStorage mocks with Supabase (Postgres + Auth). Move leads, agent sessions, paywall usage, and auth to a real persistent backend.

## Why Supabase
- Postgres — structured, queryable leads data
- Auth built-in — Google OAuth + email login, replaces `mock-auth.ts` entirely
- Row Level Security — users only see their own sessions/usage
- Free tier — 500MB DB, 50k MAU, sufficient for portfolio indefinitely
- Native Next.js App Router support via `@supabase/ssr`
- Already planned in CLAUDE.md as the target replacement

---

## What Gets Replaced

| Current mock | Replaced by |
|---|---|
| `lib/mock-auth.ts` | Supabase Auth (Google OAuth) |
| `lib/mock-leads.ts` | `leads` table |
| `lib/mock-sessions.ts` | `agent_sessions` table |
| `lib/paywall.ts` (localStorage) | `agent_usage` table |
| `lib/mock-data.ts` | Supabase `User` type |
| Admin password cookie (`admin123`) | Supabase RLS + admin role check |

---

## Database Schema

```sql
-- Lead submissions from discovery chat
create table leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  problem text,
  workflow text,
  budget text,
  timeline text,
  complexity text,
  delivery text,
  stack text,
  estimate_low int,
  estimate_high int,
  user_email text,
  notes text,
  status text default 'pending'  -- pending | accepted | declined
);

-- Agent chat history per user
create table agent_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  agent_id text not null,  -- 'warren' | 'sherlock' | 'harvey'
  created_at timestamptz default now(),
  title text,
  messages jsonb
);

-- Paywall usage counts per user per agent
create table agent_usage (
  user_id uuid references auth.users on delete cascade,
  agent_id text not null,
  count int default 0,
  primary key (user_id, agent_id)
);
```

### RLS Policies
- `leads` — service role only (no direct client access; written via API route)
- `agent_sessions` — users can only read/write their own rows
- `agent_usage` — users can only read/write their own rows

---

## Environment Variables

Add to `.env.local` and Vercel dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # for server-side lead writes and admin reads
```

---

## Implementation Steps (in order)

### Step 1 — Supabase project setup (manual, ~15 min)
- Create project at supabase.com
- Run the SQL schema above in the SQL editor
- Enable Google OAuth in Auth → Providers
- Copy URL + anon key + service role key into `.env.local`

### Step 2 — Install packages
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Step 3 — Supabase client setup
- `lib/supabase/client.ts` — browser client (anon key)
- `lib/supabase/server.ts` — server client (cookie-based, for App Router)
- `lib/supabase/admin.ts` — service role client (for API routes)
- `middleware.ts` — refresh auth session on every request

### Step 4 — Auth (replace mock-auth)
- Replace `lib/mock-auth.ts` + `lib/mock-data.ts` with Supabase Auth hooks
- Update `app/login/page.tsx` to use `signInWithOAuth({ provider: 'google' })`
- Add `/auth/callback/route.ts` for OAuth redirect handling
- Update `components/auth/client-auth-guard.tsx` to use real session

### Step 5 — Leads (highest priority)
- Update `app/api/submit-lead/route.ts` to insert into `leads` table via service role client
- Update `app/api/update-lead/route.ts` to update lead status in DB
- Update `app/admin/page.tsx` to read leads from DB (server component fetch)

### Step 6 — Agent sessions
- Replace localStorage reads/writes in `components/agents/AgentSidebar.tsx`
- Read sessions from `agent_sessions` table on mount
- Write new session on first message, update on subsequent messages

### Step 7 — Paywall usage
- Replace localStorage counter in `lib/paywall.ts` with DB upsert
- Enforce server-side in `app/api/tools/warren/route.ts` (and future agent routes)
- Client still reads usage for UI state, but server is authoritative

### Step 8 — Admin hardening
- Remove `admin123` cookie check
- Replace with Supabase admin role: set `is_admin = true` in `auth.users` metadata
- Admin page becomes a server component that checks session role

---

## Effort Estimate

| Step | Time |
|---|---|
| Supabase setup + schema | 15 min |
| Package install + client files | 15 min |
| Auth (replace mock-auth) | 45 min |
| Leads | 30 min |
| Sessions | 30 min |
| Paywall | 30 min |
| Admin hardening | 20 min |
| **Total** | **~3 hours** |

---

## Deployment Order
1. Complete Step 1 (Supabase project) and add env vars to Vercel
2. Implement Steps 2–8 locally
3. Test end-to-end locally with real Supabase dev project
4. Push to `main` → Vercel auto-deploys
