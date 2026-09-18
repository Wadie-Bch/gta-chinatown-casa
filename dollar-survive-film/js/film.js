// Deterministic renderer for this episode: same contract as before —
// renderAt(t) is a pure function of one number, no wall-clock reads.
import { W, H, span, ease, lerp, clamp, text, fillRR, measure, grain, UI, MONO } from './g2.js';
import { INK, PAPER, PAPER_2, GREEN, RED, alpha } from './palette.js';
import { cutAt, segAt } from './timeline.js';

import * as robot from './scenes/robot.js';
import * as scales from './scenes/scales.js';
import * as slot from './scenes/slot.js';
import * as printer from './scenes/printer.js';
import * as power from './scenes/power.js';
import * as market from './scenes/market.js';
import * as wallet from './scenes/wallet.js';
import * as deskwatch from './scenes/deskwatch.js';
import * as cards from './scenes/cards.js';

const SETS = { robot, scales, slot, printer, power, market, wallet, deskwatch, cards };

const TRANS = { cut: 0, push: 0.30, wipe: 0.26, flash: 0.18, freeze: 0.26 };

const _missing = new Set();
function drawCut(ctx, cut, local) {
  const set = SETS[cut.set];
  if (!set) {
    // Loud on purpose: a set missing from this map used to render a silent
    // black frame, which is indistinguishable from an intentional cut to black.
    if (!_missing.has(cut.set)) { _missing.add(cut.set); console.error('UNKNOWN SET:', cut.set); }
    ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
    text(ctx, 'MISSING SET: ' + cut.set, W / 2, H / 2, { size: 40, fill: RED, align: 'center', font: MONO, weight: 700 });
    return;
  }
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
      const s = lerp(1.05, 1, ease.out(k));
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
      ctx.fillRect(edge - 20, 0, 20, H);
    } else if (fx === 'flash') {
      drawCut(ctx, cut, local);
      ctx.fillStyle = alpha(PAPER, (1 - k) * 0.85);
      ctx.fillRect(0, 0, W, H);
    } else if (fx === 'freeze') {
      if (k < 0.6) {
        drawCut(ctx, prev, prev.dur - 0.001);
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

  if (opts.grain !== false) grain(ctx, 0.035);
  if (cut.noTag !== true) discloseTag(ctx);
  if (opts.captions) drawCaptions(ctx, tl, tc);
  ctx.restore();
  return cut;
}

/** A small permanent honesty label — this is a narrative thought experiment. */
function discloseTag(ctx) {
  ctx.save();
  ctx.globalAlpha = 0.5;
  const label = 'THOUGHT EXPERIMENT — NOT A BENCHMARK';
  const w = measure(ctx, label, 16, UI, 700) + 22;
  fillRR(ctx, 24, H - 42, w, 26, 5, alpha(INK, 0.6));
  text(ctx, label, 24 + w / 2, H - 24, { size: 16, fill: PAPER_2, align: 'center', font: UI, weight: 700, track: 1 });
  ctx.restore();
}

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
  const size = 32;
  const w = measure(ctx, line, size, UI, 600) + 40;
  const x = W / 2 - w / 2, y = H - 112;
  ctx.save();
  fillRR(ctx, x, y, w, 52, 8, alpha(INK, 0.86));
  text(ctx, line, W / 2, y + 36, { size, fill: PAPER, align: 'center', font: UI, weight: 600 });
  ctx.restore();
}

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
