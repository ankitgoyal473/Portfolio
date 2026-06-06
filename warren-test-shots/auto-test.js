/**
 * Warren Page Auto-Test
 * Tries headless first with any saved auth state.
 * Falls back to non-headless with a 3-minute wait for manual OAuth.
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const DIR = 'D:\\2025-2030\\2026\\Claude Workspace\\Portfolio\\warren-test-shots';
const AUTH_FILE = path.join(DIR, 'auth-state.json');
const TARGET = 'https://portfolio-one-topaz-65.vercel.app/agents/warren';
const LOGIN = 'https://portfolio-one-topaz-65.vercel.app/login';

async function analyzeWarrenPage(page, context) {
  const url = page.url();
  console.log('\n--- Analyzing Warren page at:', url);
  await page.waitForTimeout(2500); // Wait for React hydration

  // Full page screenshot
  await page.screenshot({ path: path.join(DIR, 'premium-page.png'), fullPage: true });
  console.log('Saved: premium-page.png');

  // Deep analysis via page.evaluate
  const analysis = await page.evaluate(() => {
    // Pro badge
    let proBadge = { found: false, text: '', style: '' };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.includes('✦ Pro')) {
        const el = node.parentElement;
        proBadge = {
          found: true,
          text: el ? el.textContent.trim() : node.nodeValue,
          style: el ? el.getAttribute('style') || '' : ''
        };
        break;
      }
    }

    // Chatbar input analysis
    const textareas = Array.from(document.querySelectorAll('textarea'));
    const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
    const allInputs = [...textareas, ...inputs];
    let inputInfo = { found: false, enabled: false, placeholder: '', disabled: false, readOnly: false };
    if (allInputs.length > 0) {
      const el = allInputs[allInputs.length - 1];
      inputInfo = {
        found: true,
        enabled: !el.disabled && !el.readOnly,
        placeholder: el.placeholder,
        disabled: el.disabled,
        readOnly: el.readOnly,
      };
    }

    // Lock button
    let lockBtn = { found: false, text: '', ariaLabel: '' };
    const buttons = Array.from(document.querySelectorAll('button'));
    for (const btn of buttons) {
      const label = btn.getAttribute('aria-label') || '';
      const text = btn.textContent || '';
      if (label.toLowerCase().includes('upgrade') || label.toLowerCase().includes('lock')) {
        lockBtn = { found: true, text: text.trim(), ariaLabel: label };
        break;
      }
      // Also check for Lock icon SVG inside button
      const svgs = btn.querySelectorAll('svg');
      if (svgs.length > 0) {
        const parentClass = btn.className || '';
        if (parentClass.includes('error') || parentClass.includes('red')) {
          lockBtn = { found: true, text: text.trim(), ariaLabel: label };
          break;
        }
      }
    }

    // "Upgrade to continue..." in placeholder
    const upgradeInPlaceholder = allInputs.some(el =>
      el.placeholder && el.placeholder.toLowerCase().includes('upgrade')
    );

    // "Limit reached" text
    const limitReachedText = document.body.innerText.includes('Limit reached');

    // Send button
    let sendBtn = { found: false, enabled: false, ariaLabel: '' };
    for (const btn of buttons) {
      const label = btn.getAttribute('aria-label') || '';
      if (label.toLowerCase().includes('send') || btn.type === 'submit') {
        sendBtn = { found: true, enabled: !btn.disabled, ariaLabel: label };
        break;
      }
    }

    // Check for greeting message (sign of successful auth)
    const greeting = document.body.innerText.includes('Good morning') ||
                     document.body.innerText.includes('Good afternoon') ||
                     document.body.innerText.includes('Good evening') ||
                     document.body.innerText.includes('WARRen');

    return { proBadge, inputInfo, lockBtn, upgradeInPlaceholder, limitReachedText, sendBtn, greeting };
  });

  console.log('\n--- ANALYSIS RESULTS ---');
  console.log('Greeting visible (auth confirmed):', analysis.greeting);
  console.log('✦ Pro badge:', JSON.stringify(analysis.proBadge));
  console.log('Chatbar input:', JSON.stringify(analysis.inputInfo));
  console.log('Lock button:', JSON.stringify(analysis.lockBtn));
  console.log('"Upgrade to continue..." placeholder:', analysis.upgradeInPlaceholder);
  console.log('"Limit reached" text:', analysis.limitReachedText);
  console.log('Send button:', JSON.stringify(analysis.sendBtn));

  // Chatbar screenshot — scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);

  const vp = await page.viewportSize();
  const chatbarHeight = 120;
  const chatbarY = vp ? Math.max(0, vp.height - chatbarHeight) : 700;

  await page.screenshot({
    path: path.join(DIR, 'premium-chatbar.png'),
    fullPage: false,
    clip: { x: 0, y: chatbarY, width: vp?.width ?? 1400, height: chatbarHeight + 20 }
  });
  console.log('Saved: premium-chatbar.png');

  // Type CDSL if input is enabled
  let submitActive = false;
  if (analysis.inputInfo.enabled) {
    const inputSel = 'textarea, input[type="text"]';
    const inputEl = page.locator(inputSel).last();
    await inputEl.click();
    await inputEl.fill('CDSL');
    await page.waitForTimeout(400);

    submitActive = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      for (const btn of btns) {
        const label = btn.getAttribute('aria-label') || '';
        if (label.toLowerCase().includes('send') && !btn.disabled) return true;
        if (btn.type === 'submit' && !btn.disabled) return true;
      }
      return false;
    });

    console.log('CDSL typed. Submit button enabled:', submitActive);
  } else {
    console.log('Input disabled — skipping CDSL typing');
  }

  await page.screenshot({ path: path.join(DIR, 'premium-cdsl.png'), fullPage: true });
  console.log('Saved: premium-cdsl.png');

  // Print final report
  console.log('\n=== FINAL TEST REPORT ===');
  console.log('Page URL:', url);
  console.log('Auth / greeting visible:', analysis.greeting);
  console.log('✦ Pro badge visible:', analysis.proBadge.found);
  if (analysis.proBadge.found) console.log('  Pro badge text:', analysis.proBadge.text, '| color style:', analysis.proBadge.style);
  console.log('Chatbar input ENABLED:', analysis.inputInfo.enabled);
  console.log('Chatbar placeholder:', analysis.inputInfo.placeholder);
  console.log('Lock/upgrade button present:', analysis.lockBtn.found, analysis.lockBtn.found ? `(${analysis.lockBtn.ariaLabel})` : '');
  console.log('"Upgrade to continue..." in placeholder:', analysis.upgradeInPlaceholder);
  console.log('"Limit reached" text:', analysis.limitReachedText);
  console.log('CDSL submission possible:', analysis.inputInfo.enabled && submitActive);
  console.log('\nScreenshots:');
  console.log('  D:\\2025-2030\\2026\\Claude Workspace\\Portfolio\\warren-test-shots\\premium-page.png');
  console.log('  D:\\2025-2030\\2026\\Claude Workspace\\Portfolio\\warren-test-shots\\premium-chatbar.png');
  console.log('  D:\\2025-2030\\2026\\Claude Workspace\\Portfolio\\warren-test-shots\\premium-cdsl.png');
}

async function run() {
  const authExists = fs.existsSync(AUTH_FILE);
  console.log('Auth state file exists:', authExists);

  // === ATTEMPT 1: Headless with stored auth ===
  if (authExists) {
    console.log('\n=== Attempt 1: Headless with stored auth ===');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      storageState: AUTH_FILE,
      viewport: { width: 1400, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 30000 });
    const url = page.url();
    console.log('Landed at:', url);

    if (!url.includes('/login')) {
      await analyzeWarrenPage(page, context);
      await browser.close();
      return;
    }

    console.log('Headless auth state expired or invalid. Falling back...');
    await browser.close();
  }

  // === ATTEMPT 2: Non-headless, wait for manual OAuth ===
  console.log('\n=== Attempt 2: NON-HEADLESS — waiting for manual Google OAuth ===');
  console.log('>>> Please log in with ankitgoyal473@gmail.com in the browser window');
  console.log('>>> Waiting up to 3 minutes...\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  // Navigate to login
  await page.goto(LOGIN, { waitUntil: 'domcontentloaded' });

  // Screenshot of login page
  await page.screenshot({ path: path.join(DIR, 'premium-page.png'), fullPage: true });
  console.log('Login page screenshot saved as premium-page.png');

  try {
    // Wait for user to leave /login
    await page.waitForURL(url => !url.href.includes('/login'), { timeout: 180000 });
    console.log('Left login page. Current URL:', page.url());

    // Navigate to Warren if not already there
    if (!page.url().includes('/agents/warren')) {
      await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 30000 });
    }

    // Save auth state
    await context.storageState({ path: AUTH_FILE });
    console.log('Auth state saved:', AUTH_FILE);

    await analyzeWarrenPage(page, context);

  } catch (err) {
    console.log('\nTimeout or error:', err.message);
    console.log('Current URL:', page.url());
    await page.screenshot({ path: path.join(DIR, 'premium-page.png'), fullPage: true }).catch(() => {});

    console.log('\n=== RESULT ===');
    console.log('Status: NEEDS MANUAL OAUTH LOGIN');
    console.log('No auth state was found and the 3-minute window expired without login.');
    console.log('Please run this script again and complete the Google OAuth flow in the browser.');
    console.log('Login page screenshot: premium-page.png');
  } finally {
    await browser.close();
  }
}

run().catch(console.error);
