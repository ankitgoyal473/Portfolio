# UI Bug Fixes & Background Improvement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 7 user-facing bugs identified via a live site audit, and improve the flat/invisible background on all pages.

**Architecture:** All changes are isolated to the Next.js frontend (`portfolio-agentx/`). No backend or Supabase changes. Tasks are independent — any can be done in any order.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion, inline CSS styles.

---

## File Map

| File | Change |
|------|--------|
| `components/home/hero.tsx` | Remove duplicate stats grid (lines 48–61) |
| `components/shared/cosmic-background.tsx` | Fix aurora blob colors + opacity |
| `app/globals.css` | Add subtle radial gradient to `body` for page depth |
| `lib/agents.ts` | Fix Harvey and Sherlock `freeLimit` copy |
| `components/home/tools-preview.tsx` | Hide "Try Free →" on coming-soon tools |
| `proxy.ts` | Add `?from=agents` query param on redirect |
| `app/login/page.tsx` | Read `?from=agents` and show context banner |
| `app/projects/page.tsx`, `app/tools/page.tsx`, `app/mcp/page.tsx`, `app/hire/page.tsx` | Reduce excessive top padding |

---

## Task 1: Remove Duplicate Stats from Hero

**Problem:** `Hero` renders a stats grid (20+, 5,000+, 3+) at the bottom of the hero section. `SocialProof` renders the exact same three stats immediately below. Users see the block twice.

**Fix:** Remove the stats grid from `Hero`. `SocialProof` is the canonical stats section.

**Files:**
- Modify: `components/home/hero.tsx` — delete lines 48–61

- [ ] **Step 1: Delete the stats grid from the Hero component**

In `components/home/hero.tsx`, remove this entire block (lines 48–61):

```tsx
        <div className="animate-fade-up mt-16 grid grid-cols-3 gap-8 border-t border-border/50 pt-8 [animation-delay:400ms]">
          <div>
            <p className="text-2xl font-bold text-foreground sm:text-3xl">20+</p>
            <p className="text-sm text-foreground-muted">AI Tools Shipped</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground sm:text-3xl">5,000+</p>
            <p className="text-sm text-foreground-muted">Hours Automated</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground sm:text-3xl">3+</p>
            <p className="text-sm text-foreground-muted">Enterprise Teams</p>
          </div>
        </div>
```

The hero section `<div>` at line 18 should end after the button group, like this:

```tsx
        <div className="animate-fade-up mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center [animation-delay:300ms]">
          <Link href="/hire">
            <Button size="lg" className="gap-2">
              Work With Me <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/tools">
            <Button variant="secondary" size="lg" className="gap-2">
              <Play className="h-4 w-4" /> Try AI Tools Free
            </Button>
          </Link>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Verify visually**

Run `npm run dev` in `portfolio-agentx/`, open http://localhost:3000. Scroll past the hero — you should see one stats row (gold accent numbers), not two.

- [ ] **Step 3: Commit**

```bash
git add portfolio-agentx/components/home/hero.tsx
git commit -m "fix(home): remove duplicate stats grid from Hero — SocialProof is canonical"
```

---

## Task 2: Fix CosmicBackground Aurora Colors and Opacity

**Problem:** `components/shared/cosmic-background.tsx` blob comments say "Warren gold / Sherlock blue / Harvey green" but all three blobs use purple/violet colors. Opacity is 0.14 / 0.10 / 0.08 — essentially invisible on a dark background.

**Agent brand colors (from `app/login/page.tsx`):**
- Warren gold: `#f0b429` → `rgba(240, 180, 41, ...)`
- Sherlock blue: `#4a9eff` → `rgba(74, 158, 255, ...)`
- Harvey green: `#00c896` → `rgba(0, 200, 150, ...)`

**Files:**
- Modify: `components/shared/cosmic-background.tsx` lines 36–78

- [ ] **Step 1: Replace the three blob `style` objects**

In `components/shared/cosmic-background.tsx`:

Replace Blob 1 (lines ~36–46) — Warren gold, top-left:
```tsx
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "5%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(240,180,41,0.28) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "aurora-1 18s ease-in-out infinite",
        }}
      />
```

