import { chromium } from 'playwright';
import path from 'node:path';

// CHROME_PATH lets CI (or a sandbox with a pre-installed browser) skip the download
const LAUNCH = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};
const b = await chromium.launch(LAUNCH);
const ctx = await b.newContext({ viewport: { width: 1440, height: 860 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const seen = new Set();
p.on('pageerror', e => { const s = e.stack || e.message; if (!seen.has(e.message)) { seen.add(e.message); console.log('PAGEERROR:', s.split('\n').slice(0, 5).join('\n')); } });
await p.goto('file://' + path.resolve('index.html'));
await p.waitForTimeout(1500);

// district building breakdown
console.log(await p.evaluate(() => {
  const m = {};
  for (const bd of BUILDINGS) { const k = bd.d ? bd.d.s : 'landmark'; m[k] = (m[k] || 0) + 1; }
  return { total: BUILDINGS.length, byStyle: m, roads: ROADS.length, props: PROPS.length };
}));

await p.click('#btnPlay');
await p.waitForTimeout(1200);
await p.evaluate(() => { mouse.down = true; });
await p.waitForTimeout(2500);
await p.evaluate(() => { mouse.down = false; });
await p.waitForTimeout(1500);

// phase timings
console.log(await p.evaluate(() => {
  const g = ctx;
  const phases = {};
  const time = (n, f) => { const t = performance.now(); for (let i = 0; i < 12; i++) f(); phases[n] = +((performance.now() - t) / 12).toFixed(2); };
  g.setTransform(DPR,0,0,DPR,0,0);
  g.save(); g.translate(VW/2,VH/2); g.scale(cam.z,cam.z); g.translate(-cam.x,-cam.y);
  const hw = halfW()+90, hh = halfH()+90;
  vis.x0=cam.x-hw; vis.x1=cam.x+hw; vis.y0=cam.y-hh; vis.y1=cam.y+hh;
  time('ground', () => drawGround(g));
  time('roads', () => drawRoads(g));
  time('groundProps', () => drawGroundProps(g));
  time('buildings', () => drawBuildings(g));
  time('entities', () => drawEntities(g));
  time('tallProps', () => drawTallProps(g));
  time('fx', () => drawFX(g));
  g.restore();
  time('overlay', () => drawOverlayFX(g));
  time('minimap', () => drawMinimap());
  const counts = { npcs: NPCS.length, cars: CARS.length, parts: PARTS.length };
  // count visible
  qBuild.length=0; QSTAMP++;
  BHASH.queryBox(vis.x0-200, vis.y0-260, vis.x1+200, vis.y1+200, qBuild, QSTAMP);
  counts.visBuildings = qBuild.length;
  qRoad.length=0; QSTAMP++;
  ROADSEG.queryBox(vis.x0, vis.y0, vis.x1, vis.y1, qRoad, QSTAMP);
  counts.visRoadSegs = qRoad.length;
  qProp.length=0; QSTAMP++;
  PHASH.queryBox(vis.x0, vis.y0, vis.x1, vis.y1, qProp, QSTAMP);
  counts.visProps = qProp.length;
  return { phases, counts };
}));

// update cost
console.log(await p.evaluate(() => {
  const t = performance.now();
  for (let i = 0; i < 20; i++) { for (const n of NPCS) updateNPC(n, 0.016); }
  const npcT = (performance.now() - t) / 20;
  const t2 = performance.now();
  for (let i = 0; i < 20; i++) { for (const c of CARS) updateCar(c, 0.016); }
  return { npcUpdate: +npcT.toFixed(2), carUpdate: +((performance.now() - t2) / 20).toFixed(2) };
}));
await b.close();
