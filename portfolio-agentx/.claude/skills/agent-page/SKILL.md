---
name: agent-page
description: Reference knowledge for building or modifying agent pages. Use when working on /agents routes, agent components, or anything touching WARRen/Sherlock/Harvey UI.
---

## Source of Truth

Read `@persona.md` before making any changes to agent UI or copy. It contains exact voice, naming rules, and UI copy for each agent.

## Agent Data

All agent metadata lives in `lib/agents.ts`. Import `agents` array or `getAgentBySlug(slug)`.

Each agent has: name, fullName, slug, color, price, freeLimit, personality, signature, tagline, cta, loadingMessages, emptyState, errorMessage, successMessage, freemiumCta.

## Component Structure

```
components/agents/
  agent-card.tsx        — Persona card for landing page (colored top border, hover glow)
  agent-hero.tsx        — Full-width hero with agent color gradient
  warren-demo.tsx       — WARRen mock demo (ticker input + streaming analysis)
  sherlock-demo.tsx     — Sherlock mock demo (URL input + streaming brief)
  harvey-demo.tsx       — Harvey full demo orchestrator
  harvey-csv-upload.tsx — CSV drag-drop + paste (exports Prospect type)
  harvey-stream.tsx     — Streaming simulation (exports HarveyResult type)
  harvey-results.tsx    — Results table + copy + CSV download
```

## Color Rules

- WARRen UI elements → `#f0b429` (gold) via inline style
- Sherlock UI elements → `#4a9eff` (blue) via inline style
- Harvey UI elements → `#00c896` (green) via inline style
- Platform shared UI → `text-accent` (#E8D5B8 from theme)

Never mix agent colors. Each agent page uses ONLY its own accent color.

## Naming Rules (enforce always)

- CORRECT: WARRen, Sherlock, Harvey, AGentX
- WRONG: warren analysis, sherlock tool, harvey bot, AI tool, AI feature

## Routes

- `/agents` — Landing page (3 persona cards)
- `/agents/warren` — WARRen page (scaffold + mock demo)
- `/agents/sherlock` — Sherlock page (scaffold + mock demo)
- `/agents/harvey` — Harvey page (full interactive demo)
- `/tools/reports` — Report Bot (utility tool, NOT an agent)
- `/tools/chatbot` — AI Chatbot Builder (utility tool, NOT an agent)

## Adding a New Agent

1. Add entry to `lib/agents.ts` (follow Agent interface)
2. Add personality + voice + UI copy to `persona.md`
3. Create `components/agents/{slug}-demo.tsx`
4. Add slug to `generateStaticParams()` in `app/agents/[name]/page.tsx`
5. Add conditional render in the dynamic route page
6. Run `/verify`
