// Warren agent page test — runs headless via Playwright CLI
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE = 'https://portfolio-one-topaz-65.vercel.app';
const RAILWAY = 'https://warren-agent-production.up.railway.app';
const SHOTS = path.join(__dirname, 'warren-test-shots');

if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS);

const log = (tag, msg) => console.log(`[${tag}] ${msg}`);
const shot = async (page, name) => {
  const p = path.join(SHOTS, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true });
  log('📷', `${name}.png`);
  return p;
};

// Minimal HTTP GET without Playwright (for header inspection)
function httpGet(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      resolve({ status: res.statusCode, headers: res.headers });
      res.resume();
    });
    req.on('error', () => resolve({ status: 0, headers: {} }));
    req.end();
  });
}

// Minimal HTTP POST
function httpPost(url, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const req = https.request(
      { hostname: u.hostname, path: u.pathname, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
      (res) => {
        let raw = '';
        res.on('data', (c) => raw += c);
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: raw }));
      }
    );
    req.on('error', () => resolve({ status: 0, headers: {}, body: '' }));
    req.write(data);
    req.end();
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const finding = (emoji, label, detail) => {
    results.push({ emoji, label, detail });
    console.log(`  ${emoji} ${label}: ${detail}`);
  };

  // ── TEST 1: Unauthenticated /agents/warren → redirect ────────────────────
  log('TEST 1', 'Unauthenticated /agents/warren → redirect');
  const ctx1 = await browser.newContext();
  const p1 = await ctx1.newPage();
  const resp1 = await p1.goto(`${BASE}/agents/warren`, { waitUntil: 'networkidle' });
  finding(resp1.url().includes('/login') ? '✅' : '❌',
    'Warren page → redirect to login', `landed at ${resp1.url()}`);
  await shot(p1, '01-unauth-redirect');
  await ctx1.close();

  // ── TEST 2: Login page UI ─────────────────────────────────────────────────
  log('TEST 2', 'Login page UI');
  const ctx2 = await browser.newContext();
  const p2 = await ctx2.newPage();
  await p2.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  const googleBtn = await p2.locator('button:has-text("Continue with Google")').count();
  // Tagline spans two elements — check each word separately
  const tagline1 = await p2.locator('text=Your AI squad grows').count();
  const tagline2 = await p2.locator('text=with your ambition').count();
  const agentOrbs = await p2.locator('text=Warren').count();
  finding(googleBtn > 0 ? '✅' : '❌', 'Google OAuth button', googleBtn > 0 ? 'present' : 'MISSING');
  finding((tagline1 > 0 || tagline2 > 0) ? '✅' : '❌', 'Brand tagline', (tagline1 > 0 || tagline2 > 0) ? 'present' : 'MISSING');
  finding(agentOrbs > 0 ? '✅' : '❌', 'Agent orbs on login panel', agentOrbs > 0 ? 'visible' : 'MISSING');
  await shot(p2, '02-login-page');
  await ctx2.close();

  // ── TEST 3: Auth-gated routes behave correctly ─────────────────────────────
  log('TEST 3', 'Auth gates (/agents and /dashboard redirect)');
  const ctx3 = await browser.newContext();
  const p3 = await ctx3.newPage();
  for (const route of ['/agents', '/dashboard', '/agents/warren']) {
    const r = await p3.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    const redirected = r.url().includes('/login');
    finding(redirected ? '✅' : '❌', `${route} → /login`, redirected ? 'correctly redirected' : `STAYED at ${r.url()}`);
  }
  await ctx3.close();

  // ── TEST 4: Public nav pages load ─────────────────────────────────────────
  log('TEST 4', 'Public nav pages');
  const navPages = [
    { url: '/projects', label: 'Projects' },
    { url: '/mcp', label: 'MCP page' },
    { url: '/tools', label: 'Tools page' },
    { url: '/hire', label: 'Hire page' },
  ];
  const ctx4 = await browser.newContext();
  const p4 = await ctx4.newPage();
  for (const nav of navPages) {
    const r = await p4.goto(`${BASE}${nav.url}`, { waitUntil: 'networkidle' });
    const ok = r.status() === 200 && !r.url().includes('/login');
    finding(ok ? '✅' : '❌', nav.label, `${r.status()} at ${r.url()}`);
  }
  await ctx4.close();

  // ── TEST 5: Stream API — now returns 401 JSON (not 307) ───────────────────
  log('TEST 5', 'Stream route unauthenticated → 401 JSON (not 307)');
  const streamResp = await httpPost(`${BASE}/api/agents/warren/stream`, { ticker: 'INFY' });
  finding(streamResp.status === 401 ? '✅' : '❌',
    'Unauthenticated stream → 401', `got ${streamResp.status}, body: ${streamResp.body.slice(0, 80)}`);
  finding(!streamResp.body.includes('<!DOCTYPE') ? '✅' : '❌',
    'Response is JSON (not HTML)', streamResp.body.slice(0, 60));

  // ── TEST 6: Homepage renders ───────────────────────────────────────────────
  log('TEST 6', 'Homepage');
  const ctx6 = await browser.newContext();
  const p6 = await ctx6.newPage();
  await p6.goto(BASE, { waitUntil: 'networkidle' });
  const heroText = await p6.locator('h1, h2').first().textContent().catch(() => '');
  const statsCount = await p6.locator('text=20+').count();
  finding(heroText.length > 0 ? '✅' : '❌', 'Homepage hero', heroText.trim().slice(0, 60));
  finding(statsCount > 0 ? '✅' : '❌', 'Stats section visible', '20+ stat present');
  await shot(p6, '06-homepage');
  await ctx6.close();

  // ── TEST 7: Mobile viewport ────────────────────────────────────────────────
  log('TEST 7', 'Mobile viewport (390×844)');
  const ctx7 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p7 = await ctx7.newPage();
  await p7.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  const mobileGoogle = await p7.locator('button:has-text("Continue with Google")').count();
  finding(mobileGoogle > 0 ? '✅' : '❌', 'Mobile: Google button visible', mobileGoogle > 0 ? 'yes' : 'MISSING');
  await shot(p7, '07-mobile-login');
  await ctx7.close();

  // ── TEST 8: Railway health ─────────────────────────────────────────────────
  log('TEST 8', 'Railway microservice health');
  const ctx8 = await browser.newContext();
  const p8 = await ctx8.newPage();
  const healthResp = await p8.goto(`${RAILWAY}/health`, { waitUntil: 'networkidle' });
  const healthBody = await p8.textContent('body');
  try {
    const json = JSON.parse(healthBody);
    finding(json.status === 'ok' ? '✅' : '❌', 'Railway /health', JSON.stringify(json));
  } catch {
    finding('❌', 'Railway /health', `non-JSON: ${healthBody.slice(0, 80)}`);
  }
  await ctx8.close();

  // ── TEST 9: Railway — empty ticker gives clear message ─────────────────────
  log('TEST 9', 'Railway: empty ticker → clear error message');
  const emptyResp = await httpPost(`${RAILWAY}/analyze`, { ticker: '', user_id: 'test' });
  finding(emptyResp.body.includes('Please enter a ticker') ? '✅' : '❌',
    'Empty ticker → clear message', emptyResp.body.slice(0, 120));

  // ── TEST 10: Railway — invalid ticker gives branded message ────────────────
  log('TEST 10', 'Railway: invalid ticker → branded error');
  const invalidResp = await httpPost(`${RAILWAY}/analyze`, { ticker: 'FAKEXYZ999', user_id: 'test' });
  finding(invalidResp.body.includes('WARRen') ? '✅' : '❌',
    'Invalid ticker → WARRen branded error', invalidResp.body.slice(0, 120));

  // ── TEST 11: Railway — valid ticker starts streaming (credits check) ───────
  log('TEST 11', 'Railway: valid ticker starts analysis (credits alive)');
  // Use a short timeout — just need to see keepalive or data (not a credit error)
  const keepaliveCheck = await new Promise((resolve) => {
    const u = new URL(`${RAILWAY}/analyze`);
    const body = JSON.stringify({ ticker: 'HDFC', user_id: 'test-credits-check' });
    const req = https.request(
      { hostname: u.hostname, path: u.pathname, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
      (res) => {
        let got = '';
        const timer = setTimeout(() => { req.destroy(); resolve(got); }, 20000);
        res.on('data', (c) => {
          got += c;
          if (got.includes('keepalive') || got.includes('event:')) {
            clearTimeout(timer);
            req.destroy();
            resolve(got);
          }
        });
        res.on('end', () => { clearTimeout(timer); resolve(got); });
      }
    );
    req.on('error', () => resolve(''));
    req.write(body);
    req.end();
  });
  const creditsOk = keepaliveCheck.includes('keepalive') || (keepaliveCheck.includes('event:') && !keepaliveCheck.includes('credit balance'));
  finding(creditsOk ? '✅' : '❌',
    'Railway credits alive — analysis starts', creditsOk ? 'keepalive received' : `got: ${String(keepaliveCheck).slice(0, 120)}`);

  await browser.close();

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════');
  console.log('WARREN PAGE TEST — SUMMARY');
  console.log('══════════════════════════════════════════════');
  const passes = results.filter(r => r.emoji === '✅').length;
  const fails  = results.filter(r => r.emoji === '❌').length;
  const warns  = results.filter(r => r.emoji === '⚠️').length;
  results.forEach(r => console.log(`  ${r.emoji} ${r.label}: ${r.detail}`));
  console.log(`\n  Total: ${passes} PASS · ${fails} FAIL · ${warns} WARN`);
  console.log('══════════════════════════════════════════════');
})();
