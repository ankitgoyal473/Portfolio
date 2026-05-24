---
name: verify
description: Run full verification (TypeScript check + lint + production build) before marking work as complete. Use before committing or claiming a task is done.
---

Run the full verification suite for this Next.js project. All three must pass:

```bash
npx tsc --noEmit && npm run lint && npm run build
```

If any step fails:
1. Read the error output carefully
2. Fix the issue
3. Re-run the full suite from the beginning

Only report success when all three commands pass with zero errors.
