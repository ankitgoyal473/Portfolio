# AGentX Persona Agents — Implementation Plan v3

## Context

Rebrand 3 of the 4 existing tools into persona-driven AI agents with distinct names, personalities, voices, and colors. Add a new `/agents` section with dedicated routes. Keep Report Bot + Chatbot Builder as utility tools at `/tools`. Harvey is the priority — build his full interactive UI.

## Key Decisions

- **3 persona agents**: WARRen, Sherlock, Harvey (never call them "tools" or "bots")
- **2 utility tools remain**: Report Bot (`/tools/reports`), Chatbot Builder (`/tools/chatbot`)
- **Platform accent**: Keep tan (#E8D5B8) for shared UI. Each agent has its own color.
- **Routes**: `/agents/[name]` for personas, `/tools/[slug]` for utilities
- **Priority**: Scaffold all 3 agents, build Harvey's full interactive demo
- **Agent reference**: See `persona.md` for exact voice, copy, and UI rules

---

## Agent Profiles

### WARRen — Wealth & Asset Research & Recommendation Engine
| Field | Value |
|-------|-------|
| Route | `/agents/warren` |
| Color | `#f0b429` (gold) |
| Price | $19/month \| Free: 1 report/month |
| Status | Scaffold only (mock demo) |
| Personality | Seasoned investment analyst. Calm, data-driven, never hypes. |
| Signature | "— WARRen 🧐" |
| What it does | 5-pillar Buffett-style stock analysis → conviction score + BUY/HOLD/SELL |

### Sherlock — Systematic Heuristic Evidence & Research for Leveraging cOmpetitor Knowledge
| Field | Value |
|-------|-------|
| Route | `/agents/sherlock` |
| Color | `#4a9eff` (blue) |
| Price | $49/month \| Free: 1 URL, manual only |
| Status | Scaffold only (mock demo) |
| Personality | Sharp, analytical, slightly dramatic. Detective who finds what others miss. |
| Signature | "The game is afoot. — Sherlock 🔎" |
| What it does | Weekly competitor intelligence: website diffs, pricing changes, job postings, threat scoring |

### Harvey — Hyper-personalised AI Revenue & Value Engine
| Field | Value |
|-------|-------|
| Route | `/agents/harvey` |
| Color | `#00c896` (green) |
| Price | $29/month \| Free: 10 rows/month |
| Status | **BUILD FULLY** — first agent |
| Personality | Elite sales copywriter. Closing energy. Confident, punchy, results-obsessed. |
| Signature | "Close-worthy. Go get them. — Harvey 💼" |
| What it does | Cold email personalization: CSV upload → per-prospect research → hyper-personalized openers |

---

## Route Structure (after implementation)

```
/agents              → Agents landing page (3 persona cards with personality)
/agents/warren       → WARRen page (scaffold + mock demo)
/agents/sherlock     → Sherlock page (scaffold + mock demo)
/agents/harvey       → Harvey page (FULL interactive UI)
/tools               → Utility tools listing (Report Bot, Chatbot Builder)
/tools/reports       → Report Bot
/tools/chatbot       → Chatbot Builder
```

**Remove:** Old `/tools/warren`, `/tools/leads` routes (replaced by `/agents/`)
**Keep:** `/tools/reports`, `/tools/chatbot`, `/tools` page (updated to show only 2 utility tools)

---

## File Structure (new/modified)

```
app/
  agents/
    page.tsx                    # Agents landing (3 persona cards)
    [name]/page.tsx             # Dynamic agent page
  tools/page.tsx                # UPDATE: show only Report Bot + Chatbot Builder
components/
  agents/
    agent-card.tsx              # Persona card (name, color, tagline, CTA)
    agent-hero.tsx              # Agent page hero (color-themed, personality quote)
    warren-demo.tsx             # WARRen mock demo (scaffold)
    sherlock-demo.tsx           # Sherlock mock demo (scaffold)
    harvey-demo.tsx             # Harvey full interactive demo
    harvey-csv-upload.tsx       # CSV file upload component
    harvey-stream.tsx           # Live SSE streaming output
    harvey-results.tsx          # Results table with copy buttons
lib/
  agents.ts                    # Agent data (names, colors, personalities, pricing, UI copy)
  constants.ts                 # UPDATE: remove warren/leads from tools array
```

---

## Agent Data (`lib/agents.ts`)

```typescript
interface Agent {
  name: string;           // "WARRen" | "Sherlock" | "Harvey"
  fullName: string;       // Expanded acronym
  slug: string;           // URL slug
  color: string;          // Hex color
  price: string;          // "$19/month"
  freeLimit: string;      // "1 report/month"
  personality: string;    // One-line description
  signature: string;      // End-of-message signature
  tagline: string;        // Hero subtitle
  cta: string;            // Button text
  loadingMessages: string[];  // Rotating loading text
  emptyState: string;     // Before first use
  errorMessage: string;
  successMessage: string;
  freemiumCta: string;    // Upsell message
}
```

---

## Harvey Full Build (Priority)

### Harvey Page Layout (`/agents/harvey`)

```
┌─────────────────────────────────────────────┐
│ HERO (green-themed)                          │
│ "Drop your prospect list. Harvey will make   │
│  every single one feel personal."            │
│ [Let Harvey Work →]                          │
├─────────────────────────────────────────────┤
│ HOW IT WORKS (3 steps)                       │
│ 1. Upload CSV (name, company, title, url)    │
│ 2. Harvey researches each prospect           │
│ 3. Get hyper-personalized openers            │
├─────────────────────────────────────────────┤
│ DEMO AREA                                    │
│ ┌─────────────────────────────────────────┐ │
│ │ CSV Upload zone (drag & drop)           │ │
│ │ OR paste: name, company, title          │ │
│ ├─────────────────────────────────────────┤ │
│ │ Tone selector: Executive/Friendly/Direct│ │
│ ├─────────────────────────────────────────┤ │
│ │ [Let Harvey Work →]                     │ │
│ ├─────────────────────────────────────────┤ │
│ │ STREAMING OUTPUT                        │ │
│ │ "Harvey is researching Acme Inc..."     │ │
│ │ "Found something good for John Smith..."│ │
│ │ "This one is going to land..."          │ │
│ │ "Harvey is on fire — 3/5 done..."       │ │
│ ├─────────────────────────────────────────┤ │
│ │ RESULTS TABLE                           │ │
│ │ Name | Company | Opener | [Steal this]  │ │
│ │ ─────────────────────────────────────── │ │
│ │ John | Acme    | "Saw your..." | [Copy] │ │
│ │ Jane | Corp    | "Your Q4..."  | [Copy] │ │
│ ├─────────────────────────────────────────┤ │
│ │ [Download Harvey's work] (CSV export)   │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ PRICING                                      │
│ Free: 10 rows/month | $29/mo: unlimited     │
├─────────────────────────────────────────────┤
│ "Close-worthy. Go get them. — Harvey 💼"    │
└─────────────────────────────────────────────┘
```

### Harvey Demo Logic (mocked)

1. User uploads CSV or pastes prospect data (name, company, title, optional URL)
2. Selects tone: Executive / Friendly / Direct
3. Clicks "Let Harvey Work →"
4. Streaming mock output:
   - Simulates processing each row (400ms delay per row)
   - Shows rotating Harvey messages: "researching...", "found something...", "on fire — N/M done..."
   - Character-by-character appearance for dramatic effect
5. Results appear as table rows (one at a time as "processed")
6. Each row has: prospect info + generated opener + "Steal this" copy button
7. "Download Harvey's work" exports results as CSV
8. Ends with: "Close-worthy. Go get them. — Harvey 💼"

### Mock Openers (hardcoded for demo)

```
"Saw your Series B announcement — scaling that fast usually breaks the ops layer. Mind if I show you what I built for [similar company]?"
"Your Q4 hiring push tells me growth is outpacing your current stack. I've seen this exact pattern before."
"John, I noticed your team just shipped [product]. The timing is perfect for what I'm about to show you."
"Your LinkedIn post about AI adoption resonated — most companies your size are stuck exactly where you described."
"Noticed Acme just opened 3 engineering roles. When hiring can't keep up, automation fills the gap."
```

---

## WARRen & Sherlock Scaffolds

### WARRen Page (`/agents/warren`)
- Gold-themed hero with personality quote
- Ticker input field + "Ask WARRen →" button
- Mock output: pre-written AAPL analysis in WARRen's voice (reuse existing streaming demo but with WARRen personality/copy)
- Shows 5 pillars as sections
- Ends with: "— WARRen 🧐"
- Freemium CTA: "WARRen has more to say. Unlock his full analysis — $19/month."

### Sherlock Page (`/agents/sherlock`)
- Blue-themed hero with personality quote
- URL input field + "Put Sherlock on the case →" button
- Mock output: pre-written competitor brief in Sherlock's voice
- Shows: pricing changes detected, new features, job postings, threat level
- Ends with: "The game is afoot. — Sherlock 🔎"
- Freemium CTA: "Sherlock is watching 4 more rivals. Unlock full surveillance — $49/month."

---

## Updates to Existing Files

### `lib/constants.ts`
- Remove `Warren Analysis` and `Lead Automation` from `tools` array
- Keep `Report Bot` and `AI Chatbot Builder` only

### `app/tools/page.tsx`
- Update to show only 2 utility tools (Report Bot, Chatbot Builder)
- Add banner/link: "Looking for our AI Agents? → /agents"

### `components/home/tools-preview.tsx`
- Rename to show agents + tools combined
- Show 3 agent cards (with persona colors) + 2 tool cards
- Or: separate "Meet Our Agents" section + "Utility Tools" section

### `components/layout/navbar.tsx`
- Add "Agents" link before "Tools" in navigation

### `lib/constants.ts` → `navLinks`
- Add `{ label: "Agents", href: "/agents" }`

### Discovery chat (`lib/estimate.ts`)
- Update problem → stack mapping to reference agent names:
  - "Stock market research" → "WARRen (Claude API · yfinance · Next.js)"
  - "Competitor intelligence" → "Sherlock (Claude API · Strands · Resend)"
  - "Cold email personalisation" → "Harvey (Claude API · Next.js · Supabase)"

---

## Design Rules (from persona.md)

### Naming (enforce always)
- CORRECT: WARRen, Sherlock, Harvey, AGentX
- WRONG: warren analysis, sherlock tool, harvey bot, AI tool, AI feature

### Color Usage
- WARRen UI elements → `#f0b429` (gold)
- Sherlock UI elements → `#4a9eff` (blue)
- Harvey UI elements → `#00c896` (green)
- Platform shared UI → `#E8D5B8` (AGentX tan)

### Voice
- Each agent page uses ONLY that agent's voice/copy from persona.md
- Never mix personalities across agents
- Always end responses with agent's signature

---

## Build Order

1. Create `lib/agents.ts` (agent data constants)
2. Update `lib/constants.ts` (remove warren/leads from tools)
3. Create `/agents` landing page
4. Create `/agents/[name]` dynamic route
5. Build agent hero + personality components
6. Build Harvey's full demo (CSV upload, tone selector, streaming, results, download)
7. Build WARRen scaffold (ticker input + mock analysis)
8. Build Sherlock scaffold (URL input + mock brief)
9. Update navbar (add "Agents" link)
10. Update home page (agents section)
11. Update `/tools` page (only 2 utilities + link to agents)
12. Update discovery chat estimate mapping

---

## Verification

- `npx tsc --noEmit` — zero errors
- `npm run build` — all routes compile
- Old routes (`/tools/warren`, `/tools/leads`) return 404
- New routes (`/agents`, `/agents/harvey`, etc.) render correctly
- Harvey demo: upload CSV → see streaming → get results → copy works
- Navbar shows: Agents | Tools | Work With Me
- Home page showcases agents with correct colors/personality
