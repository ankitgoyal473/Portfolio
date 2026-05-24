# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AGentX — persona-driven AI SaaS platform + portfolio + discovery chat lead-gen system. Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Framer Motion. Dark theme with warm tan accent (#E8D5B8).

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (Turbopack)
npm run lint         # ESLint with Next.js config
npx tsc --noEmit    # Type check without emitting
```

## Verification (before marking work done)

Run all three in sequence:
```bash
npx tsc --noEmit && npm run lint && npm run build
```
For UI changes: also start `npm run dev` and visually verify in browser.

## Architecture

- `app/` — App Router pages and API routes (no `src/` directory)
- `app/agents/` — Agent landing + `[name]` dynamic route (WARRen, Sherlock, Harvey)
- `components/ui/` — Shadcn-style primitives (Button, Card, Badge) using CVA
- `components/shared/` — Reusable components (AnimatedGrid, Typewriter, SectionHeader)
- `components/agents/` — Chat UX components (AgentSidebar, ChatThread, AgentChatbar, ThinkingBubble, PaywallSheet, PillarCards, CaseFileCard, ResultsTable)
- `components/layout/` — Navbar, Footer
- `components/chat/` — Discovery chat widget (floating, 5-stage lead qualification flow)
- `components/admin/` — Admin dashboard components (lead cards, stats)
- `lib/agents.ts` — Agent data (names, colors, personalities, pricing, UI copy)
- `lib/constants.ts` — Utility tools, projects, services, pricing, stats, navLinks
- `lib/estimate.ts` — Budget/problem → estimate mapping logic + stage definitions
- `lib/mock-leads.ts` — Lead storage (localStorage mock, replace with Supabase later)
- `lib/mock-auth.ts` — Mock auth context (replace with NextAuth later)
- `lib/mock-sessions.ts` — Chat session persistence (localStorage, max 20 per agent)
- `lib/paywall.ts` — 4-stage paywall logic (fresh → aware → warning → locked) with per-agent limits
- `persona.md` — Source of truth for agent voice, naming, and UI copy rules
- Path alias: `@/*` maps to project root

## Agents (Persona System)

Three AI agents with distinct names, personalities, and colors. Never call them "tools", "bots", or "features" — use their names.

- **WARRen** (`#f0b429` gold) — Buffett-style stock analyst → `/agents/warren`
- **Sherlock** (`#4a9eff` blue) — Competitor intelligence detective → `/agents/sherlock`
- **Harvey** (`#00c896` green) — Cold email personalization, fully interactive demo → `/agents/harvey`

Rules: `@persona.md` is the canonical reference for voice, copy, and naming. Each agent's UI uses ONLY its own color and personality. Platform shared UI uses tan (#E8D5B8).

Correct: WARRen, Sherlock, Harvey, AGentX. Wrong: warren analysis, sherlock tool, harvey bot.

## Key Features

- **Agent chat UX**: `/agents/[name]` — Claude-style chat interface with sidebar, threaded messages, thinking animations, structured output (PillarCards/CaseFileCard/ResultsTable), and paywall gating
- **Paywall system**: 4 stages (fresh → aware → warning → locked). Usage stored in localStorage key `agentx_usage_{agentId}`. Limits: WARRen=1, Sherlock=1, Harvey=10. PaywallSheet auto-opens on lock.
- **Session history**: Sidebar shows past sessions (localStorage key `agentx_sessions_{agentId}`). Click to replay. Max 20 per agent FIFO.
- **Portfolio pages**: Home, Projects (filterable), Tools (2 utility tools with mock streaming demos), Hire (dual-audience)
- **Discovery Chat**: Floating widget on all pages → 5-stage Q&A → auto-estimate → submit lead
- **Admin Dashboard**: `/admin?pw=admin123` — view/accept/decline leads
- **Mock integrations**: localStorage for leads/sessions/usage, console.log for emails, placeholder Calendly

## Design System (Tailwind v4)

Theme is defined in `app/globals.css` via `@theme inline` — NOT a tailwind.config file.

Key tokens: `bg-background` (#0A0A0A), `bg-background-card` (#1E1E1E), `text-accent` (#E8D5B8), `border-border` (#27272A). Use these semantic classes, not raw hex values.

## Known Quirks

- **Lucide React v1**: Brand icons (`Github`, `Linkedin`, `Twitter`) are removed. Use inline SVGs for social icons.
- **Next.js 16 dynamic routes**: Server components: `params` is a Promise. Client components (like agent pages): use `useParams()` hook instead.
- **Next.js 16 useSearchParams**: Must be wrapped in `<Suspense>` boundary or build fails during static generation.
- **Google Fonts blocked**: Corporate network blocks font fetches at build time. Layout uses system font stack fallback — fonts work on Vercel deploy.
- **No remote configured**: `git remote` is empty. Push to GitHub before Vercel deployment.
- **Mock integrations**: Auth, Stripe, Claude API, Supabase, and Resend are all scaffolded but mocked. Real keys go in `.env.local` (see `.env.local.example`).
- **ESLint is slow**: ~30s+ on OneDrive paths. Don't use as a per-edit hook. Run via `/verify` instead.

## Code Style

- TypeScript strict mode enabled
- Tailwind v4 with `@tailwindcss/postcss` (not the old JS config)
- Components use `cn()` from `@/lib/utils` for class merging
- "use client" only when component needs browser APIs (useState, useEffect, etc.)
- ESLint flat config (eslint.config.mjs) with `core-web-vitals` + `typescript`
