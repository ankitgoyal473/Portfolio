const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = 'D:\\2025-2030\\2026\\Claude Workspace\\Portfolio\\warren-test-shots';
const AUTH_STATE_PATH = path.join(SCREENSHOTS_DIR, 'auth-state.json');
const TARGET_URL = 'https://portfolio-one-topaz-65.vercel.app/agents/warren';

async function run() {
  const authStateExists = fs.existsSync(AUTH_STATE_PATH);
  console.log('Auth state exists:', authStateExists);

  // First attempt: headless with stored cookies if available
  let browser, context, page;

  try {
    browser = await chromium.launch({ headless: true });

    const contextOptions = {
      viewport: { width: 1400, height: 900 },
    };

    if (authStateExists) {
      contextOptions.storageState = AUTH_STATE_PATH;
      console.log('Using stored auth state');
    }

    context = await browser.newContext(contextOptions);
    page = await context.newPage();

    console.log('Navigating to', TARGET_URL);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });

    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Check if redirected to login
    if (currentUrl.includes('/login') || currentUrl.includes('/auth') || currentUrl.includes('/signin')) {
      console.log('REDIRECTED TO LOGIN — needs authentication');
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'premium-page.png'),
        fullPage: true,
      });
      console.log('Screenshot saved: premium-page.png');

      // Also close headless and try non-headless to allow manual OAuth
      await browser.close();

      console.log('\n--- Launching NON-HEADLESS browser for manual OAuth ---');
      browser = await chromium.launch({ headless: false });
      context = await browser.newContext({
        viewport: { width: 1400, height: 900 },
      });
      page = await context.newPage();

      await page.goto('https://portfolio-one-topaz-65.vercel.app/login', { waitUntil: 'domcontentloaded' });

      // Take screenshot of login page
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'premium-page.png'),
        fullPage: true,
      });
      console.log('Login page screenshot saved');

      // Wait up to 2 minutes for user to complete OAuth
      console.log('Waiting for user to complete OAuth login (up to 2 minutes)...');
      try {
        await page.waitForURL('**/agents/warren', { timeout: 120000 });
        console.log('Successfully redirected to Warren page after login!');

        // Save auth state for next time
        await context.storageState({ path: AUTH_STATE_PATH });
        console.log('Auth state saved to:', AUTH_STATE_PATH);
      } catch (e) {
        const afterLoginUrl = page.url();
        console.log('Timeout waiting for Warren page. Current URL:', afterLoginUrl);

        // If we're on some authenticated page, navigate to Warren
        if (!afterLoginUrl.includes('/login')) {
          await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
          await context.storageState({ path: AUTH_STATE_PATH });
          console.log('Navigated to Warren and saved auth state');
        } else {
          console.log('Still on login page — OAuth not completed');
          await browser.close();

          console.log('\n=== REPORT ===');
          console.log('Status: NEEDS MANUAL LOGIN');
          console.log('The page requires Google OAuth. Auth state was not found.');
          console.log('Screenshots saved:', path.join(SCREENSHOTS_DIR, 'premium-page.png'));
          return;
        }
      }
    }

    // We should now be on the Warren page — take screenshots and analyze
    const warrenUrl = page.url();
    console.log('On Warren page at:', warrenUrl);

    // Full page screenshot
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'premium-page.png'),
      fullPage: true,
    });
    console.log('Full page screenshot saved: premium-page.png');

    // Wait for chatbar to be visible
    await page.waitForTimeout(2000);

    // Check for Pro badge
    const proBadge = await page.locator('text=✦ Pro').first().isVisible().catch(() => false);
    const proBadge2 = await page.locator('[class*="pro"]').count().catch(() => 0);
    const proBadgeText = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        if (el.textContent && el.textContent.includes('✦ Pro') && el.children.length < 3) {
          return { found: true, text: el.textContent.trim(), tag: el.tagName, class: el.className };
        }
      }
      return { found: false };
    });
    console.log('Pro badge check:', JSON.stringify(proBadgeText));

    // Check chatbar input
    const inputEnabled = await page.locator('textarea, input[type="text"]').first().isEnabled().catch(() => false);
    const inputPlaceholder = await page.locator('textarea, input[type="text"]').first().getAttribute('placeholder').catch(() => 'N/A');
    console.log('Input enabled:', inputEnabled);
    console.log('Input placeholder:', inputPlaceholder);

    // Check for lock icon
    const lockIcon = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        if (el.textContent) {
          const text = el.textContent.trim();
          if ((text.includes('lock') || text.includes('🔒') || text === '🔒') && el.children.length < 2) {
            return { found: true, text, tag: el.tagName };
          }
        }
      }
      // Check for SVG lock icons
      const svgs = document.querySelectorAll('svg');
      for (const svg of svgs) {
        const parent = svg.closest('button');
        if (parent) {
          const label = parent.getAttribute('aria-label') || parent.textContent.trim();
          if (label.toLowerCase().includes('lock') || label.toLowerCase().includes('upgrade')) {
            return { found: true, text: label, tag: 'button with svg' };
          }
        }
      }
      return { found: false };
    });
    console.log('Lock icon check:', JSON.stringify(lockIcon));

    // Check for "Upgrade to continue" text
    const upgradeText = await page.locator('text=Upgrade to continue').isVisible().catch(() => false);
    console.log('Upgrade to continue visible:', upgradeText);

    // Chatbar close-up screenshot
    const chatbarSelectors = [
      '[class*="chat"]',
      '[class*="input"]',
      'form',
      '[class*="message"]',
    ];

    let chatbarEl = null;
    for (const sel of chatbarSelectors) {
      const els = page.locator(sel);
      const count = await els.count();
      if (count > 0) {
        chatbarEl = els.last();
        break;
      }
    }

    // Take chatbar screenshot by scrolling to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'premium-chatbar.png'),
      fullPage: false,
      clip: {
        x: 0,
        y: Math.max(0, (await page.evaluate(() => window.innerHeight)) - 200),
        width: 1400,
        height: 200,
      },
    });
    console.log('Chatbar screenshot saved: premium-chatbar.png');

    // Try typing CDSL if input is enabled
    let submitActive = false;
    if (inputEnabled) {
      const inputEl = page.locator('textarea, input[type="text"]').first();
      await inputEl.click();
      await inputEl.fill('CDSL');
      await page.waitForTimeout(500);

      // Check submit button state
      const submitBtn = page.locator('button[type="submit"], button[aria-label*="send"], button[aria-label*="Send"]').first();
      submitActive = await submitBtn.isEnabled().catch(async () => {
        // Try finding any button near the input
        return await page.evaluate(() => {
          const buttons = document.querySelectorAll('button');
          for (const btn of buttons) {
            if (!btn.disabled && (btn.type === 'submit' || btn.closest('form'))) {
              return true;
            }
          }
          return false;
        });
      });

      console.log('Submit button active after typing CDSL:', submitActive);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'premium-cdsl.png'),
        fullPage: true,
      });
      console.log('CDSL screenshot saved: premium-cdsl.png');
    } else {
      // Still take the screenshot even if input is disabled
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'premium-cdsl.png'),
        fullPage: true,
      });
      console.log('Input disabled — CDSL screenshot saved showing disabled state');
    }

    // Final report
    console.log('\n=== TEST REPORT ===');
    console.log('URL:', warrenUrl);
    console.log('✦ Pro badge visible:', proBadgeText.found);
    if (proBadgeText.found) console.log('  Badge text:', proBadgeText.text);
    console.log('Chatbar enabled:', inputEnabled);
    console.log('Input placeholder:', inputPlaceholder);
    console.log('Lock/upgrade icon:', lockIcon.found);
    console.log('Upgrade to continue text:', upgradeText);
    console.log('CDSL submission possible:', inputEnabled && submitActive);
    console.log('Screenshots:');
    console.log(' - premium-page.png');
    console.log(' - premium-chatbar.png');
    console.log(' - premium-cdsl.png');

  } catch (err) {
    console.error('ERROR:', err.message);
    if (page) {
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'premium-page.png'),
        fullPage: true,
      }).catch(() => {});
    }
  } finally {
    if (browser) await browser.close();
  }
}

run().catch(console.error);
