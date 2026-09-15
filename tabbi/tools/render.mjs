// Frame-exact export: drive the same page the preview uses, one frame at a time,
// and pipe PNGs straight into ffmpeg. No intermediate files, no drift.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { serve } from './serve.mjs';
import ffmpeg from 'ffmpeg-static';
import { existsSync, mkdirSync } from 'node:fs';

const arg = n => { const a = process.argv.find(v => v.startsWith('--' + n + '=')); return a ? +a.split('=')[1] : null; };
const OUT = process.argv[2] || 'out/tabbi-ep1.mp4';
const EP = arg('ep') ?? 1;
const FROM = arg('from') ?? +(process.env.FROM || 0);
const TO = arg('to') ?? (process.env.TO ? +process.env.TO : null);
mkdirSync('out', { recursive: true });
const WAV = EP === 2 ? 'out/tabbi-ep2-audio.wav' : 'out/tabbi-audio.wav';
if (!existsSync(WAV)) { console.error('run `npm run audio` first'); process.exit(1); }

const srv = await serve(8123);
const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--hide-scrollbars', '--force-device-scale-factor=1', '--force-color-profile=srgb', '--disable-lcd-text', '--disable-gpu-vsync'],
});
const page = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGEERROR', e.message));
await page.goto(`http://localhost:8123/preview.html?render=1&ep=${EP}`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__tabbi && window.__tabbi.ready, null, { timeout: 60000 });
const { duration, fps } = await page.evaluate(() => ({ duration: window.__tabbi.duration, fps: window.__tabbi.fps }));
const total = Math.round(duration * fps);
const last = TO === null ? total : Math.min(total, TO);
console.log(`rendering ${last - FROM} frames @ ${fps}fps (${duration}s) -> ${OUT}`);

const ff = spawn(ffmpeg, [
  '-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(fps), '-i', 'pipe:0',
  '-i', WAV,
  '-map', '0:v', '-map', '1:a',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p',
  '-profile:v', 'high', '-level', '4.1', '-g', String(fps * 2),
  '-af', 'volume=-0.9dB',   // headroom for AAC overshoot: keeps true peak under -1 dBTP
  '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2',
  '-shortest', '-movflags', '+faststart', OUT,
], { stdio: ['pipe', 'inherit', 'inherit'] });

const t0 = Date.now();
for (let i = FROM; i < last; i++) {
  const d = await page.evaluate(n => { window.__tabbi.renderFrame(n); return document.getElementById('stage').toDataURL('image/png'); }, i);
  const buf = Buffer.from(d.slice(d.indexOf(',') + 1), 'base64');
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 300 === 0) {
    const el = (Date.now() - t0) / 1000, done = i - FROM + 1, eta = el / done * (last - FROM - done);
    console.log(`  frame ${i}/${last}  ${(100 * done / (last - FROM)).toFixed(1)}%  elapsed ${el.toFixed(0)}s  eta ${eta.toFixed(0)}s`);
  }
}
ff.stdin.end();
await new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))));
console.log(`done in ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min -> ${OUT}`);
await b.close(); srv.close();
