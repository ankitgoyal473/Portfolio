# PLAN_v9 — Subscriptions + Pro UI + Emails + Portfolio Content

**Date:** 2026-05-30
**Status:** Awaiting user review + Gmail App Password before build

---

## Context

- Live at: https://portfolio-one-topaz-65.vercel.app (keeping this URL — validating crowd first)
- Razorpay live payments working (₹999/month)
- Domain: skipping for now, add when 5+ paying users or going public
- Email sending: Gmail App Password on ankitgoyal473@gmail.com

---

## Decisions Made

| Area | Decision |
|------|---------|
| Domain | Skip for now — use existing Vercel URL |
| Email | Gmail App Password on ankitgoyal473@gmail.com |
| Barclays mention | No — use "global investment bank" |
| Employment status | Available for freelance projects + right full-time opportunity |
| Freelance rate | Project-based, no rate shown on hire page |
| Stats | 20+ tools, 5,000+ hours automated, 3+ enterprise teams |
| Subscription cycle | 30-day strict, hard lock on expiry |
| Renewal | 30 days from payment date (not original expiry) |
| Expiry warning | 7 days before: dashboard card + agent chat banner + email |
| Confirmation email | Yes, includes Razorpay payment ID |
| Admin notification | Email to ankitgoyal473@gmail.com + admin dashboard section |
| Re-lock | Immediate hard lock on expiry (no grace period) |

---

## Phase 1 — Subscription System (Backend)

### New Supabase table: `subscriptions`

```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  status text NOT NULL DEFAULT 'active', -- active | expired | cancelled
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  razorpay_payment_id text,
  razorpay_order_id text,
  amount int NOT NULL DEFAULT 99900,
  currency text NOT NULL DEFAULT 'INR',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: users can read their own subscriptions, admin can read all
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access" ON subscriptions USING (true) WITH CHECK (true);
```

### Update `app/api/razorpay/verify/route.ts`

After signature verification, instead of just deleting agent_usage:
1. Insert subscription row: `expires_at = now() + interval '30 days'`
2. Delete agent_usage rows for all 3 agents (reset free runs)
3. Send confirmation email to buyer (via Gmail SMTP)
4. Send notification email to ankitgoyal473@gmail.com

### Update all 3 stream routes (premium check)

Replace simple `is_premium` metadata check with subscription table check:

```ts
// After auth check, before paywall:
if (user.user_metadata?.is_premium) {
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("expires_at, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .single();

  if (sub) {
    // Active subscription — bypass paywall, proceed to Claude
  } else {
    // Subscription expired — clear is_premium flag, fall through to paywall
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { is_premium: false }
    });
    // Fall through to normal paywall check → 403
  }
}
```

### New email utility: `lib/email.ts`

Using Nodemailer with Gmail SMTP:

```ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,       // ankitgoyal473@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD // 16-char app password
  }
});

export async function sendEmail({ to, subject, html }: {...}) { ... }
```

**Two email templates:**

**Buyer confirmation:**
```
Subject: You're in — AGentX Pro is active ✓
Body:
  Hi [name],
  Your AGentX Pro subscription is now active.
  Warren, Sherlock & Harvey are all yours — unlimited runs.

  Subscription details:
  • Active until: [expires_at formatted]
  • Payment ID: [razorpay_payment_id]
  • Amount: ₹999

  → Open AGentX: [link]

  Questions? Reply to this email.
  — Ankit
```

**Admin notification:**
```
Subject: 💰 New subscriber — [user email]
Body:
  [name] just paid ₹999 for AGentX Pro.
  Subscription active until [date].
  Payment ID: [razorpay_payment_id]
  → View in admin: [link]
```

**Expiry reminder (7 days before):**
```
Subject: Your AGentX Pro expires in 7 days
Body:
  Hi [name], your subscription expires on [date].
  Renew now to keep Warren, Sherlock & Harvey running.
  → Renew for ₹999: [link to agent page]
```

**Expiry reminder sending mechanism:**
- Checked lazily on each stream request (if 7 days remain and email not yet sent)
- Track with `reminder_sent_at` column on subscriptions table
- OR: check in the dashboard load and trigger via `/api/subscription/remind`

---

## Phase 2 — Pro UI

### Dashboard (`app/dashboard/page.tsx`)

**Add subscription state:**
```ts
const [subscription, setSubscription] = useState<{
  status: string;
  expires_at: string;
  daysLeft: number;
} | null>(null);
```

Fetch on mount from `agent_sessions` Supabase client:
```ts
supabase.from("subscriptions")
  .select("status, expires_at")
  .eq("user_id", user.id)
  .eq("status", "active")
  .gt("expires_at", new Date().toISOString())
  .order("expires_at", { ascending: false })
  .limit(1)
  .single()
```

**WelcomeHeader:** Pass `plan="pro"` when active subscription exists → renders gold "Pro" badge next to name.

**Subscription card (shows when subscription exists):**
```
┌─────────────────────────────────────────────┐
│ ✦ AGentX Pro                    [gold badge] │
│ Active until June 29, 2026                   │
│ 12 days remaining                            │
│                          [Renew — ₹999] ←  only shown if ≤7 days left
└─────────────────────────────────────────────┘
```

