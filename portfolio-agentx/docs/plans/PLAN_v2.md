# AGentX Discovery Chat — Implementation Plan v2

## Context

A 5-stage discovery chat system integrated into the existing AGentX portfolio site as a **floating chat widget** (bottom-right corner, available on every page). Collects requirements from freelance clients, auto-generates a scoped cost estimate, and sends pre-qualified lead briefs.

## Key Decisions (from discussion)

- **Not a separate page** — floating chat icon that opens a slide-up panel/overlay
- **Accent color**: Keep AGentX tan (#E8D5B8), not Anthropic orange
- **Integrations**: Mocked for now (localStorage instead of Supabase, console.log instead of Resend)
- **Calendly**: Placeholder link
- **Admin dashboard**: `/admin` route with simple env-var password protection
- **Branding**: AGentX (not "Ankit")

## Architecture

```
Floating Chat Bubble (fixed, all pages)
  └── Discovery Chat Panel (slide-up overlay)
       ├── Stage Bar (5 dots: Problem → Workflow → Timeline → Budget → Estimate)
       ├── Chat Messages (AI bubbles + user chip selections)
       ├── Chip Selector (quick-select options)
       ├── Free Text Input
       ├── Estimate Card (auto-generated, editable)
       └── Submit → Success + Confetti

/admin → Leads Dashboard (password-protected)
```

## Pages & Routes

| Route | Purpose |
|-------|---------|
| All pages | Floating chat widget (bottom-right) |
| `/admin` | Leads dashboard (protected) |
| `/api/submit-lead` | Save lead + send email notification |
| `/api/update-lead` | Accept/decline from admin |

## Stage Flow

### Stage 1 — Problem
Q: "What's the core problem you want to solve with AI?"
Chips: Automate workflow | Custom chatbot | Automated reports | Document analysis | Stock analysis | Competitor intel | Cold email | Something else

### Stage 2 — Current Workflow
Q: "How do you handle this today?"
Chips: Manual copy-paste | Spreadsheets & email | Paying someone | Existing tool too slow | No process yet

### Stage 3 — Timeline
Q: "When do you need this live?"
Chips: ASAP (2 weeks) | Within 1 month | 2–3 months | Flexible

### Stage 4 — Budget
Q: "What's your rough budget range?"
Chips: Under $1,500 | $1,500–$3,000 | $3,000–$6,000 | $6,000+ | Not sure yet

### Stage 5 — Estimate (auto-generated)
- Structured estimate card showing all answers
- AI-derived: Complexity, Delivery estimate, Stack
- Calculated investment range
- Editable inline (click field → dropdown/text → save)
- "Request Ankit's review" + "Edit requirements" buttons

## Estimate Mapping

### Budget → Estimate
| Budget | Estimate Range | Complexity | Delivery |
|--------|---------------|------------|----------|
| Under $1,500 | $1,000–$2,000 | Low | 1–2 weeks |
| $1,500–$3,000 | $2,500–$4,000 | Medium | 3–4 weeks |
| $3,000–$6,000 | $4,500–$6,500 | Med-High | 5–8 weeks |
| $6,000+ | $7,000–$12,000 | High | 8–12 weeks |
| Not sure yet | $2,500–$5,000 | Medium | 4–6 weeks |

### Problem → Stack
| Problem | Stack |
|---------|-------|
| Automate workflow | Claude API · Python · n8n |
| Custom chatbot | Claude API · Next.js · Supabase |
| Automated reports | Claude API · Python · ReportLab |
| Document analysis | Claude API · PyMuPDF · Supabase |
| Stock analysis | Claude API · yfinance · Next.js |
| Competitor intel | Claude API · Strands · Resend |
| Cold email | Claude API · Next.js · Supabase |
| Something else | Claude API · Next.js · Supabase |

## Edit Mode

- No page restart — same panel
- Each field becomes individually editable inline
- Click field → dropdown or text input → Save/Cancel
- Changing budget → estimate recalculates live instantly
- "Recalculated" badge flashes for 2.5 seconds
- Optional notes textarea

## Submission Flow

1. User clicks "Request Ankit's review"
2. Optional: ask for email address
3. Save lead to localStorage (mock) / Supabase (later)
4. Console.log email body (mock) / Resend (later)
5. Show success: "Sent to Ankit. You'll hear back within 24 hours."
6. Confetti animation (canvas-confetti)
7. Optional: "Want updates? Leave your email"

## Admin Dashboard (`/admin`)

- Password protection: env var `ADMIN_PASSWORD` checked via query param or cookie
- Stats row: Total leads · Pending · Accepted · Declined
- Lead cards sorted by date (newest first)
- Each card: problem, budget, timeline, complexity, estimate, notes, stack, status badge
- Accept/Decline buttons + optional note textarea
- Accept → sends "Book a call" email (mocked)
- Decline → sends "Not the right fit" email (mocked)

## Design (AGentX Theme)

- Background: #0A0A0A
- Surface cards: #1E1E1E
- Borders: #27272A
- Accent: #E8D5B8 (AGentX tan)
- Text: #FAFAFA (primary), #A1A1AA (muted)
- Font: System stack (Inter fallback)
- Chat AI bubble: dark card, accent left border 2px, rounded
- User chip: accent background, dark text
- Stage progress: 5 dots, filled accent = done, pulsing ring = active, gray = upcoming
- Transitions: Framer Motion (fade + slide up for stages, scale for chips)

## File Structure

```
components/
  chat/
    chat-widget.tsx        # Floating button + panel container
    stage-bar.tsx          # 5-dot progress indicator
    message-bubble.tsx     # AI message bubble
    chip-selector.tsx      # Quick-select chip options
    estimate-card.tsx      # Generated estimate (view + edit)
    chat-input.tsx         # Free text input
    success-state.tsx      # Confirmation + confetti
  admin/
    lead-card.tsx          # Individual lead card
    stats-row.tsx          # Summary stats
app/
  admin/page.tsx           # Leads dashboard
  api/
    submit-lead/route.ts   # Save lead + notify
    update-lead/route.ts   # Accept/decline
lib/
  estimate.ts             # Budget/problem → estimate mapping logic
  mock-leads.ts           # Mock storage (localStorage wrapper)
```

## ENV Variables (for later — all mocked now)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
ANKIT_EMAIL=ankit@agentx.dev
ADMIN_PASSWORD=
NEXT_PUBLIC_CALENDLY_URL=
NEXT_PUBLIC_SITE_URL=
```

## Build Order

1. Estimate mapping logic (`lib/estimate.ts`)
2. Mock leads storage (`lib/mock-leads.ts`)
3. Chat widget shell (floating button + slide-up panel)
4. Stage bar component
5. Message bubble + chip selector
6. All 4 Q&A stages wired up
7. Estimate card (view mode)
8. Edit mode (inline editing + live recalc)
9. Submit API route (mock save + log)
10. Success state (confirmation + confetti)
11. Admin dashboard (`/admin`)
12. Accept/Decline API + mock notification

## Verification

- `npx tsc --noEmit` — zero errors
- `npm run build` — all routes compile
- `npm run dev` — chat widget visible on all pages, full flow works
- Admin at `/admin` shows leads after submission
