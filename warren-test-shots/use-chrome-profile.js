/**
 * Try using the existing MCP Chrome profile which may have Google auth cookies.
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

const DIR = 'D:\\2025-2030\\2026\\Claude Workspace\\Portfolio\\warren-test-shots';
const AUTH_FILE = path.join(DIR, 'auth-state.json');
const TARGET = 'https://portfolio-one-topaz-65.vercel.app/agents/warren';

// MCP Chrome profiles to try
const MCP_PROFILES = [
  path.join(process.env.LOCALAPPDATA, 'ms-playwright', 'mcp-chrome-5eb8cf2'),
  path.join(process.env.LOCALAPPDATA, 'ms-playwright', 'mcp-chrome-b94fdee'),
];

async function testProfile(profileDir) {
  console.log('\nTrying profile:', profileDir);

  let browser;
  try {
    browser = await chromium.launchPersistentContext(profileDir, {
      headless: true,
      viewport: { width: 1400, height: 900 },
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 20000 });
    const url = page.url();
    console.log('Landed at:', url);

    if (!url.includes('/login')) {
      console.log('SUCCESS — authenticated via profile!');

      // Save auth state for next use
      await browser.storageState({ path: AUTH_FILE });
      console.log('Auth state saved:', AUTH_FILE);

      // Take screenshots
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(DIR, 'premium-page.png'), fullPage: true });
      console.log('Saved: premium-page.png');

      const analysis = await page.evaluate(() => {
        let proBadge = { found: false, text: '' };
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          if (node.nodeValue && node.nodeValue.includes('✦ Pro')) {
            const el = node.parentElement;
            proBadge = { found: true, text: el ? el.textContent.trim() : '' };
            break;
          }
        }

        const textareas = Array.from(document.querySelectorAll('textarea'));
        const lastTA = textareas[textareas.length - 1];
        const inputInfo = lastTA ? {
          found: true, enabled: !lastTA.disabled, placeholder: lastTA.placeholder
        } : { found: false, enabled: false, placeholder: '' };

        const buttons = Array.from(document.querySelectorAll('button'));
        let lockBtn = { found: false, ariaLabel: '' };
        for (const btn of buttons) {
          const label = btn.getAttribute('aria-label') || '';
          if (label.toLowerCase().includes('upgrade') || label.toLowerCase().includes('lock')) {
            lockBtn = { found: true, ariaLabel: label };
            break;
          }
        }

        const limitReached = document.body.innerText.includes('Limit reached');
        return { proBadge, inputInfo, lockBtn, limitReached };
      });

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(DIR, 'premium-chatbar.png'), fullPage: false });

      let submitActive = false;
      if (analysis.inputInfo.enabled) {
        const inp = page.locator('textarea').last();
        await inp.click();
        await inp.fill('CDSL');
        await page.waitForTimeout(400);
        submitActive = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('button')).some(b =>
            (b.getAttribute('aria-label') || '').toLowerCase().includes('send') && !b.disabled
          );
        });
      }
      await page.screenshot({ path: path.join(DIR, 'premium-cdsl.png'), fullPage: true });

      console.log('\n=== TEST REPORT ===');
      console.log('✦ Pro badge:', analysis.proBadge.found, analysis.proBadge.text);
      console.log('Input enabled:', analysis.inputInfo.enabled);
      console.log('Placeholder:', analysis.inputInfo.placeholder);
      console.log('Lock button:', analysis.lockBtn.found);
      console.log('Limit reached:', analysis.limitReached);
      console.log('CDSL submittable:', analysis.inputInfo.enabled && submitActive);

      await browser.close();
      return true;
    }

    await browser.close();
    return false;
  } catch (err) {
    console.log('Profile error:', err.message);
    if (browser) await browser.close().catch(() => {});
    return false;
  }
}

async function run() {
  for (const profile of MCP_PROFILES) {
    if (fs.existsSync(profile)) {
      const success = await testProfile(profile);
      if (success) return;
    }
  }

  console.log('\nNo valid Chrome profile found with active session.');
  console.log('Please run: node save-login.js');
  console.log('(A browser window will open — log in, then press ENTER)');
}

run().catch(console.error);
