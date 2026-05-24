---
name: new-agent
description: Step-by-step guide for adding a new (4th+) agent to the AGentX platform. Covers persona, data model, route, chat behavior, paywall limits, and sidebar integration.
---

# Adding a New Agent

Follow these steps in order when adding a new agent to AGentX.

## 1. Define the persona

Add an entry to `persona.md` with:
- Name (with specific capitalization — e.g., WARRen, not Warren)
- Hex color (unique, not already used by existing agents)
- One-line personality
- Pricing tier + free limit
- Signature sign-off line

## 2. Register in lib/agents.ts

Add to the `agents` array with all fields:
```
slug, name, fullName, color, price, freeLimit, personality, signature, tagline, cta, loadingMessages, emptyState, errorMessage, successMessage, freemiumCta
```

## 3. Set paywall limit

In `lib/paywall.ts`, add the agent slug to the `LIMITS` object and add entries to `PAYWALL_MESSAGES` and `PAYWALL_SHEET_DATA`.

## 4. Define thinking steps

In `app/agents/[name]/page.tsx`, add a `const {NAME}_THINKING: ThinkingStep[]` array (4-6 steps with icons, labels).

## 5. Add chat behavior

In the same page file:
- Add a case to `getGreeting()` for the initial greeting
- Add a case to `getPlaceholder()` for the chatbar placeholder
- Add a `run{Name}` async function with the agent's flow logic
- Wire it into `handleSend()` with appropriate input detection

## 6. Create structured output component

Create `components/agents/{Name}Output.tsx` — the rich content rendered inside the agent bubble after thinking completes. Follow the pattern of PillarCards/CaseFileCard/ResultsTable.

## 7. Wire in ChatThread

In `components/agents/ChatThread.tsx`, add a case to render the new output component when `metadata.type` matches.

## 8. Update navLinks (if needed)

The `/agents` landing page auto-renders from `lib/agents.ts` — no manual update needed. But verify the agent card appears.

## 9. Verify

Run: `npx tsc --noEmit && npm run lint && npm run build`
Then visually test: `npm run dev` → navigate to `/agents/{slug}`
