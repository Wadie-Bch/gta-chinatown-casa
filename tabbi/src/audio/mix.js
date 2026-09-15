// The mix. Music and effects are separate buses; speech ducks the music;
// the whole thing is normalised to about -16 LUFS with a true-peak ceiling.
import { makeBuf, mixInto, fadeRange, SR } from './dsp.js';
import { sfx } from './sfx.js';
import { speak, react } from './voices.js';
import { BEDS } from './music.js';
export { SR };

// calibrated against ffmpeg ebur128: yields ≈ -16 LUFS integrated, true peak ≤ -1 dBTP
export const FIXED_GAIN = 5.10;
const CEILING = 0.655;           // -3.7 dBFS sample peak, which keeps inter-sample peaks under -1 dBTP

const REACT = {
  tabbiSmug: ['smug', 'tabbi'], tabbiCheer: ['cheer', 'tabbi'], tabbiShout: ['shout', 'tabbi'],
  tabbiHuff: ['huff', 'tabbi'], tabbiSmall: ['small', 'tabbi'], dashSigh: ['sigh', 'dash'],
  retainWarm: ['warm', 'retain'], retainSad: ['sigh', 'retain'],
  gasp: ['gasp', 'tabbi'], sigh: ['sigh', 'tabbi'], swallow: ['swallow', 'tabbi'],
};

export async function buildSoundtrack(opts = {}) {
  const { TIMELINE, MUSIC, DURATION, soundEvents } = await import('../episode/episode.js');
  const dur = DURATION + 1.2;
  const M = makeBuf(dur);    // music bus
  const F = makeBuf(dur);    // effects + voice bus
  const yield_ = opts.yield || (() => Promise.resolve());

  // --- music: one bed per cue, each fading itself in and out -------------
  for (let i = 0; i < MUSIC.length; i++) {
    const c = MUSIC[i];
    const t1 = i + 1 < MUSIC.length ? MUSIC[i + 1].t : DURATION;
    const bed = BEDS[c.name];
    if (!bed || c.gain <= 0) continue;
    bed(M, c.t, t1, c.gain);
    fadeRange(M, c.t, t1, .3, .5);
    if (i % 3 === 2) await yield_();
  }
  await yield_();

  // --- effects and voices ------------------------------------------------
  const events = soundEvents();
  const duckPts = [];
  for (const e of events) {
    if (e.n === 'voice') {
      const who = e.who === 'me' ? 'tabbi' : e.who === 'them' ? 'dash' : e.who;
      speak(F, e.t, e.d, e.text, who, { g: 1 });
      duckPts.push([e.t - .12, e.t + e.d * .9 + .3]);
    } else if (REACT[e.n]) {
      react(F, e.t, REACT[e.n][0], REACT[e.n][1], e.g ?? 1);
      duckPts.push([e.t - .08, e.t + .7]);
    } else {
      sfx(F, e.n, e.t, e);
    }
  }
  await yield_();

  // --- ducking: the music steps back under anything spoken ---------------
  const RES = 200; // control-rate points per second
  const nd = Math.ceil(dur * RES);
  const duck = new Float32Array(nd).fill(1);
  for (const [a, b] of duckPts) {
    const ia = Math.max(0, Math.floor(a * RES)), ib = Math.min(nd, Math.ceil(b * RES));
    for (let i = ia; i < ib; i++) duck[i] = Math.min(duck[i], .38);
  }
  // smooth both ways so the duck breathes instead of clicking
  for (let i = 1; i < nd; i++) duck[i] = Math.min(duck[i], duck[i - 1] + 1 / (RES * .35));
  for (let i = nd - 2; i >= 0; i--) duck[i] = Math.min(duck[i], duck[i + 1] + 1 / (RES * .12));

  const OUT = makeBuf(dur);
  mixInto(OUT, M, 1, duck);
  mixInto(OUT, F, 1);
  await yield_();

  // --- loudness ----------------------------------------------------------
  // The make-up gain is a calibrated constant so the preview and the exported
  // file are bit-for-bit the same mix, and so the browser does not have to run
  // a loudness analysis before it can play. `analyze` re-derives it.
  let gain = FIXED_GAIN, lufs = null;
  if (opts.analyze) {
    lufs = integratedLoudness(OUT);
    gain = Math.min(12, Math.pow(10, ((opts.target ?? -16) - lufs) / 20));
    if (!isFinite(gain) || gain <= 0) gain = FIXED_GAIN;
  }
  applyGain(OUT, gain);
  limit(OUT, CEILING);
  return { L: OUT.L, R: OUT.R, n: OUT.n, sampleRate: SR, lufsBefore: lufs, gain };
}

