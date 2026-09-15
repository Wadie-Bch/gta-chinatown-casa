// Screenshot a page (or a list of times from the episode) for visual inspection.
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const url = process.argv[2] || '/preview.html?render=1';
const out = process.argv[3] || 'out/snap';
const times = (process.argv[4] || '').split(',').filter(Boolean).map(Number);
mkdirSync('out', { recursive: true });
const srv = await serve(8123);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--hide-scrollbars', '--force-device-scale-factor=1', '--force-color-profile=srgb', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const logs = [];
p.on('console', m => logs.push(m.type() + ': ' + m.text()));
p.on('pageerror', e => logs.push('PAGEERROR: ' + e.message));
await p.goto('http://localhost:8123' + url, { waitUntil: 'networkidle' });
await p.waitForFunction(() => window.__tabbi && window.__tabbi.ready, null, { timeout: 60000 }).catch(() => {});
if (!times.length) { await p.screenshot({ path: out + '.png' }); console.log('wrote', out + '.png'); }
else {
  for (const t of times) {
    await p.evaluate(t => window.__tabbi.seek(t), t);
    await p.screenshot({ path: `${out}-${t.toFixed(2)}.png` });
  }
  console.log('wrote', times.length, 'frames ->', out + '-*.png');
}
const errs = await p.evaluate(() => (globalThis.__tabbiErrors || []).slice(0, 12));
if (errs.length) console.log('SHOT ERRORS:', JSON.stringify(errs.slice(0, 6), null, 1));
if (logs.length) console.log(logs.slice(0, 40).join('\n'));
await b.close(); srv.close();
