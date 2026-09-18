// Contact sheet: many shots on one image, for fast visual review.
import { chromium } from 'playwright';
import fs from 'node:fs';
const URL = process.env.FILM_URL || 'http://127.0.0.1:8123/';
const from = Number(process.env.FROM || 0), to = Number(process.env.TO || 74);
const cols = Number(process.env.COLS || 4);
const out = process.env.OUT || `/tmp/sheet_${from}_${to}.png`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__film && window.__film.tl, null, { timeout: 30000 });
const b64 = await page.evaluate(async ({ from, to, cols }) => {
  const tl = window.__film.tl;
  const cuts = tl.cuts.slice(from, to);
  const cw = 480, chh = 270, pad = 8, lab = 22;
  const rows = Math.ceil(cuts.length / cols);
  const s = document.createElement('canvas');
  s.width = cols * (cw + pad) + pad; s.height = rows * (chh + pad + lab) + pad;
  const c = s.getContext('2d');
  c.fillStyle = '#0b0e14'; c.fillRect(0, 0, s.width, s.height);
  const film = document.getElementById('film');
  for (let i = 0; i < cuts.length; i++) {
    const cut = cuts[i];
    window.__film.renderAt(cut.start + Math.min(1.35, cut.dur * 0.55));
    const x = pad + (i % cols) * (cw + pad), y = pad + Math.floor(i / cols) * (chh + pad + lab);
    c.drawImage(film, x, y, cw, chh);
    c.fillStyle = '#D6FF35'; c.font = '600 14px monospace';
    c.fillText(`${cut.index} ${cut.set}/${cut.view || '-'} ${cut.start.toFixed(0)}s ${cut.dur.toFixed(1)}s ${cut.fx || 'cut'}`, x + 2, y + chh + 16);
  }
  return s.toDataURL('image/png').split(',')[1];
}, { from, to, cols });
fs.writeFileSync(out, Buffer.from(b64, 'base64'));
console.log('wrote', out);
await browser.close();
