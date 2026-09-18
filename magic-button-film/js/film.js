// Deterministic renderer: the picture is a pure function of one number.
// renderAt(t) never reads wall-clock time, never starts a CSS timeline and
// never chains setTimeout, so seeking to any second reproduces that second
// exactly.
import { W, H, span, ease, lerp, clamp, text, fillRR, measure, grain, UI, MONO } from './g2.js';
import { INK, PAPER, PAPER_2, LIME, CORAL, alpha } from './palette.js';
import { cutAt, segAt } from './timeline.js';

import * as city from './scenes/city.js';
import * as desk from './scenes/desk.js';
import * as composer from './scenes/composer.js';
import * as props from './scenes/props.js';
import * as assembly from './scenes/assembly.js';
import * as exportdesk from './scenes/exportdesk.js';
import * as bench from './scenes/bench.js';
import * as workshop from './scenes/workshop.js';
import * as playerdesk from './scenes/playerdesk.js';
import * as diagram from './scenes/diagram.js';

const SETS = { city, desk, composer, props, assembly, exportdesk, bench, workshop, playerdesk, diagram };

const TRANS = { cut: 0, push: 0.34, wipe: 0.30, flash: 0.22, freeze: 0.30 };

function drawCut(ctx, cut, local) {
  const set = SETS[cut.set];
  if (!set) { ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H); return; }
  ctx.save();
  try { set.draw(ctx, Math.max(0, local), cut); }
  catch (e) { console.error('scene error', cut.set, cut.view, e); ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}

export function renderAt(ctx, tl, t, opts = {}) {
  const tc = clamp(t, 0, tl.total);
  const cut = cutAt(tl, tc);
  const local = tc - cut.start;
  const fx = cut.fx || 'cut';
  const D = TRANS[fx] ?? 0;
  const prev = cut.index > 0 ? tl.cuts[cut.index - 1] : null;

  ctx.save();
  ctx.clearRect(0, 0, W, H);

  if (D > 0 && local < D && prev) {
    const k = local / D;
    if (fx === 'push') {
      const s = lerp(1.055, 1, ease.out(k));
      ctx.save();
      ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2);
      drawCut(ctx, cut, local);
      ctx.restore();
    } else if (fx === 'wipe') {
      drawCut(ctx, cut, local);
      const edge = ease.inOut(k) * (W + 40);
      ctx.save();
      ctx.beginPath(); ctx.rect(edge, 0, W - edge, H); ctx.clip();
      drawCut(ctx, prev, prev.dur - 0.001 + local);
      ctx.restore();
      ctx.fillStyle = INK;
      ctx.fillRect(edge - 26, 0, 26, H);
    } else if (fx === 'flash') {
      drawCut(ctx, cut, local);
      ctx.fillStyle = alpha(PAPER, (1 - k) * 0.9);
      ctx.fillRect(0, 0, W, H);
    } else if (fx === 'freeze') {
      if (k < 0.62) {
        drawCut(ctx, prev, prev.dur - 0.001);          // held frame, genuinely frozen
        ctx.fillStyle = alpha(INK, 0.06); ctx.fillRect(0, 0, W, H);
      } else {
        drawCut(ctx, cut, local);
      }
    } else {
      drawCut(ctx, cut, local);
    }
  } else {
    drawCut(ctx, cut, local);
  }

  if (opts.grain !== false) grain(ctx, 0.045);
  if (cut.noTag !== true) simTag(ctx);
  if (opts.captions) drawCaptions(ctx, tl, tc);
  ctx.restore();
  return cut;
}

/** A small, permanent honesty label. Not editorial text — a disclosure. */
function simTag(ctx) {
  ctx.save();
  ctx.globalAlpha = 0.55;
  const label = 'SIMULATED PREVIEW';
  const w = measure(ctx, label, 17, UI, 700) + 22;
  fillRR(ctx, 24, H - 44, w, 26, 5, alpha(INK, 0.55));
  text(ctx, label, 24 + w / 2, H - 25, { size: 17, fill: PAPER_2, align: 'center', font: UI, weight: 700, track: 1.2 });
  ctx.restore();
}

/** Optional captions: a short rolling window of the words actually being said. */
function drawCaptions(ctx, tl, t) {
  const seg = segAt(tl, t);
  if (!seg || t > seg.end + 0.2) return;
  const rel = t - seg.start;
  let idx = -1;
  for (let i = 0; i < seg.words.length; i++) { if (seg.words[i].t <= rel) idx = i; else break; }
  if (idx < 0) return;
  const start = Math.max(0, idx - 6);
  const words = seg.words.slice(start, idx + 1).map(w => w.w);
  let line = words.join(' ').replace(/\s+([,.;:!?])/g, '$1').trim();
  if (!line) return;
  const size = 34;
  const w = measure(ctx, line, size, UI, 600) + 44;
  const x = W / 2 - w / 2, y = H - 118;
  ctx.save();
  fillRR(ctx, x, y, w, 56, 8, alpha(INK, 0.86));
  text(ctx, line, W / 2, y + 39, { size, fill: PAPER, align: 'center', font: UI, weight: 600 });
  ctx.restore();
}

/** Every sound event in the film, flattened for the scheduler. */
export function collectSfx(tl) {
  const out = [];
  for (const c of tl.cuts) {
    if (!c.sfx) continue;
    for (const e of c.sfx) {
      const at = c.start + e.t;
      if (at >= 0 && at < tl.total && (e.g ?? 1) > 0) out.push({ t: at, n: e.n, g: e.g ?? 1 });
    }
  }
  return out.sort((a, b) => a.t - b.t);
}
