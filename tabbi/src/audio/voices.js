// Character vocalisations. No speech synthesis is used: each character has a
// timbre, a pitch contour and a rhythm, so you can tell who is talking with
// your eyes shut. The words themselves are on screen.
import { tone, noise, click, SR } from './dsp.js';

const VOICE = {
  tabbi: { type: 'square', duty: .42, base: 470, range: 140, syl: .115, g: .17, vib: .012, vibHz: 7, air: .012, glideUp: 1, k: 13 },
  gate: { type: 'square', duty: .5, base: 104, range: 6, syl: .225, g: .20, vib: 0, vibHz: 0, air: .02, glideUp: 0, k: 7, sub: 1 },
  helper: { type: 'sine', duty: .5, base: 620, range: 200, syl: .155, g: .15, vib: .006, vibHz: 5, air: .006, glideUp: 1.4, k: 10, bell: 1 },
  dash: { type: 'saw', duty: .5, base: 205, range: 55, syl: .2, g: .15, vib: .008, vibHz: 4.5, air: .045, glideUp: -1, k: 9 },
  sysv: { type: 'pulse', duty: .3, base: 148, range: 10, syl: .17, g: .17, vib: 0, vibHz: 0, air: .01, glideUp: 0, k: 9, bit: 1 },
};
export const VOICE_NAMES = Object.keys(VOICE);

/** how many syllables a written line is worth */
export function syllables(text) {
  const m = String(text).toLowerCase().replace(/[^a-z ]/g, ' ').match(/[aeiouy]+/g);
  const n = m ? m.length : Math.max(1, Math.round(String(text).length / 3));
  return Math.max(1, Math.min(9, n));
}

/**
 * Speak a line: one short burst per syllable, contoured so statements fall and
 * questions rise. Deterministic — the same line always sounds the same.
 */
export function speak(B, t0, dur, text, who = 'tabbi', o = {}) {
  const V = VOICE[who] || VOICE.tabbi;
  const n = syllables(text);
  const q = /\?$/.test(String(text).trim());
  const shout = /[A-Z]{4,}|!/.test(String(text));
  const span = Math.min(dur * .82, n * V.syl * 1.35);
  const step = span / n;
  const gBase = V.g * (o.g ?? 1) * (shout ? 1.35 : 1);
  for (let i = 0; i < n; i++) {
    const u = n === 1 ? .5 : i / (n - 1);
    // contour: a little arch, then down for statements, up for questions
    const arch = Math.sin(u * Math.PI) * .35;
    const dir = q ? u * .85 : -u * .5;
    const f = V.base * (1 + (arch + dir) * (V.range / V.base) * 2.1) * (o.pitch || 1);
    const t = t0 + i * step;
    const d = Math.min(step * .86, V.syl * 1.15);
    const g = gBase * (0.82 + 0.18 * Math.sin(u * 5.3));
    tone(B, { t, d, f0: f * (V.glideUp ? 1 - .05 * V.glideUp : 1), f1: f * (V.glideUp ? 1 + .06 * V.glideUp : 1), type: V.type, duty: V.duty, g, shape: 'blip', so: { a: .1, k: V.k }, vib: V.vib, vibHz: V.vibHz, pan: o.pan || 0 });
    // a formant partial keeps it from sounding like a beep
    tone(B, { t, d: d * .9, f0: f * 2.02, type: 'sine', g: g * .3, shape: 'blip', so: { a: .12, k: V.k + 4 }, pan: o.pan || 0 });
    if (V.sub) tone(B, { t, d: d * 1.1, f0: f * .5, type: 'sine', g: g * .55, shape: 'blip', so: { a: .08, k: V.k - 2 }, pan: o.pan || 0 });
    if (V.bell) tone(B, { t, d: d * 1.5, f0: f * 3.01, type: 'sine', g: g * .14, shape: 'perc', so: { k: 9 }, pan: o.pan || 0 });
    if (V.bit) tone(B, { t, d: d * .5, f0: f * 1.5, type: 'square', g: g * .22, shape: 'gate', so: { a: .02, r: .1 }, pan: o.pan || 0 });
    if (V.air) noise(B, { t, d: d * .8, g: V.air * (o.g ?? 1), lp: who === 'dash' ? 2400 : 5200, shape: 'blip', so: { a: .15, k: 10 }, pan: o.pan || 0, seed: 1000 + i * 7 });
  }
  return span;
}

