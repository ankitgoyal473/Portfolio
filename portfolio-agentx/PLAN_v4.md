Read CLAUDE.md before starting.

Build a mock /dashboard page and mock auth flow for AGentX. No real auth, no Supabase, no API calls. Everything uses mock data and localStorage only. Plugs into the existing Next.js 16 codebase.

---

## Implementation Decisions (agreed)

1. **Replace `/auth` with `/login`** — Delete existing `app/auth/page.tsx` (has email/password fields). Create new `app/login/page.tsx` with Google-only button per plan. Update all "Sign In" links to point to `/login`.

2. **Soft gate on `/agents/*`** — Agent demo pages stay PUBLIC (no login required to view). Visitors can see the page and try one demo run freely. After first use, prompt "Sign in to keep using [Agent]" — shows SaaS auth flow without killing portfolio discoverability.

3. **Build all at once** — No step-by-step confirmation. Build all 10 steps, verify at end.

---

MOCK AUTH BEHAVIOUR

Use the existing lib/mock-auth.ts pattern already in the codebase.

Mock login flow:

/login page shows "Sign in with Google" button
On click: set localStorage item key: 'agentx_user' value: { id: 'mock_user_1', name: 'Ankit Goyal', email: 'ankit@agentx.ai', avatar: 'AG', plan: 'free', joinedAt: '2025-01-01' }
Redirect to /dashboard
Mock logout:

Remove 'agentx_user' from localStorage
Redirect to /login
Auth hook (lib/mock-auth.ts — update existing): useMockAuth() returns: user: MockUser | null isLoading: boolean login: () => void (sets localStorage + redirect) logout: () => void (clears localStorage + redirect)

Protected routes:

