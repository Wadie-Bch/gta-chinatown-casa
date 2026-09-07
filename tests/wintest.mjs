import { chromium } from 'playwright';
import path from 'node:path';

// CHROME_PATH lets CI (or a sandbox with a pre-installed browser) skip the download
const LAUNCH = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};
const b = await chromium.launch(LAUNCH);
const p = await (await b.newContext({ viewport: { width: 1100, height: 700 } })).newPage();
p.on('pageerror', e => console.log('PAGEERROR', e.message));
await p.goto('file://' + path.resolve('index.html'));
await p.click('#btnPlay'); await p.waitForTimeout(800);
// fire once to open the session, then simulate being one kill short
await p.evaluate(() => { mouse.has = true; mouse.down = true; });
await p.waitForTimeout(500);
await p.evaluate(() => { mouse.down = false; G.kills = SESSION_TARGET - 1;
  const n = makeNPC(P.x + 40, P.y, 'civ'); NPCS.push(n); window.__n = n; });
await p.evaluate(() => { damageNPC(window.__n, 999, true, 1, 0); });
await p.waitForTimeout(1400);
console.log('win:', await p.evaluate(() => ({ phase: G.phase, kills: G.kills,
  endVisible: !document.getElementById('ovEnd').classList.contains('hide'),
  title: document.getElementById('endTitle').textContent,
  stats: document.getElementById('endStats').textContent.replace(/\s+/g,' ').trim(),
  best: localStorage.getItem('casawars_best') })));
await p.screenshot({ path: process.argv[2] + '/shot-win.png' });
// restart works?
await p.click('#btnAgain'); await p.waitForTimeout(900);
console.log('restart:', await p.evaluate(() => ({ phase: G.phase, kills: G.kills, hp: P.hp, npcs: NPCS.length })));
await b.close();
