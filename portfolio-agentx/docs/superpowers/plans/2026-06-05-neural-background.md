# Neural Network Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat CSS dot-grid background with a canvas-based neural network animation — drifting nodes in agent brand colors connected by pulsing edges — across all pages.

**Architecture:** A single `NeuralBackground` React component renders a `<canvas>` that fills its parent. It uses `requestAnimationFrame` for a 60fps animation loop: nodes drift and bounce, edges form between nearby nodes, and bright pulse-dots travel along random edges every ~2s. The component handles resize. It replaces `AnimatedGrid` everywhere it is used, and the `AgentXLogoAnimated` orbiting-node colors are corrected to use actual brand colors at the same time.

**Tech Stack:** React, TypeScript, HTML5 Canvas 2D API, `requestAnimationFrame`, `useEffect`/`useRef`.

---

## File Map

| File | Action |
|------|--------|
| `components/shared/neural-background.tsx` | **Create** — full canvas neural network component |
| `components/home/hero.tsx` | **Modify** — swap `AnimatedGrid` → `NeuralBackground` |
| `app/login/page.tsx` | **Modify** — swap `AnimatedGrid` → `NeuralBackground` |
| `app/hire/page.tsx` | **Modify** — swap `AnimatedGrid` → `NeuralBackground` |
| `app/not-found.tsx` | **Modify** — swap `AnimatedGrid` → `NeuralBackground` |
| `components/shared/agentx-logo-animated.tsx` | **Modify** — fix NODE_COLORS to brand colors |

`AnimatedGrid` and `CosmicBackground` are **not deleted** — they become dead imports that can be cleaned up later.

---

## Agent Brand Colors (reference throughout)

```ts
const BRAND_COLORS = {
  warren:  "#f0b429", // gold
  sherlock: "#4a9eff", // blue
  harvey:  "#00c896", // green
};
```

---

## Task 1: Build NeuralBackground Canvas Component

**Files:**
- Create: `portfolio-agentx/components/shared/neural-background.tsx`

### What it renders

- 60 nodes scattered across the canvas, each assigned one of the three brand colors
- Each node drifts slowly (speed ~0.3 px/frame) and bounces off the canvas edges
- Nodes pulse gently via a `sin`-wave opacity cycle
- Edges are drawn between any two nodes within 150px; edge opacity scales inversely with distance
- Every ~2 seconds, a bright dot "fires" along a random connected edge (pulse dot)
- Canvas resizes cleanly on `window.resize`

- [ ] **Step 1: Create the component file**

Create `portfolio-agentx/components/shared/neural-background.tsx` with this exact content:

```tsx
"use client";

import { useEffect, useRef } from "react";

const COLORS = [
  "#f0b429", // Warren gold
  "#4a9eff", // Sherlock blue
  "#00c896", // Harvey green
];

const NODE_COUNT = 60;
const CONNECT_DIST = 150;
const BASE_SPEED = 0.3;
const PULSE_INTERVAL_MS = 2000;

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  opacity: number;
  pulsePhase: number;
}

interface Pulse {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  color: string;
  speed: number;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function makeNodes(w: number, h: number): Node[] {
  return Array.from({ length: NODE_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = BASE_SPEED * (0.5 + Math.random() * 0.5);
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      radius: 1.5 + Math.random() * 2,
      opacity: 0.4 + Math.random() * 0.5,
      pulsePhase: Math.random() * Math.PI * 2,
    };
  });
}

export function NeuralBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    let nodes = makeNodes(w, h);
    const pulses: Pulse[] = [];
    let lastPulseAt = 0;
    let raf: number;

    function trySpawnPulse(now: number) {
      if (now - lastPulseAt < PULSE_INTERVAL_MS) return;
      // Find a random connected pair (up to 20 attempts)
      for (let attempt = 0; attempt < 20; attempt++) {
        const a = nodes[Math.floor(Math.random() * nodes.length)];
        const b = nodes[Math.floor(Math.random() * nodes.length)];
        if (a === b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        if (Math.sqrt(dx * dx + dy * dy) < CONNECT_DIST) {
          pulses.push({
            fromX: a.x, fromY: a.y,
            toX: b.x,   toY: b.y,
            progress: 0,
            color: a.color,
            speed: 0.012 + Math.random() * 0.01,
          });
          lastPulseAt = now;
          break;
        }
      }
    }

    function draw(now: number) {
      ctx.clearRect(0, 0, w, h);

      // Move nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.pulsePhase += 0.02;
      }

      // Edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(180,163,255,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Pulse dots
      trySpawnPulse(now);
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) { pulses.splice(p, 1); continue; }
        const px = pulse.fromX + (pulse.toX - pulse.fromX) * pulse.progress;
        const py = pulse.fromY + (pulse.toY - pulse.fromY) * pulse.progress;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(pulse.color, 0.9);
        ctx.shadowBlur = 8;
        ctx.shadowColor = pulse.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Nodes
      for (const n of nodes) {
        const glow = 0.25 + Math.sin(n.pulsePhase) * 0.12;
        // Halo
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 5);
        grad.addColorStop(0, hexToRgba(n.color, glow * 0.45));
        grad.addColorStop(1, hexToRgba(n.color, 0));
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        // Core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(n.color, n.opacity);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    const onResize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
      nodes = makeNodes(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
}
```

