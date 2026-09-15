// TABBI — the protagonist, drawn entirely from code.
// Body: a rounded browser tab. Head: a smaller raised tab silhouette.
// Mostly warm white, dark ink outlines, one restrained mint accent (his favicon).
// Reads at thumbnail size: big eyes, simple silhouette, one colour that isn't white.
import { C } from '../core/palette.js';
import { S, rr, rrPath, circ, ell, line, poly, shadow, noShadow, groundShadow } from '../core/draw.js';
import { clamp, lerp, TAU, D2R, sinw, sin01, noise1, E, p01 } from '../core/util.js';

// --- proportions (local units, feet at origin, +y is down = below the feet) ---
const BW = 146, BH = 138;            // body box
const BY = -46;                      // body bottom (above the feet)
const BTOP = BY - BH;                // body top
const NUB_W = 76, NUB_H = 26, NUB_X = -18;  // the tab on his head (off-centre: it reads as a tab, not a handle)
const EYE_Y = BTOP + 52;
const EYE_X = 33;
const MOUTH_Y = BTOP + 100;
const LW = 6;                        // outline weight

export const TABBI_H = 214;          // total height, for scaling shots

function defaults() {
  return {
    x: 0, y: 0, s: 1, flip: 1, rot: 0, sx: 1, sy: 1, lean: 0, bob: 0,
    armL: { a: 12, b: 16, l1: 30, l2: 26 },   // a = from straight-down, outward positive
    armR: { a: 12, b: 16, l1: 30, l2: 26 },
    legL: { a: -8, b: 6 }, legR: { a: 8, b: 6 },
    eye: { open: 1, wide: 1, look: [0, 0], shape: 'normal', shine: 1 },
    brow: { l: 0, r: 0, y: 0, show: 1 },
    mouth: { shape: 'line', open: 0, w: 1, talk: 0 },
    sweat: 0, blush: 0, steam: 0, shadowA: .16,
    hold: null, holdAt: 'R', glow: 0, badge: null, dim: 0,
  };
}
function merge(a, b) {
  const o = { ...a };
  for (const k in b) {
    if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && typeof b[k].constructor === 'function' && b[k].constructor === Object) o[k] = { ...a[k], ...b[k] };
    else o[k] = b[k];
  }
  return o;
}

// ---------------------------------------------------------------- poses ----
/**
 * Named poses. `ph` is a deterministic cycle phase (episode time × rate), so a
 * walk never depends on accumulated frames. Reactions are driven by the shot,
 * never by ambient randomness.
 */
