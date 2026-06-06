/**
 * Check what Supabase tokens exist in the MCP Chrome profile's local storage.
 */
const { chromium } = require('playwright');
const path = require('path');

const MCP_PROFILE = path.join(process.env.LOCALAPPDATA, 'ms-playwright', 'mcp-chrome-5eb8cf2');

async function run() {
  let browser;
  try {
    browser = await chromium.launchPersistentContext(MCP_PROFILE, {
      headless: true,
      viewport: { width: 1400, height: 900 },
    });

    const page = await browser.newPage();

    // Navigate to the site to access its localStorage
    await page.goto('https://portfolio-one-topaz-65.vercel.app', {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });

    const storageData = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const val = localStorage.getItem(key);
          items[key] = val ? val.substring(0, 100) : null; // truncate for display
        }
      }
      return items;
    });

    console.log('LocalStorage keys:', Object.keys(storageData));

    const cookies = await browser.cookies('https://portfolio-one-topaz-65.vercel.app');
    console.log('Cookies for portfolio site:');
    cookies.forEach(c => {
      console.log(` ${c.name}: expires=${new Date(c.expires * 1000).toISOString()}, httpOnly=${c.httpOnly}`);
    });

  } finally {
    if (browser) await browser.close();
  }
}

run().catch(console.error);
