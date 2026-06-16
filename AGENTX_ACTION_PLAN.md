# AgentX Action Plan
_Created: 2026-06-17 · Owner: Ankit · Status: Phase 1 code done (unpushed), awaiting review_

Goal: ship a bug-free store that can take money, a hire/Discovery funnel that captures and
notifies every lead, and an Upwork pipeline — without selling anything we can't deliver.

App lives at `web/portfolio-agentx/`. Live: https://portfolio-one-topaz-65.vercel.app

---

## ✅ Phase 1 — DONE this session (code written, build passes, NOT pushed)

These edits are already on disk. Review the diffs before pushing.

1. **Pulled Sherlock & Harvey from sale** (no ZIP exists for them).
   - `lib/products.ts` — added `comingSoon?: boolean`; set `true` on `sherlock` + `harvey`.
   - `components/store/product-card.tsx` — `comingSoon` renders a disabled "Coming soon"
     pill, Buy modal can't open.
2. **Discovery chat widget now captures contact + can't fake success.**
   - `components/chat/chat-widget.tsx` — new "contact" step (name + email) before submit;
     sends structured fields; shows an error and stays put if the POST fails.
3. **Leads are persisted, not just emailed.**
   - `app/api/submit-lead/route.ts` — rewritten: insert into `leads` table → email → Slack;
     honeypot field; requires email + a description; returns 500 only if everything failed.
4. **Slack notifications.**
   - `lib/slack.ts` (new) — `notifySlack()` posts to `SLACK_WEBHOOK_URL`; no-op if unset.
   - `app/api/razorpay/verify/route.ts` — Slack ping on sale + on manual-fulfillment fallback.
5. **Hire form** — honeypot + `source: "hire"` (`app/hire/page.tsx`).
6. **Security** — hardcoded service-role key → `SUPABASE_SERVICE_ROLE_KEY` env in
   `products/upload-to-supabase.mjs` and `.py`.
7. **Docs** — pivot banner in `portfolio-agentx/CLAUDE.md`; `web/CURRENT_STATE.md` rewritten.

Verification already run: `npx tsc --noEmit` ✅ 0 errors · `npm run build` ✅ 18 routes.

---

## ▶️ Phase 1b — REVIEW & DEPLOY (do these in order)

- [ ] **Step 1 — Review the diffs.** From `web/portfolio-agentx/`:
  ```bash
  git status
  git diff
  ```
  Files touched: `lib/products.ts`, `components/store/product-card.tsx`,
  `components/chat/chat-widget.tsx`, `app/api/submit-lead/route.ts`, `lib/slack.ts`,
  `app/api/razorpay/verify/route.ts`, `app/hire/page.tsx`, `portfolio-agentx/CLAUDE.md`.
  (Plus `products/upload-to-supabase.{mjs,py}` and `web/CURRENT_STATE.md` outside the app root.)

- [ ] **Step 2 — Add `SLACK_WEBHOOK_URL` to Vercel** (so lead/sale pings actually fire).
  - Slack: create an Incoming Webhook for the `#freelance` (or `#approvals`) channel →
    https://api.slack.com/messaging/webhooks
  - Vercel → project `portfolio-agentx` → Settings → Environment Variables → add
    `SLACK_WEBHOOK_URL` = the webhook URL (Production + Preview).
  - Without this, Slack pings are a silent no-op (email still works).

- [ ] **Step 3 — Commit & push** (triggers Vercel deploy). From `web/portfolio-agentx/`:
  ```bash
  npx tsc --noEmit && npm run build   # confirm green again
  git add -A
  git commit -m "fix(store+leads): pull undeliverable products, capture+persist+notify leads, security"
  git push origin main
  ```

- [ ] **Step 4 — Post-deploy live verification** (the real test — current live site still has old code):
  - [ ] Homepage: Sherlock & Harvey show "Coming soon" (no Buy modal); Rudy & Warren still buyable at ₹999.
  - [ ] Open Discovery chat → answer the 4 steps → confirm it now asks **name + email** before submit.
  - [ ] Submit a test Discovery lead → confirm a row appears in Supabase `leads` and you get the email + Slack ping.
  - [ ] Submit a test `/hire` form → same checks.
  - [ ] (Optional) one real ₹999 Rudy purchase → confirm download + email + Slack sale ping → refund yourself.

---

## 🔐 Phase 1c — SECURITY follow-up (your action, do soon)

- [ ] **Rotate the Supabase service-role key** — it was committed in plaintext, treat as exposed.
  - Supabase dashboard → Project Settings → API → roll the `service_role` key.
  - Update it everywhere it's used: Vercel env (`SUPABASE_SERVICE_ROLE_KEY`), Railway
    (warren-agent), and your local `.env.local` / shell when running the upload scripts.

---

## 💳 Phase 2 — Monetization hardening

- [ ] **Confirm LIVE Razorpay keys in Vercel** (not `rzp_test_*`). Settings → Env Vars →
  `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`. A live key id starts with `rzp_live_`.
- [ ] Confirm Razorpay account KYC is fully activated (required to settle real money).
- [ ] Verify product delivery once more on live: `rudy.zip` + `warren.zip` both download via the
  signed URL and the email arrives.
- [ ] Decide pricing — ₹999 flat is fine to start; revisit per product later.

---

## 🧭 Phase 3 — Income: hire funnel + Upwork (the lever you chose)

**A. Make the funnel convert**
- [ ] Confirm every page has a clear CTA into `/hire` (homepage CTA + nav already do).
- [ ] Wire real links from `personal.md` (LinkedIn / GitHub / portfolio) into footer/hire — verify none are hardcoded/placeholder.
- [ ] Give `/hire` a page-specific `<title>` (currently generic) for SEO.
- [ ] (Optional) build Sherlock & Harvey ZIPs to re-enable their sale, or leave "Coming soon".

**B. Upwork pipeline** (uses the Upwork MCP)
- [ ] Check profile + connects balance.
- [ ] Search GenAI / AI-agent / automation jobs matching the profile.
- [ ] Draft proposals that cite AgentX + Warren as live proof; queue for your approval before submit.
- [ ] Decide a cadence (e.g. daily search + draft, you approve sends).

**C. Decide Warren's fate**
- [ ] Either repurpose the Railway `warren-agent` service as a live demo on the Warren product
  page, or decommission it to stop paying for an unused service.

---

## Open questions for you
1. Push now, or after you review diffs line-by-line?
2. Which Slack channel for lead/sale pings — `#freelance` or `#approvals`?
3. Build Sherlock & Harvey ZIPs this week, or leave them "Coming soon" for now?