function applyGain(B, g) { for (let i = 0; i < B.n; i++) { B.L[i] *= g; B.R[i] *= g; } }

/** soft knee limiter with a short lookahead-free release — keeps peaks under `ceil` */
function limit(B, ceil) {
  const rel = Math.exp(-1 / (SR * .12));
  let env = 0;
  for (let i = 0; i < B.n; i++) {
    const peak = Math.max(Math.abs(B.L[i]), Math.abs(B.R[i]));
    env = peak > env ? peak : env * rel + peak * (1 - rel);
    const g = env > ceil ? ceil / env : 1;
    B.L[i] *= g; B.R[i] *= g;
    // absolute safety net
    if (B.L[i] > ceil) B.L[i] = ceil; if (B.L[i] < -ceil) B.L[i] = -ceil;
    if (B.R[i] > ceil) B.R[i] = ceil; if (B.R[i] < -ceil) B.R[i] = -ceil;
  }
}

/** ITU-R BS.1770-style integrated loudness (K-weighted, gated) */
function integratedLoudness(B) {
  const k = kWeight(B);
  const block = Math.floor(SR * .4), hop = Math.floor(block * .25);
  const blocks = [];
  for (let s = 0; s + block <= k.L.length; s += hop) {
    let sl = 0, sr = 0;
    for (let i = s; i < s + block; i++) { sl += k.L[i] * k.L[i]; sr += k.R[i] * k.R[i]; }
    const ms = sl / block + sr / block;
    if (ms > 0) blocks.push(-0.691 + 10 * Math.log10(ms));
  }
  if (!blocks.length) return -70;
  const abs = blocks.filter(v => v > -70);
  if (!abs.length) return -70;
  const mean = v => v.reduce((a, b) => a + Math.pow(10, b / 10), 0) / v.length;
  const relGate = -0.691 + 10 * Math.log10(mean(abs)) - 10;
  const gated = abs.filter(v => v > relGate);
  const use = gated.length ? gated : abs;
  return -0.691 + 10 * Math.log10(mean(use));
}
function kWeight(B) {
  // stage 1: high shelf (+4 dB @ ~1.5 kHz), stage 2: high-pass (~38 Hz)
  const out = { L: new Float32Array(B.n), R: new Float32Array(B.n) };
  for (const ch of ['L', 'R']) {
    const x = B[ch], y = out[ch];
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    const b0 = 1.53512485958, b1 = -2.69169618940, b2 = 1.19839281085;
    const a1 = -1.69065929318, a2 = 0.73248077421;
    for (let i = 0; i < B.n; i++) {
      const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
    }
    let u1 = 0, u2 = 0, v1 = 0, v2 = 0;
    const c0 = 1.0, c1 = -2.0, c2 = 1.0, d1 = -1.99004745483, d2 = 0.99007225006;
    for (let i = 0; i < B.n; i++) {
      const u = y[i];
      const v = c0 * u + c1 * u1 + c2 * u2 - d1 * v1 - d2 * v2;
      u2 = u1; u1 = u; v2 = v1; v1 = v; y[i] = v;
    }
  }
  return out;
}

/** 16-bit PCM WAV, for the render pipeline */
export function toWav(st) {
  const n = st.n, bytes = 44 + n * 4;
  const buf = new ArrayBuffer(bytes), dv = new DataView(buf);
  const wstr = (off, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(off + i, s.charCodeAt(i)); };
  wstr(0, 'RIFF'); dv.setUint32(4, bytes - 8, true); wstr(8, 'WAVE'); wstr(12, 'fmt ');
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true);
  dv.setUint32(24, SR, true); dv.setUint32(28, SR * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true);
  wstr(36, 'data'); dv.setUint32(40, n * 4, true);
  let o = 44;
  for (let i = 0; i < n; i++) {
    let l = Math.max(-1, Math.min(1, st.L[i])), r = Math.max(-1, Math.min(1, st.R[i]));
    dv.setInt16(o, l * 32767, true); dv.setInt16(o + 2, r * 32767, true); o += 4;
  }
  return buf;
}
