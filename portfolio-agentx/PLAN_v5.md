Read CLAUDE.md and persona.md before starting anything.

Redesign all 3 agent pages (WARRen, Sherlock, Harvey) with a Claude-style chat UX. This replaces the current form-based layout entirely.

---

## Implementation Decisions (agreed)

1. **Delete old components** — Remove harvey-demo.tsx, harvey-csv-upload.tsx, harvey-stream.tsx, harvey-results.tsx, warren-demo.tsx, sherlock-demo.tsx, agent-hero.tsx entirely. The new chat UX replaces everything.

2. **Usage persists in localStorage** — Usage increments per run, persists across page refreshes. User hits paywall stages naturally. Key: `agentx_usage_{agentId}`. Resets on manual clear or "new month" logic.

3. **Quick-reply chips float above chatbar** — Fixed position strip between chat thread and chatbar input. Not inside the thread. Disappear immediately after selection.

4. **Build all at once** — No step-by-step confirmation. Build all 16 steps, verify at end.

---

GLOBAL LAYOUT — ALL 3 AGENT PAGES

Every agent page uses this exact layout:

┌─────────────────────────────────────────┐ │ Navbar (existing) │ ├──────────────┬──────────────────────────┤ │ │ │ │ Sidebar │ Chat thread │ │ (240px) │ (fills remaining) │ │ │ │ │ ├──────────────────────────┤ │ │ Fixed chatbar │ └──────────────┴──────────────────────────┘

Sidebar: fixed height, independent scroll
Chat thread: scrollable, grows upward
Chatbar: fixed to bottom of chat area, never scrolls away
Mobile: sidebar hidden by default, hamburger icon top-left reveals it as a slide-over drawer
SIDEBAR COMPONENT components/agents/AgentSidebar.tsx

Props: agentId, agentColor, sessions[], usage, limit, onNewSession, onSelectSession, activeSessionId

Structure top to bottom:

Agent identity header: Agent name in agentColor + emoji Collapsible toggle button (chevron icon) Collapsed state: just shows emoji + thin bar

Usage widget: "Free tier" label + count "3 / 10" Thin progress bar in agentColor Fills left to right as usage increases At 80%+ : bar color shifts to warning amber At 100% : bar turns red, lock icon appears

New session button: Full width, outlined, agent color border "+ New session" text On click: clears chat thread, starts fresh

Session history list: Each session item shows:

Session name (auto-generated from input: WARRen: "AAPL · Deep dive" Sherlock: "stripe.com · weekly"
Harvey: "23 SaaS founders")
Relative date: "today", "2 days ago"
Row/report count as muted subtext
Active session: highlighted in agentColor background (10% opacity) with agentColor left border 2px
Hover: subtle background shift
Click: loads that session's output back into chat thread (replay)
Collapsed sidebar: Only shows: agent emoji + usage dot Dot color = green/amber/red based on usage Click to expand

CHAT THREAD COMPONENT components/agents/ChatThread.tsx

Props: messages[], agentId, isRunning

Message types to render:

USER bubble (right-aligned): Background: agentColor at 15% opacity Border: agentColor at 30% opacity Text: primary Border radius: 12px 4px 12px 12px Max width: 70% No avatar

