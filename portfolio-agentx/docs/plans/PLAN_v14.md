# PLAN_v14 — Premium Dark AI-Consultancy Aesthetic Rebrand

## Vision

Transform AGentX from colorful SaaS to premium dark AI-consultancy. Reference: Vercel + Linear + Anthropic design language. Near-black background, pure white type, muted gray secondary, soft violet accents, glassmorphism surfaces, elegant gradients, generous whitespace, smooth micro-interactions.

**Design principles:**
- Restraint over decoration
- Violet as the singular accent — no competing hues
- Glassmorphism on surfaces, not gimmick
- Animation that communicates brand identity (the logo), not spectacle

---

## Decisions Made

| Decision | Choice |
|----------|--------|
| Agent colors | Muted violet spectrum — Warren light violet, Sherlock mid violet, Harvey deep indigo |
| Logo animation | Orbital — 3 nodes orbit the hexagon center, fading trails, ~60s period |
| Scope | Theme tokens + targeted component polish (glassmorphism + animation swap) |
| Hero animation | Large animated AGentX logo centered, replaces BlackholeCanvas |
| Star field | Subtle CSS/canvas dot field behind the logo animation (not WebGL) |
| BlackholeCanvas | Replaced — kept on disk but unused |

---

## Color System Changes

### Theme Tokens (`app/globals.css`)

| Token | Current | New |
|-------|---------|-----|
| `--color-background` | `#0a0a0a` | `#050505` |
| `--color-background-secondary` | `#141414` | `#080808` |
| `--color-background-card` | `#1e1e1e` | `#0d0d12` |
| `--color-foreground` | `#fafafa` | `#ffffff` |
| `--color-foreground-secondary` | `#a1a1aa` | `#8887a0` |
| `--color-foreground-muted` | `#71717a` | `#55546e` |
| `--color-accent` | `#e8d5b8` (warm cream) | `#b6a3ff` (soft violet) |
| `--color-accent-hover` | `#f0e6d2` | `#c4b5fd` |
| `--color-accent-muted` | `rgba(232,213,184,0.1)` | `rgba(182,163,255,0.08)` |
| `--color-border` | `#27272a` | `#1c1c2e` |
| `--color-border-hover` | `#3f3f46` | `#2d2d45` |

Add new tokens:
```css
--color-accent-strong: #8b5cf6;       /* for interactive states */
--color-glass-bg: rgba(13,13,18,0.6); /* glassmorphism surface */
--color-glass-border: rgba(182,163,255,0.08); /* glass border */
```

Add glassmorphism utility class:
```css
.glass {
  background: var(--color-glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-glass-border);
}
```

### Agent Colors (`lib/agents.ts`)

| Agent | Current | New | Rationale |
|-------|---------|-----|-----------|
| Warren | `#f0b429` (bright gold) | `#c4b5fd` (light violet) | Clarity, calm precision |
| Sherlock | `#4a9eff` (bright blue) | `#8b5cf6` (mid violet) | Sharp, analytical |
| Harvey | `#00c896` (neon green) | `#6366f1` (deep indigo) | Bold, confident |

These cascade automatically to all components using `agent.color` — no individual component changes needed.

---

## Workstream 1 — Theme Tokens

**File:** `app/globals.css`

- Update all `@theme inline` tokens per table above
- Add `--color-accent-strong`, `--color-glass-bg`, `--color-glass-border`
- Add `.glass` utility class
- Update `aurora-1/2/3` keyframe colors to violet (was agent colors gold/blue/green):
  - Blob 1: `rgba(182,163,255,0.14)` (light violet)
  - Blob 2: `rgba(139,92,246,0.10)` (mid violet)
  - Blob 3: `rgba(99,102,241,0.08)` (deep indigo)
- Update typography defaults: add `letter-spacing: -0.02em` to heading sizes, `line-height: 1.1` for large headings

---

## Workstream 2 — Agent Colors

**File:** `lib/agents.ts`

Update `color` field on all 3 agents per table above. Also update `AGENT_ICONS` — no icon change needed (TrendingUp/Search/Mail stay the same). The `$19/month`, `$49/month`, `$29/month` prices stay.

---

## Workstream 3 — Animated Logo Component

**File:** `components/shared/agentx-logo-animated.tsx` (CREATE NEW)

Canvas-based animation. Two layers:

### Layer 1 — Star field (subtle background)
- ~80 small dots, random positions, random sizes (0.5–2px)
- Gentle twinkling: each star has an independent opacity oscillation
- Colors: mostly white, some violet-tinted (`rgba(182,163,255,x)`)
- Static positions (not drifting)

