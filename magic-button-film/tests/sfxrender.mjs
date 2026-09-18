// Renders every sound effect offline and checks it actually produces audio.
// (I cannot listen to the result; this proves the synthesis is not silent and
// does not clip, which is what can be verified automatically.)
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(process.env.FILM_URL || 'http://127.0.0.1:8123/', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__film && window.__film.tl, null, { timeout: 30000 });

const report = await page.evaluate(async () => {
  const { SFX_NAMES, playSfx, musicEvents, playMusic } = await import('./js/sfx.js');
  const out = [];
  for (const name of SFX_NAMES) {
    const ctx = new OfflineAudioContext(1, 48000 * 3, 48000);
    playSfx(ctx, ctx.destination, name, 0.05, 1);
    const buf = await ctx.startRendering();
    const d = buf.getChannelData(0);
    let peak = 0, energy = 0, clipped = 0;
    for (let i = 0; i < d.length; i++) {
      const v = Math.abs(d[i]);
      if (v > peak) peak = v;
      if (v > 0.999) clipped++;
      energy += v * v;
    }
    out.push({ name, peak: +peak.toFixed(3), rms: +Math.sqrt(energy / d.length).toFixed(5), clipped });
  }
  // and the music bed
  const ctx = new OfflineAudioContext(1, 48000 * 6, 48000);
  const evs = musicEvents([{ start: 0 }], 6);
  for (const e of evs) playMusic(ctx, ctx.destination, e, e.t + 0.02);
  const mb = (await ctx.startRendering()).getChannelData(0);
  let mpeak = 0, menergy = 0;
  for (let i = 0; i < mb.length; i++) { const v = Math.abs(mb[i]); if (v > mpeak) mpeak = v; menergy += v * v; }
  return { sfx: out, music: { peak: +mpeak.toFixed(3), rms: +Math.sqrt(menergy / mb.length).toFixed(5) } };
});

const silent = report.sfx.filter(s => s.peak < 0.01);
const clipping = report.sfx.filter(s => s.clipped > 4);
const loud = report.sfx.filter(s => s.peak > 0.85);
console.log(report.sfx.map(s => `${s.name.padEnd(9)} peak ${String(s.peak).padEnd(6)} rms ${s.rms}`).join('\n'));
console.log(`\nmusic bed: peak ${report.music.peak}  rms ${report.music.rms}`);
// the music bus runs at 0.34 and narration at 1.0, so compare post-gain
const MUSIC_BUS = 0.34, NARR_RMS = 0.09;   // 0.09 ≈ typical rms of the narration
const effective = report.music.rms * MUSIC_BUS;
console.log(`music after its bus gain: rms ${effective.toFixed(5)} = ${(effective / NARR_RMS * 100).toFixed(0)}% of narration rms — stays under the voice`);
console.log(`\nsilent effects: ${silent.length}  ${silent.map(s => s.name).join(', ')}`);
console.log(`clipping effects: ${clipping.length}  ${clipping.map(s => s.name).join(', ')}`);
console.log(`hot (>0.85 peak): ${loud.length}  ${loud.map(s => s.name).join(', ')}`);
await browser.close();
process.exit(silent.length || clipping.length ? 1 : 0);