export function pose(name, ph = 0, extra = {}) {
  const P = defaults();
  switch (name) {
    case 'idle':
      P.bob = sinw(ph * .5) * 2;
      P.armL = { a: 10, b: 14, l1: 30, l2: 26 }; P.armR = { a: 10, b: 14, l1: 30, l2: 26 };
      P.mouth = { shape: 'line', open: 0, w: 1 };
      break;
    case 'stare': // motionless, used for held reactions
      P.mouth = { shape: 'flat', open: 0, w: 1 };
      P.eye = { open: 1, wide: 1.02, look: [0, 0], shape: 'normal', shine: 1 };
      break;
    case 'walking': {
      const s = sinw(ph), c = sinw(ph + .25);
      P.legL = { a: s * 26, b: 8 + Math.max(0, -s) * 16 };
      P.legR = { a: -s * 26, b: 8 + Math.max(0, s) * 16 };
      P.armL = { a: 10 - s * 22, b: 16, l1: 30, l2: 26 };
      P.armR = { a: 10 + s * 22, b: 16, l1: 30, l2: 26 };
      P.bob = Math.abs(c) * 5 - 2; P.lean = 3;
      break;
    }
    case 'running': {
      const s = sinw(ph), c = sinw(ph + .25);
      P.legL = { a: s * 46, b: 10 + Math.max(0, -s) * 42 };
      P.legR = { a: -s * 46, b: 10 + Math.max(0, s) * 42 };
      P.armL = { a: 26 - s * 52, b: 44, l1: 30, l2: 26 };
      P.armR = { a: 26 + s * 52, b: 44, l1: 30, l2: 26 };
      P.bob = Math.abs(c) * 9 - 4; P.lean = 13;
      P.mouth = { shape: 'o', open: .55, w: .8 };
      P.eye = { open: .78, wide: 1, look: [.35, 0], shape: 'normal', shine: 1 };
      P.brow = { l: 12, r: 15, y: -2, show: 1 };
      break;
    }
    case 'smug':
      P.armL = { a: 52, b: 78, l1: 30, l2: 25 }; P.armR = { a: 52, b: 78, l1: 30, l2: 25 };
      P.eye = { open: .48, wide: 1, look: [.12, .1], shape: 'narrow', shine: 1 };
      P.brow = { l: 11, r: 11, y: 2, show: 1 };
      P.mouth = { shape: 'smirk', open: 0, w: 1 };
      P.lean = -4; P.bob = sinw(ph * .4) * 1.5;
      break;
    case 'suspicious':
      P.eye = { open: .42, wide: .96, look: [.45, 0], shape: 'narrow', shine: .6 };
      P.brow = { l: -15, r: 19, y: -3, show: 1 };
      P.mouth = { shape: 'wavy', open: 0, w: .7 };
      P.armL = { a: 30, b: 62, l1: 30, l2: 25 }; P.armR = { a: 6, b: 10, l1: 30, l2: 26 };
      P.lean = -3;
      break;
    case 'typing': {
      const k = sin01(ph * 2.1);
      P.armL = { a: 46, b: 66 + k * 12, l1: 30, l2: 26 };
      P.armR = { a: 46, b: 66 + (1 - k) * 12, l1: 30, l2: 26 };
      P.eye = { open: .8, wide: 1, look: [0, .45], shape: 'normal', shine: 1 };
      P.brow = { l: 7, r: 7, y: -1, show: 1 };
      P.mouth = { shape: 'line', open: 0, w: .7 }; P.lean = 6;
      break;
    }
    case 'hopeful':
      P.eye = { open: 1.12, wide: 1.1, look: [0, -.18], shape: 'sparkle', shine: 1 };
      P.brow = { l: -17, r: -17, y: -6, show: 1 };
      P.mouth = { shape: 'smile', open: .18, w: .9 };
      P.armL = { a: 26, b: 74, l1: 30, l2: 25 }; P.armR = { a: 26, b: 74, l1: 30, l2: 25 };
      P.bob = sinw(ph * .8) * 3;
      break;
    case 'shocked':
      P.eye = { open: 1.22, wide: 1.06, look: [0, 0], shape: 'shock', shine: 1 };
      P.brow = { l: -20, r: -20, y: -13, show: 1 };
      P.mouth = { shape: 'gasp', open: .95, w: .85 };
      P.armL = { a: 74, b: 20, l1: 30, l2: 26 }; P.armR = { a: 74, b: 20, l1: 30, l2: 26 };
      P.legL = { a: -18, b: 4 }; P.legR = { a: 18, b: 4 };
      break;
    case 'defeated':
      P.eye = { open: .34, wide: .95, look: [0, .3], shape: 'dead', shine: .25 };
      P.brow = { l: -19, r: -19, y: 3, show: 0 };
      P.mouth = { shape: 'frown', open: 0, w: .8 };
      P.armL = { a: -6, b: 2, l1: 31, l2: 26 }; P.armR = { a: -6, b: 2, l1: 31, l2: 26 };
      P.legL = { a: -4, b: 2 }; P.legR = { a: 4, b: 2 };
      P.lean = 7; P.sy = .94; P.sx = 1.04; P.bob = -6;
      break;
    case 'celebrating': {
      const j = Math.abs(sinw(ph));
      P.armL = { a: 150, b: -20, l1: 31, l2: 26 }; P.armR = { a: 150, b: -20, l1: 31, l2: 26 };
      P.eye = { open: .2, wide: 1, look: [0, 0], shape: 'happyArc', shine: 1 };
      P.brow = { l: -18, r: -18, y: -8, show: 0 };
      P.mouth = { shape: 'bigSmile', open: .6, w: 1.05 };
      P.bob = -j * 22; P.legL = { a: -22, b: 26 }; P.legR = { a: 22, b: 26 };
      P.sy = 1 + j * .05; P.sx = 1 - j * .04;
      break;
    }
    case 'holding':
      P.armL = { a: 58, b: 52, l1: 30, l2: 25 }; P.armR = { a: 58, b: 52, l1: 30, l2: 25 };
      P.mouth = { shape: 'smile', open: .1, w: .9 };
      break;
    case 'toViewer':
      P.eye = { open: 1, wide: 1.06, look: [0, 0], shape: 'normal', shine: 1 };
      P.brow = { l: 0, r: 0, y: -1, show: 1 };
      P.mouth = { shape: 'flat', open: 0, w: 1.15 };
      P.armL = { a: 8, b: 10, l1: 30, l2: 26 }; P.armR = { a: 8, b: 10, l1: 30, l2: 26 };
      break;
    case 'angry':
      P.eye = { open: .7, wide: 1, look: [0, 0], shape: 'narrow', shine: .7 };
      P.brow = { l: 29, r: 29, y: 5, show: 1 };
      P.mouth = { shape: 'shout', open: .8, w: 1 };
      P.armL = { a: 66, b: 84, l1: 30, l2: 24 }; P.armR = { a: 66, b: 84, l1: 30, l2: 24 };
      P.lean = 8; P.sx = 1.05; P.sy = .97;
      break;
    case 'sad':
      P.eye = { open: .95, wide: 1.05, look: [0, .12], shape: 'wet', shine: 1 };
      P.brow = { l: -27, r: -27, y: -5, show: 1 };
      P.mouth = { shape: 'frown', open: .1, w: .7 };
      P.armL = { a: 2, b: 4, l1: 31, l2: 26 }; P.armR = { a: 2, b: 4, l1: 31, l2: 26 };
      P.lean = 4;
      break;
    case 'point':
      P.armR = { a: 96, b: -8, l1: 33, l2: 30 }; P.armL = { a: 10, b: 14, l1: 30, l2: 26 };
      P.mouth = { shape: 'shout', open: .5, w: .9 };
      P.brow = { l: 14, r: 14, y: 0, show: 1 };
      break;
    case 'sitting':
      P.legL = { a: -70, b: 84 }; P.legR = { a: 70, b: 84 };
      P.armL = { a: 18, b: 10, l1: 30, l2: 26 }; P.armR = { a: 18, b: 10, l1: 30, l2: 26 };
      P.bob = -34; P.mouth = { shape: 'flat', open: 0, w: .9 };
      break;
  }
  return merge(P, extra);
}

