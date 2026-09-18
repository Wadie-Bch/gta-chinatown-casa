// Phone-sized checks: stage keeps 16:9, controls stay tappable, the rotate
// button really rotates the stage without breaking seeking or hiding controls.
import { chromium, devices } from 'playwright';

const URL = process.env.FILM_URL || 'http://127.0.0.1:8123/';
const OUT = process.env.OUT || 'shots/mobile';
import fs from 'node:fs';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (n, p, d = '') => { results.push(p); console.log(`${p ? 'PASS' : 'FAIL'}  ${n}${d ? '  — ' + d : ''}`); };

const SIZES = [
  { name: 'portrait-360', w: 360, h: 800 },
  { name: 'portrait-390', w: 390, h: 844 },
  { name: 'portrait-430', w: 430, h: 932 },
  { name: 'landscape-844', w: 844, h: 390 },
  { name: 'landscape-932', w: 932, h: 430 },
];

const browser = await chromium.launch();
for (const s of SIZES) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__film && window.__film.tl, null, { timeout: 30000 });
  await page.waitForSelector('#bigPlay:not([disabled])', { timeout: 40000 });

  const box = await page.evaluate(() => {
    const st = document.getElementById('stage');
    const r = st.getBoundingClientRect();
    return { w: +r.width.toFixed(1), h: +r.height.toFixed(1), vw: innerWidth, vh: innerHeight };
  });
  const ratio = box.w / box.h;
  check(`${s.name}: stage holds 16:9`, Math.abs(ratio - 16 / 9) < 0.02, `${box.w}x${box.h} = ${ratio.toFixed(3)}`);
  check(`${s.name}: stage fits the viewport`, box.w <= box.vw + 1 && box.h <= box.vh + 1, `viewport ${box.vw}x${box.vh}`);

  // no horizontal page scroll
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check(`${s.name}: no horizontal page scroll`, overflow <= 0, `${overflow}px`);

  // every control is big enough to hit and fully inside the stage
  const ctl = await page.evaluate(() => {
    const st = document.getElementById('stage').getBoundingClientRect();
    return [...document.querySelectorAll('#controls button, #seek')]
      .filter(b => b.offsetParent !== null)          // skip controls this size hides
      .map(b => {
        const r = b.getBoundingClientRect();
        return { id: b.id || b.className, w: +r.width.toFixed(1), h: +r.height.toFixed(1),
                 inside: r.left >= st.left - 1 && r.right <= st.right + 1 && r.bottom <= st.bottom + 1 };
      });
  });
  const small = ctl.filter(c => Math.min(c.w, c.h) < 40);
  const outside = ctl.filter(c => !c.inside);
  check(`${s.name}: controls are tappable (>=38px)`, small.length === 0, small.map(c => `${c.id} ${c.w}x${c.h}`).join(', ') || `${ctl.length} controls ok`);
  check(`${s.name}: controls sit inside the stage`, outside.length === 0, outside.map(c => c.id).join(', '));

  await page.click('#bigPlay');
  await page.waitForTimeout(700);
  await page.locator('#stage').screenshot({ path: `${OUT}/${s.name}.png` });

  if (s.name.startsWith('portrait')) {
    // rotate view
    await page.evaluate(() => document.getElementById('rotBtn').click());
    await page.waitForTimeout(300);
    const rot = await page.evaluate(() => {
      const st = document.getElementById('stage');
      const cs = getComputedStyle(st).transform;
      const r = st.getBoundingClientRect();
      const ctls = [...document.querySelectorAll('#controls button')].map(b => {
        const br = b.getBoundingClientRect();
        return br.width > 20 && br.height > 20 && br.left > -2 && br.top > -2 &&
               br.right < innerWidth + 2 && br.bottom < innerHeight + 2;
      });
      return { transform: cs, boxW: +r.width.toFixed(1), boxH: +r.height.toFixed(1),
               rotated: st.classList.contains('rot'), ctlsVisible: ctls.filter(Boolean).length, ctlsTotal: ctls.length,
               stageW: st.style.width, stageH: st.style.height };
    });
    check(`${s.name}: rotate applies a 90° transform`, /matrix/.test(rot.transform) && rot.rotated, rot.transform.slice(0, 40));
    // rotated: the laid-out stage is wider than the viewport but its on-screen box fits
    const laidW = parseFloat(rot.stageW), laidH = parseFloat(rot.stageH);
    check(`${s.name}: rotated stage keeps 16:9`, Math.abs(laidW / laidH - 16 / 9) < 0.02, `${laidW}x${laidH}`);
    // a 16:9 box inside a rotated viewport fills exactly one edge completely
    const fillsAnEdge = Math.abs(laidH - s.w) < 2 || Math.abs(laidW - s.h) < 2;
    check(`${s.name}: rotated stage is as large as 16:9 allows`, fillsAnEdge, `${laidW}x${laidH} in ${s.h}x${s.w}`);
    check(`${s.name}: rotating enlarges the picture`, laidW > box.w * 1.4, `${laidW}px rotated vs ${box.w}px upright`);
    check(`${s.name}: controls still on screen when rotated`, rot.ctlsVisible === rot.ctlsTotal, `${rot.ctlsVisible}/${rot.ctlsTotal}`);

    // seeking must still work while rotated
    const before = await page.evaluate(() => window.__film.state.engine.time);
    await page.evaluate(() => {
      const sk = document.getElementById('seek');
      sk.value = '700';
      sk.dispatchEvent(new Event('input', { bubbles: true }));
      sk.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => ({ t: window.__film.state.engine.time, total: window.__film.tl.total }));
    check(`${s.name}: seeking works while rotated`, Math.abs(after.t - after.total * 0.7) < 1.5 && after.t !== before, `t=${after.t.toFixed(1)}s`);
    await page.locator('#stage').screenshot({ path: `${OUT}/${s.name}-rotated.png` });
    await page.evaluate(() => document.getElementById('rotBtn').click());
    await page.waitForTimeout(250);
    const restored = await page.evaluate(() => document.getElementById('stage').classList.contains('rot'));
    check(`${s.name}: rotate toggles back`, !restored);
  }
  check(`${s.name}: no page errors`, errs.length === 0, errs.slice(0, 2).join('; '));
  await page.close();
}

