---
name: dev
description: Start the dev server and verify UI changes visually in the browser. Use after making frontend changes to confirm they look correct.
---

Start the Next.js development server and verify UI changes:

1. Start the dev server in background:
```bash
npm run dev
```

2. Wait for "Ready" message, then open `http://localhost:3000` in the browser.

3. Navigate to the page that was changed and verify:
   - Layout renders correctly (no overflow, proper spacing)
   - Dark theme colors are consistent (background #0A0A0A, cards #1E1E1E, accent #E8D5B8)
   - Responsive: check at mobile (375px), tablet (768px), desktop (1280px)
   - Animations work (hover effects, typewriter, grid background)
   - No console errors

4. Report what you see. If there are visual issues, describe them and fix.

5. Stop the dev server when done.
