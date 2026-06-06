/**
 * Step 1: Login capture script
 * Opens a NON-HEADLESS browser, navigates to /login, and waits for the user
 * to complete Google OAuth. Once on the Warren page, saves auth state to
 * auth-state.json and takes all required screenshots.
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = 'D:\\2025-2030\\2026\\Claude Workspace\\Portfolio\\warren-test-shots';
const AUTH_STATE_PATH = path.join(SCREENSHOTS_DIR, 'auth-state.json');
const TARGET_URL = 'https://portfolio-one-topaz-65.vercel.app/agents/warren';

async function run() {
  console.log('Launching NON-HEADLESS Chromium for manual Google OAuth...');
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: null, // Use full window
  });

  const page = await context.newPage();

  // Navigate to login page
  await page.goto('https://portfolio-one-topaz-65.vercel.app/login', {
    waitUntil: 'domcontentloaded',
  });

  console.log('\n>>> Browser is open. Please:');
  console.log('    1. Click "Continue with Google"');
  console.log('    2. Log in with ankitgoyal473@gmail.com');
  console.log('    3. Wait for the Warren page to load');
  console.log('\nScript will auto-continue once you reach /agents/warren');
  console.log('Waiting up to 3 minutes...\n');

  // Take login page screenshot immediately
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'login-page.png'),
    fullPage: true,
  });
  console.log('Login page screenshot saved.');

  try {
    // Wait for navigation to Warren page (or any authenticated page)
    await page.waitForURL((url) => !url.href.includes('/login'), {
      timeout: 180000,
    });

    const afterLoginUrl = page.url();
    console.log('After login URL:', afterLoginUrl);

    // If not on Warren page, navigate there
    if (!afterLoginUrl.includes('/agents/warren')) {
      console.log('Navigating to Warren page...');
      await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    }

    // Save auth state
    await context.storageState({ path: AUTH_STATE_PATH });
    console.log('Auth state saved to:', AUTH_STATE_PATH);

    // Wait for page to fully load
    await page.waitForTimeout(2000);

    // === SCREENSHOTS AND ANALYSIS ===

    // Full page screenshot
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'premium-page.png'),
      fullPage: true,
    });
    console.log('premium-page.png saved');

    // Analyze page
    const analysis = await page.evaluate(() => {
      const result = {
        proBadge: { found: false, text: '', element: '' },
        lockIcon: { found: false, text: '' },
        upgradeText: false,
        inputEnabled: false,
        inputPlaceholder: '',
        inputValue: '',
      };

      // Check for Pro badge
      const allEls = document.querySelectorAll('*');
      for (const el of allEls) {
        const text = el.childNodes.length <= 3 ? el.textContent.trim() : '';
        if (text.includes('✦ Pro') || text.includes('Pro')) {
          if (el.children.length <= 2 && text.length < 20) {
            result.proBadge = { found: true, text, element: el.tagName + '.' + el.className };
            break;
          }
        }
      }

      // Check for upgrade/lock text
      const bodyText = document.body.innerText;
      result.upgradeText = bodyText.includes('Upgrade to continue');

      // Check for lock via SVG or button
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        const label = (btn.getAttribute('aria-label') || btn.textContent || '').toLowerCase();
        if (label.includes('lock') || label.includes('upgrade') || label.includes('premium')) {
          result.lockIcon = { found: true, text: btn.textContent.trim() || btn.getAttribute('aria-label') };
          break;
        }
      }

      // Check input
      const inputs = document.querySelectorAll('textarea, input[type="text"]');
      if (inputs.length > 0) {
        const inp = inputs[inputs.length - 1]; // usually the last one is chatbar
        result.inputEnabled = !inp.disabled && !inp.readOnly;
        result.inputPlaceholder = inp.placeholder || '';
        result.inputValue = inp.value || '';
      }

      return result;
    });

    console.log('\n=== PAGE ANALYSIS ===');
    console.log('✦ Pro badge:', JSON.stringify(analysis.proBadge));
    console.log('Lock icon:', JSON.stringify(analysis.lockIcon));
    console.log('"Upgrade to continue" text:', analysis.upgradeText);
    console.log('Input enabled:', analysis.inputEnabled);
    console.log('Input placeholder:', analysis.inputPlaceholder);

    // Chatbar screenshot (bottom area)
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'premium-chatbar.png'),
      fullPage: false,
    });
    console.log('premium-chatbar.png saved');

    // Type CDSL if input is enabled
    let submitActive = false;
    if (analysis.inputEnabled) {
      const inputEl = page.locator('textarea, input[type="text"]').last();
      await inputEl.click();
      await inputEl.fill('CDSL');
      await page.waitForTimeout(500);

      // Check submit button
      submitActive = await page.evaluate(() => {
        const btns = document.querySelectorAll('button[type="submit"], button');
        for (const btn of btns) {
          if (!btn.disabled) {
            const label = (btn.getAttribute('aria-label') || btn.textContent || '').toLowerCase();
            if (label.includes('send') || label.includes('submit') || label.includes('analyze') || btn.type === 'submit') {
              return true;
            }
          }
        }
        return false;
      });

      console.log('Submit button active after typing CDSL:', submitActive);
    }

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'premium-cdsl.png'),
      fullPage: true,
    });
    console.log('premium-cdsl.png saved');

    // Final report
    console.log('\n=== FINAL TEST REPORT ===');
    console.log('URL:', page.url());
    console.log('✦ Pro badge visible:', analysis.proBadge.found, analysis.proBadge.found ? `("${analysis.proBadge.text}")` : '');
    console.log('Chatbar input enabled:', analysis.inputEnabled);
    console.log('Input placeholder:', analysis.inputPlaceholder || '(none)');
    console.log('Lock/upgrade element found:', analysis.lockIcon.found);
    console.log('"Upgrade to continue" text present:', analysis.upgradeText);
    console.log('CDSL submission possible:', analysis.inputEnabled && submitActive);
    console.log('\nScreenshots saved:');
    console.log(' - premium-page.png');
    console.log(' - premium-chatbar.png');
    console.log(' - premium-cdsl.png');

  } catch (err) {
    console.error('Error or timeout:', err.message);
    const url = page.url();
    console.log('Current URL at error:', url);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'premium-page.png'),
      fullPage: true,
    }).catch(() => {});
    console.log('Error screenshot saved to premium-page.png');
  } finally {
    await browser.close();
    console.log('\nBrowser closed.');
  }
}

run().catch(console.error);