- [ ] **Step 2: Type-check the new file**

```bash
cd portfolio-agentx && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add portfolio-agentx/components/shared/neural-background.tsx
git commit -m "feat(background): add NeuralBackground canvas component — drifting nodes + pulsing edges"
```

---

## Task 2: Wire NeuralBackground into the Hero

**Context:** `components/home/hero.tsx` currently imports `AnimatedGrid` from `@/components/shared/animated-grid` and renders it as the section background. The hero `<section>` has `relative overflow-hidden` so the absolute-positioned canvas fills it.

**Files:**
- Modify: `portfolio-agentx/components/home/hero.tsx` — swap import + JSX

- [ ] **Step 1: Swap AnimatedGrid → NeuralBackground in hero.tsx**

In `components/home/hero.tsx`:

Replace:
```tsx
import { AnimatedGrid } from "@/components/shared/animated-grid";
```
With:
```tsx
import { NeuralBackground } from "@/components/shared/neural-background";
```

Replace (inside JSX):
```tsx
      <AnimatedGrid />
```
With:
```tsx
      <NeuralBackground />
```

- [ ] **Step 2: Type-check**

```bash
cd portfolio-agentx && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add portfolio-agentx/components/home/hero.tsx
git commit -m "feat(background): replace AnimatedGrid with NeuralBackground in homepage hero"
```

---

## Task 3: Wire NeuralBackground into Login, Hire, and 404

**Context:** Three more files use `AnimatedGrid`:
- `app/login/page.tsx` — left panel background
- `app/hire/page.tsx` — hero section background
- `app/not-found.tsx` — 404 page background

All three have the same pattern: `<AnimatedGrid />` renders inside a `relative overflow-hidden` container.

**Files:**
- Modify: `portfolio-agentx/app/login/page.tsx`
- Modify: `portfolio-agentx/app/hire/page.tsx`
- Modify: `portfolio-agentx/app/not-found.tsx`

- [ ] **Step 1: Update login/page.tsx**

In `app/login/page.tsx`:

Replace:
```tsx
import { AnimatedGrid } from "@/components/shared/animated-grid";
```
With:
```tsx
import { NeuralBackground } from "@/components/shared/neural-background";
```

Replace (inside JSX, left panel):
```tsx
        <AnimatedGrid />
```
With:
```tsx
        <NeuralBackground />
```

- [ ] **Step 2: Update hire/page.tsx**

In `app/hire/page.tsx`:

Replace:
```tsx
import { AnimatedGrid } from "@/components/shared/animated-grid";
```
With:
```tsx
import { NeuralBackground } from "@/components/shared/neural-background";
```

Replace (inside JSX, hero section):
```tsx
        <AnimatedGrid />
```
With:
```tsx
        <NeuralBackground />
```

- [ ] **Step 3: Update not-found.tsx**

In `app/not-found.tsx`:

