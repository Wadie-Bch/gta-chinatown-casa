// Deterministic 2D drawing helpers. Nothing here reads wall-clock time.
export const W = 1600, H = 900;

export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const lerp = (a, b, t) => a + (b - a) * t;
/** Normalised progress of t inside [a,b], clamped. */
export const span = (t, a, b) => clamp((t - a) / (b - a || 1e-6), 0, 1);

export const ease = {
  linear: t => t,
  out: t => 1 - Math.pow(1 - t, 3),
  outQuint: t => 1 - Math.pow(1 - t, 5),
  in: t => t * t * t,
  inOut: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  back: t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  elastic: t => t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1,
  bounce: t => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  },
};

/** Small deterministic PRNG — same seed always yields the same sequence. */
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export function roundRect(c, x, y, w, h, r) {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  c.beginPath();
  c.moveTo(x + rr, y);
  c.arcTo(x + w, y, x + w, y + h, rr);
  c.arcTo(x + w, y + h, x, y + h, rr);
  c.arcTo(x, y + h, x, y, rr);
  c.arcTo(x, y, x + w, y, rr);
  c.closePath();
}
export function fillRR(c, x, y, w, h, r, fill) { roundRect(c, x, y, w, h, r); c.fillStyle = fill; c.fill(); }
export function strokeRR(c, x, y, w, h, r, stroke, lw = 3) {
  roundRect(c, x, y, w, h, r); c.strokeStyle = stroke; c.lineWidth = lw; c.stroke();
}

export function poly(c, pts, fill, stroke, lw = 0) {
  if (pts.length < 2) return;
  c.beginPath();
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke && lw) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
}

export function line(c, x1, y1, x2, y2, stroke, lw = 3, cap = 'round') {
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
  c.strokeStyle = stroke; c.lineWidth = lw; c.lineCap = cap; c.stroke();
  c.lineCap = 'butt';
}

export function circle(c, x, y, r, fill, stroke, lw = 0) {
  c.beginPath(); c.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke && lw) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
}

export const DISPLAY = '"Barlow Condensed", "Arial Narrow", Impact, system-ui, sans-serif';
export const UI = '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif';
export const MONO = '"IBM Plex Mono", "Cascadia Mono", Consolas, monospace';

export function text(c, str, x, y, {
  size = 48, font = DISPLAY, fill = '#fff', align = 'left', base = 'alphabetic',
  weight = 700, track = 0, alpha: a = 1, stroke = null, lw = 6, upper = false,
  maxWidth = 0, crop = false,
} = {}) {
  if (a <= 0) return 0;
  const s = upper ? String(str).toUpperCase() : String(str);
  if (maxWidth) {
    // shrink to fit rather than overflow the frame
    let guard = 0;
    while (size > 10 && guard++ < 60) {
      c.save(); c.font = `${weight} ${size}px ${font}`;
      const w = c.measureText(s).width + track * Math.max(0, s.length - 1);
      c.restore();
      if (w <= maxWidth) break;
      size = Math.max(10, size * Math.min(0.96, maxWidth / w));
    }
  }
  c.save();
  c.globalAlpha *= a;
  c.font = `${weight} ${size}px ${font}`;
  c.textBaseline = base;
  // opt-in audit used by the automated legibility check; costs nothing when off
  if (typeof window !== 'undefined' && window.__textAudit) {
    const tw = c.measureText(s).width + track * Math.max(0, s.length - 1);
    const tx = align === 'center' ? x - tw / 2 : align === 'right' ? x - tw : x;
    const m = c.getTransform();                     // report frame coords, not local ones
    const sx = Math.hypot(m.a, m.b), sy = Math.hypot(m.c, m.d);
    window.__textAudit.push({
      s, size: size * sy, align, crop,
      x: m.a * tx + m.c * y + m.e, y: m.b * tx + m.d * y + m.f, w: tw * sx,
    });
  }
  if (!track) {
    c.textAlign = align;
    if (stroke) { c.lineWidth = lw; c.strokeStyle = stroke; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = fill; c.fillText(s, x, y);
    const w = c.measureText(s).width;
    c.restore();
    return w;
  }
  // manual letter-spacing (kept identical across browsers)
  c.textAlign = 'left';
  let total = 0;
  for (const ch of s) total += c.measureText(ch).width + track;
  total -= track;
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  for (const ch of s) {
    if (stroke) { c.lineWidth = lw; c.strokeStyle = stroke; c.lineJoin = 'round'; c.strokeText(ch, cx, y); }
    c.fillStyle = fill; c.fillText(ch, cx, y);
    cx += c.measureText(ch).width + track;
  }
  c.restore();
  return total;
}

export function measure(c, str, size, font = DISPLAY, weight = 700) {
  c.save(); c.font = `${weight} ${size}px ${font}`;
  const w = c.measureText(String(str)).width; c.restore(); return w;
}

/** Soft contact shadow under an object. */
export function contactShadow(c, x, y, rx, ry, a = 0.3) {
  const g = c.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
  g.addColorStop(0, `rgba(10,13,20,${a})`);
  g.addColorStop(1, 'rgba(10,13,20,0)');
  c.save(); c.translate(x, y); c.scale(1, ry / Math.max(rx, 0.001)); c.translate(-x, -y);
  c.fillStyle = g; c.beginPath(); c.arc(x, y, Math.max(rx, ry), 0, Math.PI * 2); c.fill();
  c.restore();
}

/** Restrained paper/ink grain — drawn once into a pattern, never animated. */
let grainCanvas = null;
export function grain(c, a = 0.05) {
  if (!grainCanvas) {
    grainCanvas = document.createElement('canvas');
    grainCanvas.width = grainCanvas.height = 180;
    const gc = grainCanvas.getContext('2d');
    const img = gc.createImageData(180, 180);
    const r = rng(9137);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (r() - 0.5) * 120;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    gc.putImageData(img, 0, 0);
  }
  c.save();
  c.globalAlpha = a;
  c.globalCompositeOperation = 'overlay';
  const p = c.createPattern(grainCanvas, 'repeat');
  c.fillStyle = p; c.fillRect(0, 0, W, H);
  c.restore();
}

/** Clip helper: run fn with a rounded-rect clip applied. */
export function clipRR(c, x, y, w, h, r, fn) {
  c.save(); roundRect(c, x, y, w, h, r); c.clip(); fn(); c.restore();
}
