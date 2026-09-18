// Renders arbitrary ad-hoc cuts straight from a scene module, for fast iteration.
import { chromium } from 'playwright';
const spec = JSON.parse(process.env.SPEC);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
const errs = [];
p.on('pageerror', e => errs.push(e.message));
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(process.env.FILM_URL || 'http://127.0.0.1:8124/', { waitUntil: 'domcontentloaded' });
await p.waitForFunction(() => window.__film && window.__film.tl, null, { timeout: 30000 });
const b64 = await p.evaluate(async ({ spec }) => {
  const mod = await import('./js/scenes/' + spec.mod + '.js');
  const cv = document.getElementById('film');
  const g = cv.getContext('2d');
  const cols = spec.frames.length > 2 ? 2 : spec.frames.length;
  const rows = Math.ceil(spec.frames.length / cols);
  const sheet = document.createElement('canvas');
  sheet.width = cols * 800 + (cols + 1) * 10; sheet.height = rows * 450 + (rows + 1) * 10;
  const sg = sheet.getContext('2d');
  sg.fillStyle = '#000'; sg.fillRect(0, 0, sheet.width, sheet.height);
  spec.frames.forEach((f, i) => {
    g.setTransform(cv.width / 1600, 0, 0, cv.height / 900, 0, 0);
    g.clearRect(0, 0, 1600, 900);
    mod.draw(g, f.t, { dur: 4, ...spec.cut, ...f.cut });
    const x = 10 + (i % cols) * 810, y = 10 + Math.floor(i / cols) * 460;
    sg.drawImage(cv, x, y, 800, 450);
    sg.fillStyle = '#D6FF35'; sg.font = '600 14px monospace';
    sg.fillText(JSON.stringify({ t: f.t, ...(f.cut || {}) }).slice(0, 90), x + 4, y + 16);
  });
  return sheet.toDataURL('image/png').split(',')[1];
}, { spec });
const fs = await import('node:fs');
fs.writeFileSync(process.env.OUT, Buffer.from(b64, 'base64'));
console.log('wrote', process.env.OUT, '| errors:', errs.length, errs.slice(0, 3));
await b.close();
