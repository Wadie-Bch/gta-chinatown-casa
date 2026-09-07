import { chromium } from 'playwright';
import path from 'node:path';

// CHROME_PATH lets CI (or a sandbox with a pre-installed browser) skip the download
const LAUNCH = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};
const b = await chromium.launch(LAUNCH);
for (const vp of [{w:390,h:844,n:'portrait'},{w:844,h:390,n:'landscape'},{w:1440,h:860,n:'desktop'}]) {
  const ctx = await b.newContext({ viewport:{width:vp.w,height:vp.h}, isMobile: vp.n!=='desktop', hasTouch: vp.n!=='desktop' });
  const p = await ctx.newPage();
  await p.goto('file://' + path.resolve('index.html'));
  await p.click('#btnPlay'); await p.waitForTimeout(700);
  await p.evaluate(() => toggleMap());
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const g = id => { const e = document.getElementById(id); const b = e.getBoundingClientRect();
      return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height),
               vis: getComputedStyle(e).display !== 'none' && b.width > 0 }; };
    return { head: g('mapHead'), close: g('btnCloseMap'), map: g('bigmap'), vw: innerWidth, vh: innerHeight };
  });
  console.log(vp.n, JSON.stringify(r));
  await p.evaluate(() => toggleMap());
  // overlap check on the live HUD
  await p.waitForTimeout(300);
  const ov = await p.evaluate(() => {
    const ids = ['topleft','topright','phase','mmWrap','stkL','stkR','bFire','bCar','bSwap','bMap','bPause'];
    const rs = {};
    for (const id of ids) { const e = document.getElementById(id); if (!e) continue;
      if (e.closest('.hide')) continue;
      const b = e.getBoundingClientRect(); if (b.width < 1) continue; rs[id] = b; }
    const hits = [];
    const ks = Object.keys(rs);
    for (let i=0;i<ks.length;i++) for (let j=i+1;j<ks.length;j++) {
      const a = rs[ks[i]], c = rs[ks[j]];
      const ox = Math.min(a.right,c.right)-Math.max(a.left,c.left);
      const oy = Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top);
      if (ox > 6 && oy > 6) hits.push(ks[i]+'/'+ks[j]+' '+Math.round(ox)+'x'+Math.round(oy));
    }
    const off = ks.filter(k => { const b = rs[k]; return b.left < -2 || b.top < -2 || b.right > innerWidth+2 || b.bottom > innerHeight+2; });
    return { overlaps: hits, offscreen: off };
  });
  console.log('   hud:', JSON.stringify(ov));
  await ctx.close();
}
await b.close();
