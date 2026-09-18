// Original sound effects, synthesised in the browser. Nothing is downloaded,
// so there is no licence to track and nothing to fail to load.
// Every effect is scheduled at an absolute AudioContext time, which is what
// keeps pause / replay / seek from ever double-firing a sound.

function env(ctx, node, at, a, d, peak = 1) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), at + a);
  g.gain.exponentialRampToValueAtTime(0.0001, at + a + d);
  node.connect(g);
  return g;
}

function noiseBuffer(ctx) {
  if (ctx._nb) return ctx._nb;
  const len = Math.floor(ctx.sampleRate * 1.2);
  const b = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = b.getChannelData(0);
  let s = 12345;
  for (let i = 0; i < len; i++) {
    s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
    d[i] = (s / 2147483648) - 1;
  }
  ctx._nb = b;
  return b;
}

function noise(ctx, at, dur, { type = 'bandpass', freq = 1200, q = 1, gain = 0.3, sweep = null } = {}) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  src.playbackRate.value = 1;
  const f = ctx.createBiquadFilter();
  f.type = type; f.frequency.setValueAtTime(freq, at); f.Q.value = q;
  if (sweep) f.frequency.exponentialRampToValueAtTime(Math.max(40, sweep), at + dur);
  src.connect(f);
  const g = env(ctx, f, at, Math.min(0.012, dur * 0.2), dur, gain);
  src.start(at);
  src.stop(at + dur + 0.08);
  return g;
}

function tone(ctx, at, dur, { type = 'sine', f0 = 440, f1 = null, gain = 0.2 } = {}) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, at);
  if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), at + dur);
  const g = env(ctx, o, at, Math.min(0.01, dur * 0.25), dur, gain);
  o.start(at);
  o.stop(at + dur + 0.05);
  return g;
}

/** name -> (ctx, at, out, gain) */
const RECIPES = {
  keydown: (c, at, o, g) => { noise(c, at, 0.055, { freq: 2600, q: 0.8, gain: 0.34 * g }).connect(o);
                              tone(c, at, 0.06, { type: 'triangle', f0: 180, f1: 90, gain: 0.30 * g }).connect(o); },
  keyup:   (c, at, o, g) => { noise(c, at, 0.035, { freq: 3800, q: 1.2, gain: 0.16 * g }).connect(o); },
  click:   (c, at, o, g) => { noise(c, at, 0.03, { freq: 3000, q: 1.5, gain: 0.22 * g }).connect(o); },
  thock:   (c, at, o, g) => { tone(c, at, 0.10, { type: 'sine', f0: 150, f1: 70, gain: 0.34 * g }).connect(o);
                              noise(c, at, 0.05, { freq: 1400, q: 0.7, gain: 0.18 * g }).connect(o); },
  thud:    (c, at, o, g) => { tone(c, at, 0.16, { type: 'sine', f0: 120, f1: 48, gain: 0.40 * g }).connect(o);
                              noise(c, at, 0.07, { freq: 700, q: 0.6, gain: 0.16 * g }).connect(o); },
  type:    (c, at, o, g) => { for (let i = 0; i < 18; i++)
                                noise(c, at + i * 0.115 + (i % 3) * 0.012, 0.022, { freq: 2800 + (i % 5) * 340, q: 1.4, gain: 0.10 * g }).connect(o); },
  snap:    (c, at, o, g) => { noise(c, at, 0.04, { freq: 5200, q: 2, gain: 0.30 * g }).connect(o);
                              tone(c, at, 0.05, { type: 'square', f0: 620, f1: 180, gain: 0.10 * g }).connect(o); },
  roll:    (c, at, o, g) => { noise(c, at, 1.1, { type: 'bandpass', freq: 900, q: 0.6, gain: 0.13 * g, sweep: 260 }).connect(o); },
  card:    (c, at, o, g) => { noise(c, at, 0.26, { type: 'highpass', freq: 1800, gain: 0.18 * g, sweep: 3400 }).connect(o); },
  paper:   (c, at, o, g) => { noise(c, at, 0.34, { type: 'bandpass', freq: 2400, q: 0.5, gain: 0.16 * g, sweep: 1100 }).connect(o); },
  printer: (c, at, o, g) => { for (let i = 0; i < 16; i++)
                                noise(c, at + i * 0.062, 0.03, { freq: 1700 + (i % 4) * 500, q: 2, gain: 0.10 * g }).connect(o); },
  stamp:   (c, at, o, g) => { tone(c, at, 0.13, { type: 'sine', f0: 210, f1: 70, gain: 0.40 * g }).connect(o);
                              noise(c, at, 0.09, { freq: 1200, q: 0.5, gain: 0.26 * g }).connect(o); },
  whoosh:  (c, at, o, g) => { noise(c, at, 0.42, { type: 'bandpass', freq: 380, q: 0.7, gain: 0.26 * g, sweep: 2600 }).connect(o); },
  motor:   (c, at, o, g) => { const n = noise(c, at, 2.6, { type: 'lowpass', freq: 520, gain: 0.10 * g }); n.connect(o);
                              tone(c, at, 2.6, { type: 'sawtooth', f0: 58, f1: 62, gain: 0.045 * g }).connect(o); },
  spark:   (c, at, o, g) => { noise(c, at, 0.10, { type: 'highpass', freq: 4200, gain: 0.16 * g }).connect(o); },
  tick:    (c, at, o, g) => { noise(c, at, 0.018, { freq: 5000, q: 3, gain: 0.16 * g }).connect(o); },
  error:   (c, at, o, g) => { tone(c, at, 0.20, { type: 'square', f0: 220, f1: 110, gain: 0.13 * g }).connect(o);
                              tone(c, at + 0.06, 0.18, { type: 'square', f0: 165, f1: 82, gain: 0.11 * g }).connect(o); },
  bonk:    (c, at, o, g) => { tone(c, at, 0.20, { type: 'triangle', f0: 320, f1: 90, gain: 0.32 * g }).connect(o);
                              noise(c, at, 0.05, { freq: 900, q: 0.8, gain: 0.14 * g }).connect(o); },
  pickup:  (c, at, o, g) => { tone(c, at, 0.09, { type: 'square', f0: 740, gain: 0.13 * g }).connect(o);
                              tone(c, at + 0.075, 0.13, { type: 'square', f0: 1108, gain: 0.12 * g }).connect(o); },
  win:     (c, at, o, g) => { [523, 659, 784, 1047].forEach((f, i) =>
                                tone(c, at + i * 0.10, 0.30, { type: 'triangle', f0: f, gain: 0.14 * g }).connect(o)); },
  pass:    (c, at, o, g) => { noise(c, at, 0.55, { type: 'bandpass', freq: 1400, q: 0.5, gain: 0.16 * g, sweep: 220 }).connect(o); },
  uiopen:  (c, at, o, g) => { tone(c, at, 0.10, { type: 'sine', f0: 440, f1: 660, gain: 0.14 * g }).connect(o);
                              noise(c, at, 0.05, { freq: 2600, q: 1.2, gain: 0.10 * g }).connect(o); },
  window:  (c, at, o, g) => { tone(c, at, 0.16, { type: 'sine', f0: 300, f1: 520, gain: 0.14 * g }).connect(o);
                              noise(c, at, 0.10, { type: 'highpass', freq: 2200, gain: 0.10 * g }).connect(o); },
  lid:     (c, at, o, g) => { noise(c, at, 0.20, { type: 'bandpass', freq: 800, q: 0.6, gain: 0.20 * g, sweep: 2200 }).connect(o);
                              tone(c, at + 0.12, 0.10, { type: 'sine', f0: 140, f1: 70, gain: 0.20 * g }).connect(o); },
  cloth:   (c, at, o, g) => { noise(c, at, 0.85, { type: 'bandpass', freq: 3000, q: 0.4, gain: 0.16 * g, sweep: 700 }).connect(o); },
  drag:    (c, at, o, g) => { noise(c, at, 1.2, { type: 'lowpass', freq: 700, gain: 0.11 * g, sweep: 240 }).connect(o); },
};