/dashboard → redirect to /login if no user
/agents/* → redirect to /login if no user
Use a simple ClientAuthGuard component that checks localStorage on mount
MOCK DATA

Create lib/mock-data.ts with:

mockUser: id: 'mock_user_1' name: 'Ankit Goyal' email: 'ankit@agentx.ai' avatar: 'AG' plan: 'free' joinedAt: '2025-01-01'

mockUsage (current month): warren: { used: 0, limit: 1, unit: 'reports' } sherlock:{ used: 0, limit: 1, unit: 'rivals' } harvey: { used: 3, limit: 10, unit: 'rows' }

mockStats: reportsRun: 3 rivalsTracked: 0 emailsWritten: 47 sessionsSaved: 4

mockSessions (past agent runs): [ { id: 's1', agentId: 'harvey', createdAt: '2025-05-20T10:30:00', inputSummary: '23 prospects · SaaS founders', rowCount: 23, status: 'complete' }, { id: 's2', agentId: 'harvey', createdAt: '2025-05-18T14:00:00', inputSummary: '24 prospects · Dental practices', rowCount: 24, status: 'complete' }, { id: 's3', agentId: 'warren', createdAt: '2025-05-15T09:00:00', inputSummary: 'AAPL · Deep dive', rowCount: 1, status: 'complete' } ]

mockLeads (discovery chat submissions): [ { id: 'l1', problem: 'Automate lead follow-up workflow', budget: ' 
1
,
500
–
 3,000', estimateLow: 2500, estimateHigh: 4000, status: 'pending', createdAt: '2025-05-22T11:00:00' }, { id: 'l2', problem: 'Custom AI chatbot for dental practice', budget: ' 
3
,
000
–
 6,000', estimateLow: 3000, estimateHigh: 5000, status: 'accepted', calendlyUrl: 'https://calendly.com/ankitgoyal', createdAt: '2025-05-17T09:00:00' }, { id: 'l3', problem: 'Stock research automation tool', budget: '$6,000+', estimateLow: 7000, estimateHigh: 12000, status: 'declined', createdAt: '2025-05-10T14:00:00' } ]

PAGES TO BUILD

/login

Full page, dark background.

Layout: centered card, max-width 400px.

Content:

AGentX logo / wordmark at top
Headline: "Sign in to AGentX"
Subtext: "Access WARRen, Sherlock, and Harvey"
Large Google button: Google 'G' SVG icon + "Continue with Google" On click → runs mock login → redirects /dashboard
Small print: "By signing in you agree to our terms of service"
Subtle animated grid background (reuse AnimatedGrid component if exists)
Do NOT show email/password fields. This is Google only.

/dashboard

Protected — redirect to /login if no mock user.

Layout:

Full dark page
Top navbar (reuse existing Navbar component) Right side shows: user avatar initials + name
dropdown with "Sign out" option
Page content max-width 1100px, centered
Padding: 32px horizontal, 40px vertical
Section 1 — Welcome header: "Welcome back, [name]" in large display text Subtext: "Your squad is ready." Right side: plan badge "Free plan" or "Pro"

"Upgrade →" link for free users
Section 2 — Agent cards (3 columns): One card per agent. Each card styled in its own color (WARRen gold, Sherlock blue, Harvey green).

WARRen card: Top: WARRen name + "🧐" in gold Usage bar: "0 / 1 free report used" Progress bar (0% filled, gold color) Status: "Free tier · 1 report/month" CTA button: "Ask WARRen →" (gold outlined) If used >= limit: button becomes "Unlock WARRen — $19/month" (gold filled, links to mock /pricing)

Sherlock card: Top: Sherlock name + "🔎" in blue Usage bar: "0 rivals being watched" Status: "Free tier · 1 rival/month"
CTA button: "Put Sherlock on the case →" If used >= limit: "Unlock Sherlock — $49/month"

Harvey card: Top: Harvey name + "💼" in green Usage bar: "3 / 10 free rows used" Progress bar (30% filled, green color) Status: "Free tier · 10 rows/month" CTA button: "Let Harvey Work →" (green outlined) If used >= limit: "Unlock Harvey — $29/month"

Section 3 — Stats row (4 metric cards): Reports run: 3 Rivals tracked: 0 Emails written: 47 Sessions saved: 4 Each: muted label above, large number below

Section 4 — Recent sessions: Title: "Recent sessions" List of mockSessions, each row shows: Agent color dot + agent name Input summary Date (relative: "3 days ago") Row count or "1 report" Status badge: "complete" in green "View →" button (mock, no action for now)

Section 5 — Discovery requests: Title: "Your project requests" Cards for each mockLead:

Pending card: Problem statement (bold) Budget + estimate range "Submitted X days ago" Status badge: "Pending review" (amber) Subtext: "Ankit will review within 24 hours"

Accepted card: Problem statement (bold) Status badge: "Accepted" (green) "Ankit wants to connect!" CTA: "Book a call →" (links to mockLead.calendlyUrl) Subtle green glow on card border

Declined card: Problem statement (bold) Status badge: "Not a fit right now" (muted) Muted styling, reduced opacity No CTA

SMART REDIRECT AFTER LOGIN

In the mock login function:

Check localStorage for 'agentx_redirect'
If exists → redirect there + clear the key
If not → redirect to /dashboard
In ClientAuthGuard (used on /agents/* pages):

Check if user logged in
If not → save current path to localStorage key 'agentx_redirect'
Then redirect to /login
This means: user tries to visit /agents/harvey without login → goes to /login → after login → comes back to /agents/harvey automatically.

NAVBAR UPDATE

Update existing Navbar component:

If user logged in (mock user in localStorage): Show: Avatar circle (initials, e.g. "AG")
user name on desktop
dropdown on click: "Dashboard" → /dashboard "Sign out" → mock logout
If not logged in: Show: "Sign in" button → /login
COMPONENTS TO CREATE

components/auth/ ClientAuthGuard.tsx
— wraps protected pages — checks localStorage on mount — redirects if no user — shows nothing (null) while checking — renders children if user found

components/dashboard/ AgentCard.tsx — single agent card StatsRow.tsx — 4 metric cards SessionList.tsx — recent sessions LeadCards.tsx — discovery request cards WelcomeHeader.tsx — greeting + plan badge

DESIGN RULES

Follow existing design system exactly. Dark background (#0A0A0A), cards (#1E1E1E). Use existing Tailwind v4 tokens from globals.css. Use cn() from @/lib/utils for class merging.

Agent colors (CSS custom properties): --warren: #f0b429 --sherlock: #4a9eff --harvey: #00c896

Progress bars: Background: border color (#27272A) Fill: agent color Height: 4px, border-radius full

Status badges use existing Badge component.

Transitions: Cards fade in on mount (framer-motion, stagger 0.1s between cards) Reuse existing animation patterns

Mobile: Agent cards → single column on mobile Stats row → 2x2 grid on mobile Sessions → simplified list on mobile

DO NOT BUILD YET:

Real Supabase queries
Real NextAuth
Real Stripe
/pricing page (just link to it)
"View session" detail page
BUILD ORDER

Step 1: lib/mock-data.ts + update lib/mock-auth.ts Step 2: ClientAuthGuard component Step 3: /login page Step 4: Navbar update (auth-aware) Step 5: WelcomeHeader + AgentCard components Step 6: StatsRow + SessionList components Step 7: LeadCards component Step 8: /dashboard page (assemble all components) Step 9: Smart redirect logic Step 10: Verify build passes (npx tsc --noEmit && npm run lint && npm run build)

Confirm after each step before continuing. Match existing code style exactly. Use existing components wherever possible. No new dependencies unless absolutely necessary.