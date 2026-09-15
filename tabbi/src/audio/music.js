// Original lightweight score. Each bed is a tension level, not a song.
import { tone, noise, click, bell, SR } from './dsp.js';

const N = (n) => 440 * Math.pow(2, (n - 69) / 12);
const pluck = (B, t, f, d, g, pan = 0) => {
  tone(B, { t, d, f0: f, type: 'tri', g: g * .7, shape: 'perc', so: { k: 7 }, pan });
  tone(B, { t, d: d * .6, f0: f * 2, type: 'sine', g: g * .22, shape: 'perc', so: { k: 11 }, pan });
};
const pad = (B, t, f, d, g, pan = 0) => {
  tone(B, { t, d, f0: f, type: 'soft', g: g * .55, shape: 'pad', so: { a: .35, r: .4 }, pan, vib: .004, vibHz: 3.4 });
  tone(B, { t, d, f0: f * 1.005, type: 'sine', g: g * .3, shape: 'pad', so: { a: .4, r: .45 }, pan: -pan });
};
const bass = (B, t, f, d, g, pan = 0) => {
  tone(B, { t, d, f0: f, type: 'square', duty: .42, g: g * .5, shape: 'blip', so: { a: .02, k: 5 }, pan });
  tone(B, { t, d: d * 1.1, f0: f * .5, type: 'sine', g: g * .6, shape: 'blip', so: { a: .02, k: 4 }, pan });
};
const hat = (B, t, g, open = false) => noise(B, { t, d: open ? .14 : .05, g, lp: 12000, hp: 6000, shape: 'perc', so: { k: open ? 12 : 30 }, seed: (t * 977) | 0 });
const kick = (B, t, g) => { tone(B, { t, d: .22, f0: 120, f1: 45, type: 'sine', g, shape: 'perc', so: { k: 12 } }); };
const snap = (B, t, g) => noise(B, { t, d: .12, g, lp: 7000, hp: 1400, shape: 'perc', so: { k: 20 }, seed: (t * 311) | 0 });

/** iterate steps of a loop between t0 and t1 */
function steps(t0, t1, bpm, div, cb) {
  const st = 60 / bpm / div;
  const i0 = Math.ceil((t0 - 1e-6) / st);
  for (let i = i0; i * st < t1; i++) { const t = i * st; if (t >= t0) cb(i, t); }
}

