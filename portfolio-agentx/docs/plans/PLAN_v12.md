# PLAN_v12 — Cosmic Animation Redesign (Replace BlackholeRing)

## Problem with v11 Animation

The `BlackholeRing` canvas component looks static because:
1. `angle += 0.0017` = one full rotation every 61 seconds — imperceptibly slow
2. `createConicGradient` has limited browser support (Chrome 99+, Safari 16.4+ only) — silently renders nothing on older browsers
3. Alpha values (0.10–0.55) on a dark background are too faint to see
4. Canvas `shadowBlur` is slow and often invisible in practice

## Decisions Made

| Decision | Choice |
|----------|--------|
| Visual feel | Deep space / cosmic |
| Animation approach | CSS aurora blobs + SVG rotating ring (replaces canvas) |
| Pages with animation | Homepage hero, Login left panel, Agents hero only |
| Site-wide background | Remove — plain dark background everywhere else |
| Colors | Agent colors: Warren gold `#f0b429`, Sherlock blue `#4a9eff`, Harvey green `#00c896` |

---

## New Component: `CosmicBackground`

**File:** `components/shared/cosmic-background.tsx`

Replaces `BlackholeRing` entirely. Two layered visual effects:

### Layer 1 — Aurora Blobs (atmospheric depth)
Three large blurred divs, one per agent color, slowly drifting:

```
Blob 1 — Warren gold (#f0b429), top-left, 600px circle, blur(120px), opacity 12%
         keyframes: drift slowly between 3 positions over 18s, ease-in-out, infinite alternate
         
Blob 2 — Sherlock blue (#4a9eff), top-right, 500px circle, blur(100px), opacity 10%  
         keyframes: drift on different 18s cycle, starts mid-animation (animationDelay: -9s)
         
Blob 3 — Harvey green (#00c896), bottom-center, 400px circle, blur(90px), opacity 8%
         keyframes: drift on 22s cycle, starts mid-animation (animationDelay: -11s)
```

Drift keyframes example:
```css
@keyframes aurora-drift-1 {
  0%   { transform: translate(0px, 0px) scale(1); }
  33%  { transform: translate(30px, -20px) scale(1.05); }
  66%  { transform: translate(-20px, 15px) scale(0.95); }
  100% { transform: translate(10px, -10px) scale(1.02); }
}
```

### Layer 2 — Rotating Ring (visible movement)
SVG ellipse tilted edge-on like an accretion disk. Clear rotation, obvious movement.

```
SVG size: 500×200px (wide, flat — perspective ellipse)
Ellipse: rx=240, ry=90, centered
Stroke: 2px, gradient from agent gold to blue
Filter: drop-shadow(0 0 12px #f0b429) drop-shadow(0 0 24px #4a9eff40)
CSS animation: spin 20s linear infinite
Inner photon ring: rx=180, ry=68, 1px, white at 40% opacity, spin 15s
Event horizon: filled ellipse rx=80, ry=30, dark (#020205)
```

Rotation via CSS transform on the SVG (not canvas angle):
```css
@keyframes spin-ring {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
```

### Props
```ts
interface CosmicBackgroundProps {
  ringSize?: "sm" | "md" | "lg";  // sm=300px, md=500px, lg=700px wide
  className?: string;
}
```

### Structure
```tsx
<div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
  {/* Aurora layer */}
  <div className="aurora-blob blob-1" />  {/* gold, top-left */}
  <div className="aurora-blob blob-2" />  {/* blue, top-right */}
  <div className="aurora-blob blob-3" />  {/* green, bottom-center */}

  {/* Ring layer — centered */}
  <div className="absolute inset-0 flex items-center justify-center">
    <svg ...>
      {/* outer disk ring */}
      {/* photon ring */}
      {/* event horizon */}
    </svg>
  </div>
</div>
```

CSS keyframes go in `app/globals.css` under `@layer utilities` or as inline `<style>` in the component (use `<style jsx>` if needed, or Tailwind arbitrary animation).

---

## Placements (3 pages only)

| Page | File | Ring size | Notes |
|------|------|-----------|-------|
| Homepage hero | `components/home/hero.tsx` | `lg` (700px wide) | Behind headline, aurora fills full hero section |
| Login left panel | `app/login/page.tsx` | `md` (500px wide) | Replace existing AnimatedGrid overlay position |
| Agents page hero | `app/agents/page.tsx` | `md` (500px wide) | Behind "Meet Our Agents" heading |

---

## Cleanup

| File | Change |
|------|--------|
| `components/shared/blackhole-ring.tsx` | Delete entirely |
| `app/layout.tsx` | Remove the fixed site-wide BlackholeRing div + import |
| `components/home/hero.tsx` | Replace `<BlackholeRing>` with `<CosmicBackground ringSize="lg">` |
| `app/login/page.tsx` | Replace `<BlackholeRing>` with `<CosmicBackground ringSize="md">` |
| `app/agents/page.tsx` | Replace `<BlackholeRing>` with `<CosmicBackground ringSize="md">` |

---

## Files Changed

| File | Action |
|------|--------|
| `components/shared/cosmic-background.tsx` | Create new |
| `components/shared/blackhole-ring.tsx` | Delete |
| `app/globals.css` | Add aurora keyframes |
| `components/home/hero.tsx` | Swap component |
| `app/login/page.tsx` | Swap component |
| `app/agents/page.tsx` | Swap component |
| `app/layout.tsx` | Remove site-wide ring |

---

## Success Criteria

- Animation is clearly visible and moving on first load
- Works in all modern browsers (no canvas API dependencies)
- No performance regression (CSS animations are GPU-accelerated)
- Plain dark background on all other pages (dashboard, hire, projects, tools, admin)
- TypeScript clean, no lint errors

---

## Status

- [ ] Create components/shared/cosmic-background.tsx
- [ ] Add keyframes to app/globals.css
- [ ] Update components/home/hero.tsx
- [ ] Update app/login/page.tsx
- [ ] Update app/agents/page.tsx
- [ ] Clean up app/layout.tsx (remove site-wide ring)
- [ ] Delete components/shared/blackhole-ring.tsx
