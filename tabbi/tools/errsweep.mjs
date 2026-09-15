// Run the whole timeline through the renderer and report any runtime errors.
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
const srv = await serve(8123);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--hide-scrollbars', '--force-device-scale-factor=1'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const pe = []; p.on('pageerror', e => pe.push(e.message));
const EP = (process.argv.find(v=>v.startsWith('--ep=')) || '--ep=1').split('=')[1];
await p.goto(`http://localhost:8123/preview.html?render=1&ep=${EP}`, { waitUntil: 'networkidle' });
await p.waitForFunction(() => window.__tabbi && window.__tabbi.ready, null, { timeout: 60000 });
const t0 = Date.now();
const res = await p.evaluate(() => {
  const d = window.__tabbi.duration; const step = 1 / 30 * 3;
  for (let t = 0; t < d; t += step) window.__tabbi.seek(t);
  window.__tabbi.seek(d - 0.001);
  return (globalThis.__tabbiErrors || []).slice(0, 20);
});
console.log(`swept ${(300 / (1 / 30 * 3)).toFixed(0)} samples in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log(res.length ? JSON.stringify(res.slice(0, 8), null, 1) : 'NO SHOT ERRORS');
if (pe.length) console.log('PAGE ERRORS:', pe.slice(0, 5));
await b.close(); srv.close();
