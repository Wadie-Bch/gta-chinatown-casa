// Renders one representative frame per shot (deterministically, via renderAt)
// and writes them to shots/ for visual review.
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = process.env.OUT || 'shots';
const URL = process.env.FILM_URL || 'http://127.0.0.1:8123/';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 950 }, deviceScaleFactor: 1 });
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type() === 'error' && !/CERT_AUTHORITY/.test(m.text())) errs.push(m.text()); });
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__film && window.__film.tl, null, { timeout: 30000 });
await page.evaluate(() => { document.getElementById('poster').classList.add('gone'); document.getElementById('controls').style.opacity = '0'; });

const cuts = await page.evaluate(() => window.__film.tl.cuts.map(c => ({
  i: c.index, start: c.start, dur: c.dur, set: c.set, view: c.view || '', fx: c.fx || 'cut',
})));
const only = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
for (const c of cuts) {
  if (only && !only.includes(c.i)) continue;
  const t = c.start + Math.min(1.35, c.dur * 0.55);
  await page.evaluate(tt => window.__film.renderAt(tt), t);
  const name = `${OUT}/${String(c.i).padStart(2, '0')}_${c.set}_${c.view || 'x'}_${c.start.toFixed(0)}s.png`;
  await page.locator('#film').screenshot({ path: name });
}
console.log(`wrote ${only ? only.length : cuts.length} frames to ${OUT}/`);
console.log('errors:', errs.length); errs.slice(0, 10).forEach(e => console.log(' ', e.slice(0, 200)));
await browser.close();
