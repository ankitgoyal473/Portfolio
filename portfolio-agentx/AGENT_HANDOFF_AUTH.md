# Auth Agent Handoff

## Status: Supabase Auth is live

Real Google OAuth via Supabase replaces all mock localStorage auth.

## Files Changed

| File | Action |
|------|--------|
| `middleware.ts` | Created — refreshes sessions, protects `/agents/*`, `/admin/*`, `/dashboard/*` |
| `app/auth/callback/route.ts` | Created — exchanges OAuth code for session cookie |
| `lib/mock-auth.ts` | Rewritten — `useMockAuth()` now uses `createBrowserSupabaseClient()` with real Google OAuth |
| `lib/mock-data.ts` | Updated — `MockUser` is now a re-export of Supabase `User` type; `mockUser` set to `null` |
| `app/login/page.tsx` | Updated — removed "Mock Login (dev)" button; Google button calls real OAuth |
| `components/auth/client-auth-guard.tsx` | Rewritten — uses real Supabase session with loading spinner |
| `components/layout/navbar.tsx` | Updated — `user.avatar`/`user.name` → `user.user_metadata?.full_name ?? user.email` (both desktop and mobile) |
| `app/dashboard/page.tsx` | Updated — `user.name`/`user.plan` → `user_metadata.full_name ?? user.email` / hardcoded `"free"` |

## Files Not Changed (no user field accesses)

- `components/agents/sign-in-nudge.tsx` — only reads `user` (truthy check) and `isLoading`
- `app/agents/[name]/page.tsx` — does not use `useMockAuth` at all

## Manual Steps Still Required

1. **Supabase Dashboard**: Go to Authentication → Providers → Google, enable Google OAuth, enter your Google Client ID and Client Secret.

2. **Google Cloud Console**: In your OAuth 2.0 credentials, add the authorized redirect URI:
   ```
   https://dwcdzjhelmjjhsdcyrgc.supabase.co/auth/v1/callback
   ```

3. **Supabase Dashboard → Auth → URL Configuration**: Add your production domain to "Redirect URLs":
   ```
   https://your-production-domain.com/auth/callback
   ```
   For local dev, `http://localhost:3000/auth/callback` is handled automatically by `window.location.origin`.

4. **plan field**: Supabase `User` has no `plan` field. Dashboard currently hardcodes `plan="free"`. When a real plan/subscription system is added, read it from `user.user_metadata` or a separate Supabase table.

## TypeScript

`npx tsc --noEmit` passes with 0 errors.
