import { chromium } from 'playwright';
import path from 'node:path';

// CHROME_PATH lets CI (or a sandbox with a pre-installed browser) skip the download
const LAUNCH = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};
const b = await chromium.launch(LAUNCH);
const p = await (await b.newContext({ viewport:{width:1100,height:700} })).newPage();
p.on('pageerror', e => console.log('PAGEERROR', e.message));
await p.goto('file://' + path.resolve('index.html'));
await p.click('#btnPlay'); await p.waitForTimeout(1000);

// walk the player onto the nearest car, then drive
console.log('jack:', await p.evaluate(async () => {
  // put a clean car on a real boulevard, pointing down it
  const r = ROADS.find(r => r.klass === 'major' && r.len > 900);
  const d0 = r.len * 0.4, pt = roadPoint(r, d0), tg = roadTangent(r, d0);
  const c = makeCar(pt[0], pt[1], 'car', r, d0, 1);
  c.a = Math.atan2(tg[1], tg[0]); CARS.push(c);
  P.x = c.x; P.y = c.y;
  G.wantCar = true;
  await new Promise(r => setTimeout(r, 250));
  return { inCar: !!P.car, kind: P.car && P.car.kind, drivers: CARS.filter(c=>c.driver).length };
}));
await p.evaluate(() => { window.__x0 = P.car.x; window.__y0 = P.car.y; });
await p.keyboard.down('w'); await p.waitForTimeout(2600); await p.keyboard.up('w');
console.log('drive:', await p.evaluate(() => ({ vel: Math.round(P.car ? P.car.vel : -1),
  travelled: Math.round(Math.hypot(P.car.x - window.__x0, P.car.y - window.__y0)), hp: Math.round(P.car.hp) })));
await p.screenshot({ path: process.argv[2] + '/shot-driving.png' });
// shoot from the car, then get out
await p.evaluate(() => { mouse.has = true; mouse.x = innerWidth*0.8; mouse.y = innerHeight*0.4; mouse.down = true; });
await p.waitForTimeout(1200);
await p.evaluate(() => { mouse.down = false; G.wantCar = true; });
await p.waitForTimeout(400);
console.log('exit:', await p.evaluate(() => ({ inCar: !!P.car, phase: G.phase, onFoot: !solidAt(P.x,P.y,9) })));
// blow up a car
console.log('boom:', await p.evaluate(async () => {
  const c = CARS.find(c => !c.wreck && c !== P.car);
  if (!c) return 'none'; c.x = P.x + 300; c.y = P.y; c.hp = 0;
  await new Promise(r => setTimeout(r, 600));
  return { wreck: c.wreck, parts: PARTS.length };
}));
await b.close();
