// Sample-level synthesis. The soundtrack is generated from the same timeline as
// the picture, so the preview and the exported file hear exactly the same mix.
export const SR = 48000;

export function makeBuf(seconds) {
  const n = Math.ceil(seconds * SR);
  return { L: new Float32Array(n), R: new Float32Array(n), n, seconds };
}

// ---- deterministic noise ------------------------------------------------
let _s = 22222;
export function nseed(v) { _s = v >>> 0 || 1; }
function rnd() { _s ^= _s << 13; _s ^= _s >>> 17; _s ^= _s << 5; _s >>>= 0; return _s / 4294967296 * 2 - 1; }

// ---- wave shapes --------------------------------------------------------
const TAU = Math.PI * 2;
export function wave(type, ph, duty = .5) {
  switch (type) {
    case 'sine': return Math.sin(ph * TAU);
    case 'tri': { const f = ph - Math.floor(ph); return 4 * Math.abs(f - .5) - 1; }
    case 'saw': { const f = ph - Math.floor(ph); return f * 2 - 1; }
    case 'square': { const f = ph - Math.floor(ph); return f < duty ? 1 : -1; }
    case 'pulse': { const f = ph - Math.floor(ph); return f < .18 ? 1 : -1; }
    case 'soft': { const f = Math.sin(ph * TAU); return Math.sign(f) * Math.pow(Math.abs(f), .6); }
    default: return Math.sin(ph * TAU);
  }
}

// ---- envelopes ----------------------------------------------------------
/** u in [0,1] over the event's duration */
export function envAt(shape, u, o = {}) {
  switch (shape) {
    case 'perc': return Math.exp(-u * (o.k ?? 6)) * (u < .004 ? u / .004 : 1);
    case 'blip': { const a = o.a ?? .06; return (u < a ? u / a : Math.exp(-(u - a) * (o.k ?? 14))); }
    case 'pad': { const a = o.a ?? .3, r = o.r ?? .35; return Math.min(u / a, 1) * Math.min((1 - u) / r, 1); }
    case 'gate': { const a = o.a ?? .01, r = o.r ?? .06; return Math.min(u / a, 1) * Math.min((1 - u) / r, 1); }
    case 'swell': return Math.sin(Math.PI * Math.min(1, u)) ** (o.p ?? 1.2);
    case 'rise': return Math.min(1, u / (o.a ?? .5)) * Math.min(1, (1 - u) / (o.r ?? .12));
    default: return 1;
  }
}

/** write a shaped oscillator into the buffer */
export function tone(B, o) {
  const t0 = Math.max(0, Math.floor((o.t || 0) * SR));
  const n = Math.max(1, Math.floor((o.d || .2) * SR));
  if (t0 >= B.n) return;
  const type = o.type || 'sine', g = o.g ?? .3, pan = o.pan ?? 0;
  const gl = g * Math.min(1, 1 - pan) * (pan > 0 ? 1 - pan * .9 : 1), gr = g * (pan < 0 ? 1 + pan * .9 : 1);
  const f0 = o.f0 ?? o.f ?? 440, f1 = o.f1 ?? f0;
  const shape = o.shape || 'perc', so = o.so || {};
  const vib = o.vib || 0, vibHz = o.vibHz || 5.5;
  const fmAmt = o.fmAmt || 0, fmHz = o.fmHz || 0;
  const glide = o.glide || 'lin';
  let ph = o.ph0 || 0, fmPh = 0;
  for (let i = 0; i < n; i++) {
    const j = t0 + i; if (j >= B.n) break;
    const u = i / n;
    let f = glide === 'exp' ? f0 * Math.pow(f1 / f0, u) : f0 + (f1 - f0) * u;
    if (vib) f *= 1 + Math.sin(u * n / SR * vibHz * TAU) * vib;
    let s = wave(type, ph, o.duty);
    if (fmAmt) { s = wave(type, ph + Math.sin(fmPh * TAU) * fmAmt, o.duty); fmPh += fmHz / SR; }
    const e = envAt(shape, u, so) * (o.tremolo ? (1 - o.tremolo + o.tremolo * (.5 + .5 * Math.sin(u * n / SR * (o.tremHz || 7) * TAU))) : 1);
    const v = s * e;
    B.L[j] += v * gl; B.R[j] += v * gr;
    ph += f / SR;
  }
}