Replace Blob 2 (lines ~49–61) — Sherlock blue, top-right:
```tsx
      <div
        style={{
          position: "absolute",
          top: "0%",
          right: "5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(74,158,255,0.22) 0%, transparent 70%)",
          filter: "blur(90px)",
          animation: "aurora-2 22s ease-in-out infinite",
          animationDelay: "-9s",
        }}
      />
```

Replace Blob 3 (lines ~64–78) — Harvey green, bottom-center:
```tsx
      <div
        style={{
          position: "absolute",
          bottom: "0%",
          left: "30%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,200,150,0.18) 0%, transparent 70%)",
          filter: "blur(100px)",
          animation: "aurora-3 26s ease-in-out infinite",
          animationDelay: "-13s",
        }}
      />
```

- [ ] **Step 2: Verify visually**

Open http://localhost:3000 and http://localhost:3000/login. On the homepage hero you should now see faint gold (top-left), blue (top-right), and green (bottom-center) aurora blobs. On the login left panel the same colors should be visible. The effect is intentionally subtle — if you can see a faint color tint, it's working.

- [ ] **Step 3: Commit**

```bash
git add portfolio-agentx/components/shared/cosmic-background.tsx
git commit -m "fix(background): use correct agent brand colors and visible opacity in aurora blobs"
```

---

## Task 3: Add Visual Depth to All Pages (Body Gradient)

**Problem:** Every page outside the hero is flat `#050505` black with zero visual texture. Inner pages (Projects, Tools, MCPs, Hire) look especially unfinished.

**Fix:** Add a subtle radial gradient at the very top of `body` — a faint brand-purple glow that fades to black. This gives all pages a sense of depth without clashing with any content.

**Files:**
- Modify: `app/globals.css` — update the `body` rule

- [ ] **Step 1: Update the `body` rule in globals.css**

In `app/globals.css`, find the existing `body` block (around line 38):

```css
body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family:
    var(--font-sans),
    system-ui,
    -apple-system,
    sans-serif;
}
```

Replace with:

```css
body {
  background:
    radial-gradient(ellipse 80% 40% at 50% -5%, rgba(139, 92, 246, 0.09) 0%, transparent 60%),
    var(--color-background);
  color: var(--color-foreground);
  font-family:
    var(--font-sans),
    system-ui,
    -apple-system,
    sans-serif;
}
```

- [ ] **Step 2: Verify visually**

Open http://localhost:3000/projects and http://localhost:3000/mcp. At the very top of the page (just below the navbar) you should see a faint purple glow bleeding down from the top edge. It should be noticeable but not garish — a subtle depth cue. On the homepage the hero's own background overrides this so no double-effect.

- [ ] **Step 3: Commit**

```bash
git add portfolio-agentx/app/globals.css
git commit -m "fix(background): add subtle radial gradient to body for visual depth on all pages"
```

---

## Task 4: Fix Agent Free Limit Copy

**Problem:** `lib/agents.ts` has:
- Harvey: `freeLimit: "10 rows/month"` — "rows" is an internal Harvey concept (prospect list rows). New visitors don't know what "rows" means.
- Sherlock: `freeLimit: "1 URL, manual only"` — "manual only" is unexplained.

**Files:**
- Modify: `lib/agents.ts` lines 57 and 79

- [ ] **Step 1: Update freeLimit strings**

In `lib/agents.ts`, make these two changes:

Line 57 (Sherlock):
```ts
    freeLimit: "1 analysis/month",
```

Line 79 (Harvey):
```ts
    freeLimit: "10 prospects/month",
```

- [ ] **Step 2: Check for other references**

The string `"10 rows/month"` is also referenced in:
- `lib/paywall.ts:137` — `features: ["Unlimited rows", "3 tones", "Campaign history"]` — leave this as-is, it's in the premium upsell modal which has context.
- `lib/mock-data.ts:36` — `unit: "rows"` — this is mock data, leave as-is.
- `lib/paywall.ts:136` — `"You've used your 10 free rows."` — update this to `"You've used your 10 free prospect emails."` for clarity.

