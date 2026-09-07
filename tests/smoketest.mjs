import { chromium } from 'playwright';
import path from 'node:path';

// CHROME_PATH lets CI (or a sandbox with a pre-installed browser) skip the download
const LAUNCH = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};

const url = 'file://' + path.resolve('index.html');
const shots = process.argv[2] || '.';

const b = await chromium.launch(LAUNCH);
const errors = [];

async function run(name, vp, isMobile, actions) {
  const ctx = await b.newContext({ viewport: vp, isMobile, hasTouch: isMobile, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push(`[${name}] PAGEERROR ${e.message}`));
  p.on('console', m => { if (m.type() === 'error') errors.push(`[${name}] CONSOLE ${m.text()}`); });
  await p.goto(url);
  await p.waitForTimeout(2500);
  const boot = await p.evaluate(() => ({
    b: BUILDINGS.length, r: ROADS.length, pr: PROPS.length,
    touch: dev.touch, portrait: dev.portrait, z: +cam.z.toFixed(3)
  }));
  console.log(name, JSON.stringify(boot));
  await p.screenshot({ path: path.join(shots, `shot-${name}-menu.png`) });
  await p.click('#btnPlay');
  await p.waitForTimeout(1400);
  await p.screenshot({ path: path.join(shots, `shot-${name}-calm.png`) });
  if (actions) await actions(p);
  await ctx.close();
}

// ---- desktop ----
await run('desktop', { width: 1440, height: 860 }, false, async p => {
  // walk + shoot
  await p.mouse.move(900, 380);
  await p.keyboard.down('w');
  await p.waitForTimeout(600);
  await p.keyboard.up('w');
  await p.evaluate(() => { mouse.down = true; });
  await p.waitForTimeout(2500);
  await p.evaluate(() => { mouse.down = false; });
  await p.waitForTimeout(2500);
  const s = await p.evaluate(() => ({ phase: G.phase, kills: G.kills, wanted: G.wanted, hp: P.hp | 0, npcs: NPCS.length, cars: CARS.length, bul: BULLETS.length }));
  console.log('  live state', JSON.stringify(s));
  await p.screenshot({ path: path.join(shots, 'shot-desktop-live.png') });
  // fps probe
  const fps = await p.evaluate(() => new Promise(r => {
    let n = 0; const t0 = performance.now();
    const tick = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(tick); else r(Math.round(n / ((performance.now() - t0) / 1000))); };
    requestAnimationFrame(tick);
  }));
  console.log('  fps ~', fps);
  // vehicle
  await p.evaluate(() => { G.wantCar = true; });
  await p.waitForTimeout(300);
  console.log('  inCar', await p.evaluate(() => !!P.car));
  await p.keyboard.press('m');
  await p.waitForTimeout(700);
  await p.screenshot({ path: path.join(shots, 'shot-desktop-map.png') });
  await p.keyboard.press('m');
  await p.waitForTimeout(200);
});

// ---- mobile portrait ----
await run('portrait', { width: 390, height: 844 }, true, async p => {
  const box = await p.locator('#stkL').boundingBox();
  await p.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2 - 30);
  await p.evaluate(() => { btn.fire = true; });
  await p.waitForTimeout(3000);
  await p.evaluate(() => { btn.fire = false; });
  const s = await p.evaluate(() => ({ phase: G.phase, kills: G.kills, touchVisible: !document.getElementById('touch').classList.contains('hide') }));
  console.log('  live state', JSON.stringify(s));
  await p.screenshot({ path: path.join(shots, 'shot-portrait-live.png') });
  await p.locator('#bMap').tap();
  await p.waitForTimeout(700);
  await p.screenshot({ path: path.join(shots, 'shot-portrait-map.png') });
});

// ---- mobile landscape ----
await run('landscape', { width: 844, height: 390 }, true, async p => {
  await p.evaluate(() => { btn.fire = true; });
  await p.waitForTimeout(2000);
  await p.evaluate(() => { btn.fire = false; });
  await p.screenshot({ path: path.join(shots, 'shot-landscape-live.png') });
});

await b.close();
if (errors.length) { console.log('\n--- ERRORS ---'); errors.slice(0, 25).forEach(e => console.log(e)); process.exit(1); }
console.log('\nNo runtime errors.');