export const SFX_NAMES = Object.keys(RECIPES);

export function playSfx(ctx, out, name, at, gain = 1) {
  const r = RECIPES[name];
  if (!r) return false;
  r(ctx, Math.max(at, ctx.currentTime), out, gain);
  return true;
}

/**
 * A sparse music bed: one low pulse per beat and a quiet chord that changes by
 * chapter. Kept well under the narration and deliberately thin.
 */
export function musicEvents(chapters, total) {
  const ROOTS = [110, 110, 98, 110, 123.47, 98, 87.31, 98, 110, 98, 130.81];
  const out = [];
  for (let i = 0; i < chapters.length; i++) {
    const start = chapters[i].start;
    const end = i + 1 < chapters.length ? chapters[i + 1].start : total;
    const root = ROOTS[i % ROOTS.length];
    out.push({ t: start + 0.02, kind: 'pad', f: root, dur: Math.min(end - start, 26) });
    for (let b = 0; start + b * 2.0 < end - 1.2; b++) {
      out.push({ t: start + b * 2.0, kind: 'pulse', f: root });
    }
  }
  return out.filter(e => e.t < total);
}

export function playMusic(ctx, out, ev, at) {
  if (ev.kind === 'pad') {
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
    o1.type = 'sine'; o2.type = 'sine';
    o1.frequency.value = ev.f; o2.frequency.value = ev.f * 1.5;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.055, at + 2.2);
    g.gain.setValueAtTime(0.055, at + Math.max(2.4, ev.dur - 2.0));
    g.gain.exponentialRampToValueAtTime(0.0001, at + ev.dur);
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(out);
    o1.start(at); o2.start(at); o1.stop(at + ev.dur + 0.1); o2.stop(at + ev.dur + 0.1);
  } else {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(ev.f / 2, at);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.10, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
    o.connect(g); g.connect(out);
    o.start(at); o.stop(at + 0.55);
  }
}
