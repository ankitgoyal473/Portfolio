# PLAN_v8 — Premium Whitelist (is_premium flag)

**Date:** 2026-05-30
**Status:** Awaiting user answers on 2 questions before build

---

## Context

- Live Razorpay payment working (₹999/month, live keys active)
- User wants to whitelist specific Google accounts with unlimited access (no paywall)
- Use case: own account, friends, testers, demo access
- Pattern already exists in codebase: `is_admin` stored in `auth.users.raw_user_meta_data`

---

## Decisions Made

| Decision | Choice |
|----------|--------|
| Implementation approach | `is_premium: true` in Supabase `auth.users.raw_user_meta_data` |
| Promo codes | Deferred — whitelist is cleaner for this use case |
| Whitelisting mechanism | SQL or admin UI toggle |

---

## Pending Answers (blocking build)

1. **Usage tracking for premium users:** Should usage still be tracked (counted) but never enforced (never blocked)? Or skip tracking entirely?
   - Track but never block → analytics on how much premium users use agents
   - Skip tracking → cleaner, no DB rows for premium users

2. **Admin UI toggle:** Want a button in `/admin` dashboard to grant/revoke premium per user? Or manual SQL only for now?

---

## SQL to whitelist any account (ready to run now)

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_premium":true}'
WHERE email = 'ankitgoyal473@gmail.com';
```

Run in Supabase SQL editor for any account. Takes effect on next login (JWT refresh).

---

## Code Changes

### Stream routes (all 3: warren, sherlock, harvey)
In `app/api/agents/warren/stream/route.ts`, `sherlock/stream/route.ts`, `harvey/stream/route.ts`:

After auth check, before paywall check:
```ts
// Premium users bypass paywall entirely
if (user.user_metadata?.is_premium) {
  // skip paywall check and usage increment
  // proceed directly to Claude API call
}
```

### Agent page — `app/agents/[name]/page.tsx`
On mount, after getting user:
```ts
const isPremium = user?.user_metadata?.is_premium === true;
if (isPremium) {
  setLocked(false);
  setPaywallOpen(false);
  // skip usage load or just show unlimited
}
```

Pass `isPremium` down to `AgentChatbar` to show a subtle indicator (optional).

### Optional: Admin dashboard — `app/admin/page.tsx`
Add a toggle button next to each user row to grant/revoke `is_premium`:
- `POST /api/admin/set-premium` → uses `supabaseAdmin` to update `raw_user_meta_data`
- Toggle UI: shows crown icon or "Premium" badge next to user email

---

## Files to Change

| File | Change |
|------|--------|
| `app/api/agents/warren/stream/route.ts` | Skip paywall if `is_premium` |
| `app/api/agents/sherlock/stream/route.ts` | Skip paywall if `is_premium` |
| `app/api/agents/harvey/stream/route.ts` | Skip paywall if `is_premium` |
| `app/agents/[name]/page.tsx` | Skip lock state if `is_premium` |
| `app/admin/page.tsx` | (optional) Premium toggle per user |
| `app/api/admin/set-premium/route.ts` | (optional) New route to toggle premium |

---

## Not in this plan (defer)
- Promo codes / access codes
- Per-user invite links
- Premium expiry dates
- Email notification when premium granted
- Stripe/Razorpay subscription sync with premium flag