export const BEDS = {
  silence: () => { },

  hungerPad(B, t0, t1, g) {
    const ch = [[N(53), N(57), N(60), N(64)], [N(50), N(53), N(57), N(60)]];
    steps(t0, t1, 60, .25, (i, t) => { const c = ch[i % 2]; c.forEach((f, k) => pad(B, t, f, 4.2, g * .07 * (k === 0 ? 1.3 : 1), (k - 1.5) * .25)); });
    steps(t0, t1, 60, 1, (i, t) => { if (i % 4 === 0) bell(B, t, N(76), 1.6, g * .028, .3); });
  },
  denial(B, t0, t1, g) {
    steps(t0, t1, 72, .5, (i, t) => { pluck(B, t, N(i % 2 ? 51 : 56), 1.1, g * .1, -.15); bass(B, t, N(i % 2 ? 39 : 44), .7, g * .1); });
    steps(t0, t1, 72, .25, (i, t) => pad(B, t, N(63), 3.4, g * .05, .3));
  },
  checkpoint(B, t0, t1, g) {
    steps(t0, t1, 88, .25, (i, t) => { pad(B, t, N(38), 3.2, g * .11); pad(B, t, N(45), 3.2, g * .05, .3); });
    steps(t0, t1, 88, 1, (i, t) => { click(B, t, g * .05, i % 2 ? .35 : -.35, 5200, .012); if (i % 4 === 0) kick(B, t, g * .12); });
    steps(t0, t1, 88, .5, (i, t) => { if (i % 4 === 1) pluck(B, t, N([63, 61, 60, 63][(i >> 2) % 4]), .9, g * .05, .25); });
  },
  lowEbb(B, t0, t1, g) {
    const ch = [[N(48), N(51), N(55)], [N(46), N(50), N(53)]];
    steps(t0, t1, 52, .25, (i, t) => ch[i % 2].forEach((f, k) => pad(B, t, f, 4.8, g * .07, (k - 1) * .3)));
  },
  idea(B, t0, t1, g) {
    const sc = [60, 64, 67, 72, 76, 72, 67, 64];
    steps(t0, t1, 128, 4, (i, t) => pluck(B, t, N(sc[i % 8]), .42, g * .075, ((i % 4) - 1.5) * .28));
    steps(t0, t1, 128, 1, (i, t) => bass(B, t, N(i % 4 < 2 ? 36 : 41), .4, g * .09));
    steps(t0, t1, 128, 2, (i, t) => hat(B, t, g * .03));
  },
  shopping(B, t0, t1, g) {
    const line = [60, 64, 67, 64, 62, 65, 69, 65];
    steps(t0, t1, 112, 2, (i, t) => pluck(B, t, N(line[i % 8]), .5, g * .07, ((i % 4) - 1.5) * .3));
    steps(t0, t1, 112, 1, (i, t) => bass(B, t, N([36, 36, 41, 43][i % 4]), .42, g * .1));
    steps(t0, t1, 112, 2, (i, t) => hat(B, t, g * .028 * (i % 2 ? .6 : 1)));
    steps(t0, t1, 112, 1, (i, t) => { if (i % 4 === 0) kick(B, t, g * .1); if (i % 4 === 2) snap(B, t, g * .05); });
  },
  victory(B, t0, t1, g) {
    steps(t0, t1, 120, .5, (i, t) => { const ch = [[60, 64, 67, 72], [62, 65, 69, 74], [64, 67, 71, 76], [65, 69, 72, 77]][i % 4]; ch.forEach((n, k) => pluck(B, t, N(n), .8, g * .07, (k - 1.5) * .3)); });
    steps(t0, t1, 120, 1, (i, t) => { bass(B, t, N([36, 38, 40, 41][i % 4]), .45, g * .12); kick(B, t, g * .1); });
    steps(t0, t1, 120, 2, (i, t) => hat(B, t, g * .035, i % 4 === 3));
    steps(t0, t1, 120, 4, (i, t) => { if (i % 16 > 11) pluck(B, t, N(72 + (i % 4) * 2), .3, g * .05, .3); });
  },
  irony(B, t0, t1, g) {
    steps(t0, t1, 96, 2, (i, t) => pluck(B, t, N([60, 63, 67, 63][i % 4]), .6, g * .06, ((i % 4) - 1.5) * .3));
    steps(t0, t1, 96, 1, (i, t) => bass(B, t, N([36, 36, 39, 34][i % 4]), .5, g * .1));
    steps(t0, t1, 96, .25, (i, t) => pad(B, t, N(51), 2.6, g * .05, -.2));
  },
  delivery(B, t0, t1, g) {
    steps(t0, t1, 104, 1, (i, t) => { bass(B, t, N([40, 40, 43, 45][i % 4]), .42, g * .1); if (i % 2 === 0) kick(B, t, g * .09); });
    steps(t0, t1, 104, 2, (i, t) => hat(B, t, g * .03));
    steps(t0, t1, 104, .5, (i, t) => pluck(B, t, N([67, 64, 69, 64][i % 4]), .7, g * .05, .25));
  },
  chase(B, t0, t1, g) {
    steps(t0, t1, 140, 4, (i, t) => bass(B, t, N([36, 36, 43, 36, 41, 36, 39, 36][i % 8]), .16, g * .085));
    steps(t0, t1, 140, 2, (i, t) => hat(B, t, g * .035, i % 8 === 7));
    steps(t0, t1, 140, 1, (i, t) => { if (i % 4 === 0) kick(B, t, g * .13); if (i % 4 === 2) snap(B, t, g * .07); });
    steps(t0, t1, 140, .5, (i, t) => pluck(B, t, N([72, 70, 67, 70][i % 4]), .5, g * .05, ((i % 2) - .5) * .5));
  },
  tension(B, t0, t1, g) {
    steps(t0, t1, 80, 1, (i, t) => { bass(B, t, N(33), .34, g * .1); if (i % 2) click(B, t, g * .04, .3, 4200, .012); });
    steps(t0, t1, 80, .25, (i, t) => pad(B, t, N(68), 3.4, g * .045, .25));
    steps(t0, t1, 80, .5, (i, t) => { if (i % 4 === 3) pluck(B, t, N(63), .7, g * .04, -.3); });
  },
  dread(B, t0, t1, g) {
    steps(t0, t1, 60, .25, (i, t) => { pad(B, t, N(31), 4.4, g * .13); pad(B, t, N(43 - (i % 3)), 4.4, g * .05, .3); });
    steps(t0, t1, 60, 1, (i, t) => { if (i % 4 === 0) tone(B, { t, d: 1.6, f0: N(55 - i % 4), type: 'tri', g: g * .045, shape: 'perc', so: { k: 3 }, pan: -.2 }); });
  },
  ceremony(B, t0, t1, g) {
    const ch = [[48, 55, 60, 64], [46, 53, 58, 62], [45, 52, 57, 61], [43, 50, 55, 59]];
    steps(t0, t1, 46, .25, (i, t) => ch[i % 4].forEach((n, k) => pad(B, t, N(n), 5.4, g * .07, (k - 1.5) * .28)));
    steps(t0, t1, 46, .25, (i, t) => { if (i % 2 === 0) bell(B, t, N(79), 2.6, g * .03, .35); });
  },
  helperTheme(B, t0, t1, g) {
    const arp = [72, 76, 79, 84, 79, 76];
    steps(t0, t1, 96, 3, (i, t) => bell(B, t, N(arp[i % 6]), .8, g * .045, ((i % 3) - 1) * .35));
    steps(t0, t1, 96, .5, (i, t) => pad(B, t, N([52, 55, 57, 55][i % 4]), 1.4, g * .06));
  },
  outro(B, t0, t1, g) {
    steps(t0, t1, 84, .25, (i, t) => [53, 57, 60, 65].forEach((n, k) => pad(B, t, N(n), 3.4, g * .08, (k - 1.5) * .3)));
    steps(t0, t1, 84, 1, (i, t) => { if (i === 0) bass(B, t, N(41), 1.2, g * .1); });
  },
};
