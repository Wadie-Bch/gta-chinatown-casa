// TABBI — drawing primitives. Everything visible in the episode is built from
// these; no external images anywhere in the project.
import { C, FONT, f } from './palette.js';
import { clamp, lerp, TAU, p01, E } from './util.js';

export function S(ctx, fn) { ctx.save(); try { fn(); } finally { ctx.restore(); } }

/** rounded-rect path (single radius or [tl,tr,br,bl]) */
export function rrPath(ctx, x, y, w, h, r = 0) {
  let tl, tr, br, bl;
  if (Array.isArray(r)) [tl, tr, br, bl] = r; else tl = tr = br = bl = r;
  const m = Math.min(Math.abs(w), Math.abs(h)) / 2;
  tl = Math.min(tl, m); tr = Math.min(tr, m); br = Math.min(br, m); bl = Math.min(bl, m);
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y); ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br); ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h); ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl); ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
}
export function rr(ctx, x, y, w, h, r, fill, stroke, lw = 0) {
  rrPath(ctx, x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke && lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
export function circ(ctx, x, y, r, fill, stroke, lw = 0) {
  ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke && lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
export function ell(ctx, x, y, rx, ry, rot, fill, stroke, lw = 0) {
  ctx.beginPath(); ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot || 0, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke && lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
export function line(ctx, x1, y1, x2, y2, col, lw, cap = 'round') {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = cap; ctx.stroke();
}
/** quadratic 2-segment limb through a bend point */
export function limb(ctx, x1, y1, bx, by, x2, y2, col, lw) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(bx, by, x2, y2);
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}
export function poly(ctx, pts, fill, stroke, lw = 0, close = true) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (close) ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke && lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
}

/** restrained soft shadow — used for depth, never for drama */
export function shadow(ctx, blur, dy, col = 'rgba(32,32,39,.18)', dx = 0) {
  ctx.shadowColor = col; ctx.shadowBlur = blur; ctx.shadowOffsetX = dx; ctx.shadowOffsetY = dy;
}
export function noShadow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }

/** contact shadow ellipse under a character */
export function groundShadow(ctx, x, y, w, a = .18) {
  S(ctx, () => { ctx.globalAlpha = a; ell(ctx, x, y, w, w * .22, 0, C.ink); });
}

// ---- type -------------------------------------------------------------
export function measure(ctx, str, weight, size) {
  ctx.font = f(weight, size);
  return ctx.measureText(str).width;
}
/**
 * Text with measured bounds. `back` draws an opaque rounded plate first so a
 * caption is never white-on-white.
 */
export function text(ctx, str, x, y, o = {}) {
  const size = o.size || 40, weight = o.weight || 700;
  const col = o.color || C.ink, align = o.align || 'center', base = o.base || 'middle';
  S(ctx, () => {
    ctx.font = f(weight, size);
    ctx.textAlign = align; ctx.textBaseline = base;
    if (o.letter) ctx.letterSpacing = o.letter + 'px';
    const w = ctx.measureText(str).width;
    if (o.back) {
      const px = o.backPadX ?? size * .55, py = o.backPadY ?? size * .42;
      let bx = x - w / 2;
      if (align === 'left') bx = x; else if (align === 'right') bx = x - w;
      let by = y - size * .5;
      if (base === 'top') by = y; else if (base === 'bottom') by = y - size;
      S(ctx, () => {
        if (o.backShadow) shadow(ctx, 22, 8, 'rgba(32,32,39,.18)');
        rr(ctx, bx - px, by - py, w + px * 2, size + py * 2, o.backR ?? (size * .5 + py),
          o.back, o.backStroke, o.backStroke ? (o.backLW || 3) : 0);
      });
    }
    if (o.stroke) { ctx.lineWidth = o.strokeW || 8; ctx.strokeStyle = o.stroke; ctx.lineJoin = 'round'; ctx.strokeText(str, x, y); }
    ctx.fillStyle = col;
    ctx.fillText(str, x, y);
    if (o.underline) {
      const uy = y + size * .62;
      let ux = x - w / 2; if (align === 'left') ux = x; else if (align === 'right') ux = x - w;
      line(ctx, ux, uy, ux + w, uy, col, Math.max(2, size * .06), 'butt');
    }
  });
}
/** greedy wrap; returns array of lines that each fit maxW */
export function wrap(ctx, str, weight, size, maxW) {
  ctx.font = f(weight, size);
  const words = str.split(' '); const out = []; let cur = '';
  for (const w of words) {
    const trial = cur ? cur + ' ' + w : w;
    if (ctx.measureText(trial).width > maxW && cur) { out.push(cur); cur = w; } else cur = trial;
  }
  if (cur) out.push(cur);
  return out;
}
export function textBlock(ctx, str, x, y, o = {}) {
  const size = o.size || 40, weight = o.weight || 700, lh = o.lh || size * 1.18;
  const lines = wrap(ctx, str, weight, size, o.maxW || 700);
  const h = lines.length * lh;
  let y0 = y - h / 2 + lh / 2;
  if (o.vAlign === 'top') y0 = y + lh / 2;
  lines.forEach((l, i) => text(ctx, l, x, y0 + i * lh, { ...o, size, weight }));
  return { lines, h };
}

// ---- world furniture --------------------------------------------------
/** the mouse pointer, a physical object in this world */
export function cursor(ctx, x, y, s = 1, rot = 0, opt = {}) {
  S(ctx, () => {
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    if (opt.shadow !== false) shadow(ctx, 16, 6, 'rgba(32,32,39,.25)');
    poly(ctx, [[0, 0], [0, 46], [11.5, 35], [19, 51], [27, 47], [19.5, 31.5], [34, 30]],
      opt.fill || C.white, C.ink, 5);
    noShadow(ctx);
    if (opt.grab) { // little mint ring when the cursor is holding something
      circ(ctx, 2, 2, 16 + Math.sin(opt.grab * 6) * 1.5, null, C.mint, 4);
    }
  });
}

/** loading spinner — in this world, an obstacle */
export function spinner(ctx, x, y, r, t, col = C.mint, lw = 10, speed = 1.1) {
  S(ctx, () => {
    ctx.translate(x, y); ctx.rotate((t * speed) * TAU);
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(32,32,39,.12)'; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = lw;
    const sweep = lerp(.18, .78, (Math.sin(t * 2.3) * .5 + .5));
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU * sweep); ctx.stroke();
  });
}
/** determinate ring (cooldowns, uploads) */
export function ring(ctx, x, y, r, k, col = C.mint, lw = 12, trackCol = 'rgba(32,32,39,.12)') {
  S(ctx, () => {
    ctx.lineCap = 'round';
    ctx.strokeStyle = trackCol; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    if (k > 0.001) {
      ctx.strokeStyle = col; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(k), false); ctx.stroke();
    }
  });
}