/** blink that is a decision, not a tic: pass explicit times from the shot */
export function blinkAt(lt, times, dur = .13) {
  let k = 1;
  for (const b of times) {
    if (lt > b - dur && lt < b + dur) {
      const u = (lt - (b - dur)) / (dur * 2);
      k = Math.min(k, Math.abs(u - .5) * 2);
    }
  }
  return k;
}

// --------------------------------------------------------------- drawing ----
function bodyPath(ctx) {
  // a browser tab: big rounded shoulders, slight outward flare at the base
  const x = -BW / 2, y = BTOP, w = BW, h = BH, rt = 50, rb = 22, flare = 7;
  ctx.beginPath();
  ctx.moveTo(x + rt, y);
  ctx.lineTo(x + w - rt, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rt);
  ctx.lineTo(x + w + flare, y + h - rb);
  ctx.quadraticCurveTo(x + w + flare, y + h, x + w + flare - rb, y + h);
  ctx.lineTo(x - flare + rb, y + h);
  ctx.quadraticCurveTo(x - flare, y + h, x - flare, y + h - rb);
  ctx.lineTo(x, y + rt);
  ctx.quadraticCurveTo(x, y, x + rt, y);
  ctx.closePath();
}
function nubPath(ctx) {
  const w = NUB_W, h = NUB_H, y = BTOP - h + 4, r = 10, flare = 9, cx = NUB_X;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2 + r, y);
  ctx.lineTo(cx + w / 2 - r, y);
  ctx.quadraticCurveTo(cx + w / 2, y, cx + w / 2 + 2, y + r);
  ctx.quadraticCurveTo(cx + w / 2 + flare - 2, y + h - 6, cx + w / 2 + flare, y + h);
  ctx.lineTo(cx - w / 2 - flare, y + h);
  ctx.quadraticCurveTo(cx - w / 2 - flare + 2, y + h - 6, cx - w / 2 - 2, y + r);
  ctx.quadraticCurveTo(cx - w / 2, y, cx - w / 2 + r, y);
  ctx.closePath();
}

