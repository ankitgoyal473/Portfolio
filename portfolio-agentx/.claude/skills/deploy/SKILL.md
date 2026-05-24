---
name: deploy
description: Deployment checklist for Vercel. Use when ready to deploy the portfolio site.
disable-model-invocation: true
---

## Pre-deployment Checklist

Run these checks before deploying:

1. **Verify build passes**: Run `/verify` skill first.

2. **Check environment variables**: Ensure `.env.local` has all required keys (see `.env.local.example`):
   - NEXTAUTH_URL, NEXTAUTH_SECRET
   - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
   - STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
   - ANTHROPIC_API_KEY
   - NEXT_PUBLIC_APP_URL

3. **Check git status**: Ensure all changes are committed.

4. **Push to GitHub**:
```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

5. **Deploy to Vercel**:
   - Go to vercel.com → New Project → Import your GitHub repo
   - Framework: Next.js (auto-detected)
   - Add environment variables from step 2
   - Deploy

6. **Post-deploy verification**:
   - Check all routes load (/, /projects, /tools, /hire, /auth, /dashboard)
   - Verify streaming API route works (/api/tools/warren)
   - Test on mobile
   - Check Google Fonts load (they will on Vercel, unlike local corporate network)

## Alternative: Vercel CLI
```bash
npx vercel --prod
```
