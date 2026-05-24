# Portfolio Website — Implementation Plan

## Context

Building a world-class portfolio site for Ankit Goyal (Senior AI Engineer & Freelancer) using Next.js 14 + Tailwind + Shadcn/UI. Dark, techy aesthetic inspired by Anthropic.com. Two audiences: US freelance clients and corporate recruiters. Includes freemium AI tools with Stripe monetization, Google auth, and a user dashboard.

**Phase 1 (this session):** Project setup + Home page  
**Future phases:** Remaining pages, auth, payments, tool integrations

---

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS 3.4 + Shadcn/UI
- **Auth:** NextAuth.js (mocked for now)
- **Payments:** Stripe (scaffolded/mocked)
- **AI:** Anthropic SDK (mocked responses)
- **Animations:** Framer Motion
- **Fonts:** Inter (Google Fonts)
- **Deployment:** Vercel (instructions provided later)

---

## Design System (Anthropic-Inspired)

### Colors
```
Background:     #0A0A0A (primary), #141414 (secondary), #1E1E1E (cards)
Accent:         #E8D5B8 (warm tan/cream — signature)
Accent hover:   #F0E6D2
Text:           #FAFAFA (primary), #A1A1AA (secondary), #71717A (muted)
Border:         #27272A (default), #3F3F46 (hover)
Success:        #10B981
Error:          #EF4444
```

### Typography
- Font: Inter (400, 500, 600, 700)
- Hero: 64-80px, font-bold
- H2: 40-48px, font-semibold
- Body: 16-18px, text-secondary

### Animations
- Animated dot grid background (CSS keyframes, low-opacity tan dots)
- Typewriter effect on hero headline
- Fade-up on scroll (Framer Motion)
- Card hover: border glow + slight translateY

---

## File Structure

```
portfolio/
├── app/
│   ├── layout.tsx              # Root layout (fonts, theme, nav)
│   ├── page.tsx                # Home page
│   ├── projects/page.tsx       # Portfolio grid
│   ├── tools/
│   │   ├── page.tsx            # Tools listing
│   │   └── [slug]/page.tsx     # Individual tool page
│   ├── hire/page.tsx           # Freelance + recruiter page
│   ├── auth/
│   │   └── page.tsx            # Login page
│   ├── dashboard/page.tsx      # User dashboard
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── tools/warren/route.ts
│       └── stripe/webhook/route.ts
├── components/
│   ├── ui/                     # Shadcn components
│   ├── layout/
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   ├── home/
│   │   ├── hero.tsx            # Typewriter + CTA
│   │   ├── tools-preview.tsx   # Tool cards grid
│   │   ├── social-proof.tsx    # Stats/logos
│   │   └── cta-section.tsx     # Hire me banner
│   ├── projects/
│   │   └── project-card.tsx
│   ├── tools/
│   │   └── tool-card.tsx
│   └── shared/
│       ├── animated-grid.tsx   # Dot grid background
│       ├── typewriter.tsx      # Typewriter effect
│       └── section-header.tsx
├── lib/
│   ├── utils.ts                # cn() helper
│   ├── constants.ts            # Projects, tools data
│   └── mock-auth.ts            # Mock auth context
├── styles/
│   └── globals.css
├── public/
│   └── images/
├── tailwind.config.ts
├── next.config.js
├── package.json
├── tsconfig.json
└── .env.local.example
```

---

## Phase 1: Setup + Home Page

### Step 1: Project Scaffolding
1. `npx create-next-app@latest` with TypeScript, Tailwind, App Router, ESLint
2. Install dependencies: `framer-motion`, `lucide-react`
3. Init Shadcn/UI: `npx shadcn@latest init`
4. Add Shadcn components: button, card, badge, separator

### Step 2: Design System Setup
1. Configure `tailwind.config.ts` with custom colors, fonts, spacing
2. Set up `globals.css` with CSS variables and animated grid
3. Add Inter font via `next/font/google`
4. Create `lib/utils.ts` with `cn()` helper

### Step 3: Layout Shell
1. Root `layout.tsx` — dark theme, font, metadata
2. `navbar.tsx` — logo, nav links, CTA button, mobile menu
3. `footer.tsx` — links, social, copyright

### Step 4: Home Page Components
1. **Hero** — animated grid bg, typewriter headline, subtitle, dual CTAs
2. **Tools Preview** — 4 tool cards with icons, brief descriptions, "Try Free" buttons
3. **Social Proof** — stats strip (projects delivered, happy clients, tools built)
4. **Hire Me CTA** — split section: freelance clients left, recruiters right

### Step 5: Shared Components
1. `animated-grid.tsx` — CSS dot grid with subtle animation
2. `typewriter.tsx` — client component with typing effect
3. `section-header.tsx` — reusable section title + subtitle

---

## Data Constants (lib/constants.ts)

```typescript
tools = [
  { name: "Warren Analysis", desc: "Buffett-style stock research", price: "$19/mo", slug: "warren" },
  { name: "Lead Automation", desc: "AI-powered lead generation", price: "$29/mo", slug: "leads" },
  { name: "Report Bot", desc: "Excel → PDF reports", price: "$9/mo", slug: "reports" },
  { name: "AI Chatbot Builder", desc: "Custom chatbot in minutes", price: "$49/mo", slug: "chatbot" },
]

projects = [
  { name: "Enterprise RAG System", tags: ["Python", "LangChain", "AWS"], client: "Fortune 500" },
  { name: "Automated Trading Signals", tags: ["Claude API", "FastAPI"], client: "Hedge Fund" },
  // ...more
]

pricing = {
  free: { uses: 3, features: ["Limited output", "No export"] },
  pro_bundle: { price: 49, features: ["All tools", "Unlimited", "Priority support"] }
}
```

---

## Verification

After Phase 1 completion:
1. `npm run dev` — site runs on localhost:3000
2. Home page loads with animated grid, typewriter effect, tool cards
3. Navigation works (links to placeholder pages)
4. Responsive: looks good on mobile, tablet, desktop
5. Lighthouse: 90+ performance, accessibility
6. No TypeScript errors: `npx tsc --noEmit`

---

## Future Phases (not this session)

- **Phase 2:** Projects page (filterable grid), Hire page (Calendly embed)
- **Phase 3:** Auth (NextAuth + Google), Dashboard
- **Phase 4:** Tool pages with mock streaming UI
- **Phase 5:** Stripe integration, usage tracking
- **Phase 6:** Real API connections, deployment to Vercel