/** a non-verbal reaction: gasp, sigh, huff, cheer */
export function react(B, t, kind, who = 'tabbi', g = 1) {
  const V = VOICE[who] || VOICE.tabbi;
  switch (kind) {
    case 'gasp':
      noise(B, { t, d: .36, g: .10 * g, lp: 1400, lp1: 4200, shape: 'rise', so: { a: .7, r: .25 }, seed: 31 });
      tone(B, { t: t + .03, d: .3, f0: V.base * .9, f1: V.base * 1.8, type: V.type, duty: V.duty, g: .1 * g, shape: 'blip', so: { a: .3, k: 6 } });
      break;
    case 'sigh':
      tone(B, { t, d: .85, f0: V.base * 1.05, f1: V.base * .6, type: V.type, duty: V.duty, g: .1 * g, shape: 'swell', vib: .01, vibHz: 4 });
      noise(B, { t, d: .95, g: .05 * g, lp: 2600, lp1: 900, shape: 'swell', seed: 77 });
      break;
    case 'huff':
      tone(B, { t, d: .22, f0: V.base * 1.3, f1: V.base * .8, type: V.type, duty: V.duty, g: .15 * g, shape: 'perc', so: { k: 9 } });
      noise(B, { t, d: .2, g: .06 * g, lp: 2000, shape: 'perc', so: { k: 12 }, seed: 12 });
      break;
    case 'cheer':
      for (let i = 0; i < 4; i++) tone(B, { t: t + i * .105, d: .18, f0: V.base * (1.1 + i * .22), f1: V.base * (1.25 + i * .24), type: V.type, duty: V.duty, g: .16 * g, shape: 'blip', so: { a: .1, k: 10 }, vib: .02, vibHz: 8 });
      break;
    case 'smug':
      tone(B, { t, d: .16, f0: V.base * 1.0, f1: V.base * 1.35, type: V.type, duty: V.duty, g: .14 * g, shape: 'blip', so: { a: .12, k: 11 } });
      tone(B, { t: t + .17, d: .22, f0: V.base * 1.35, f1: V.base * 1.55, type: V.type, duty: V.duty, g: .13 * g, shape: 'blip', so: { a: .12, k: 9 } });
      break;
    case 'shout':
      for (let i = 0; i < 3; i++) tone(B, { t: t + i * .12, d: .16, f0: V.base * 1.7, f1: V.base * 1.45, type: V.type, duty: V.duty, g: .2 * g, shape: 'blip', so: { a: .05, k: 12 } });
      break;
    case 'small':
      tone(B, { t, d: .3, f0: V.base * .85, f1: V.base * .72, type: V.type, duty: V.duty, g: .075 * g, shape: 'blip', so: { a: .25, k: 7 }, vib: .01, vibHz: 4 });
      break;
    case 'swallow':
      tone(B, { t, d: .1, f0: 150, f1: 90, type: 'sine', g: .12 * g, shape: 'perc', so: { k: 14 } });
      noise(B, { t, d: .09, g: .04 * g, lp: 900, shape: 'perc', so: { k: 18 }, seed: 5 });
      break;
    case 'pant':
      for (let i = 0; i < 5; i++) noise(B, { t: t + i * .32, d: .2, g: .055 * g, lp: 1500, lp1: 900, shape: 'swell', seed: 200 + i * 9 });
      break;
  }
}
