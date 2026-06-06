// Screenshot the current Warren page using your Chrome session
// Closes Chrome first if open, uses profile to stay logged in
const { chromium } = require('playwright');
const path = require('path');
const SHOTS = path.join(__dirname, 'warren-test-shots');

(async () => {
  const browser = await chromium.launchPersistentContext(
    'C:\\Users\\ankit\\AppData\\Local\\Google\\Chrome\\User Data',
    {
      channel: 'chrome',
      headless: false,
      viewport: { width: 1280, height: 900 },
      args: ['--profile-directory=Default'],
    }
  );

  const page = await browser.newPage();
  console.log('Navigating to Warren page...');
  await page.goto('https://portfolio-one-topaz-65.vercel.app/agents/warren', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  const url = page.url();
  console.log('Landed at:', url);

  if (url.includes('/login')) {
    console.log('Not logged in — taking login screenshot');
    await page.screenshot({ path: `${SHOTS}/live-login.png`, fullPage: true });
    await browser.close();
    return;
  }

  // Wait for page to settle (subscription check runs ~1s)
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SHOTS}/live-warren-page.png`, fullPage: true });
  console.log('📷 live-warren-page.png');

  // Check Pro badge
  const pro = await page.locator('text=✦ Pro').count();
  const placeholder = await page.locator('textarea').getAttribute('placeholder').catch(() => 'N/A');
  const disabled = await page.locator('textarea').getAttribute('disabled').catch(() => null);
  console.log('Pro badge:', pro > 0 ? 'YES ✅' : 'NO ❌');
  console.log('Chatbar placeholder:', placeholder);
  console.log('Chatbar disabled:', disabled !== null ? 'YES ❌' : 'NO ✅');

  // Scroll to bottom to capture any existing results
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/live-warren-bottom.png`, fullPage: true });
  console.log('📷 live-warren-bottom.png');

  await browser.close();
  console.log('Done.');
})().catch(e => console.error('Error:', e.message));
