import { chromium } from 'playwright';
import fs from 'node:fs';
const OUT = '/tmp/claude-0/-home-user-gta-chinatown-casa/1d365fc6-c319-529a-842f-29b164bb8181/scratchpad/dollar_raw.mp4';
const LOG = (...a) => console.log(new Date().toISOString(), ...a);

const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
const errs = [];
p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/CERT_AUTHORITY|fonts\.googleapis/.test(m.text())) errs.push(m.text()); });

LOG('loading player...');
await p.goto('http://127.0.0.1:8124/', { waitUntil: 'domcontentloaded' });
await p.waitForSelector('#bigPlay:not([disabled])', { timeout: 40000 });
const total = await p.evaluate(() => window.__film.tl.total);
LOG('ready. total duration =', total.toFixed(2), 's');

await p.evaluate(() => {
  const engine = window.__film.state.engine;
  const dest = engine.ctx.createMediaStreamDestination();
  engine.master.connect(dest);
  const canvas = document.getElementById('film');
  const vTrack = canvas.captureStream(30).getVideoTracks()[0];
  const aTrack = dest.stream.getAudioTracks()[0];
  const combined = new MediaStream([vTrack, aTrack]);
  window.__rec = new MediaRecorder(combined, { mimeType: 'video/mp4', videoBitsPerSecond: 6_000_000 });
  window.__chunks = [];
  window.__rec.ondataavailable = e => { if (e.data.size) window.__chunks.push(e.data); };
  window.__rec.start(2000);
});
LOG('recorder started, starting playback...');

const startedAt = Date.now();
const [download] = await Promise.all([
  p.waitForEvent('download', { timeout: (total + 30) * 1000 }),
  (async () => {
    await p.click('#bigPlay');
    // wait for actual engine time to reach the end, not just a fixed sleep,
    // so we don't cut off early if headless rAF runs slower than real time
    await p.waitForFunction(
      () => window.__film.state.engine.time >= window.__film.tl.total - 0.15 || !window.__film.state.engine.playing,
      null, { timeout: (total + 60) * 1000, polling: 500 },
    );
    await p.waitForTimeout(800); // let the tail reverb of the last cue finish
    const finalT = await p.evaluate(() => window.__film.state.engine.time);
    LOG('playback reached', finalT.toFixed(2), 's of', total.toFixed(2), 's — stopping recorder');
    await p.evaluate(() => new Promise(resolve => {
      window.__rec.onstop = () => {
        const blob = new Blob(window.__chunks, { type: window.__rec.mimeType });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'dollar_raw.mp4';
        document.body.appendChild(a);
        a.click();
        setTimeout(resolve, 200);
      };
      window.__rec.stop();
    }));
  })(),
]);
await download.saveAs(OUT);
const elapsed = (Date.now() - startedAt) / 1000;
LOG('saved', OUT, fs.statSync(OUT).size, 'bytes, wall time', elapsed.toFixed(1), 's');
LOG('page errors:', errs.length);
errs.slice(0, 10).forEach(e => LOG('  ', e.slice(0, 200)));
await b.close();
LOG('done');
