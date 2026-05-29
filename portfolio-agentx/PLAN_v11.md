# PLAN_v11 — /tools Page Redesign + Black Hole Animation

## Decisions Made

### /tools Redesign
| Decision | Choice |
|----------|--------|
| Tool count | 2 live + 4 coming soon = 6 total |
| Hero headline | "Tools That Run While You Sleep" |
| Pricing section | Remove entirely |
| Scope | /tools listing + /tools/[slug] detail pages |
| Agents banner | Remove (stops page deflecting to /agents) |
| Bottom CTA | "Have a specific workflow in mind? Let's build it." → /hire |

### Black Hole Animation
| Decision | Choice |
|----------|--------|
| Style | Lensing ring — glowing accretion disk (canvas-based) |
| Color tie-in | Subtle gradient: warm amber → orange → cool blue. Not explicit agent dots. |
| Placements | Homepage hero, Login left panel, Agents page hero, Site-wide background texture |
| Performance | Smooth + rich — canvas/requestAnimationFrame acceptable |

---

## Tools Grid (6 cards)

### Live Tools (full color, interactive)
| Tool | Icon | Color | Price | Description |
|------|------|-------|-------|-------------|
| Report Bot | FileText | `#F59E0B` | $9/mo | Transform raw Excel data into polished PDF reports with AI-generated insights |
| AI Chatbot Builder | Bot | `#EC4899` | $49/mo | Build and deploy custom AI chatbots trained on your data. No code required |

### Coming Soon (desaturated, badge overlay)
| Tool | Icon | Color | Tagline |
|------|------|-------|---------|
| Data Insights Bot | BarChart2 | `#6366F1` | Ask your spreadsheet anything. Get answers in seconds. |
| Resume Screener AI | Users | `#10B981` | Upload 100 CVs. Get a ranked shortlist in 30 seconds. |
| Contract Reviewer | FileSearch | `#F43F5E` | Plain-English breakdown of any contract. Flag risks instantly. |
| Meeting Notes Summariser | Mic | `#8B5CF6` | From transcript to action items in one click. |

---

## /tools Page Changes

### Hero Section
- Remove "2 Utility Tools" badge
- New badge: "2 Live · 4 Coming Soon"
- Headline: **"Tools That Run While You Sleep"**
- Subtext: "AI-powered tools for real business workflows. Upload, process, ship."
- No agents banner

### Tools Grid
- 3-col desktop / 2-col tablet / 1-col mobile
- **Live cards**: full color, icon circle (56px), hover lift + glow in tool color, colored top border, name + price badge, description, "Open Tool →" button
- **Coming soon cards**: full structure but desaturated (`opacity-50` + `grayscale`), "Coming Soon" badge overlay, no CTA button

### Remove
- Agents banner (top of page)
- Entire pricing section (Free / Individual / Pro table)

### Add
- Bottom CTA block: "Have a specific workflow in mind? Let's build it." + "Work With Me →" button → /href

---

## /tools/[slug] Detail Page Changes

### Layout (keep 2-col split)
- Left: tool icon + name + description + features list
- Right: improved terminal demo

### CTA Button
- Remove "Subscribe — $9/mo" button
- Replace with: "Request Early Access →" (links to /hire)

### Terminal Demo (right panel)
- Keep existing typewriter animation for "reports" slug
- For "chatbot" slug: build a mock chat interface (static messages showing AI responding)
- For coming-soon slugs: redirect to /tools (not a 404)

### Redirect for coming-soon slugs
In `app/tools/[slug]/page.tsx`, if slug is not in the live tools list, redirect to `/tools`.

---

---

## Black Hole Animation

### Component: `components/shared/blackhole-ring.tsx`

Canvas-based accretion disk with 4 visual layers (inside → out):
1. **Event horizon** — `#050508` dark filled circle, ~30% of total radius
2. **Photon ring** — ultra-thin bright white ring, sharp glow (`shadowBlur`)
3. **Accretion disk** — tilted ellipse (perspective squish `scaleY(0.3)`), conic gradient rotating:
   - Inner: warm amber `#f0b429` → hot orange `#ff6b00`
   - Outer: cools to blue `#4a9eff` → fades transparent
   - Rotation speed: ~60s full revolution (`angle += 0.002` per frame)
4. **Outer diffuse glow** — large radial gradient, blue-purple `#6366f1`, low opacity haze

**Props:**
```ts
interface BlackholeRingProps {
  size?: number;        // canvas px, default 600
  opacity?: number;     // wrapper opacity, default 0.6
  className?: string;
}
```

### Placement Details

| Location | File | Size | Opacity | Notes |
|----------|------|------|---------|-------|
| Homepage hero | `components/home/hero.tsx` | 700px | 55% | Centered behind headline text, `pointer-events-none absolute` |
| Login left panel | `app/login/page.tsx` | 450px | 50% | Overlays AnimatedGrid, centered in brand panel |
| Agents page hero | `app/agents/page.tsx` | 550px | 45% | Behind "Meet Our Agents" heading |
| Site-wide | `app/layout.tsx` | 100vmin | 7% | `fixed` full-screen, behind all content, `z-0` |

### Animation Loop (canvas)
```
each frame:
  clearRect()
  draw outer diffuse glow (radial gradient, static)
  draw accretion disk (conic gradient, angle += 0.002)
  draw photon ring (ellipse stroke, white, shadowBlur 12)
  draw event horizon (filled dark circle)
  requestAnimationFrame()
```

---

## Files to Change

### /tools Redesign
| File | Change |
|------|--------|
| `app/tools/page.tsx` | Full redesign — new hero, 6-card grid, remove pricing |
| `lib/constants.ts` | Add 4 coming-soon tools + `comingSoon: boolean` to Tool type |
| `app/tools/[slug]/page.tsx` | New CTA, redirect for coming-soon slugs |
| `components/tools/tool-demo.tsx` | Add mock chat demo for chatbot slug |

### Black Hole Animation
| File | Change |
|------|--------|
| `components/shared/blackhole-ring.tsx` | New component (create) |
| `components/home/hero.tsx` | Add BlackholeRing behind headline |
| `app/login/page.tsx` | Add BlackholeRing to left brand panel |
| `app/agents/page.tsx` | Add BlackholeRing behind hero heading |
| `app/layout.tsx` | Add site-wide fixed BlackholeRing at z-0 |

---

## Status

### /tools Redesign
- [ ] Update lib/constants.ts
- [ ] Redesign app/tools/page.tsx
- [ ] Update app/tools/[slug]/page.tsx
- [ ] Update components/tools/tool-demo.tsx

### Black Hole Animation
- [ ] Create components/shared/blackhole-ring.tsx
- [ ] Add to homepage hero
- [ ] Add to login left panel
- [ ] Add to agents page hero
- [ ] Add site-wide to app/layout.tsx
