// Loads the film, reports console errors, timeline warnings, and shot stats.
import { chromium } from 'playwright';

const URL = process.env.FILM_URL || 'http://127.0.0.1:8123/';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [], warns = [];
page.on('console', m => {
  if (m.type() === 'error') errors.push(m.text());
  if (m.type() === 'warning') warns.push(m.text());
});
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
page.on('requestfailed', r => errors.push('REQFAIL ' + r.url() + ' ' + (r.failure()?.errorText)));

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__film && window.__film.tl, null, { timeout: 30000 });

const info = await page.evaluate(() => {
  const tl = window.__film.tl;
  const durs = tl.cuts.map(c => +c.dur.toFixed(2));
  const sets = {};
  for (const c of tl.cuts) sets[c.set] = (sets[c.set] || 0) + 1;
  const fam = tl.cuts.map(c => c.fx || 'cut');
  let runs = [], run = 1;
  for (let i = 1; i < fam.length; i++) { if (fam[i] === fam[i - 1]) run++; else { runs.push([fam[i - 1], run]); run = 1; } }
  runs.push([fam[fam.length - 1], run]);
  return {
    total: tl.total, cuts: tl.cuts.length, warnings: tl.warnings,
    minDur: Math.min(...durs), maxDur: Math.max(...durs),
    avgDur: +(durs.reduce((a, b) => a + b, 0) / durs.length).toFixed(2),
    longShots: tl.cuts.filter(c => c.dur > 6).map(c => `${c.set}/${c.view || '-'} ${c.dur.toFixed(1)}s @${c.start.toFixed(1)}`),
    shortShots: tl.cuts.filter(c => c.dur < 1.2).map(c => `${c.set}/${c.view || '-'} ${c.dur.toFixed(2)}s @${c.start.toFixed(1)}`),
    sets, longestFxRun: runs.reduce((m, r) => r[1] > m[1] ? r : m, ['', 0]),
    mode: window.__film.state.engine.mode, notice: window.__film.state.engine.notice,
  };
});
console.log(JSON.stringify(info, null, 1));
console.log('--- console errors:', errors.length);
errors.slice(0, 20).forEach(e => console.log('  ERR', e.slice(0, 220)));
console.log('--- console warnings:', warns.length);
warns.slice(0, 10).forEach(e => console.log('  WARN', e.slice(0, 220)));
await browser.close();
process.exit(errors.length ? 1 : 0);
