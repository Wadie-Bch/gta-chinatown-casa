import { chromium } from 'playwright';
import path from 'node:path';

// CHROME_PATH lets CI (or a sandbox with a pre-installed browser) skip the download
const LAUNCH = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};
const b = await chromium.launch(LAUNCH);
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
p.on('pageerror', e => console.log('PAGEERROR', e.message));
await p.goto('file://' + path.resolve('index.html'));
await p.click('#btnPlay');
await p.waitForTimeout(1200);

// aim at whatever is nearest and hold the trigger
await p.evaluate(() => {
  // a crude bot: chase the nearest target and hold the trigger
  window.__auto = setInterval(() => {
    const t = nearestTarget(P.x, P.y, 1200);
    for (const k of ['w','a','s','d']) keys[k] = false;
    if (t) {
      mouse.has = true;
      mouse.x = VW/2 + (t.x - cam.x) * cam.z; mouse.y = VH/2 + (t.y - cam.y) * cam.z;
      const dx = t.x - P.x, dy = t.y - P.y, d = Math.hypot(dx, dy);
      if (d > 150) { if (dx > 24) keys['d'] = true; if (dx < -24) keys['a'] = true;
                     if (dy > 24) keys['s'] = true; if (dy < -24) keys['w'] = true; }
    }
    mouse.down = true;
    if (G.ammo[G.wep] <= 0) autoSwitch();
  }, 60);
});
for (let i = 0; i < 18; i++) {
  await p.waitForTimeout(5000);
  const s = await p.evaluate(() => ({ t: Math.round(G.sessionT), kills: G.kills, wanted: G.wanted, hp: P.hp|0, ar: P.armor|0,
    cops: NPCS.filter(n=>n.alive&&n.type!=='civ').length, civ: NPCS.filter(n=>n.alive&&n.type==='civ').length,
    cars: CARS.length, phase: G.phase, cash: G.cash, qs: +qScale.toFixed(2), fa: +frameAvg.toFixed(1) }));
  console.log(JSON.stringify(s));
  if (s.phase !== 'live') break;
}
await p.screenshot({ path: process.argv[2] + '/shot-combat.png' });
const end = await p.evaluate(() => ({ phase: G.phase, kills: G.kills, endVisible: !document.getElementById('ovEnd').classList.contains('hide') }));
console.log('end:', JSON.stringify(end));
await b.close();
