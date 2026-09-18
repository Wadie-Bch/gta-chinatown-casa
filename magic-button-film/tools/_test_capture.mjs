import { chromium } from 'playwright';
import fs from 'node:fs';
const OUT = '/tmp/claude-0/-home-user-gta-chinatown-casa/1d365fc6-c319-529a-842f-29b164bb8181/scratchpad/test_capture.mp4';

const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
const errs = [];
p.on('pageerror', e => errs.push(e.message));
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('http://127.0.0.1:8123/', { waitUntil: 'domcontentloaded' });
await p.waitForSelector('#bigPlay:not([disabled])', { timeout: 40000 });

await p.evaluate(() => {
  const st = window.__film.state;
  const engine = st.engine;
  const dest = engine.ctx.createMediaStreamDestination();
  engine.master.connect(dest);
  const canvas = document.getElementById('film');
  const vTrack = canvas.captureStream(30).getVideoTracks()[0];
  const aTrack = dest.stream.getAudioTracks()[0];
  const combined = new MediaStream([vTrack, aTrack]);
  window.__rec = new MediaRecorder(combined, { mimeType: 'video/mp4', videoBitsPerSecond: 5_000_000 });
  window.__chunks = [];
  window.__rec.ondataavailable = e => { if (e.data.size) window.__chunks.push(e.data); };
  window.__rec.start(500);
});

const [download] = await Promise.all([
  p.waitForEvent('download', { timeout: 30000 }),
  (async () => {
    await p.click('#bigPlay');
    await p.waitForTimeout(4500);
    await p.evaluate(() => new Promise(resolve => {
      window.__rec.onstop = () => {
        const blob = new Blob(window.__chunks, { type: window.__rec.mimeType });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'test_capture.mp4';
        document.body.appendChild(a);
        a.click();
        setTimeout(resolve, 100);
      };
      window.__rec.stop();
    }));
  })(),
]);
await download.saveAs(OUT);
console.log('saved', OUT, fs.statSync(OUT).size, 'bytes');
console.log('page errors:', errs.length, errs.slice(0, 5));
await b.close();
