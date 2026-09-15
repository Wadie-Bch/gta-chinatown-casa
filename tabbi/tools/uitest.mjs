// Exercise the preview the way a viewer does: play, pause, replay, sound.
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
const srv = await serve(8199);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--hide-scrollbars'] });
const log = [];
async function run(width, height, label) {
  const p = await b.newPage({ viewport: { width, height } });
  p.on('pageerror', e => log.push(`${label} PAGEERROR ${e.message}`));
  await p.goto('http://localhost:8199/preview.html', { waitUntil: 'networkidle' });
  await p.waitForFunction(() => window.__tabbi && window.__tabbi.ready, null, { timeout: 60000 });
  await p.waitForFunction(() => !document.getElementById('startBtn').disabled, null, { timeout: 120000 });
  const cardVisible = !(await p.locator('#start').isHidden());
  log.push(`${label} soundtrack ready · start card shown: ${cardVisible ? 'YES (sound needs a gesture)' : 'no (autoplay allowed)'}`);
  await p.screenshot({ path: `out/ui-${label}-start.png` });

  if (cardVisible) { await p.click('#startBtn'); }   // a real user gesture
  await p.waitForTimeout(1600);
  const st = await p.evaluate(() => window.__tabbiState());
  log.push(`${label} after play: t=${st.t.toFixed(2)}s audio=${st.audio} playing=${st.playing}`);
  await p.screenshot({ path: `out/ui-${label}-playing.png` });

  await p.click('#stage');                          // pause
  await p.waitForTimeout(400);
  const a = await p.evaluate(() => window.__tabbiState());
  await p.waitForTimeout(700);
  const c = await p.evaluate(() => window.__tabbiState());
  log.push(`${label} pause held: ${(!c.playing && Math.abs(c.t - a.t) < .05) ? 'YES' : 'NO'} (t ${a.t.toFixed(2)}→${c.t.toFixed(2)})`);

  await p.click('#stage');                          // resume
  await p.waitForTimeout(700);
  const d = await p.evaluate(() => window.__tabbiState());
  log.push(`${label} resume: ${d.playing && d.t > c.t ? 'YES' : 'NO'}`);

  await p.click('#sound'); await p.waitForTimeout(200);
  const m = await p.evaluate(() => window.__tabbiState());
  log.push(`${label} mute toggles: ${m.muted ? 'YES' : 'NO'} (gain ${m.gain})`);
  await p.click('#sound'); await p.waitForTimeout(150);
  const m2 = await p.evaluate(() => window.__tabbiState());
  log.push(`${label} unmute: ${!m2.muted ? 'YES' : 'NO'} (gain ${m2.gain})`);

  // replay from the end card
  await p.evaluate(() => window.__tabbi.seekPlay(window.__tabbi.duration - 0.6));
  await p.waitForTimeout(1500);
  const e = await p.evaluate(() => window.__tabbiState());
  log.push(`${label} reaches end: ${e.t >= e.duration - .05 ? 'YES' : 'NO'} endcard=${!(await 0, e.endcard)}`);
  await p.screenshot({ path: `out/ui-${label}-end.png` });
  await p.click('#replayBtn'); await p.waitForTimeout(800);
  const f = await p.evaluate(() => window.__tabbiState());
  log.push(`${label} replay restarts: ${f.t < 3 && f.playing ? 'YES' : 'NO'} (t=${f.t.toFixed(2)})`);
  // horizontal overflow check
  const ov = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  log.push(`${label} horizontal overflow: ${ov ? 'YES (bad)' : 'no'}`);
  await p.close();
}
await run(1440, 900, 'desktop');
await run(390, 844, 'phone');
console.log(log.join('\n'));
await b.close(); srv.close();