/** a soft key-light pool on the floor */
export function lightPool(ctx, x, y, rx, ry, col, a = .5) {
  S(ctx, () => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx, 0, TAU); ctx.fill();
  });
}

export function vignette(ctx, w, h, a = .22, col = '32,32,39') {
  S(ctx, () => {
    const g = ctx.createRadialGradient(w / 2, h / 2, h * .32, w / 2, h / 2, h * .95);
    g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${a})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
}

/** fine paper-grain so flat vector fields never look dead. Deterministic. */
let grainCanvas = null;
export function grain(ctx, w, h, a = .035) {
  if (!grainCanvas) {
    const c = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(220, 220) : null;
    if (!c) return;
    const g = c.getContext('2d'); const img = g.createImageData(220, 220);
    let s = 12345;
    for (let i = 0; i < img.data.length; i += 4) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const v = 128 + ((s >>> 16) % 64) - 32;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0); grainCanvas = c;
  }
  S(ctx, () => {
    ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay';
    const p = ctx.createPattern(grainCanvas, 'repeat');
    ctx.fillStyle = p; ctx.fillRect(0, 0, w, h);
  });
}

// ---- speech -----------------------------------------------------------
/**
 * In-world speech bubble. White plate, ink border, ink text — legible over any
 * background by construction. `tail` points at the speaker.
 */