### Layer 2 — Orbiting logo nodes
- Hexagon outline drawn in `rgba(182,163,255,0.25)`, 1px stroke
- 3 nodes orbiting the hexagon center at equal radii (~40% of canvas size)
- Starting at 270°, 30°, 150° (top, bottom-right, bottom-left — matches logo geometry)
- Orbital period: 60s (very slow, elegant)
- Each node leaves a fading trail: circular buffer of last 40 positions, opacity `1 → 0`
- Node colors: Warren `#c4b5fd`, Sherlock `#8b5cf6`, Harvey `#6366f1`
- Node dot size: 4px filled circle + `shadowBlur 12` glow in node color
- Connecting lines between all 3 nodes (triangle inside hexagon), drawn at opacity ~0.15

**Props:**
```ts
interface AgentXLogoAnimatedProps {
  size?: number;      // canvas px, default 500
  className?: string;
}
```

Always renders `absolute inset-0 w-full h-full pointer-events-none aria-hidden`.

---

## Workstream 4 — Animation Placement Swap

Replace `BlackholeCanvas` with `AgentXLogoAnimated` in 3 files:

| File | Current | New |
|------|---------|-----|
| `components/home/hero.tsx` | `<BlackholeCanvas />` | `<AgentXLogoAnimated />` |
| `app/login/page.tsx` | `<BlackholeCanvas />` | `<AgentXLogoAnimated size={400} />` |
| `app/agents/page.tsx` | `<BlackholeCanvas />` | `<AgentXLogoAnimated size={450} />` |

Parents already have `relative overflow-hidden` — no layout changes needed.

---

## Workstream 5 — Glassmorphism Cards

**File:** `components/ui/card.tsx`

Current card: solid `bg-background-card` with `border-border`.

New card: glassmorphism surface.

```tsx
// Card base className change:
// Before:
"rounded-xl border border-border bg-background-card ..."
// After:
"rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] backdrop-blur-md ..."
```

Also:
- Reduce border-radius on cards: `rounded-xl` → `rounded-lg` (sharper, more premium)
- Card hover: subtle `border-[rgba(182,163,255,0.15)]` lift

---

## Workstream 6 — CosmicBackground Color Update

**File:** `components/shared/cosmic-background.tsx`

Currently not used (BlackholeCanvas replaced it) but update aurora blob colors to violet so it's ready if used again:
- Blob 1: `rgba(240,180,41,0.18)` → `rgba(196,181,253,0.14)` (light violet)
- Blob 2: `rgba(74,158,255,0.15)` → `rgba(139,92,246,0.10)` (mid violet)
- Blob 3: `rgba(0,200,150,0.10)` → `rgba(99,102,241,0.08)` (deep indigo)
- SVG gradient: update `disk-gradient` stops to violet spectrum
- drop-shadow filter: update from amber to violet

---

## File Ownership (Zero Overlap)

| File | Workstream | Agent |
|------|-----------|-------|
| `app/globals.css` | 1 | theme-dev |
| `lib/agents.ts` | 2 | theme-dev |
| `components/shared/cosmic-background.tsx` | 6 | theme-dev |
| `components/shared/agentx-logo-animated.tsx` | 3 | animation-dev |
| `components/home/hero.tsx` | 4 | animation-dev |
| `app/login/page.tsx` | 4 | animation-dev |
| `app/agents/page.tsx` | 4 | animation-dev |
| `components/ui/card.tsx` | 5 | animation-dev |

**2 agents — theme-dev and animation-dev — zero file overlap, run in parallel.**

---

## Non-Goals (Out of Scope)

- Individual page layout restructuring (spacing, sections) — separate plan
- Navbar redesign
- Button component redesign
- Agent chat UI (stream, results cards) — separate plan
- Any backend / subscription / payment changes
- Amount revert (₹1 → ₹999) — still pending separately

---

## Status

### theme-dev
- [ ] Update `app/globals.css` — tokens, glass utility, aurora keyframe colors, typography
- [ ] Update `lib/agents.ts` — violet spectrum agent colors
- [ ] Update `components/shared/cosmic-background.tsx` — violet aurora + ring gradient

### animation-dev
- [ ] Create `components/shared/agentx-logo-animated.tsx` — canvas star field + orbiting nodes
- [ ] Swap `components/home/hero.tsx` — BlackholeCanvas → AgentXLogoAnimated
- [ ] Swap `app/login/page.tsx` — BlackholeCanvas → AgentXLogoAnimated
- [ ] Swap `app/agents/page.tsx` — BlackholeCanvas → AgentXLogoAnimated
- [ ] Update `components/ui/card.tsx` — glassmorphism surface