function armSeg(ctx, sx, sy, a1, a2, l1, l2, flip, col = C.ink, lw = LW, hand = true) {
  const r1 = a1 * D2R, r2 = (a1 + a2) * D2R;
  const x1 = sx + Math.sin(r1) * l1 * flip, y1 = sy + Math.cos(r1) * l1;
  const x2 = x1 + Math.sin(r2) * l2 * flip, y2 = y1 + Math.cos(r2) * l2;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke();
  if (hand) circ(ctx, x2, y2, lw * 1.35, C.white, col, lw * .85);
  return [x2, y2];
}
function legSeg(ctx, sx, sy, a1, a2, flip) {
  const l1 = 26, l2 = 22;
  const r1 = a1 * D2R, r2 = (a1 + a2) * D2R;
  const x1 = sx + Math.sin(r1) * l1, y1 = sy + Math.cos(r1) * l1;
  const x2 = x1 + Math.sin(r2) * l2, y2 = y1 + Math.cos(r2) * l2;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = C.ink; ctx.lineWidth = LW; ctx.stroke();
  // foot
  S(ctx, () => { ctx.translate(x2, y2); ctx.rotate((a1 + a2) * D2R * .3); rr(ctx, -6 * flip, -5, 27 * flip, 13, 6.5, C.white, C.ink, LW * .9); });
}

