# PLAN_v10 — UI Redesign: Logo + Login + Tools Preview + MCP Page

## Goals

1. Consistent agent icons (Lucide) baked into agent data — not scattered across pages
2. New AGentX geometric SVG logo — replaces Sparkles icon everywhere
3. Login page — split-screen redesign
4. Homepage ToolsPreview — redesigned agent cards with prominent icons
5. New `/mcp` page — platform stack + MCPs Ankit built
6. MCP added to navbar

---

## Decisions Made

| Decision | Choice |
|----------|--------|
| Logo style | Geometric SVG mark (hexagon / node graph) + "AGentX" text |
| Tools redesign scope | Homepage `ToolsPreview` component only |
| MCP page content | Both: what powers AGentX + MCPs Ankit built |
| Login feel | Split screen — left brand panel, right auth form |
| Login left panel copy | Option A: "Your AI squad grows with your ambition." / *Warren. Sherlock. Harvey. More coming.* |
| MCP in navbar | Yes — add "MCPs" link |

---

## Change 1 — Agent Icons in `lib/agents.ts`

Add `icon: LucideIcon` to the `Agent` interface and populate each agent:

| Agent | Icon | Color |
|-------|------|-------|
| Warren | `TrendingUp` | `#f0b429` |
| Sherlock | `Search` | `#4a9eff` |
| Harvey | `Mail` | `#00c896` |

Remove the scattered `AGENT_ICONS` maps from `app/agents/page.tsx` and any other pages — use `agent.icon` directly.

---

## Change 2 — AGentX Logo Component

**File:** `components/shared/agentx-logo.tsx`

Custom SVG geometric mark:
- Hexagon outline with 3 node dots at corners (representing 3 agents)
- Connected by thin circuit-style lines
- "AGentX" text to the right, "X" in accent color (`text-accent`)
- Props: `size?: "sm" | "md" | "lg"` (sm = navbar, md = footer, lg = login)

Replace `Sparkles` + text in:
- `components/layout/navbar.tsx`
- `components/layout/footer.tsx`
- `app/login/page.tsx`

---

## Change 3 — Login Page Split-Screen

**File:** `app/login/page.tsx`

### Left Panel (hidden on mobile, `md:flex`)
- Full height, `bg-background-card`, subtle `AnimatedGrid` behind
- AGentX logo (large) at top
- Headline: **"Your AI squad grows with your ambition."**
- Subtext: *Warren. Sherlock. Harvey. More coming.*
- Three agent orbs: colored circles with agent icon + name, stacked vertically with a thin line connecting them (like a squad roster)
- Bottom: small stat — e.g. "3 agents live · Custom workflows on the way"

### Right Panel
- Centered vertically, clean white-space
- AGentX logo (small) at top (mobile only — hidden on desktop since left panel shows it)
- Headline: "Sign in to AGentX"
- Subtext: "Access Warren, Sherlock, and Harvey"
- Google OAuth button (existing)
- Terms text

---

## Change 4 — Homepage ToolsPreview Redesign

**File:** `components/home/tools-preview.tsx`

### Agent Cards — New Layout
Instead of a basic Card with just text:
- Large icon circle (60x60px) with agent color background at the top of each card
- Agent name in agent color, bold
- One-line "what it does" (personality)
- Subtle "Free: 1 run" badge at bottom
- Hover: card lifts, glow in agent color
- Full-width CTA row below the 3 cards: "Explore all agents →"

### Utility Tools — Keep but tighten
- Smaller section below agents
- Two cards side by side, cleaner

---

## Change 5 — MCP Page

**File:** `app/mcp/page.tsx`

### Section 1: "What Powers AGentX"
Grid of tech cards (4 per row on desktop):

| Tech | Role | Color |
|------|------|-------|
| Claude API (claude-sonnet-4-6) | Core AI reasoning | `#D97706` |
| Jina Reader | Web content extraction | `#6366F1` |
| Strands | Agent orchestration framework | `#10B981` |
| Supabase | Auth, database, RLS | `#3ECF8E` |
| Razorpay | Payments & subscriptions | `#3395FF` |
| Vercel | Deployment & edge functions | `#FFFFFF` |
| Nodemailer + Gmail | Transactional email | `#EA4335` |
| Next.js 16 | App framework | `#FFFFFF` |

Each card: icon (or letter mark), name, role description, subtle color glow.

### Section 2: "MCPs Ankit Built"
Positioned as products / portfolio:

| MCP | Description | Status |
|-----|-------------|--------|
| Developer MCP Suite | MCP servers for code review, PR automation, and dev workflow | Live |
| (Coming Soon #1) | Placeholder for next custom MCP | Coming Soon |
| (Coming Soon #2) | Placeholder | Coming Soon |

Cards with: name, description, status badge, "Private" label (no links, like the projects page).

### Hero
- Title: "The Stack Behind AGentX"
- Subtitle: "Every tool is production-grade. No demos, no toy integrations."

---

## Change 6 — Navbar Update

**File:** `lib/constants.ts` — `navLinks`

Add `{ label: "MCPs", href: "/mcp" }` between Projects and Tools:

```ts
export const navLinks = [
  { label: "Agents", href: "/agents" },
  { label: "Projects", href: "/projects" },
  { label: "MCPs", href: "/mcp" },
  { label: "Tools", href: "/tools" },
  { label: "Work With Me", href: "/hire" },
];
```

---

## File Ownership (Zero Overlap)

| File | Change |
|------|--------|
| `lib/agents.ts` | Add `icon: LucideIcon` to Agent type + data |
| `components/shared/agentx-logo.tsx` | New logo component |
| `components/layout/navbar.tsx` | Use AgentXLogo, remove Sparkles |
| `components/layout/footer.tsx` | Use AgentXLogo, remove Sparkles |
| `app/login/page.tsx` | Full split-screen redesign |
| `components/home/tools-preview.tsx` | Agent card redesign |
| `app/mcp/page.tsx` | New page (create) |
| `lib/constants.ts` | Add MCPs to navLinks |

---

## Non-Goals (Out of Scope for This Plan)

- `/agents` page card redesign (already uses agent colors well)
- `/tools` page (utility tools page)
- Any backend changes
- Payment or subscription changes
- Amount revert (₹1 → ₹999) — separate task

---

## Status

- [ ] Change 1: Agent icons in lib/agents.ts
- [ ] Change 2: AGentX logo component
- [ ] Change 3: Login page split-screen
- [ ] Change 4: ToolsPreview redesign
- [ ] Change 5: MCP page
- [ ] Change 6: Navbar navLinks update