// fullscreen: API path plus the inline fallback when the API is unavailable
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#bigPlay:not([disabled])', { timeout: 40000 });
await page.evaluate(() => { document.getElementById('fsBtn').click(); });
await page.waitForTimeout(500);
const fs1 = await page.evaluate(() => ({ api: !!document.fullscreenElement, inline: document.getElementById('app').classList.contains('inline-fs') }));
check('fullscreen engages (API or inline fallback)', fs1.api || fs1.inline, JSON.stringify(fs1));
await page.evaluate(() => { document.getElementById('fsBtn').click(); });
await page.waitForTimeout(400);
const fs2 = await page.evaluate(() => ({ api: !!document.fullscreenElement, inline: document.getElementById('app').classList.contains('inline-fs') }));
check('fullscreen exits again', !fs2.api && !fs2.inline, JSON.stringify(fs2));

// force the API to fail — the inline fallback must take over (this is the iPhone path)
const page2 = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await page2.addInitScript(() => {
  Element.prototype.requestFullscreen = () => Promise.reject(new Error('unsupported'));
  delete Element.prototype.webkitRequestFullscreen;
});
await page2.goto(URL, { waitUntil: 'domcontentloaded' });
await page2.waitForSelector('#bigPlay:not([disabled])', { timeout: 40000 });
await page2.evaluate(() => document.getElementById('fsBtn').click());
await page2.waitForTimeout(500);
const inlineOnly = await page2.evaluate(() => {
  const app = document.getElementById('app');
  const st = document.getElementById('stage').getBoundingClientRect();
  return { inline: app.classList.contains('inline-fs'), stageVisible: st.width > 100 && st.height > 50 };
});
check('inline fullscreen fallback works when the API refuses', inlineOnly.inline && inlineOnly.stageVisible, JSON.stringify(inlineOnly));
await page2.locator('#stage').screenshot({ path: `${OUT}/inline-fullscreen.png` });

await browser.close();
const failed = results.filter(r => !r).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