/** filtered noise: the percussion, the air, the friction */
export function noise(B, o) {
  const t0 = Math.max(0, Math.floor((o.t || 0) * SR));
  const n = Math.max(1, Math.floor((o.d || .2) * SR));
  if (t0 >= B.n) return;
  const g = o.g ?? .2, pan = o.pan ?? 0;
  const gl = g * (pan > 0 ? 1 - pan * .9 : 1), gr = g * (pan < 0 ? 1 + pan * .9 : 1);
  const shape = o.shape || 'perc', so = o.so || {};
  let lpz = 0, hpz = 0, hpy = 0;
  const lp0 = o.lp ?? 6000, lp1 = o.lp1 ?? lp0, hp = o.hp ?? 0;
  if (o.seed !== undefined) nseed(o.seed);
  for (let i = 0; i < n; i++) {
    const j = t0 + i; if (j >= B.n) break;
    const u = i / n;
    let s = rnd();
    const lp = lp0 + (lp1 - lp0) * u;
    const a = 1 - Math.exp(-TAU * lp / SR);
    lpz += a * (s - lpz); s = lpz;
    if (hp > 0) { const b = Math.exp(-TAU * hp / SR); hpy = b * (hpy + s - hpz2(hpz, s)); hpz = s; s = hpy; }
    const v = s * envAt(shape, u, so);
    B.L[j] += v * gl; B.R[j] += v * gr;
  }
}
function hpz2(prev, s) { return prev; }

/** a fast transient: clicks, taps, keys */
export function click(B, t, g = .3, pan = 0, bright = 5000, d = .012) {
  noise(B, { t, d, g, pan, lp: bright, shape: 'perc', so: { k: 30 } });
}

/** simple ring-modulated bell */
export function bell(B, t, f, d = .6, g = .2, pan = 0) {
  tone(B, { t, d, f0: f, type: 'sine', g: g * .7, shape: 'perc', so: { k: 5 }, pan });
  tone(B, { t, d: d * .7, f0: f * 2.76, type: 'sine', g: g * .32, shape: 'perc', so: { k: 8 }, pan });
  tone(B, { t, d: d * .45, f0: f * 5.4, type: 'sine', g: g * .14, shape: 'perc', so: { k: 13 }, pan });
}

/** mix a whole buffer into another with gain */
export function mixInto(dst, src, gain = 1, gainArr = null) {
  const n = Math.min(dst.n, src.n);
  if (gainArr) {
    const step = gainArr.length / n;
    for (let i = 0; i < n; i++) { const g = gain * gainArr[(i * step) | 0]; dst.L[i] += src.L[i] * g; dst.R[i] += src.R[i] * g; }
  } else for (let i = 0; i < n; i++) { dst.L[i] += src.L[i] * gain; dst.R[i] += src.R[i] * gain; }
}

/** fade a time range of a buffer in and out (used at music cue boundaries) */
export function fadeRange(B, t0, t1, fin = .25, fout = .35) {
  const a = Math.max(0, Math.floor(t0 * SR)), b = Math.min(B.n, Math.floor(t1 * SR));
  const na = Math.floor(fin * SR), nb = Math.floor(fout * SR);
  for (let i = a; i < Math.min(b, a + na); i++) { const k = (i - a) / na; B.L[i] *= k; B.R[i] *= k; }
  for (let i = Math.max(a, b - nb); i < b; i++) { const k = (b - i) / nb; B.L[i] *= k; B.R[i] *= k; }
}
