import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 950 } });
await p.goto(process.env.FILM_URL || 'http://127.0.0.1:8123/', { waitUntil: 'domcontentloaded' });
await p.waitForFunction(() => window.__film && window.__film.tl, null, { timeout: 30000 });
await p.evaluate(() => { document.getElementById('poster').classList.add('gone'); document.getElementById('controls').style.opacity = '0'; });
for (const spec of process.env.T.split(',')) {
  const t = Number(spec);
  await p.evaluate(tt => window.__film.renderAt(tt), t);
  await p.locator('#film').screenshot({ path: `${process.env.OUT || '/tmp'}/t${spec.replace('.', '_')}.png` });
}
await b.close();
console.log('ok');
