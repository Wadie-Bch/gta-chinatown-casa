// Renders every frame at 30fps across the whole film (the actual capture
// rate) and reports any console/page error, to catch edge cases (like
// near-plane clipping at specific camera positions) that a sparse
// per-shot sample can miss.
import { chromium } from 'playwright';
const URL = process.env.FILM_URL || 'http://127.0.0.1:8123/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push({ t: null, msg: 'PAGEERROR ' + e.message }));
page.on('console', m => { if (m.type() === 'error' && !/CERT_AUTHORITY|fonts\.googleapis/.test(m.text())) errors.push({ t: null, msg: m.text() }); });
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__film && window.__film.tl, null, { timeout: 30000 });

const total = await page.evaluate(() => window.__film.tl.total);
const fps = 30;
const N = Math.ceil(total * fps);
console.log(`sweeping ${N} frames at ${fps}fps across ${total.toFixed(2)}s...`);

const CHUNK = 200;
for (let start = 0; start < N; start += CHUNK) {
  const end = Math.min(N, start + CHUNK);
  await page.evaluate(({ start, end, fps }) => {
    for (let i = start; i < end; i++) window.__film.renderAt(i / fps);
  }, { start, end, fps });
  if (errors.some(e => e.t === null)) {
    // tag any errors accumulated during this chunk with the chunk range so we can find them
    for (const e of errors) if (e.t === null) e.t = `frames ${start}-${end} (~${(start/fps).toFixed(1)}s-${(end/fps).toFixed(1)}s)`;
  }
  if ((start / CHUNK) % 10 === 0) console.log(`  ...${(end / fps).toFixed(1)}s / ${total.toFixed(1)}s`);
}

console.log(`\ndone. errors: ${errors.length}`);
errors.forEach(e => console.log('  ', e.t, '-', e.msg.slice(0, 200)));
await browser.close();
process.exit(errors.length ? 1 : 0);
