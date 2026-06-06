// Run CDSL analysis on the live Warren page with screenshots
// Usage: node run-warren-live.js
// A browser window will open — log in with Google if prompted, then sit back.

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'https://portfolio-one-topaz-65.vercel.app';
const SHOTS = path.join(__dirname, 'warren-test-shots');
const AUTH_FILE = path.join(SHOTS, 'auth-state.json');
if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS);

const shot = async (page, name) => {
  const p = path.join(SHOTS, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true });
  console.log(`  📷 ${name}.png`);
};

(async () => {
  const storageState = fs.existsSync(AUTH_FILE) ? AUTH_FILE : undefined;
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    ...(storageState ? { storageState } : {}),
  });
  const page = await ctx.newPage();

  // ── STEP 1: Navigate to Warren page ────────────────────────────────────────
  console.log('\n[1] Navigating to Warren page...');
  await page.goto(`${BASE}/agents/warren`, { waitUntil: 'networkidle' });

  // If on login page, wait for user to complete Google OAuth
  if (page.url().includes('/login')) {
    console.log('\n⚠  Login required. Please log in with Google in the browser window.');
    console.log('   Waiting up to 3 minutes...\n');
    await page.waitForURL(`${BASE}/agents/warren`, { timeout: 180000 });
    console.log('  ✅ Logged in!');
    // Save auth state for next run
    await ctx.storageState({ path: AUTH_FILE });
    console.log('  💾 Auth state saved for future runs.');
  } else {
    console.log('  ✅ Already logged in.');
  }

  // ── STEP 2: Wait for chat interface to load ────────────────────────────────
  console.log('\n[2] Waiting for chat interface...');
  await page.waitForSelector('textarea', { timeout: 15000 });
  await page.waitForTimeout(2000); // let subscription check complete

  await shot(page, 'live-01-loaded');
  console.log('  ✅ Chat interface loaded.');

  // Check for Pro badge
  const proBadge = await page.locator('text=✦ Pro').count();
  console.log(`  ${proBadge > 0 ? '✅' : '⚠ '} Pro badge: ${proBadge > 0 ? 'visible' : 'NOT visible (check premium grant)'}`);

  // Check if chatbar is enabled
  const inputDisabled = await page.locator('textarea').getAttribute('disabled');
  const placeholder = await page.locator('textarea').getAttribute('placeholder');
  console.log(`  ${inputDisabled === null ? '✅' : '❌'} Chatbar: ${inputDisabled === null ? 'enabled' : 'DISABLED'}`);
  console.log(`  📝 Placeholder: "${placeholder}"`);

  if (inputDisabled !== null) {
    console.log('\n  ❌ Chatbar is locked. Grant premium via /admin first.');
    await shot(page, 'live-02-locked');
    await browser.close();
    return;
  }

  // ── STEP 3: Type CDSL and submit ───────────────────────────────────────────
  console.log('\n[3] Typing CDSL...');
  await page.locator('textarea').click();
  await page.locator('textarea').fill('CDSL');
  await shot(page, 'live-02-typed');

  console.log('[4] Submitting...');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  await shot(page, 'live-03-submitted');

  // ── STEP 4: Wait for thinking log to appear ────────────────────────────────
  console.log('\n[5] Waiting for thinking log (✦ events)...');
  try {
    await page.waitForSelector('text=Fetching live price', { timeout: 30000 });
    console.log('  ✅ Thinking log started!');
    await shot(page, 'live-04-thinking');
  } catch {
    console.log('  ⚠  No thinking log visible yet (may still be starting)');
    await shot(page, 'live-04-no-thinking');
  }

  // ── STEP 5: Wait for first pillar card ────────────────────────────────────
  console.log('\n[6] Waiting for first pillar card (up to 15 min)...');
  let pillarFound = false;
  const deadline = Date.now() + 15 * 60 * 1000;

  while (Date.now() < deadline) {
    // Take a screenshot every 30s to capture progress
    const elapsed = Math.round((Date.now() - (deadline - 15*60*1000)) / 1000);
    process.stdout.write(`\r  ${elapsed}s elapsed...`);

    // Check for pillar cards
    const pillars = await page.locator('[data-pillar], .pillar-card, text=Technical Analysis, text=Fundamental Analysis').count();
    if (pillars > 0) {
      pillarFound = true;
      console.log(`\n  ✅ Pillar card appeared at ${elapsed}s`);
      break;
    }

    // Check for error
    const errorMsg = await page.locator('text=error, text=Error, text=failed').count();
    if (errorMsg > 0) {
      console.log(`\n  ⚠  Error message detected`);
      break;
    }

    await page.waitForTimeout(10000);
    if (elapsed % 60 < 10) {
      const n = Math.floor(elapsed / 60);
      await shot(page, `live-05-progress-${n}min`);
    }
  }

  await shot(page, 'live-06-after-pillars');

  // ── STEP 6: Wait for verdict ───────────────────────────────────────────────
  console.log('\n[7] Waiting for verdict card...');
  try {
    await page.waitForFunction(
      () => document.body.innerText.includes('HOLD') ||
            document.body.innerText.includes('BUY') ||
            document.body.innerText.includes('SELL') ||
            document.body.innerText.includes('ACCUMULATE') ||
            document.body.innerText.includes('AVOID'),
      { timeout: 5 * 60 * 1000 }
    );
    console.log('  ✅ Verdict card visible!');
  } catch {
    console.log('  ⚠  Verdict not yet visible');
  }

  await page.waitForTimeout(2000);
  await shot(page, 'live-07-verdict');

  // Final full-page screenshot
  await shot(page, 'live-08-final');

  console.log('\n══════════════════════════════════════');
  console.log('DONE. Screenshots saved to warren-test-shots/');
  console.log('══════════════════════════════════════\n');

  await browser.close();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
