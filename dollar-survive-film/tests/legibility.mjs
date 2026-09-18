// Sweeps the whole film and reports any on-screen text that runs off the frame
// or lands in the strip the controls occupy. Also samples render cost.
import { chromium } from 'playwright';
const URL = process.env.FILM_URL || 'http://127.0.0.1:8124/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
const errs = [];
page.on('pageerror', e => errs.push(e.message));
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__film && window.__film.tl, null, { timeout: 30000 });

const res = await page.evaluate(() => {
  const W = 1600, H = 900;
  const tl = window.__film.tl;
  const overflow = [], lowInFrame = [];
  const times = [];
  for (const c of tl.cuts) {
    for (const f of [0.08, 0.3, 0.55, 0.8, 0.97]) times.push({ t: c.start + c.dur * f, cut: c });
  }
  for (const { t, cut } of times) {
    window.__textAudit = [];
    window.__film.renderAt(t);
    for (const e of window.__textAudit) {
      if (!e.crop && (e.x < -2 || e.x + e.w > W + 2)) {
        overflow.push({ cut: cut.index, set: cut.set, view: cut.view, t: +t.toFixed(1),
                        s: e.s.slice(0, 44), x: Math.round(e.x), w: Math.round(e.w) });
      }
      // the control strip is the bottom ~118px; editorial text must stay clear of it
      if (e.y > H - 120 && e.size > 22 && !/SIMULATED PREVIEW/.test(e.s)) {
        lowInFrame.push({ cut: cut.index, set: cut.set, s: e.s.slice(0, 36), y: Math.round(e.y) });
      }
    }
  }
  window.__textAudit = null;
  // render cost: full sweep, wall clock per frame
  const t0 = performance.now();
  const N = 240;
  for (let i = 0; i < N; i++) window.__film.renderAt((i / N) * tl.total);
  const per = (performance.now() - t0) / N;
  return { sampled: times.length, overflow, lowInFrame, msPerFrame: +per.toFixed(2) };
});

const dedupe = a => [...new Map(a.map(o => [o.cut + o.s, o])).values()];
const ov = dedupe(res.overflow), low = dedupe(res.lowInFrame);
console.log(`sampled ${res.sampled} frames across every shot`);
console.log(`text running off the frame: ${ov.length}`);
ov.slice(0, 15).forEach(o => console.log('  ', JSON.stringify(o)));
console.log(`editorial text in the control strip: ${low.length}`);
low.slice(0, 15).forEach(o => console.log('  ', JSON.stringify(o)));
console.log(`render cost: ${res.msPerFrame} ms/frame  (~${Math.round(1000 / res.msPerFrame)} fps headroom, headless)`);
console.log('page errors:', errs.length);
await browser.close();
process.exit(ov.length || errs.length ? 1 : 0);
