// Exercises the player controls the way a person would, and checks the things
// that are easy to get wrong: seeking, replay, sound duplication, determinism.
import { chromium } from 'playwright';

const URL = process.env.FILM_URL || 'http://127.0.0.1:8123/';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !/CERT_AUTHORITY|fonts\.googleapis/.test(m.text())) errors.push(m.text()); });

const results = [];
const check = (name, pass, detail = '') => { results.push({ name, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };

await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__film && window.__film.tl, null, { timeout: 30000 });
await page.waitForSelector('#bigPlay:not([disabled])', { timeout: 40000 });

// count every scheduled sound so we can prove nothing double-fires
await page.evaluate(() => {
  const st = window.__film.state;
  window.__sfxLog = [];
  const eng = st.engine;
  const origTick = eng.tick.bind(eng);
  const seen = new Map();
  eng.tick = function () {
    const before = this.evCursor;
    origTick();
    for (let i = before; i < this.evCursor; i++) {
      const ev = this.events[i];
      window.__sfxLog.push(ev.t.toFixed(3) + ':' + ev.n);
      seen.set(ev.t + ev.n, (seen.get(ev.t + ev.n) || 0) + 1);
    }
    window.__sfxDupes = [...seen.values()].filter(v => v > 1).length;
  };
});

// 1. first frame is drawn before playback
const firstFrame = await page.evaluate(() => {
  const cv = document.getElementById('film');
  const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  let nonBg = 0;
  for (let i = 0; i < d.length; i += 4 * 97) if (d[i] > 40 || d[i + 1] > 40) nonBg++;
  return nonBg;
});
check('first frame is drawn before playback', firstFrame > 200, `${firstFrame} sampled non-background pixels`);

// 2. play advances the clock and the picture changes
await page.click('#bigPlay');
await page.waitForTimeout(1400);
const t1 = await page.evaluate(() => window.__film.state.engine.time);
check('play advances the clock', t1 > 0.9, `t=${t1.toFixed(2)}s`);
const framesDiffer = await page.evaluate(async () => {
  const cv = document.getElementById('film'), g = cv.getContext('2d');
  const a = g.getImageData(0, 0, cv.width, cv.height).data.slice(0, 200000);
  await new Promise(r => setTimeout(r, 380));
  const b = g.getImageData(0, 0, cv.width, cv.height).data.slice(0, 200000);
  let diff = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) > 6) diff++;
  return diff;
});
check('picture is actually animating', framesDiffer > 300, `${framesDiffer} changed sample pixels in 380ms`);

// 3. pause holds the clock
await page.click('#play');
const p1 = await page.evaluate(() => window.__film.state.engine.time);
await page.waitForTimeout(700);
const p2 = await page.evaluate(() => window.__film.state.engine.time);
check('pause holds the clock', Math.abs(p2 - p1) < 0.02, `${p1.toFixed(3)} -> ${p2.toFixed(3)}`);

// 4. deterministic render: same t twice -> identical pixels
const deterministic = await page.evaluate(() => {
  const cv = document.getElementById('film'), g = cv.getContext('2d');
  window.__film.renderAt(123.456);
  const a = g.getImageData(0, 0, cv.width, cv.height).data;
  const ha = Array.from(a.slice(0, 400000)).reduce((h, v) => (h * 31 + v) >>> 0, 7);
  window.__film.renderAt(11.1);
  window.__film.renderAt(123.456);
  const b = g.getImageData(0, 0, cv.width, cv.height).data;
  const hb = Array.from(b.slice(0, 400000)).reduce((h, v) => (h * 31 + v) >>> 0, 7);
  return ha === hb;
});
check('renderAt(t) is deterministic', deterministic);

// 5. seek via the range input
await page.evaluate(() => { const s = document.getElementById('seek'); s.value = '500'; s.dispatchEvent(new Event('input', { bubbles: true })); s.dispatchEvent(new Event('change', { bubbles: true })); });
const seeked = await page.evaluate(() => window.__film.state.engine.time);
const total = await page.evaluate(() => window.__film.tl.total);
check('seek jumps to the right time', Math.abs(seeked - total / 2) < 1.0, `${seeked.toFixed(1)}s of ${total.toFixed(1)}s`);

// 6. chapters
const chapCount = await page.evaluate(() => document.querySelectorAll('#chapList button').length);
await page.click('#chapBtn');
await page.waitForTimeout(120);
const chapVisible = await page.isVisible('#chapters');
await page.click('#chapList button:nth-child(1)');
await page.waitForTimeout(400);
const afterChap = await page.evaluate(() => ({ t: window.__film.state.engine.time, want: window.__film.tl.chapters[0].start }));
check('chapter list opens', chapVisible, `${chapCount} chapters`);
check('chapter selection seeks', Math.abs(afterChap.t - afterChap.want) < 1.2, `t=${afterChap.t.toFixed(1)}s`);
const chap7 = await page.evaluate(async () => {
  document.getElementById('chapBtn').click();
  document.querySelectorAll('#chapList button')[6].click();
  await new Promise(r => setTimeout(r, 300));
  return { t: window.__film.state.engine.time, want: window.__film.tl.chapters[6].start };
});
check('later chapter seeks', Math.abs(chap7.t - chap7.want) < 1.2, `t=${chap7.t.toFixed(1)}s want ${chap7.want.toFixed(1)}s`);