AGENT bubble (left-aligned): Background: card color (#1E1E1E) Border: 0.5px border color Top of first bubble shows: Agent emoji + name in agentColor Font size 11px, muted Border radius: 4px 12px 12px 12px Max width: 85% (wider — agent outputs can be long)

THINKING bubble (agent, while running): Same style as agent bubble Shows animated thinking steps: Each step = icon + text + status icon Status: ○ pending → ◉ active (pulse) → ✓ done (agentColor checkmark) Steps defined per agent (see below) 800ms between each step activation

STRUCTURED OUTPUT bubble (agent): Renders rich content inline in chat: WARRen: pillar cards (see below) Sherlock: case file card (see below) Harvey: results table (see below) All render inside the agent bubble width

SYSTEM message (centered, no bubble): Small muted text centered in thread Used for: "Session started", "Replaying session from May 20" Font size 11px, color tertiary

PAYWALL message (agent bubble, special): Agent delivers warning in their voice Rendered differently — agentColor border left 3px, slightly highlighted background This is stage 3 of paywall (last free run)

Auto-scroll: thread always scrolls to bottom when new message appears. Smooth scroll behavior.

FIXED CHATBAR COMPONENT components/agents/AgentChatbar.tsx

Props: agentId, agentColor, usageCount, usageLimit, isLocked, onSend, onFileUpload, placeholder

Structure: Outer container: Fixed to bottom of chat area Padding: 12px 16px Background: page background (#0A0A0A) Border top: 0.5px border color Backdrop blur for glass effect

Inner pill: Background: card color (#1E1E1E) Border: 0.5px border, agentColor glow on focus (box-shadow 0 0 0 2px agentColor at 20% opacity) Border radius: 24px Padding: 8px 8px 8px 14px Display: flex, align items center, gap 8px

Left side: Harvey only: paperclip icon button Opens file picker (accept=".csv") On file select: shows filename pill in chatbar before sending WARRen/Sherlock: no left icon

Center: Textarea (not input — allows multiline) Auto-grows up to 120px then scrolls Placeholder per agent: WARRen: "Ask WARRen... (e.g. AAPL)" Sherlock: "Give Sherlock a rival URL..." Harvey: "Describe what you're selling..." Enter = send (Shift+Enter = newline) Font size 14px

Right side: Usage counter (conditional display): Hidden on first load (usageCount === 0) Fades in after first use Text: "2 of 3 left" in agentColor Font size 11px, mono font Animation: fadeIn 0.4s ease on appear

Send button:
  Circle, 32px, agentColor background
  Arrow-up icon, dark text
  Hover: brightness 110%
  Active: scale 0.95
  Disabled state (empty input): 
    muted background, 40% opacity

LOCKED STATE (isLocked=true): Entire inner pill: opacity 50% Textarea: disabled, cursor not-allowed Placeholder changes to: "Upgrade to continue..." Send button: replaced with lock icon Same circle style, red background On click: triggers bottom sheet Counter hidden, replaced with: "Limit reached" in red, 11px

PAYWALL SYSTEM lib/paywall.ts + components/agents/PaywallSheet.tsx

4-stage paywall logic in lib/paywall.ts:

Stage 1 — FRESH (usageCount === 0): No counter shown. Full experience.

Stage 2 — AWARE (0 < usageCount < limit): Counter fades into chatbar. No other change.

Stage 3 — WARNING (usageCount === limit): After completing the final free run: Agent sends a special chat bubble in their voice (PAYWALL message type):

WARRen: "That was my last free report for you this month. I have more to say — shall we continue? — WARRen 🧐"

Sherlock: "I've used up my free surveillance quota for the month. I have more intelligence to gather. The game doesn't have to end here. — Sherlock 🔎"

Harvey: "That's your last free batch. I've got more prospects waiting — and I'm just warming up. Shall we keep going? — Harvey 💼"

Chatbar counter turns amber. User can still read output, copy results. Next attempt triggers Stage 4.

Stage 4 — LOCKED (usageCount > limit): Chatbar freezes (locked state above). PaywallSheet slides up automatically. Cannot be dismissed without paying (or closing the tab — don't be evil, "Maybe later" closes sheet but chatbar stays locked).

PaywallSheet component: Position: fixed bottom 0, full width z-index: 50 (above chatbar) Animation: slide up from bottom (translateY 100% → 0, 350ms ease-out) Background: surface card (#1E1E1E) Border radius: 16px 16px 0 0 Border top: 1px solid agentColor

Handle bar: 32px wide, 3px tall Background: border color Border radius: full Centered, margin bottom 16px

Content: Agent emoji (large, 32px) + name in agentColor, font size 18px bold

Headline in agent voice:
WARRen:  "WARRen has more analysis to share."
Sherlock: "Sherlock is still on the case."
Harvey:  "Harvey has more prospects waiting."

Subtext (muted, 13px):
WARRen:  "You've used your 1 free report 
          this month. Unlock WARRen for 
          full 5-pillar analysis, PDF 
          export, and unlimited reports."
Sherlock: "You've used your free scan. 
          Unlock Sherlock for 5 rivals, 
          weekly auto-digest, and Monday 
          email delivery."
Harvey:  "You've used your 10 free rows. 
          Unlock Harvey for unlimited 
          prospects, 3 tone variants, 
          and campaign history."

Feature pills row:
3-4 pills in agentColor (10% bg, 
agentColor text, agentColor border):
WARRen:  "5-pillar analysis" 
         "PDF export" "Unlimited"
Sherlock: "5 rivals" "Weekly digest" 
          "Email delivery"
Harvey:  "Unlimited rows" "3 tones" 
         "Campaign history"

Price display:
Large: "$XX" in agentColor, 28px bold
Muted: "/month" next to it
Below: "Cancel anytime · No contracts"
  in 11px muted

Buttons:
Primary (full width):
  Background: agentColor
  Text: dark, bold, 14px
  WARRen:  "Unlock WARRen — $19/month"
  Sherlock: "Unlock Sherlock — $49/month"
  Harvey:  "Unlock Harvey — $29/month"
  On click: mock Stripe (console.log 
  for now, real Stripe later)

Secondary (full width, below):
  Background: transparent
  Border: 0.5px border color
  Text: muted, 13px
  "Maybe later"
  On click: closes sheet, chatbar 
  stays locked (user sees locked state)

Bottom: "Or get all 3 for $79/month →"
  Small link, muted, centered
  Links to /pricing (mock)

WARREN — CHAT BEHAVIOUR

Initial greeting bubble on page load: "Good morning. Give me a ticker and I will tell you what the market is missing. — WARRen 🧐" (Use time of day: morning/afternoon/evening)

Input detection in chatbar: On send, detect if input looks like ticker: Regex: /^[A-Z]{1,5}(.NS|.BSE)?$/i If ticker detected: run analysis flow If not: WARRen responds conversationally: "I work best with stock tickers. Try typing AAPL or RELIANCE.NS"

Mock analysis flow:

User bubble: "AAPL"
WARRen bubble: "AAPL it is. Let me walk you through what I see..."
Thinking bubble appears with steps: 📊 Reading price data... (800ms) 🏰 Analysing the moat... (800ms) 📰 Scanning market sentiment... (800ms) ⚙️ Checking options chain... (800ms) 🌍 Assessing global impact... (800ms) 🎯 Forming my verdict... (800ms)
Thinking bubble replaced by output: 5 pillar cards stacked in bubble Cards 2-5 blurred for free users Verdict card at bottom blurred Sign-off: "— WARRen 🧐"
Pillar card structure (inside agent bubble): Each card: Header row: icon + pillar name + signal badge (BULLISH/BEARISH/NEUTRAL) Body: 2-3 lines mock analysis text Card 1 (Technical): fully visible Cards 2-5: blurred (filter: blur(4px), pointer-events: none) Blur overlay: "Unlock WARRen — $19/month" centered text over blur

Session naming: "AAPL · Quick scan"

SHERLOCK — CHAT BEHAVIOUR

Initial greeting bubble on page load: "I am ready. Give me a rival to watch — a URL or company name. — Sherlock 🔎"

Input detection: URL detected (contains . and /): Sherlock confirms: "Adding stripe.com to your watchlist. Scan now or wait for Monday digest?" Show 2 quick-reply chips ABOVE chatbar: [Scan now] [Add to watchlist] Chips are buttons, clicking sends that text as user message

Company name (no URL): "Do you mean stripe.com? I will need the URL to investigate properly."

Mock scan flow:

User: "Scan now"
Sherlock: "On it. Give me a moment..."
Thinking bubble: 🔍 Examining their website... (1000ms) 📋 Comparing to last snapshot...(1000ms) 💼 Checking job postings... (1000ms) 📰 Reading the news... (1000ms) 🎯 Scoring the threat level... (1000ms) 📝 Writing your case file... (1000ms)
Case file card appears in bubble:

Case file card structure: Header: "🔎 CASE FILE · stripe.com" Date + "Threat level: MEDIUM 🟡" badge

Sherlock intro line: "Elementary. Here is what I found."

Section — Website changes: Change item with colored dot + text Mock: "Pricing page updated.  
99
p
l
a
n
→
 79. Discounting." Badge: "PRICING CHANGE 🔴"

Section — Hiring signals: Mock: "3 new ML Engineer roles posted. Building something new in AI." Badge: "HIRING SIGNAL 🟡"

Section — News (BLURRED free users): Blur overlay: "Unlock Sherlock — $49/month"

Section — What this means for you (BLURRED): Blur overlay same

Sign-off: "The game is afoot. — Sherlock 🔎"

Session naming: "stripe.com · May 24"

HARVEY — CHAT BEHAVIOUR

Initial greeting bubble on page load: "Drop your prospect list. I will make every single one feel personal. — Harvey 💼"

Flow via chatbar:

Step 1 — User attaches CSV via paperclip: File pill appears in chatbar showing filename: "prospects.csv ✕" User types offer or sends with just CSV

Step 2 — Harvey confirms: "Got it — 47 prospects loaded. I can see: name, company, title, website.

What are you selling? Give me 2-3 sentences and I will make every opener land."

Step 3 — User types offer, sends: User bubble shows their offer text

Step 4 — Harvey asks tone (quick-reply chips): "Last thing — what tone? Pick one:" 3 chips above chatbar: [🎩 Executive] [🤝 Friendly] [⚡ Direct]

Step 5 — After tone selected, Harvey runs: "Friendly it is. Let me work..." Thinking bubble: 📋 Parsing 47 prospects... (600ms) 🔍 Researching Acme Inc... (400ms each) ✍️ Writing for Sarah Chen... (300ms each) ⚡ Processing next prospect...

Then results table appears in bubble:

Results table structure: Header: "Harvey's openers — 47 prospects" Table with columns:

# | Name | Company | Opener | Actions

Rows animate in one by one (150ms stagger)
Each row slides in from left (x: -16px → 0)
Opener text types out (skip if >20 rows)

Actions per row (show on hover):
[Steal this 📋] [↺]
"Steal this" = copy to clipboard + 
brief "Copied!" toast

Rows 11+ blurred for free users
Blur row overlay:
"Harvey has 37 more to write.
 Unlock unlimited — $29/month"

Below table (visible):
"Download Harvey's work" button
(downloads mock CSV for now)

Sign-off below table: "Close-worthy. Go get them. — Harvey 💼"

Session naming: "47 prospects · Friendly"

QUICK-REPLY CHIPS

Reusable component: components/agents/QuickReplyChips.tsx

Appears above chatbar when agent wants user to pick an option. Disappears after selection.

Style: Horizontal flex, gap 8px Padding 8px 16px (same as chatbar padding) Each chip: Outlined pill, agentColor border agentColor text Hover: agentColor background (15% opacity) Border radius: full Font size 12px, padding 6px 14px On click: sends chip text as user message chips disappear immediately

SESSION REPLAY

When user clicks past session in sidebar:

System message in thread: "Replaying session from May 20"

Load saved messages from localStorage (mock) for that session

Render full conversation history (no animations — render instantly)

Show "Re-run this analysis →" button as final system message On click: runs the same input again (mock run with thinking animation)

Session save logic (lib/mock-sessions.ts): On every completed agent run: Save to localStorage: Key: agentx_sessions_${agentId} Value: array of SessionRecord { id, agentId, createdAt, name, messages[], inputSummary, usageCount } Max 20 sessions per agent stored FIFO — oldest dropped when at limit

COMPONENTS TO BUILD / UPDATE

New components: components/agents/AgentSidebar.tsx components/agents/ChatThread.tsx components/agents/AgentChatbar.tsx components/agents/QuickReplyChips.tsx components/agents/ThinkingBubble.tsx components/agents/PaywallSheet.tsx components/agents/PillarCards.tsx (WARRen) components/agents/CaseFileCard.tsx (Sherlock) components/agents/ResultsTable.tsx (Harvey)

Update: app/agents/[name]/page.tsx → new layout wrapping all above lib/mock-sessions.ts → create new lib/paywall.ts → create new

DESIGN RULES

Follow existing design system exactly. Use existing Tailwind v4 tokens. No new dependencies unless critical. Framer Motion already installed — use it.

Specific animation specs: Chatbar pill focus glow: box-shadow: 0 0 0 2px {agentColor}33 transition: 200ms ease

Bottom sheet slide up: initial: translateY(100%) animate: translateY(0) transition: 350ms cubic-bezier(0.32,0.72,0,1)

Chat bubble appear: initial: opacity 0, y: 8px animate: opacity 1, y: 0 transition: 200ms ease

Thinking step activate: Step dot: scale 0.8→1.0 + agentColor background fills in Label: opacity 0.4→1.0

Harvey row slide in: initial: x: -16px, opacity: 0 animate: x: 0, opacity: 1 stagger: 150ms between rows

Paywall counter fade in: initial: opacity 0, x: 8px animate: opacity 1, x: 0 transition: 400ms ease Only triggers once (first use)

Mobile (< 768px): Sidebar hidden by default Hamburger button top-left of chatbar Sidebar opens as slide-over drawer Overlay behind drawer (click to close) Chat thread full width Chatbar full width

BUILD ORDER

Step 1: lib/mock-sessions.ts + lib/paywall.ts Step 2: AgentChatbar.tsx (all states) Step 3: AgentSidebar.tsx Step 4: ThinkingBubble.tsx Step 5: QuickReplyChips.tsx Step 6: ChatThread.tsx (all message types) Step 7: PillarCards.tsx (WARRen output) Step 8: CaseFileCard.tsx (Sherlock output) Step 9: ResultsTable.tsx (Harvey output) Step 10: PaywallSheet.tsx Step 11: Wire WARRen page with new layout Step 12: Wire Sherlock page with new layout Step 13: Wire Harvey page with new layout Step 14: Session replay in sidebar Step 15: Mobile responsive Step 16: Verify build passes

Confirm after each step. Do not skip steps or combine them. Each agent must feel like a different character — different voice, different output format, different interaction pattern. Not a color swap. A completely different experience.