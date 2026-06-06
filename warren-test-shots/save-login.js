/**
 * STEP 1: Run this script ONCE to save your Google OAuth login state.
 *
 *   node save-login.js
 *
 * A Chrome window will open. Log in with ankitgoyal473@gmail.com.
 * Once you land on the Warren page, press ENTER in this terminal.
 * The auth state will be saved to auth-state.json.
 *
 * Then run: node run-test.js
 */
const { chromium } = require('playwright');
const path = require('path');
const readline = require('readline');

const DIR = 'D:\\2025-2030\\2026\\Claude Workspace\\Portfolio\\warren-test-shots';
const AUTH_FILE = path.join(DIR, 'auth-state.json');

async function run() {
  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  await page.goto('https://portfolio-one-topaz-65.vercel.app/login');
  console.log('\n>>> Browser opened. Log in with ankitgoyal473@gmail.com');
  console.log('>>> Once you see the Warren page (or any post-login page), press ENTER here.\n');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise(resolve => rl.question('Press ENTER after login...', () => { rl.close(); resolve(); }));

  await context.storageState({ path: AUTH_FILE });
  console.log('Auth state saved to:', AUTH_FILE);
  console.log('Now run: node run-test.js');

  await browser.close();
}

run().catch(console.error);
