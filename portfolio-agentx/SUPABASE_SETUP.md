# Supabase Setup — AGentX Storefront

Manual steps required in the Supabase dashboard before the storefront can process payments.

---

## Step 1: Create `purchases` Table

Go to **Supabase → SQL Editor** and run:

```sql
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  product_slug text not null,
  razorpay_payment_id text not null unique,
  razorpay_order_id text not null,
  created_at timestamptz default now()
);
```

---

## Step 2: Create `solutions` Storage Bucket

Go to **Supabase → Storage → New bucket**:

- **Name:** `solutions`
- **Public:** OFF (private — signed URLs only)

---

## Step 3: Upload Product ZIPs

Upload files into the `solutions` bucket with these exact names:

- `rudy.zip`
- `warren.zip`
- `sherlock.zip`
- `harvey.zip`

For development/testing, you can upload a placeholder `placeholder.txt` renamed to each of these.
The verify route will generate signed URLs pointing to these files on successful payment.

---

## Step 4: Verify Environment Variables

Check `portfolio-agentx/.env.local` has all of these set:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
GMAIL_USER=...
GMAIL_APP_PASSWORD=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For Vercel production, also ensure these are set in the Vercel dashboard under Environment Variables:
- `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `NEXT_PUBLIC_APP_URL` (set to your live domain)

---

## Notes

- The `purchases` table has a `unique` constraint on `razorpay_payment_id` — this makes the verify route idempotent (safe to call twice with the same payment ID).
- The `solutions` storage bucket must be **private** (not public). The verify route generates time-limited signed URLs (24h) using the service role key.
- Old tables (`subscriptions`, `agent_sessions`, `agent_usage`, `leads`) can be left in place — they are no longer used by any active route.