// 7. mute
await page.click('#mute');
const muted = await page.evaluate(() => ({ m: window.__film.state.engine.muted, g: window.__film.state.engine.master.gain.value }));
check('mute silences the master bus', muted.m === true && muted.g === 0, `gain=${muted.g}`);
await page.click('#mute');
const unmuted = await page.evaluate(() => window.__film.state.engine.master.gain.value);
check('unmute restores the master bus', unmuted === 1);

// 8. replay
await page.click('#replay');
await page.waitForTimeout(500);
const replayed = await page.evaluate(() => ({ t: window.__film.state.engine.time, playing: window.__film.state.engine.playing }));
check('replay restarts from zero and plays', replayed.t < 1.2 && replayed.playing, `t=${replayed.t.toFixed(2)}s`);

// 9. no duplicated sound events across pause / seek / replay over a dense stretch
// one continuous pass over a dense stretch — nothing may repeat inside it
await page.evaluate(() => { window.__sfxLog.length = 0; });
await page.evaluate(() => window.__film.state.engine.play(52.0));   // the ticket spill: many cues
await page.waitForTimeout(3000);
await page.evaluate(() => window.__film.state.engine.pause());
const pass1 = await page.evaluate(() => window.__sfxLog.slice());
check('sound cues actually fire', pass1.length > 3, `${pass1.length} cues: ${pass1.slice(0, 5).join(', ')}`);
check('no cue repeats inside one continuous pass', new Set(pass1).size === pass1.length,
      `${pass1.length} cues, ${new Set(pass1).size} distinct`);

// pausing and resuming must not replay what already sounded
await page.evaluate(() => { window.__sfxLog.length = 0; });
await page.evaluate(() => window.__film.state.engine.play());
await page.waitForTimeout(900);
await page.evaluate(() => window.__film.state.engine.pause());
const afterResume = await page.evaluate(() => window.__sfxLog.slice());
check('resume does not replay earlier cues', afterResume.every(c => !pass1.includes(c)),
      `${afterResume.length} new cues after resume`);
// a cue scheduled in the past must never be played
const stale = await page.evaluate(() => {
  const e = window.__film.state.engine;
  e.pause(); e.seek(120);
  const before = e.evCursor;
  return { before, first: e.events[before] ? +e.events[before].t.toFixed(2) : null };
});
check('seeking parks the cue cursor ahead of the playhead', stale.first === null || stale.first >= 120, `next cue at ${stale.first}s`);

// 10. captions toggle, off by default
const ccDefault = await page.getAttribute('#ccBtn', 'aria-pressed');
await page.click('#ccBtn');
const ccOn = await page.getAttribute('#ccBtn', 'aria-pressed');
check('captions are off by default and toggle on', ccDefault === 'false' && ccOn === 'true');
await page.click('#ccBtn');

// 11. keyboard
await page.evaluate(() => window.__film.seek(100));
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(150);
const kb = await page.evaluate(() => window.__film.state.engine.time);
check('keyboard seek works', kb > 104 && kb < 107, `t=${kb.toFixed(1)}s`);

// 12. end of film stops cleanly
await page.evaluate(() => { const e = window.__film.state.engine; e.play(e.tl ? 0 : window.__film.tl.total - 1.0); });
await page.evaluate(() => window.__film.state.engine.play(window.__film.tl.total - 0.8));
await page.waitForTimeout(1600);
const ended = await page.evaluate(() => ({ playing: window.__film.state.engine.playing, t: window.__film.state.engine.time, total: window.__film.tl.total }));
check('playback stops at the end', !ended.playing && Math.abs(ended.t - ended.total) < 0.4, `t=${ended.t.toFixed(2)} / ${ended.total.toFixed(2)}`);

// 13. replay after the end works
await page.click('#play');
await page.waitForTimeout(600);
const afterEnd = await page.evaluate(() => window.__film.state.engine.time);
check('play after the end restarts', afterEnd < 1.5, `t=${afterEnd.toFixed(2)}s`);

console.log('\nconsole errors:', errors.length);
errors.slice(0, 8).forEach(e => console.log('  ', e.slice(0, 200)));
const failed = results.filter(r => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
await browser.close();
process.exit(failed || errors.length ? 1 : 0);
