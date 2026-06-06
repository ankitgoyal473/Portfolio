// Full analysis test — waits for all pillars + verdict, validates field names
const https = require('https');
const RAILWAY = 'warren-agent-production.up.railway.app';

const ticker = process.argv[2] || 'HDFCBANK';
const body = JSON.stringify({ ticker, user_id: 'full-test-' + Date.now() });

console.log(`\nTesting ${ticker} — waiting for all pillars + verdict...\n`);
const start = Date.now();

const req = https.request({
  hostname: RAILWAY, path: '/analyze', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
}, res => {
  let buf = '', evtType = '';
  const pillars = [], thinking = [];
  let verdict = null, error = null;

  res.on('data', c => {
    buf += c;
    const lines = buf.split('\n'); buf = lines.pop();
    for (const l of lines) {
      if (l.startsWith('event: ')) evtType = l.slice(7).trim();
      else if (l.startsWith('data: ')) {
        try {
          const d = JSON.parse(l.slice(6));
          if (evtType === 'pillar') {
            pillars.push(d);
            const elapsed = Math.round((Date.now()-start)/1000);
            console.log(`[${elapsed}s] PILLAR: "${d.pillar}" | ${d.signal} | score=${d.score}`);
            // Verify field names
            if (!d.pillar) console.log('  ⚠️  MISSING: d.pillar is empty/null');
            if (!d.summary) console.log('  ⚠️  MISSING: d.summary');
            if (!d.signal) console.log('  ⚠️  MISSING: d.signal');
          } else if (evtType === 'verdict') {
            verdict = d;
            const elapsed = Math.round((Date.now()-start)/1000);
            console.log(`[${elapsed}s] VERDICT: ${d.verdict} | ${d.conviction} | avg=${d.avgScore}`);
          } else if (evtType === 'thinking') {
            thinking.push(d.message);
            process.stdout.write('.');
          } else if (evtType === 'error') {
            error = d;
            console.log('\nERROR:', d.message);
          } else if (evtType === 'done') {
            const elapsed = Math.round((Date.now()-start)/1000);
            console.log(`\n\n[${elapsed}s] DONE`);
            console.log('\n=== SUMMARY ===');
            console.log(`Ticker: ${ticker}`);
            console.log(`Pillars: ${pillars.length}/6`);
            console.log(`Thinking events: ${thinking.length}`);
            console.log(`Verdict: ${verdict ? verdict.verdict + ' (' + verdict.conviction + ')' : 'none'}`);
            console.log('\nField validation:');
            pillars.forEach(p => {
              const nameOk = !!p.pillar;
              const summaryOk = !!p.summary;
              const signalOk = !!p.signal;
              const scoreOk = p.score !== undefined;
              console.log(`  ${nameOk&&summaryOk&&signalOk&&scoreOk?'✅':'❌'} ${p.pillar||'[MISSING]'}: signal=${p.signal}, score=${p.score}`);
            });
            if (error) console.log('\n❌ Error:', error.message);
            else if (pillars.length === 6 && verdict) console.log('\n✅ PASS — 6 pillars + verdict, all fields valid');
            else console.log('\n⚠️  PARTIAL — missing pillars or verdict');
          }
        } catch {}
      }
    }
  });
  res.on('end', () => { if (!verdict && !error) console.log('\nStream ended without done event'); });
});
req.on('error', e => console.error('Error:', e.message));
req.write(body); req.end();