function drawEyes(ctx, P) {
  const e = P.eye, open = clamp(e.open, 0, 1.5), wide = e.wide ?? 1;
  const lx = e.look[0] * 9, ly = e.look[1] * 8;
  for (const side of [-1, 1]) {
    const cx = side * EYE_X, cy = EYE_Y;
    const rx = Math.min(27, 25 * wide), ry = Math.min(33, 27 * open * wide);
    if (e.shape === 'x') {
      S(ctx, () => {
        ctx.lineCap = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(cx - 16, cy - 16); ctx.lineTo(cx + 16, cy + 16);
        ctx.moveTo(cx + 16, cy - 16); ctx.lineTo(cx - 16, cy + 16); ctx.stroke();
      });
      continue;
    }
    if (e.shape === 'happyArc') {
      S(ctx, () => {
        ctx.strokeStyle = C.ink; ctx.lineWidth = 8; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx, cy + 6, 20, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      });
      continue;
    }
    if (open < .07 || e.shape === 'closed') {
      line(ctx, cx - 20, cy, cx + 20, cy, C.ink, 7);
      continue;
    }
    if (e.shape === 'dead') {            // lights on, nobody home
      ell(ctx, cx, cy + 9, rx * .82, Math.max(5, ry * .46), 0, C.ink);
      line(ctx, cx - rx, cy - 5, cx + rx, cy - 5, C.ink, 8.5);
      continue;
    }
    const shockK = e.shape === 'shock' ? 1.04 : 1;
    ell(ctx, cx, cy, rx * shockK, ry * shockK, 0, C.ink);
    if (e.shape === 'narrow') {   // upper lid
      S(ctx, () => {
        ctx.fillStyle = C.white;
        ctx.beginPath(); ctx.ellipse(cx, cy - ry * .55, rx * 1.25, ry * .75, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = C.ink; ctx.lineWidth = LW;
        ctx.beginPath(); ctx.moveTo(cx - rx * .98, cy - ry * .22); ctx.lineTo(cx + rx * .98, cy - ry * .34); ctx.stroke();
      });
    }
    if (e.shape === 'shock') circ(ctx, cx + lx * .5, cy + ly * .5, 6.5, C.white);
    if (e.shape === 'wet') {
      S(ctx, () => { ctx.globalAlpha = .9; ell(ctx, cx + 2, cy + ry * .45, rx * .55, ry * .3, 0, 'rgba(255,255,255,.55)'); });
    }
    if (e.shine > 0) {
      S(ctx, () => {
        ctx.globalAlpha = e.shine;
        if (e.shape === 'sparkle') {
          const px = cx - rx * .28 + lx, py = cy - ry * .34 + ly;
          poly(ctx, [[px, py - 13], [px + 4.6, py - 4.6], [px + 13, py], [px + 4.6, py + 4.6], [px, py + 13], [px - 4.6, py + 4.6], [px - 13, py], [px - 4.6, py - 4.6]], C.white);
          circ(ctx, cx + rx * .4, cy + ry * .35, 4.5, 'rgba(255,255,255,.85)');
        } else {
          circ(ctx, cx - rx * .3 + lx, cy - ry * .36 + ly, 8.2, C.white);
          circ(ctx, cx + rx * .36 + lx * .5, cy + ry * .3 + ly * .5, 4, 'rgba(255,255,255,.75)');
        }
      });
    }
  }
}

function drawMouth(ctx, P) {
  const m = P.mouth, y = MOUTH_Y, w = 34 * (m.w ?? 1);
  const talkOpen = m.talk ? clamp(m.open + m.talk, 0, 1) : m.open;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const stroke = (fn) => { ctx.strokeStyle = C.ink; ctx.lineWidth = 6.5; ctx.beginPath(); fn(); ctx.stroke(); };
  switch (m.shape) {
    case 'line': stroke(() => { ctx.moveTo(-w * .42, y); ctx.lineTo(w * .42, y); }); break;
    case 'flat': stroke(() => { ctx.moveTo(-w * .6, y); ctx.lineTo(w * .6, y); }); break;
    case 'smile': stroke(() => ctx.arc(0, y - 10, w * .6, Math.PI * .18, Math.PI * .82)); break;
    case 'bigSmile': {
      const h = 14 + talkOpen * 20;
      ctx.beginPath(); ctx.moveTo(-w * .75, y - 6);
      ctx.quadraticCurveTo(0, y + h, w * .75, y - 6); ctx.closePath();
      ctx.fillStyle = C.ink; ctx.fill(); break;
    }
    case 'smirk': stroke(() => { ctx.moveTo(-w * .5, y + 3); ctx.quadraticCurveTo(w * .18, y + 9, w * .56, y - 9); }); break;
    case 'frown': stroke(() => ctx.arc(0, y + 16, w * .55, Math.PI * 1.2, Math.PI * 1.8)); break;
    case 'wavy': stroke(() => { ctx.moveTo(-w * .55, y); ctx.quadraticCurveTo(-w * .18, y - 9, 0, y); ctx.quadraticCurveTo(w * .18, y + 9, w * .55, y); }); break;
    case 'o': ell(ctx, 0, y + 2, 12 + talkOpen * 5, 11 + talkOpen * 14, 0, C.ink); break;
    case 'gasp': ell(ctx, 0, y + 6, 17 * (m.w ?? 1), 16 + talkOpen * 20, 0, C.ink); break;
    case 'shout': {
      ctx.beginPath(); ctx.moveTo(-w * .6, y - 8);
      ctx.quadraticCurveTo(0, y - 16, w * .6, y - 8);
      ctx.quadraticCurveTo(0, y + 16 + talkOpen * 16, -w * .6, y - 8);
      ctx.fillStyle = C.ink; ctx.fill(); break;
    }
    case 'chew': {
      const k = sin01((m.talk || 0) * 6);
      stroke(() => { ctx.moveTo(-w * .4, y - k * 4); ctx.quadraticCurveTo(0, y + 8 + k * 6, w * .4, y - k * 4); });
      break;
    }
    case 'none': break;
    default: stroke(() => { ctx.moveTo(-w * .42, y); ctx.lineTo(w * .42, y); });
  }
}

export function drawTabbi(ctx, opts = {}) {
  const P = merge(defaults(), opts);
  S(ctx, () => {
    ctx.translate(P.x, P.y);
    ctx.scale(P.s * P.flip, P.s);
    if (P.rot) ctx.rotate(P.rot);
    if (P.shadowA > 0) groundShadow(ctx, 0, 2, 62 * P.sx, P.shadowA);
    if (P.glow > 0) S(ctx, () => { ctx.globalAlpha = P.glow * .5; shadow(ctx, 60, 0, C.mint); circ(ctx, 0, BTOP + BH / 2, 100, 'rgba(24,133,103,.18)'); });

    // legs first so the body overlaps the hips
    S(ctx, () => {
      ctx.translate(0, P.bob * .25);
      legSeg(ctx, -30, BY - 4, P.legL.a, P.legL.b, -1);
      legSeg(ctx, 30, BY - 4, P.legR.a, P.legR.b, 1);
    });

    S(ctx, () => {
      ctx.translate(0, P.bob);
      ctx.rotate(P.lean * D2R * .5);
      ctx.scale(P.sx, P.sy);

      // back arm
      S(ctx, () => { ctx.globalAlpha = .97; armSeg(ctx, -BW / 2 + 11, BTOP + 76, P.armL.a, P.armL.b, P.armL.l1, P.armL.l2, -1, 'rgba(32,32,39,.82)'); });

      shadow(ctx, 26, 12, 'rgba(32,32,39,.13)');
      nubPath(ctx); ctx.fillStyle = C.white; ctx.fill();
      bodyPath(ctx); ctx.fillStyle = C.white; ctx.fill();
      noShadow(ctx);
      nubPath(ctx); ctx.strokeStyle = C.ink; ctx.lineWidth = LW; ctx.lineJoin = 'round'; ctx.stroke();
      bodyPath(ctx); ctx.strokeStyle = C.ink; ctx.lineWidth = LW; ctx.stroke();
      // the one mint thing about him: his favicon
      circ(ctx, NUB_X - NUB_W / 2 + 17, BTOP - NUB_H / 2 + 5, 8.5, C.mint);

      if (P.dim > 0) S(ctx, () => { ctx.globalAlpha = P.dim; bodyPath(ctx); ctx.fillStyle = C.ink; ctx.fill(); nubPath(ctx); ctx.fill(); });

      drawEyes(ctx, P);
      if (P.brow.show) {
        for (const side of [-1, 1]) {
          const a = (side < 0 ? P.brow.l : P.brow.r) * D2R * side;
          S(ctx, () => {
            ctx.translate(side * EYE_X, EYE_Y - 30 + P.brow.y);
            ctx.rotate(a * -1);
            line(ctx, -13, 0, 13, 0, C.ink, 7.5);
          });
        }
      }
      drawMouth(ctx, P);
      if (P.blush > 0) S(ctx, () => {
        ctx.globalAlpha = P.blush * .5;
        ell(ctx, -EYE_X - 20, EYE_Y + 26, 15, 8, 0, C.red); ell(ctx, EYE_X + 20, EYE_Y + 26, 15, 8, 0, C.red);
      });
      if (P.sweat > 0) S(ctx, () => {
        ctx.globalAlpha = clamp(P.sweat);
        const dy = (P.sweat % 1) * 18;
        ctx.translate(BW / 2 - 6, BTOP + 22 + dy);
        poly(ctx, [[0, -12], [7, 4], [0, 12], [-7, 4]], '#BFE3F3', C.ink, 3.4);
      });

      // front arm (the acting one)
      const hand = armSeg(ctx, BW / 2 - 11, BTOP + 76, P.armR.a, P.armR.b, P.armR.l1, P.armR.l2, 1);
      if (P.hold) S(ctx, () => { ctx.translate(hand[0], hand[1]); if (P.flip < 0) ctx.scale(-1, 1); P.hold(ctx); });

      if (P.badge) P.badge(ctx, 0, BTOP + BH - 26);
    });
  });
}

/** tiny standalone mark — the channel logo and Tabbi at thumbnail size */
export function tabbiMark(ctx, x, y, s = 1, mintDot = true) {
  S(ctx, () => {
    ctx.translate(x, y); ctx.scale(s, s);
    nubPath(ctx); ctx.fillStyle = C.white; ctx.fill();
    bodyPath(ctx); ctx.fillStyle = C.white; ctx.fill();
    nubPath(ctx); ctx.strokeStyle = C.ink; ctx.lineWidth = LW; ctx.lineJoin = 'round'; ctx.stroke();
    bodyPath(ctx); ctx.strokeStyle = C.ink; ctx.lineWidth = LW; ctx.stroke();
    if (mintDot) circ(ctx, NUB_X - NUB_W / 2 + 17, BTOP - NUB_H / 2 + 5, 8.5, C.mint);
    ell(ctx, -EYE_X, EYE_Y, 25, 27, 0, C.ink); ell(ctx, EYE_X, EYE_Y, 25, 27, 0, C.ink);
    circ(ctx, -EYE_X - 7, EYE_Y - 10, 8.2, C.white); circ(ctx, EYE_X - 7, EYE_Y - 10, 8.2, C.white);
    line(ctx, -14, MOUTH_Y, 14, MOUTH_Y, C.ink, 6.5);
  });
}

export const TABBI = { BW, BH, BY, BTOP, EYE_Y, EYE_X, MOUTH_Y, NUB_H };
