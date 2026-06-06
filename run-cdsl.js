// Streams CDSL analysis from Railway, saves events, renders HTML result
const https = require('https');
const fs = require('fs');
const path = require('path');

const RAILWAY = 'warren-agent-production.up.railway.app';
const OUT_JSON = path.join(__dirname, 'warren-test-shots', 'cdsl-events.json');
const OUT_HTML = path.join(__dirname, 'warren-test-shots', 'cdsl-result.html');

const events = [];
let lastPrint = Date.now();

const body = JSON.stringify({ ticker: 'CDSL', user_id: 'cdsl-screenshot-' + Date.now() });

console.log('Starting CDSL analysis via Railway...\n');

const req = https.request(
  { hostname: RAILWAY, path: '/analyze', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
  (res) => {
    let buf = '', evtType = '';

    res.on('data', (chunk) => {
      buf += chunk.toString();
      const lines = buf.split('\n');
      buf = lines.pop();

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          evtType = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          try {
            const d = JSON.parse(line.slice(6));
            events.push({ type: evtType, data: d });
            if (evtType === 'thinking') {
              const now = Date.now();
              if (now - lastPrint > 5000) { process.stdout.write('\n  ✦ ' + d.message); lastPrint = now; }
              else process.stdout.write('.');
            } else if (evtType === 'pillar') {
              const stars = '★'.repeat(Math.round(d.score || 0)) + '☆'.repeat(5 - Math.round(d.score || 0));
              console.log(`\n\n  PILLAR: ${d.pillar}`);
              console.log(`  Score:  ${stars} (${d.score}/5)  |  Signal: ${d.signal}`);
              console.log(`  ${(d.summary || '').slice(0, 120)}...`);
            } else if (evtType === 'verdict') {
              console.log('\n\n  ══════════════════════════════════');
              console.log(`  VERDICT: ${d.verdict}  |  Conviction: ${d.conviction}`);
              console.log(`  Entry: ${d.entry}  Target: ${d.target}  Stop: ${d.stopLoss}`);
              console.log(`  Risk/Reward: ${d.riskReward}  |  Avg Score: ${d.avgScore}`);
              console.log('  ══════════════════════════════════');
            } else if (evtType === 'error') {
              console.log('\n  ERROR:', d.message);
            }
          } catch {}
        }
      }
    });

    res.on('end', () => {
      console.log('\n\nAnalysis complete. Building HTML...');
      fs.writeFileSync(OUT_JSON, JSON.stringify(events, null, 2));

      const pillars = events.filter(e => e.type === 'pillar').map(e => e.data);
      const verdictEvt = events.find(e => e.type === 'verdict');
      const verdict = verdictEvt?.data;
      const errorEvt = events.find(e => e.type === 'error');

      const signalColor = s => s === 'BULLISH' ? '#22c55e' : s === 'BEARISH' ? '#ef4444' : '#f0b429';
      const verdictColor = v => v === 'BUY' || v === 'ACCUMULATE' ? '#22c55e' : v === 'SELL' || v === 'AVOID' ? '#ef4444' : '#f0b429';

      const pillarHTML = pillars.map(p => `
        <div style="background:#1e1e1e;border:1px solid #27272a;border-radius:12px;padding:20px;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <h3 style="color:#fff;font-size:15px;font-weight:600;margin:0;">${p.pillar}</h3>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="color:${signalColor(p.signal)};font-size:12px;font-weight:600;border:1px solid ${signalColor(p.signal)}40;padding:2px 8px;border-radius:99px;">${p.signal}</span>
              <span style="color:#f0b429;font-size:18px;">${'★'.repeat(Math.round(p.score||0))}${'☆'.repeat(5-Math.round(p.score||0))}</span>
              <span style="color:#888;font-size:13px;">${p.score||0}/5</span>
            </div>
          </div>
          <p style="color:#a1a1aa;font-size:13px;line-height:1.6;margin:0;">${p.summary||''}</p>
          ${p.keyMetrics && Object.keys(p.keyMetrics||{}).length > 0 ? `
          <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;">
            ${Object.entries(p.keyMetrics||{}).map(([k,v])=>`
              <div style="background:#0a0a0a;border:1px solid #27272a;border-radius:8px;padding:6px 10px;">
                <div style="color:#71717a;font-size:10px;">${k}</div>
                <div style="color:#e4e4e7;font-size:12px;font-weight:600;">${v}</div>
              </div>`).join('')}
          </div>` : ''}
        </div>`).join('');

      const verdictHTML = verdict ? `
        <div style="background:#1e1e1e;border:2px solid ${verdictColor(verdict.verdict)}40;border-radius:16px;padding:28px;margin-top:24px;">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
            <div style="background:${verdictColor(verdict.verdict)}20;border:2px solid ${verdictColor(verdict.verdict)};border-radius:12px;padding:10px 24px;">
              <span style="color:${verdictColor(verdict.verdict)};font-size:22px;font-weight:700;">${verdict.verdict}</span>
            </div>
            <div>
              <div style="color:#888;font-size:12px;">Conviction</div>
              <div style="color:#fff;font-size:15px;font-weight:600;">${verdict.conviction}</div>
            </div>
            <div>
              <div style="color:#888;font-size:12px;">Avg Score</div>
              <div style="color:#f0b429;font-size:15px;font-weight:600;">${verdict.avgScore}/5</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
            ${[['Entry',verdict.entry,'#4a9eff'],['Target',verdict.target,'#22c55e'],['Stop Loss',verdict.stopLoss,'#ef4444'],['Risk/Reward',verdict.riskReward,'#f0b429'],['Next Review',verdict.nextReview,'#888']].map(([l,v,c])=>`
            <div style="background:#0a0a0a;border:1px solid #27272a;border-radius:10px;padding:12px;">
              <div style="color:#71717a;font-size:11px;">${l}</div>
              <div style="color:${c};font-size:14px;font-weight:700;">${v||'—'}</div>
            </div>`).join('')}
          </div>
        </div>` : '';

      const errorHTML = errorEvt ? `<div style="background:#1e1e1e;border:1px solid #ef444440;border-radius:12px;padding:20px;color:#ef4444;">${errorEvt.data.message}</div>` : '';

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>WARRen — CDSL Analysis</title>
<style>
  * { box-sizing: border-box; }
  body { background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 32px; }
  .header { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
  .agent-dot { width: 40px; height: 40px; border-radius: 50%; background: #f0b429; display: flex; align-items: center; justify-content: center; font-size: 18px; }
</style>
</head>
<body>
  <div style="max-width:720px;margin:0 auto;">
    <div class="header">
      <div class="agent-dot">📈</div>
      <div>
        <div style="color:#f0b429;font-size:18px;font-weight:700;">WARRen</div>
        <div style="color:#71717a;font-size:13px;">CDSL.NS — 6-Pillar Analysis</div>
      </div>
      <div style="margin-left:auto;background:#f0b42920;border:1px solid #f0b42940;border-radius:99px;padding:4px 12px;color:#f0b429;font-size:12px;">✦ Pro</div>
    </div>
    ${errorHTML || (pillarHTML + verdictHTML) || '<p style="color:#888">No results captured.</p>'}
    <div style="margin-top:20px;color:#3f3f46;font-size:11px;text-align:right;">Generated ${new Date().toISOString()}</div>
  </div>
</body>
</html>`;

      fs.writeFileSync(OUT_HTML, html);
      console.log('HTML written to:', OUT_HTML);
      console.log('JSON written to:', OUT_JSON);
      console.log('\nSummary:');
      console.log('  Pillars captured:', pillars.length);
      console.log('  Verdict:', verdict ? `${verdict.verdict} (${verdict.conviction})` : 'none');
    });
  }
);

req.on('error', e => { console.error('Request error:', e.message); process.exit(1); });
req.write(body);
req.end();