In `lib/paywall.ts`, find line ~136:
```ts
      "You've used your 10 free rows. Unlock Harvey for unlimited prospects, 3 tone variants, and campaign history.",
```
Replace with:
```ts
      "You've used your 10 free prospect emails. Unlock Harvey for unlimited prospects, 3 tone variants, and campaign history.",
```

- [ ] **Step 3: Verify visually**

Open http://localhost:3000 and scroll to the "Meet Our Agents" section. Harvey card should now say `Free: 10 prospects/month`. Sherlock card should say `Free: 1 analysis/month`.

- [ ] **Step 4: Commit**

```bash
git add portfolio-agentx/lib/agents.ts portfolio-agentx/lib/paywall.ts
git commit -m "fix(copy): clarify Harvey and Sherlock free tier limits for new visitors"
```

---

## Task 5: Remove "Try Free →" from Coming-Soon Tools on Homepage

**Problem:** `components/home/tools-preview.tsx` maps all tools and shows `Try Free →` for every one — including the 4 coming-soon tools. This implies they're usable when they aren't.

**Context:** The `Tool` type in `lib/constants.ts` has `comingSoon?: boolean`. The `/tools` page already dims coming-soon cards. The homepage preview doesn't check this flag at all.

**Files:**
- Modify: `components/home/tools-preview.tsx` lines 105–112

- [ ] **Step 1: Conditionally render the CTA based on `tool.comingSoon`**

In `components/home/tools-preview.tsx`, find the `CardContent` block inside the tools map (~line 105):

```tsx
                  <CardContent className="mt-auto flex items-center justify-between">
                    <Badge variant="secondary">{tool.price}</Badge>
                    <Link href={`/tools/${tool.slug}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        Try Free <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
