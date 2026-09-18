// Narration path: recorded audio is the master clock; the documented fallbacks
// must still give a working, honest player.
import { chromium } from 'playwright';
const URL = process.env.FILM_URL || 'http://127.0.0.1:8123/';
const results = [];
const check = (n, p, d = '') => { results.push(p); console.log(`${p ? 'PASS' : 'FAIL'}  ${n}${d ? '  — ' + d : ''}`); };
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });

// --- 1. recorded narration ------------------------------------------------
{
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#bigPlay:not([disabled])', { timeout: 40000 });
  const info = await page.evaluate(() => {
    const e = window.__film.state.engine;
    const segs = window.__film.tl.segs;
    return {
      mode: e.mode, notice: e.notice, decoded: e.buffers.size, segments: segs.length,
      sampleRate: e.ctx.sampleRate,
      // decoded length must match the manifest duration the timeline was built from
      drift: segs.map(s => {
        const b = e.buffers.get(s.id);
        return b ? +(b.duration - s.dur).toFixed(3) : null;
      }),
      total: window.__film.tl.total,
      lastSegEnd: segs[segs.length - 1].end,
    };
  });
  check('recorded narration is the active mode', info.mode === 'audio', info.mode);
  check('every segment decoded', info.decoded === info.segments, `${info.decoded}/${info.segments}`);
  const worst = Math.max(...info.drift.map(Math.abs));
  check('decoded audio matches the manifest timings', worst < 0.06, `worst drift ${worst.toFixed(3)}s`);
  check('timeline ends after the last word', info.total > info.lastSegEnd, `${info.total.toFixed(1)}s vs last segment end ${info.lastSegEnd.toFixed(1)}s`);
  check('no notice shown when narration is fine', info.notice === '', info.notice);

  // scheduling: playing from the middle must schedule only what is still ahead
  const sched = await page.evaluate(async () => {
    const e = window.__film.state.engine;
    await e.play(150);
    const n = e.sources.length;
    const segsAhead = window.__film.tl.segs.filter(s => s.end > 150).length;
    e.pause();
    const afterPause = e.sources.length;
    return { n, segsAhead, afterPause };
  });
  check('seeking schedules only the remaining narration', sched.n === sched.segsAhead, `${sched.n} sources for ${sched.segsAhead} remaining segments`);
  check('pausing stops every source', sched.afterPause === 0, `${sched.afterPause} left`);

  // captions draw from the real word timings
  const cap = await page.evaluate(() => {
    document.getElementById('ccBtn').click();
    window.__textAudit = [];
    window.__film.renderAt(100.0);
    const got = window.__textAudit.map(t => t.s);
    window.__textAudit = null;
    document.getElementById('ccBtn').click();
    const seg = window.__film.tl.segs.find(s => 100 >= s.start && 100 <= s.end);
    return { got, segText: seg ? seg.text : '' };
  });
  const capLine = cap.got.find(g => g.length > 12 && cap.segText.toLowerCase().includes(g.toLowerCase().slice(0, 12)));
  check('captions show the words actually being spoken', !!capLine, capLine ? `"${capLine}"` : cap.got.join(' | ').slice(0, 90));
  await page.close();
}

// --- 2. narration unavailable -> browser speech --------------------------
{
  const page = await browser.newPage();
  await page.route('**/audio/narration/*.mp3', r => r.abort());
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#bigPlay:not([disabled])', { timeout: 40000 });
  const info = await page.evaluate(() => {
    const e = window.__film.state.engine;
    return { mode: e.mode, notice: e.notice, hasSpeech: 'speechSynthesis' in window };
  });
  check('falls back when the recording cannot load', info.mode !== 'audio', info.mode);
  check('fallback is labelled as approximate', /approximate|silent/i.test(info.notice), info.notice);
  const noticeShown = await page.isVisible('#notice');
  check('the fallback notice is shown on screen', noticeShown);
  await page.click('#bigPlay');
  await page.waitForTimeout(1200);
  const playing = await page.evaluate(() => ({ t: window.__film.state.engine.time, playing: window.__film.state.engine.playing }));
  check('the picture still plays without the recording', playing.playing && playing.t > 0.8, `t=${playing.t.toFixed(2)}s`);
  await page.close();
}

// --- 3. no speech either -> silent playback stays functional -------------
{
  const page = await browser.newPage();
  await page.route('**/audio/narration/*.mp3', r => r.abort());
  await page.addInitScript(() => { delete window.speechSynthesis; });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#bigPlay:not([disabled])', { timeout: 40000 });
  const info = await page.evaluate(() => ({ mode: window.__film.state.engine.mode, notice: window.__film.state.engine.notice }));
  check('silent mode when no speech is available', info.mode === 'silent', `${info.mode} — "${info.notice}"`);
  await page.click('#bigPlay');
  await page.waitForTimeout(1000);
  const t = await page.evaluate(() => window.__film.state.engine.time);
  check('silent playback still runs the film', t > 0.7, `t=${t.toFixed(2)}s`);
  await page.close();
}

await browser.close();
const failed = results.filter(r => !r).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
