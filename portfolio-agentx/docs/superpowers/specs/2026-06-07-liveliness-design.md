# AGentX Liveliness — Design Spec

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a complete motion layer to the AGentX storefront — hero background animation, scroll-triggered entrances, animated stat counters, upgraded micro-interactions, and login page entrance animations.

**Architecture:** Framer Motion `whileInView` for all scroll animations via a single shared `AnimatedSection` wrapper. DOM-based floating code fragments for the hero. No new dependencies — Framer Motion is already installed.

**Tech Stack:** Next.js 16, Framer Motion (already installed), Tailwind CSS v4, TypeScript

**Pages in scope:** Homepage (`/`) + Login (`/login`) only.

---

## Decisions

| Layer | Decision |
|---|---|
| Hero background | Floating code fragments — DOM spans rising upward (Option G) |
| Scroll animations | Quiet — fade + 8px translateY, 350ms ease-out, once per viewport enter |
| Stat counters | New section between hero and explainer — 20+, 5,000+, 3+ tick up on scroll |
| Product cards | Spring scale on hover via Framer Motion (stiffness 200, damping 22) |
| FAQ accordion | AnimatePresence height animation on open/close |
| CTA buttons | Subtle scale 1.02 on hover |
| Login page | Right panel slides in from right; agent orbs stagger in from bottom |
| Reduced motion | useReducedMotion() — all animations disabled, counters jump to final value |

---

## File Map

### New files
- `components/shared/animated-section.tsx` — `whileInView` scroll wrapper, accepts `delay` prop
- `components/shared/floating-code-bg.tsx` — hero background, DOM spans rising upward
- `components/store/stats-section.tsx` — 3 animated counters with useInView

### Modified files
- `components/store/hero-section.tsx` — add `<FloatingCodeBackground />`
- `components/store/product-card.tsx` — convert hover to Framer Motion spring
- `components/store/faq-section.tsx` — AnimatePresence height animation on answers
- `app/page.tsx` — add `<StatsSection />` between hero and explainer, wrap all sections in `<AnimatedSection>`
- `app/login/page.tsx` — entrance animations on right panel + agent orbs
- `app/globals.css` — `@media (prefers-reduced-motion: reduce)` CSS override for FloatingCodeBackground

---

## Component Specs

### `AnimatedSection`
```tsx
// Props: children, delay?: number (default 0), className?: string
// Calls useReducedMotion() — if true, renders children with no animation
// variants: { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }
// transition: { duration: 0.35, ease: "easeOut", delay }
// initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
```

### `FloatingCodeBackground`
```tsx
// Snippets pool (12 items):
// 'claude', 'CLAUDE.md', '> warren analyze RELIANCE', 'use_computer: true',
// 'tool_use: web_search', '✓ 32/32 tests passed', 'export ANTHROPIC_API_KEY=sk-...',
// '> sherlock research "HDFC"', 'npm install -g @anthropic-ai/claude-code',
// 'streaming: true', 'FastAPI + Strands', '# Claude Code Solution'
//
// Spawns up to 8 active spans at once, each:
//   - position: absolute, randomized left (5%–85%)
//   - bottom: -30px, rises to top via CSS @keyframes (floatCode)
//   - duration: 6–10s, opacity fades near top
//   - color: #F9731650 (orange) or #4a9eff40 (blue), random
//   - font-family: monospace, font-size: 0.55–0.7rem
// Gradient overlay: linear-gradient(to top, transparent 60%, #0A0A0A 95%)
// Respects prefers-reduced-motion — renders null if true
// Cleans up intervals on unmount
```

### `StatsSection`
```tsx
// Stats: [{ value: 20, suffix: "+", label: "AI Tools Shipped" },
//          { value: 5000, suffix: "+", label: "Hours Automated" },
//          { value: 3, suffix: "+", label: "Enterprise Teams" }]
// useInView from framer-motion, triggerOnce: true
// useEffect: when inView, start counting via requestAnimationFrame
//   - easing: quadratic ease-out over 1500ms
//   - final value displayed as "20+", "5,000+", "3+"
// If useReducedMotion: display final value immediately, no animation
// Layout: 3-column row, centered, border-y border-[#27272A] bg-[#0D0D0D]
// Number style: text-4xl font-black text-[#F97316]
// Label style: text-sm text-[#71717A] mt-1
```

### Product Card hover upgrade
```tsx
// Outer div → motion.div
// KEEP onMouseEnter/onMouseLeave for boxShadow glow (Framer Motion doesn't
//   animate box-shadow cleanly — leave those handlers untouched)
// ADD alongside them: whileHover={{ scale: 1.02 }}
// ADD: transition={{ type: "spring", stiffness: 200, damping: 22 }}
// Result: glow via inline JS, scale via Framer Motion — both fire on hover
```

### FAQ accordion
```tsx
// Each answer: wrap in AnimatePresence + motion.div
// initial={{ height: 0, opacity: 0, overflow: "hidden" }}
// animate={{ height: "auto", opacity: 1 }}
// exit={{ height: 0, opacity: 0 }}
// transition={{ duration: 0.25, ease: "easeOut" }}
// Question row: motion.div whileHover={{ x: 2 }}, transition duration 150ms
```

### Login page entrance
```tsx
// Right panel (the flex-1 div): wrap in motion.div
//   initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
//   transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
//
// Agent orbs container: motion.div with variants staggerChildren: 0.12
// Each orb div: motion.div
//   variants: { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }
//   transition: { duration: 0.35, ease: "easeOut" }
// Parent: initial="hidden" animate="visible"
```

### Homepage page.tsx section order + delays
```tsx
<HeroSection />                         // no AnimatedSection — hero is immediate
<StatsSection />                        // built-in whileInView
<AnimatedSection delay={0}>
  <ExplainerSection />
</AnimatedSection>
<AnimatedSection delay={0.05}>
  <ProductsSection />
</AnimatedSection>
<AnimatedSection delay={0}>
  <HowItWorksSection />
</AnimatedSection>
<AnimatedSection delay={0}>
  <FaqSection />
</AnimatedSection>
<AnimatedSection delay={0}>
  <ProjectsSection />
</AnimatedSection>
<AnimatedSection delay={0}>
  <HireCtaSection />
</AnimatedSection>
```

---

## Reduced Motion Behaviour

| Component | Reduced motion behaviour |
|---|---|
| `AnimatedSection` | Renders children immediately, no transition |
| `FloatingCodeBackground` | Returns null |
| `StatsSection` | Jumps to final value immediately |
| Product card hover | Spring still fires (hover is intentional user action) |
| FAQ accordion | Height still animates (user-initiated, 250ms is acceptable) |
| Login entrances | Renders at final state immediately |

CSS fallback in `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  .floating-code-bg { display: none; }
}
```
