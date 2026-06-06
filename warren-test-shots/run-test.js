/**
 * STEP 2: Run this after save-login.js has created auth-state.json
 *
 *   node run-test.js
 *
 * Tests the Warren page in headless mode using stored auth.
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const DIR = 'D:\\2025-2030\\2026\\Claude Workspace\\Portfolio\\warren-test-shots';
const AUTH_FILE = path.join(DIR, 'auth-state.json');
const TARGET = 'https://portfolio-one-topaz-65.vercel.app/agents/warren';

async function run() {
  if (!fs.existsSync(AUTH_FILE)) {
    console.error('ERROR: auth-state.json not found. Run save-login.js first.');
    process.exit(1);
  }

  console.log('Using auth state from:', AUTH_FILE);
  const browser = await chromium.launch({ headless: false }); // false so you can see it
  const context = await browser.newContext({
    storageState: AUTH_FILE,
    viewport: { width: 1400, height: 900 },
  });
  const page = await context.newPage();

  console.log('Navigating to Warren...');
  await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 30000 });
  const url = page.url();
  console.log('Landed at:', url);

  if (url.includes('/login')) {
    console.log('Auth state expired — please run save-login.js again');
    await page.screenshot({ path: path.join(DIR, 'premium-page.png'), fullPage: true });
    await browser.close();
    return;
  }

  // Wait for React hydration
  await page.waitForTimeout(3000);

  // Full page screenshot
  await page.screenshot({ path: path.join(DIR, 'premium-page.png'), fullPage: true });
  console.log('Saved: premium-page.png');

  const analysis = await page.evaluate(() => {
    let proBadge = { found: false, text: '', style: '' };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.includes('✦ Pro')) {
        const el = node.parentElement;
        proBadge = {
          found: true,
          text: el ? el.textContent.trim() : node.nodeValue,
          style: el ? (el.getAttribute('style') || '') : ''
        };
        break;
      }
    }

    const textareas = Array.from(document.querySelectorAll('textarea'));
    const lastInput = textareas[textareas.length - 1];
    const inputInfo = lastInput ? {
      found: true,
      enabled: !lastInput.disabled && !lastInput.readOnly,
      placeholder: lastInput.placeholder,
      disabled: lastInput.disabled,
    } : { found: false, enabled: false, placeholder: '' };

    const buttons = Array.from(document.querySelectorAll('button'));
    let lockBtn = { found: false, ariaLabel: '', hasRedBg: false };
    for (const btn of buttons) {
      const label = btn.getAttribute('aria-label') || '';
      if (label.toLowerCase().includes('upgrade') || label.toLowerCase().includes('lock')) {
        lockBtn = {
          found: true,
          ariaLabel: label,
          hasRedBg: btn.className.includes('error') || getComputedStyle(btn).backgroundColor.includes('rgb(239')
        };
        break;
      }
    }

    let sendBtn = { found: false, enabled: false };
    for (const btn of buttons) {
      const label = btn.getAttribute('aria-label') || '';
      if (label.toLowerCase().includes('send')) {
        sendBtn = { found: true, enabled: !btn.disabled };
        break;
      }
    }

    const greeting = document.body.innerText.includes('WARRen') ||
      document.body.innerText.includes('Good morning') ||
      document.body.innerText.includes('Good afternoon') ||
      document.body.innerText.includes('Good evening');

    const limitReached = document.body.innerText.includes('Limit reached');
    const upgradeInPlaceholder = inputInfo.placeholder.toLowerCase().includes('upgrade');

    return { proBadge, inputInfo, lockBtn, sendBtn, greeting, limitReached, upgradeInPlaceholder };
  });

  // Chatbar close-up
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(DIR, 'premium-chatbar.png'), fullPage: false });
  console.log('Saved: premium-chatbar.png');

  // Type CDSL
  let submitActive = false;
  if (analysis.inputInfo.enabled) {
    const inp = page.locator('textarea').last();
    await inp.click();
    await inp.fill('CDSL');
    await page.waitForTimeout(500);
    submitActive = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      for (const b of btns) {
        if ((b.getAttribute('aria-label') || '').toLowerCase().includes('send') && !b.disabled) return true;
      }
      return false;
    });
  }

  await page.screenshot({ path: path.join(DIR, 'premium-cdsl.png'), fullPage: true });
  console.log('Saved: premium-cdsl.png');

  console.log('\n=== TEST REPORT ===');
  console.log('URL:', url);
  console.log('Authenticated (greeting visible):', analysis.greeting);
  console.log('✦ Pro badge:', analysis.proBadge.found, analysis.proBadge.found ? `| "${analysis.proBadge.text}" | style: ${analysis.proBadge.style}` : '');
  console.log('Chatbar ENABLED:', analysis.inputInfo.enabled);
  console.log('Placeholder:', analysis.inputInfo.placeholder);
  console.log('"Upgrade to continue..." placeholder:', analysis.upgradeInPlaceholder);
  console.log('"Limit reached" text:', analysis.limitReached);
  console.log('Lock button:', analysis.lockBtn.found, analysis.lockBtn.found ? analysis.lockBtn.ariaLabel : '');
  console.log('CDSL submittable:', analysis.inputInfo.enabled && submitActive);

  await browser.close();
}

run().catch(console.error);
