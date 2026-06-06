// Authenticate via Supabase admin magic link → Playwright headless test
const { createClient } = require('@supabase/supabase-js');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SHOTS = path.join(__dirname, 'warren-test-shots');
if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS);

const SUPABASE_URL = 'https://dwcdzjhelmjjhsdcyrgc.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Y2R6amhlbG1qamhzZGN5cmdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAzMzE1MywiZXhwIjoyMDk1NjA5MTUzfQ.cY1uhX2hXLCnK6m_AgGmOOBWONoMvd8Zh6nB5ibp_-k';
const USER_EMAIL = 'ankitgoyal473@gmail.com';
const BASE = 'https://portfolio-one-topaz-65.vercel.app';

(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

  // Step 1: Generate magic link for the admin user
  console.log('Generating session for', USER_EMAIL, '...');
  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: USER_EMAIL,
  });
  if (linkErr || !linkData?.properties?.hashed_token) {
    console.error('Failed to generate link:', linkErr?.message || 'no token');
    process.exit(1);
  }

  const token = linkData.properties.hashed_token;
  const type = 'magiclink';
  console.log('Got token. Verifying OTP...');

  // Step 2: Verify OTP to get access_token + refresh_token
  const { data: sessionData, error: verifyErr } = await supabase.auth.verifyOtp({
    email: USER_EMAIL,
    token,
    type: 'email',
  });
  if (verifyErr || !sessionData?.session) {
    console.error('OTP verify failed:', verifyErr?.message || 'no session');
    // Try alternate token extraction from action_link
    console.log('action_link:', linkData.action_link?.slice(0, 100));
    process.exit(1);
  }

  const { access_token, refresh_token } = sessionData.session;
  console.log('Session obtained. Launching browser...');

  // Step 3: Launch headless Playwright, inject session into localStorage
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Navigate to the base URL first, then inject auth
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });

  // Inject Supabase session into localStorage
  await page.evaluate(({ url, access_token, refresh_token }) => {
    const key = `sb-${url.replace('https://', '').split('.')[0]}-auth-token`;
    // Actually use full project ref
    const projectRef = 'dwcdzjhelmjjhsdcyrgc';
    localStorage.setItem(`sb-${projectRef}-auth-token`, JSON.stringify({
      access_token,
      refresh_token,
      expires_in: 3600,
      token_type: 'bearer',
    }));
  }, { url: SUPABASE_URL, access_token, refresh_token });

  // Step 4: Navigate to Warren page
  console.log('Navigating to Warren page...');
  await page.goto(`${BASE}/agents/warren`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(3000);

  const url = page.url();
  console.log('Landed at:', url);

  if (url.includes('/login')) {
    console.log('Still redirecting to login — session injection may need server-side cookie');
    await page.screenshot({ path: `${SHOTS}/session-login.png`, fullPage: true });
    await browser.close();
    process.exit(0);
  }

  // Step 5: Take screenshot and check UI state
  await page.screenshot({ path: `${SHOTS}/session-warren.png`, fullPage: true });
  console.log('Screenshot: session-warren.png');

  const proBadge = await page.locator('text=✦ Pro').count();
  const proUnlimited = await page.locator('text=Unlimited').count();
  const placeholder = await page.locator('textarea').getAttribute('placeholder').catch(() => 'N/A');
  const disabled = await page.locator('textarea').getAttribute('disabled').catch(() => null);

  console.log('\n=== UI STATE ===');
  console.log('Pro badge (chatbar):', proBadge > 0 ? '✅ visible' : '❌ missing');
  console.log('Pro · Unlimited (sidebar):', proUnlimited > 0 ? '✅ visible' : '❌ missing');
  console.log('Chatbar placeholder:', placeholder);
  console.log('Chatbar disabled:', disabled !== null ? '❌ YES (locked)' : '✅ enabled');

  await browser.close();
})();