**Agent usage cards for Pro users:** Show "Unlimited" instead of "X of Y used".

### Agent page (`app/agents/[name]/page.tsx`)

**Expiry warning banner (≤7 days left):**
```
⚠ Your Pro plan expires in 5 days  [Renew →]
```
Shown as a subtle banner above the chatbar. Clicking "Renew →" opens PaywallSheet.

### Admin dashboard (`app/admin/page.tsx`)

**New "Subscribers" section** below Users:
- Table: name, email, status badge (Active/Expired), started_at, expires_at, payment ID
- Sorted by expires_at desc
- Fetch from `/api/admin/subscriptions` (new GET route)

---

## Phase 3 — Portfolio Content

### Homepage (`app/page.tsx` via components)

**Hero stats (replace dummy values):**
- `20+` AI Tools Shipped
- `5,000+` Hours Automated
- `3+` Enterprise Teams

**Bio / headline:**
> "ML Engineer with 5 years building production AI systems at enterprise scale. Shipped 20+ GenAI tools across multiple business units at a global investment bank — RAG pipelines, agentic workflows, and developer MCPs on AWS Bedrock."

**Title:** ML Engineer (was "Senior AI Engineer")

### Projects page (`app/projects/page.tsx`)

Replace placeholder projects with 4 real ones:

**1. Enterprise RAG System**
- Tagline: "Query your company's entire knowledge base in plain English"
- Description: Built on AWS Bedrock for a global investment bank. Unstructured + structured data sources, real-time retrieval across 3+ business units.
- Impact: 50+ analysts, 250+ hours saved per week
- Stack: AWS Bedrock, S3, Lambda, Python

**2. Hypothesis Testing Agent**
- Tagline: "Statistical analysis through conversation — no code required"
- Description: Non-technical business teams could run A/B tests and significance testing through natural language. Replaced manual analyst workflows.
- Impact: 40+ hours/week of manual analysis automated
- Stack: Python, LLMs, statistical libraries, AWS

**3. QA Testing Agent**
- Tagline: "AI that reads your codebase and writes the test suite"
- Description: Agentic QA system that analysed code changes, generated test cases, and executed them autonomously. Integrated with CI/CD pipelines.
- Impact: 3-day QA cycles reduced to hours (~70% reduction)
- Stack: AWS Bedrock Agents, Python, CI/CD

**4. Developer MCP Suite**
- Tagline: "JIRA, AWS, and GitLab — all through conversation"
- Description: Custom MCP servers for the developer toolchain. Engineers managed sprints, provisioned infrastructure, and reviewed PRs without leaving their AI interface. Built before MCP was mainstream.
- Impact: 20+ engineers, 50+ hours/week reclaimed
- Stack: Python, MCP Protocol, JIRA API, AWS SDK, GitLab API

### Hire page (`app/hire/page.tsx`)

- Dual audience: freelance projects + full-time roles
- No rate shown — project-based
- CTA: "Start a Project" (freelance) + "View My Work" (full-time)
- Remove any placeholder client logos or testimonials

---

## Phase 4 — Expiry Reminder Mechanism

Add `reminder_sent_at timestamptz` to subscriptions table.

In `/api/razorpay/create-order` or a new `/api/subscription/check` route:
- Load user's active subscription
- If `expires_at - now() <= 7 days` AND `reminder_sent_at IS NULL`:
  → Send reminder email
  → Set `reminder_sent_at = now()`

This lazy evaluation means no cron job — reminder fires on next visit/agent use.

---

## Files to Create / Modify

| File | Change |
|------|--------|
| `lib/email.ts` | New — Nodemailer Gmail SMTP utility + 3 email templates |
| `app/api/razorpay/verify/route.ts` | Insert subscription, send emails |
| `app/api/agents/*/stream/route.ts` | Check subscription table, expire lazily |
| `app/api/admin/subscriptions/route.ts` | New GET route for admin subscriptions list |
| `app/dashboard/page.tsx` | Subscription state, Pro badge, subscription card, usage "Unlimited" |
| `app/agents/[name]/page.tsx` | Expiry warning banner (≤7 days) |
| `app/admin/page.tsx` | New Subscribers section |
| `components/dashboard/welcome-header.tsx` | Pro badge when plan="pro" |
| `app/page.tsx` / home components | Real stats, bio, ML Engineer title |
| `app/projects/page.tsx` | 4 real projects |
| `app/hire/page.tsx` | Project-based CTA, dual audience |

---

## User Actions Required Before Build

1. **Gmail App Password:**
   - Gmail → Settings → Security → 2-step verification must be ON
   - Security → App Passwords → Generate → name it "AGentX"
   - Share the 16-character password → added to `.env.local` + Vercel

2. **Supabase migration:** I'll run the SQL for the `subscriptions` table via Supabase MCP.

---

## Not in this plan (defer)
- Custom domain (agentx.dev) — add after 5+ paying users
- Razorpay Subscriptions (auto-recurring billing) — manual for now
- Subscription cancellation flow
- Stripe for international users
- Annual plan
