// TABBI — shared math / timing helpers. Deterministic: every value is a pure
// function of episode time. No accumulation, no Math.random at draw time.

export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, k) => a + (b - a) * k;
export const inv = (a, b, v) => (b === a ? 0 : (v - a) / (b - a));
/** normalized, clamped progress of v across [a,b] */
export const p01 = (v, a, b) => clamp(inv(a, b, v));
export const mix = (a, b, k) => a + (b - a) * clamp(k);

// ---- easing -----------------------------------------------------------
export const E = {
  linear: t => t,
  in2: t => t * t,
  out2: t => 1 - (1 - t) * (1 - t),
  io2: t => (t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
  in3: t => t * t * t,
  out3: t => 1 - (1 - t) ** 3,
  io3: t => (t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  out4: t => 1 - (1 - t) ** 4,
  io4: t => (t < .5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2),
  out5: t => 1 - (1 - t) ** 5,
  back: t => { const c = 1.70158, c3 = c + 1; return c3 * t * t * t - c * t * t; },
  outBack: t => { const c = 1.9, c3 = c + 1; return 1 + c3 * (t - 1) ** 3 + c * (t - 1) ** 2; },
  outEl: t => t === 0 ? 0 : t === 1 ? 1 : 2 ** (-9 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI / 3)) + 1,
  outBounce: t => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375;
    return n * (t -= 2.625 / d) * t + .984375;
  },
  ioSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
};

/** eased ramp: t in seconds, from a→b over [t0,t0+d] */
export function ramp(t, t0, d, from = 0, to = 1, ease = E.io3) {
  return lerp(from, to, ease(p01(t, t0, t0 + d)));
}
/** value that rises then falls (a "pop") */
export function pulse(t, t0, d, ease = E.io2) {
  const k = p01(t, t0, t0 + d);
  return ease(k < .5 ? k * 2 : (1 - k) * 2);
}
/** 1 while t inside [t0,t1), else 0 */
export const on = (t, t0, t1) => (t >= t0 && t < t1 ? 1 : 0);

/** springy overshoot settle, deterministic */
export function settle(t, t0, d, from, to, bounce = 6, decay = 5) {
  const k = p01(t, t0, t0 + d);
  if (k >= 1) return to;
  const e = 1 - Math.exp(-decay * k) * Math.cos(bounce * k);
  return lerp(from, to, e);
}

// ---- seeded noise -----------------------------------------------------
export function hash(n) {
  let x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}
export function rng(seed) {
  let s = (seed * 1664525 + 1013904223) >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
/** smooth 1-D value noise in [-1,1]; deterministic in t */
export function noise1(t, seed = 0) {
  const i = Math.floor(t), f = t - i;
  const u = f * f * (3 - 2 * f);
  const a = hash(i + seed * 71.3) * 2 - 1, b = hash(i + 1 + seed * 71.3) * 2 - 1;
  return lerp(a, b, u);
}
/** deterministic shake amount that decays; use sparingly */
export function shake(t, t0, d, amp = 10, freq = 26, seed = 1) {
  const k = p01(t, t0, t0 + d);
  if (k >= 1) return { x: 0, y: 0 };
  const a = amp * (1 - k) ** 2;
  return { x: noise1(t * freq, seed) * a, y: noise1(t * freq + 33, seed + 5) * a };
}

// ---- cycles -----------------------------------------------------------
export const tri = ph => { const f = ph - Math.floor(ph); return f < .5 ? f * 2 : 2 - f * 2; };
export const sin01 = ph => Math.sin(ph * Math.PI * 2) * .5 + .5;
export const sinw = ph => Math.sin(ph * Math.PI * 2);

// ---- keyframe tracks --------------------------------------------------
/** keys: [{t, v, e?}] sorted; returns value at time t (seconds, shot-local) */
export function track(keys, t) {
  if (t <= keys[0].t) return keys[0].v;
  const last = keys[keys.length - 1];
  if (t >= last.t) return last.v;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t >= a.t && t < b.t) {
      const e = b.e || E.io3;
      return lerp(a.v, b.v, e(inv(a.t, b.t, t)));
    }
  }
  return last.v;
}
/** object-valued keyframes: [{t, ...fields, e?}] */
export function trackObj(keys, t, fields) {
  const out = {};
  for (const f of fields) out[f] = track(keys.filter(k => k[f] !== undefined).map(k => ({ t: k.t, v: k[f], e: k.e })), t);
  return out;
}

export const TAU = Math.PI * 2;
export const D2R = Math.PI / 180;