Replace:
```tsx
import { AnimatedGrid } from "@/components/shared/animated-grid";
```
With:
```tsx
import { NeuralBackground } from "@/components/shared/neural-background";
```

Replace (inside JSX):
```tsx
      <AnimatedGrid />
```
With:
```tsx
      <NeuralBackground />
```

- [ ] **Step 4: Type-check all three**

```bash
cd portfolio-agentx && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add portfolio-agentx/app/login/page.tsx portfolio-agentx/app/hire/page.tsx portfolio-agentx/app/not-found.tsx
git commit -m "feat(background): replace AnimatedGrid with NeuralBackground in login, hire, 404"
```

---

## Task 4: Fix AgentXLogoAnimated Node Colors

**Context:** `components/shared/agentx-logo-animated.tsx` defines `NODE_COLORS` as a violet spectrum (`#c4b5fd`, `#8b5cf6`, `#6366f1`). These should be the actual agent brand colors so the 3 orbiting nodes visually represent Warren (gold), Sherlock (blue), Harvey (green). This component is used on the `/agents` page hero and the login left panel.

**Files:**
- Modify: `portfolio-agentx/components/shared/agentx-logo-animated.tsx` lines 11–15

- [ ] **Step 1: Replace NODE_COLORS**

In `components/shared/agentx-logo-animated.tsx`, find:

```ts
// Agent node colors — violet spectrum
const NODE_COLORS = [
  "#c4b5fd", // Warren — light violet
  "#8b5cf6", // Sherlock — mid violet
  "#6366f1", // Harvey — deep indigo
];
```

Replace with:

```ts
// Agent node colors — brand identity
const NODE_COLORS = [
  "#f0b429", // Warren — gold
  "#4a9eff", // Sherlock — blue
  "#00c896", // Harvey — green
];
```

- [ ] **Step 2: Type-check**

```bash
cd portfolio-agentx && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add portfolio-agentx/components/shared/agentx-logo-animated.tsx
git commit -m "fix(branding): AgentXLogoAnimated node colors — Warren gold, Sherlock blue, Harvey green"
```

---

## Task 5: Visual Verification

Use Playwright to screenshot all affected pages and confirm the neural background is rendering and looks good.

- [ ] **Step 1: Screenshot homepage hero**

Navigate to `http://localhost:3000` (dev server) or the Vercel preview URL. Take a full-page screenshot. Verify: colored nodes (gold/blue/green) visible on a dark background with connecting lines. No flat dot-grid.

- [ ] **Step 2: Screenshot login page**

Navigate to `/login`. Verify: left panel shows the neural network (not the dot grid). The 3 orbiting nodes from `AgentXLogoAnimated` should now be gold/blue/green instead of violet.

- [ ] **Step 3: Screenshot hire and 404 pages**

Navigate to `/hire` and any invalid path (e.g., `/xyz`). Verify neural background renders in both.

- [ ] **Step 4: Check performance**

Open browser DevTools → Performance. Record 5 seconds on the homepage. Verify: no frame drops below 30fps, no memory leaks from uncancelled `requestAnimationFrame`.

- [ ] **Step 5: Push and update branch**

```bash
git push
```

---

## Self-Review

**Spec coverage:**
| Requirement | Task |
|-------------|------|
| Canvas neural network component | Task 1 ✓ |
| Nodes in Warren/Sherlock/Harvey colors | Task 1 ✓ |
| Drifting nodes with bounce | Task 1 ✓ |
| Edges between nearby nodes | Task 1 ✓ |
| Pulse dots travelling along edges | Task 1 ✓ |
| Responsive canvas (resize) | Task 1 ✓ |
| Swap into homepage hero | Task 2 ✓ |
| Swap into login, hire, 404 | Task 3 ✓ |
| Fix AgentXLogoAnimated colors | Task 4 ✓ |
| Visual verification | Task 5 ✓ |

**Placeholder scan:** No TBDs. All code blocks are complete and self-contained.

**Type consistency:** `NeuralBackground` props `{ className?: string }` — used identically in all 4 call sites with no props (uses default). `hexToRgba` defined once in the component file, not shared — intentional (no other file needs it). `Node` and `Pulse` interfaces are local to the file.