export function bubble(ctx, str, x, y, o = {}) {
  const size = o.size || 42, maxW = o.maxW || 620, pad = o.pad ?? size * .62;
  const grow = clamp(o.grow ?? 1);
  if (grow <= 0.001) return;
  const lines = wrap(ctx, str, 700, size, maxW);
  const lh = size * 1.16;
  let w = 0; ctx.font = f(700, size);
  for (const l of lines) w = Math.max(w, ctx.measureText(l).width);
  w += pad * 2; const h = lines.length * lh + pad * 1.55;
  const dark = !!o.dark;
  const bg = dark ? C.ink : (o.bg || C.cream);
  const fg = dark ? C.white : (o.color || C.ink);
  const bd = dark ? C.ink : (o.border || C.ink);
  const r = Math.min(h / 2, size * .85);
  S(ctx, () => {
    ctx.translate(x, y);
    const gs = lerp(.55, 1, E.outBack(grow));
    ctx.scale(gs, gs); ctx.globalAlpha = clamp(grow * 1.6);
    const bx = -w / 2, by = -h / 2;
    shadow(ctx, 26, 10, 'rgba(32,32,39,.20)');
    rr(ctx, bx, by, w, h, r, bg); noShadow(ctx);
    rr(ctx, bx, by, w, h, r, null, bd, o.lw ?? 5);
    if (o.tail) {
      const [tx, ty] = o.tail;           // direction, roughly -1..1
      const ax = clamp(tx, -1, 1) * (w / 2 - r * .8);
      const ay = ty > 0 ? h / 2 : -h / 2;
      const d = ty > 0 ? 1 : -1;
      const tw = size * .42, tl = size * .68;
      S(ctx, () => {
        poly(ctx, [[ax - tw, ay - d * 2], [ax + tw, ay - d * 2], [ax + tx * tw * 1.1, ay + d * tl]], bg, bd, o.lw ?? 5);
        // hide the seam
        S(ctx, () => { ctx.globalCompositeOperation = 'source-over'; rr(ctx, ax - tw - 3, ay - d * 9, tw * 2 + 6, 10, 0, bg); });
      });
    }
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = f(700, size);
    const y0 = -((lines.length - 1) * lh) / 2;
    lines.forEach((l, i) => ctx.fillText(l, 0, y0 + i * lh));
  });
}

/** system voice: ink plate, white type, squared corners — machines don't smile */
export function sysPlate(ctx, str, x, y, o = {}) {
  const size = o.size || 40;
  const grow = clamp(o.grow ?? 1); if (grow <= .001) return;
  const lines = wrap(ctx, str, 800, size, o.maxW || 760);
  ctx.font = f(800, size);
  let w = 0; for (const l of lines) w = Math.max(w, ctx.measureText(l).width);
  const padX = size * .8, padY = size * .62, lh = size * 1.14;
  w += padX * 2; const h = lines.length * lh + padY * 1.4;
  S(ctx, () => {
    ctx.translate(x, y); ctx.globalAlpha = clamp(grow * 1.4);
    const k = E.out3(grow);
    ctx.scale(lerp(.9, 1, k), lerp(.7, 1, k));
    shadow(ctx, 30, 12, 'rgba(32,32,39,.28)');
    rr(ctx, -w / 2, -h / 2, w, h, o.r ?? 16, o.bg || C.ink); noShadow(ctx);
    if (o.accent) rr(ctx, -w / 2, h / 2 - 7, w, 7, [0, 0, 6, 6], o.accent);
    ctx.fillStyle = o.color || C.white; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = f(800, size); ctx.letterSpacing = (o.letter ?? 1) + 'px';
    const y0 = -((lines.length - 1) * lh) / 2;
    lines.forEach((l, i) => ctx.fillText(l, 0, y0 + i * lh));
  });
}
