// Proves the transitions are real moving edits, not instant swaps, by sampling
// several frames across each transition and measuring how the picture changes.
import { chromium } from 'playwright';
const URL = process.env.FILM_URL || 'http://127.0.0.1:8123/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 960, height: 560 } });
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__film && window.__film.tl, null, { timeout: 30000 });

const report = await page.evaluate(() => {
  const tl = window.__film.tl, cv = document.getElementById('film'), g = cv.getContext('2d');
  const grab = t => {
    window.__film.renderAt(t);
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    const out = new Uint8Array(4096);
    for (let i = 0; i < 4096; i++) out[i] = d[i * 4 * 37 % (d.length - 4)];
    return out;
  };
  const diff = (a, b) => { let n = 0; for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > 8) n++; return n / a.length; };
  const byFx = {};
  for (const c of tl.cuts) {
    const fx = c.fx || 'cut';
    if (c.index === 0) continue;
    const D = { cut: 0.06, push: 0.34, wipe: 0.30, flash: 0.22, freeze: 0.30 }[fx];
    const samples = [0.02, 0.25, 0.5, 0.75, 0.98].map(f => grab(c.start + D * f));
    const steps = [];
    for (let i = 1; i < samples.length; i++) steps.push(+diff(samples[i - 1], samples[i]).toFixed(3));
    (byFx[fx] = byFx[fx] || []).push({ i: c.index, steps, mid: steps[1] + steps[2] });
  }
  const summary = {};
  for (const [fx, arr] of Object.entries(byFx)) {
    summary[fx] = {
      n: arr.length,
      // a real moving transition changes the picture at every step, not only at the seam
      alwaysMoving: arr.filter(a => a.steps.every(s => s > 0.002)).length,
      medianMidChange: +arr.map(a => a.mid).sort((x, y) => x - y)[Math.floor(arr.length / 2)].toFixed(3),
      stuck: arr.filter(a => a.steps.every(s => s < 0.001)).map(a => a.i),
    };
  }
  return summary;
});
console.log(JSON.stringify(report, null, 1));
let ok = true;
for (const [fx, r] of Object.entries(report)) {
  if (fx === 'cut') continue;
  const pass = r.medianMidChange > 0.01 && r.stuck.length === 0;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${fx}: ${r.n} uses, median mid-transition change ${r.medianMidChange}, stuck ${r.stuck.length}`);
  if (!pass) ok = false;
}
const cutR = report.cut;
console.log(`INFO  cut: ${cutR.n} hard cuts (instant by design)`);
await browser.close();
process.exit(ok ? 0 : 1);