```

Replace with:

```tsx
                  <CardContent className="mt-auto flex items-center justify-between">
                    {tool.comingSoon ? (
                      <Badge variant="outline" className="text-foreground-muted">Coming Soon</Badge>
                    ) : (
                      <Badge variant="secondary">{tool.price}</Badge>
                    )}
                    {!tool.comingSoon && (
                      <Link href={`/tools/${tool.slug}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Try Free <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
```

- [ ] **Step 2: Verify visually**

On http://localhost:3000, scroll to "Utility Tools". Coming-soon tool cards should show only a "Coming Soon" badge with no link button. Report Bot and AI Chatbot Builder should still show `Try Free →`.

- [ ] **Step 3: Commit**

```bash
git add portfolio-agentx/components/home/tools-preview.tsx
git commit -m "fix(home): hide Try Free CTA on coming-soon tools in homepage preview"
```

---

## Task 6: Explain Why the User Was Redirected to Login

**Problem:** `proxy.ts` redirects unauthenticated users from `/agents` to `/login` with no query param. The login page has no awareness of why the user landed there — it shows the same generic UI for every visitor.

**Fix:** Pass `?from=agents` in the redirect URL. The login page reads this and shows a one-line context banner: "Sign in to access Warren, Sherlock, and Harvey."

**Files:**
- Modify: `proxy.ts` line 39
- Modify: `app/login/page.tsx` — read `?from` param and render a banner

- [ ] **Step 1: Add query param to the redirect in proxy.ts**

In `proxy.ts`, find line ~39:
```ts
    return NextResponse.redirect(new URL('/login', request.url))
```

Replace with:
```ts
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', request.nextUrl.pathname.split('/')[1] ?? 'app')
    return NextResponse.redirect(loginUrl)
```

This sets `?from=agents` when redirecting from `/agents`, `?from=dashboard` from `/dashboard`, etc.

- [ ] **Step 2: Read the param in the login page and show a banner**

In `app/login/page.tsx`, add a `useSearchParams` read. Because `useSearchParams` requires Suspense in Next.js 16, read from `window.location.search` in a `useEffect` instead (avoids the Suspense wrapper and build failure).

Add this state and effect to `LoginPage` (after the existing `const { login } = useMockAuth()` line):

```tsx
  const [fromContext, setFromContext] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    if (from) setFromContext(from);
  }, []);
```

Then, inside the RIGHT PANEL section (find the `<div className="flex-1 flex flex-col justify-center ...">` that contains "Sign in to AGentX"), add this banner just above the `<h1>` heading:

```tsx
{fromContext === 'agents' && (
  <div className="mb-6 rounded-lg border border-border bg-accent-muted px-4 py-3 text-sm text-foreground-secondary">
    Sign in to access <span className="text-foreground font-medium">Warren, Sherlock, and Harvey</span> — your free account unlocks all three.
  </div>
)}
```

Make sure `useState` and `useEffect` are imported from `"react"` at the top of the file.

- [ ] **Step 3: Verify flow**

1. Open an incognito window and go to http://localhost:3000
2. Click "Agents" in the navbar
3. You should land on `/login?from=agents`
4. The banner "Sign in to access Warren, Sherlock, and Harvey..." should appear above the "Sign in to AGentX" heading
5. Click Work With Me or any other nav link → `/login` without `?from` → no banner

- [ ] **Step 4: Type check**

```bash
cd portfolio-agentx && npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add portfolio-agentx/proxy.ts portfolio-agentx/app/login/page.tsx
git commit -m "fix(ux): show context banner on login page when redirected from protected route"
```

---

## Task 7: Reduce Excessive Top Whitespace on Inner Pages

**Problem:** Inner pages (Projects, Tools, MCPs, Hire) have a large empty gap (~150px) between the navbar and the page title. This is caused by `pt-24` or `py-24` on the outermost section with no hero above it.

**Fix:** Change the top padding of the first section on each inner page from `py-24` (or `pt-24`) to `pt-12 pb-24`.

**Files:**
- Modify: `app/projects/page.tsx`
- Modify: `app/tools/page.tsx`
- Modify: `app/mcp/page.tsx`
- Modify: `app/hire/page.tsx`

- [ ] **Step 1: Find the outermost section padding on each page**

For each of the four files, look for the first `<section` or `<main` tag and find its `className`. Replace `py-24` with `pt-12 pb-24`, or `pt-24` with `pt-12`. If the class is `py-20`, replace with `pt-10 pb-20`.

Run this grep to locate the exact lines:

```bash
grep -n "py-24\|pt-24\|py-20\|pt-20" portfolio-agentx/app/projects/page.tsx portfolio-agentx/app/tools/page.tsx portfolio-agentx/app/mcp/page.tsx portfolio-agentx/app/hire/page.tsx
```

Apply the change in each file found. Example: `className="py-24 px-6"` → `className="pt-12 pb-24 px-6"`.

- [ ] **Step 2: Verify visually**

Check http://localhost:3000/projects, /tools, /mcp, /hire. The page title should appear close to the navbar — roughly 48–64px of breathing room, not a full screen-height gap.

- [ ] **Step 3: Commit**

```bash
git add portfolio-agentx/app/projects/page.tsx portfolio-agentx/app/tools/page.tsx portfolio-agentx/app/mcp/page.tsx portfolio-agentx/app/hire/page.tsx
git commit -m "fix(layout): reduce top whitespace on inner pages (projects, tools, mcp, hire)"
```

---

## Self-Review

**Spec coverage:**
| Bug | Task |
|-----|------|
| Stats duplicated | Task 1 ✓ |
| CosmicBackground invisible | Task 2 ✓ |
| All pages flat black | Task 3 ✓ |
| Harvey/Sherlock copy confusing | Task 4 ✓ |
| Coming-soon tools show Try Free | Task 5 ✓ |
| Agents nav silent redirect | Task 6 ✓ |
| Inner page top whitespace | Task 7 ✓ |

**Placeholder scan:** No TBDs or vague instructions — all steps have exact code or exact commands.

**Type consistency:** `fromContext` state used consistently. `tool.comingSoon` matches the `Tool` type in `lib/constants.ts` (`comingSoon?: boolean`). `window.location.search` is browser-side only and is gated inside `useEffect`, so no SSR issues.
