---
name: wire-supabase
description: Replace mock localStorage storage with real Supabase database + Resend emails for the discovery chat lead system. Use when you have Supabase and Resend API keys ready.
disable-model-invocation: true
---

## Prerequisites

User must provide:
- Supabase project URL and anon key
- Supabase service role key (for server-side operations)
- Resend API key
- Ankit's email address for lead notifications

## Step 1: Install dependencies

```bash
npm install @supabase/supabase-js resend
```

## Step 2: Create `.env.local` from `.env.local.example`

Fill in the Supabase and Resend values.

## Step 3: Create Supabase table

Run this SQL in the Supabase SQL editor:

```sql
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  problem text,
  workflow text,
  timeline text,
  budget text,
  notes text,
  complexity text,
  delivery text,
  stack text,
  estimate_low integer,
  estimate_high integer,
  user_email text,
  status text DEFAULT 'pending',
  ankit_note text
);
```

## Step 4: Create `lib/supabase.ts`

Server-side Supabase client using service role key for API routes.
Client-side Supabase client using anon key for the admin dashboard.

## Step 5: Create `lib/resend.ts`

Helper that sends formatted HTML emails via Resend:
- New lead notification to Ankit (with Accept/Decline links)
- Acceptance email to user (with Calendly link)
- Decline email to user (polite, with resources)

## Step 6: Update API routes

- `app/api/submit-lead/route.ts` — Replace console.log with real Supabase insert + Resend email
- `app/api/update-lead/route.ts` — Replace console.log with real Supabase update + Resend notification to user

## Step 7: Update admin dashboard

- `app/admin/page.tsx` — Replace `getLeads()` (localStorage) with Supabase query
- Move password protection to middleware or use Supabase auth for admin

## Step 8: Update chat widget submission

- `components/chat/chat-widget.tsx` — On submit, POST to `/api/submit-lead` instead of localStorage `saveLead()`

## Step 9: Verify

Run `/verify` to confirm build passes, then test the full flow end-to-end.
