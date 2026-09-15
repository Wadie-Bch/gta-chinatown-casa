// The world's sound. Every cue is synthesised; nothing is sampled.
import { tone, noise, click, bell, SR } from './dsp.js';
const T = (B, o) => tone(B, o), N = (B, o) => noise(B, o);

export function sfx(B, name, t, o = {}) {
  const g = (o.g ?? 1), d = o.d, pan = o.pan || 0;
  switch (name) {
    // --- room tone / beds ------------------------------------------------
    case 'roomHum': T(B, { t, d: d || 2, f0: 58, type: 'sine', g: .035 * g, shape: 'pad', so: { a: .25, r: .3 }, pan }); N(B, { t, d: d || 2, g: .008 * g, lp: 700, shape: 'pad', so: { a: .3, r: .3 }, seed: 3 }); break;
    case 'roomHumDark': T(B, { t, d: d || 2, f0: 44, type: 'saw', g: .05 * g, shape: 'pad', so: { a: .3, r: .3 } }); T(B, { t, d: d || 2, f0: 120.5, type: 'sine', g: .018 * g, shape: 'pad', so: { a: .4, r: .4 } }); break;
    case 'sizzle': N(B, { t, d: d || 1.5, g: .03 * g, lp: 8000, hp: 2000, shape: 'pad', so: { a: .3, r: .35 }, seed: 9 }); break;
    // --- body ------------------------------------------------------------
    case 'growl': T(B, { t, d: d || 1.1, f0: 62, f1: 44, type: 'saw', g: .20 * g, shape: 'swell', vib: .35, vibHz: 6.2 }); T(B, { t: t + .12, d: (d || 1.1) * .7, f0: 92, f1: 58, type: 'tri', g: .09 * g, shape: 'swell', vib: .3, vibHz: 4.4 }); N(B, { t, d: d || 1.1, g: .03 * g, lp: 420, shape: 'swell', seed: 17 }); break;
    case 'growlShort': T(B, { t, d: .5, f0: 70, f1: 46, type: 'saw', g: .18 * g, shape: 'swell', vib: .3, vibHz: 7 }); break;
    case 'blink': T(B, { t, d: .05, f0: 1500, f1: 900, type: 'sine', g: .05 * g, shape: 'perc', so: { k: 26 } }); break;
    case 'blinkSlow': T(B, { t, d: .3, f0: 900, f1: 420, type: 'sine', g: .05 * g, shape: 'blip', so: { a: .3, k: 6 } }); break;
    case 'eyeNarrow': T(B, { t, d: .18, f0: 800, f1: 380, type: 'tri', g: .05 * g, shape: 'blip', so: { a: .2, k: 9 } }); break;
    case 'gasp': N(B, { t, d: .34, g: .09 * g, lp: 1300, lp1: 4400, shape: 'rise', so: { a: .65, r: .3 }, seed: 41 }); T(B, { t: t + .02, d: .28, f0: 420, f1: 780, type: 'square', duty: .42, g: .08 * g, shape: 'blip', so: { a: .35, k: 6 } }); break;
    case 'sigh': T(B, { t, d: .9, f0: 500, f1: 300, type: 'square', duty: .42, g: .09 * g, shape: 'swell' }); N(B, { t, d: 1.0, g: .05 * g, lp: 2600, lp1: 800, shape: 'swell', seed: 71 }); break;
    case 'swallow': T(B, { t, d: .1, f0: 150, f1: 88, type: 'sine', g: .11 * g, shape: 'perc', so: { k: 15 } }); break;
    case 'crunch': for (let i = 0; i < 5; i++) N(B, { t: t + i * .055, d: .09, g: .14 * g * (1 - i * .13), lp: 5200, hp: 600, shape: 'perc', so: { k: 24 }, seed: 300 + i * 13 }); break;
    case 'panting': for (let i = 0; i < Math.ceil((d || 2) / .34); i++) N(B, { t: t + i * .34, d: .2, g: .05 * g, lp: 1500, lp1: 900, shape: 'swell', seed: 500 + i * 11 }); break;
    // --- interface -------------------------------------------------------
    case 'uiPop': T(B, { t, d: .14, f0: 620, f1: 980, type: 'sine', g: .12 * g, shape: 'blip', so: { a: .1, k: 15 } }); click(B, t, .05 * g, pan, 6000); break;
    case 'uiSlam': T(B, { t, d: .3, f0: 260, f1: 120, type: 'tri', g: .2 * g, shape: 'perc', so: { k: 10 } }); N(B, { t, d: .2, g: .09 * g, lp: 3000, shape: 'perc', so: { k: 16 }, seed: 6 }); break;
    case 'tick': click(B, t, .09 * g, pan, 7000, .01); T(B, { t, d: .05, f0: 2100, type: 'sine', g: .05 * g, shape: 'perc', so: { k: 40 } }); break;
    case 'tickSlow': T(B, { t, d: .14, f0: 1200, f1: 900, type: 'sine', g: .08 * g, shape: 'perc', so: { k: 18 } }); break;
    case 'typeKey': click(B, t, .075 * g, (Math.sin(t * 91) * .3), 5200, .014); T(B, { t, d: .035, f0: 340 + (t * 137 % 90), type: 'square', g: .045 * g, shape: 'perc', so: { k: 40 } }); break;
    case 'hoverTick': T(B, { t, d: .07, f0: 1500, type: 'sine', g: .05 * g, shape: 'perc', so: { k: 28 } }); break;
    case 'click': case 'clack': click(B, t, .13 * g, pan, 4200, .02); T(B, { t, d: .07, f0: 300, f1: 180, type: 'tri', g: .1 * g, shape: 'perc', so: { k: 22 } }); break;
    case 'clickHeavy': click(B, t, .2 * g, pan, 3200, .035); T(B, { t, d: .16, f0: 190, f1: 92, type: 'tri', g: .24 * g, shape: 'perc', so: { k: 13 } }); T(B, { t: t + .02, d: .1, f0: 640, type: 'sine', g: .07 * g, shape: 'perc', so: { k: 20 } }); break;
    case 'flipCard': for (let i = 0; i < 3; i++) click(B, t + i * .05, .07 * g, pan, 4000, .012); break;
    case 'deny': T(B, { t, d: .42, f0: 200, f1: 118, type: 'square', duty: .35, g: .2 * g, shape: 'blip', so: { a: .02, k: 5 } }); T(B, { t: t + .13, d: .34, f0: 150, f1: 96, type: 'square', duty: .35, g: .17 * g, shape: 'blip', so: { a: .02, k: 5 } }); break;
    case 'errorSoft': T(B, { t, d: .22, f0: 330, f1: 246, type: 'tri', g: .13 * g, shape: 'blip', so: { a: .05, k: 9 } }); break;
    case 'successSoft': bell(B, t, 880, .5, .13 * g, pan); bell(B, t + .1, 1320, .5, .1 * g, pan); break;
    case 'successBig': [523, 659, 784, 1046].forEach((f, i) => bell(B, t + i * .1, f, .9, .16 * g, pan)); break;
    case 'chimeSoft': bell(B, t, 1046, .6, .09 * g, pan); break;
    case 'notif1': bell(B, t, 988, .45, .12 * g, .2); bell(B, t + .11, 1318, .5, .1 * g, -.2); break;
    case 'notif3': bell(B, t, 784, .5, .13 * g, 0); bell(B, t + .13, 1175, .55, .11 * g, 0); break;
    case 'notifSlide': N(B, { t, d: .3, g: .05 * g, lp: 2600, hp: 500, shape: 'swell', seed: 88 }); break;
    case 'sendMsg': T(B, { t, d: .1, f0: 700, f1: 1250, type: 'sine', g: .11 * g, shape: 'blip', so: { a: .08, k: 16 }, pan: .3 }); break;
    case 'recvMsg': T(B, { t, d: .12, f0: 900, f1: 560, type: 'sine', g: .11 * g, shape: 'blip', so: { a: .08, k: 14 }, pan: -.3 }); break;
    case 'copied': T(B, { t, d: .09, f0: 1400, f1: 1900, type: 'sine', g: .09 * g, shape: 'blip', so: { a: .08, k: 20 } }); break;
    case 'linkPop': T(B, { t, d: .18, f0: 520, f1: 1250, type: 'sine', g: .12 * g, shape: 'blip', so: { a: .08, k: 12 } }); break;
    case 'screenOn': N(B, { t, d: .25, g: .07 * g, lp: 9000, hp: 3000, shape: 'perc', so: { k: 12 }, seed: 4 }); T(B, { t, d: .5, f0: 15720 / 8, type: 'sine', g: .02 * g, shape: 'pad', so: { a: .05, r: .3 } }); break;
    case 'spinLoop': for (let i = 0; i < Math.ceil((d || 1) / .19); i++) T(B, { t: t + i * .19, d: .1, f0: 640 + (i % 3) * 110, type: 'sine', g: .045 * g, shape: 'blip', so: { a: .15, k: 16 } }); break;
    case 'printer': for (let i = 0; i < Math.ceil((d || 2) / .07); i++) { click(B, t + i * .07, .045 * g, ((i % 2) ? .25 : -.25), 3600, .012); } N(B, { t, d: d || 2, g: .03 * g, lp: 2200, hp: 400, shape: 'pad', so: { a: .1, r: .2 }, seed: 55 }); break;
    case 'stamp': case 'stampSoft': T(B, { t, d: .16, f0: 150, f1: 70, type: 'tri', g: (name === 'stamp' ? .22 : .13) * g, shape: 'perc', so: { k: 15 } }); N(B, { t, d: .1, g: .1 * g, lp: 3400, shape: 'perc', so: { k: 24 }, seed: 8 }); break;
    case 'stampHeavy': T(B, { t, d: .3, f0: 120, f1: 48, type: 'square', duty: .4, g: .28 * g, shape: 'perc', so: { k: 9 } }); N(B, { t, d: .18, g: .16 * g, lp: 2600, shape: 'perc', so: { k: 15 }, seed: 2 }); break;
    case 'sting': [392, 311].forEach((f, i) => T(B, { t: t + i * .16, d: .9, f0: f, type: 'tri', g: .12 * g, shape: 'perc', so: { k: 4 } })); T(B, { t, d: 1.2, f0: 55, type: 'sine', g: .1 * g, shape: 'swell' }); break;
    case 'markSting': [523, 784, 1046].forEach((f, i) => bell(B, t + i * .075, f, 1.4, .14 * g, i === 1 ? .2 : -.15)); T(B, { t, d: 1.6, f0: 130.8, type: 'sine', g: .08 * g, shape: 'swell' }); break;
    case 'silenceHit': T(B, { t, d: .8, f0: 70, f1: 40, type: 'sine', g: .16 * g, shape: 'perc', so: { k: 3 } }); break;
    case 'idea': [784, 1046, 1318, 1568].forEach((f, i) => bell(B, t + i * .06, f, .7, .13 * g, 0)); break;
    case 'powerUp': T(B, { t, d: .55, f0: 180, f1: 900, type: 'square', duty: .3, g: .09 * g, shape: 'rise', so: { a: .6, r: .2 }, glide: 'exp' }); break;
    case 'riser': T(B, { t, d: d || 1.2, f0: 110, f1: 900, type: 'saw', g: .07 * g, shape: 'rise', so: { a: .85, r: .1 }, glide: 'exp' }); N(B, { t, d: d || 1.2, g: .05 * g, lp: 700, lp1: 9000, shape: 'rise', so: { a: .9, r: .08 }, seed: 19 }); break;
    case 'confetti': for (let i = 0; i < 14; i++) T(B, { t: t + i * .028, d: .2, f0: 900 + (i * 137 % 900), type: 'sine', g: .05 * g, shape: 'perc', so: { k: 14 }, pan: ((i % 5) - 2) * .3 }); break;
    case 'clapSoft': N(B, { t, d: .16, g: .1 * g, lp: 6000, hp: 900, shape: 'perc', so: { k: 20 }, seed: 600 + (t * 31 | 0) }); break;
    case 'badgeAttach': T(B, { t, d: .12, f0: 1200, f1: 1600, type: 'sine', g: .1 * g, shape: 'blip', so: { a: .1, k: 16 } }); bell(B, t + .06, 1568, .6, .08 * g, 0); break;
    case 'splitSwish': N(B, { t, d: .22, g: .09 * g, lp: 3000, lp1: 9000, shape: 'swell', seed: 91 }); break;
    case 'wobble': T(B, { t, d: .35, f0: 300, type: 'tri', g: .09 * g, shape: 'blip', so: { a: .05, k: 7 }, vib: .12, vibHz: 12 }); break;
    case 'wrongWay': T(B, { t, d: .5, f0: 420, f1: 190, type: 'square', duty: .3, g: .13 * g, shape: 'blip', so: { a: .03, k: 5 } }); break;
    case 'gateBeep': T(B, { t, d: .1, f0: 340, type: 'square', duty: .5, g: .1 * g, shape: 'gate', so: { a: .02, r: .1 } }); T(B, { t: t + .12, d: .1, f0: 255, type: 'square', duty: .5, g: .09 * g, shape: 'gate', so: { a: .02, r: .1 } }); break;
    case 'scanUp': T(B, { t, d: d || 1.6, f0: 300, f1: 1500, type: 'sine', g: .05 * g, shape: 'rise', so: { a: .8, r: .15 } }); for (let i = 0; i < 8; i++) T(B, { t: t + i * .2, d: .06, f0: 1800, type: 'sine', g: .04 * g, shape: 'perc', so: { k: 30 } }); break;
    case 'helperChime': [659, 880, 1174].forEach((f, i) => bell(B, t + i * .07, f, .8, .1 * g, .15)); break;
    case 'helperRead': [880, 1046, 784, 988].forEach((f, i) => { bell(B, t + i * .34, f, .5, .1 * g, .1); }); break;
    case 'thinkBlip': T(B, { t, d: .1, f0: 700, f1: 820, type: 'sine', g: .07 * g, shape: 'blip', so: { a: .15, k: 16 } }); break;
    case 'domeSeal': T(B, { t, d: .7, f0: 900, f1: 300, type: 'sine', g: .1 * g, shape: 'swell' }); N(B, { t, d: .6, g: .05 * g, lp: 5000, lp1: 1200, shape: 'swell', seed: 44 }); break;
    case 'glassPress': N(B, { t, d: .45, g: .05 * g, lp: 2400, hp: 800, shape: 'swell', seed: 23 }); T(B, { t, d: .4, f0: 1600, f1: 1250, type: 'sine', g: .035 * g, shape: 'swell' }); break;
    // --- physical --------------------------------------------------------
    case 'footStep': N(B, { t, d: .08, g: .09 * g, lp: 1800, shape: 'perc', so: { k: 24 }, pan, seed: 700 + (t * 53 | 0) }); T(B, { t, d: .06, f0: 110, type: 'sine', g: .07 * g, shape: 'perc', so: { k: 26 } }); break;
    case 'footRunStep': N(B, { t, d: .06, g: .075 * g, lp: 2400, shape: 'perc', so: { k: 30 }, pan, seed: 800 + (t * 71 | 0) }); T(B, { t, d: .05, f0: 140, type: 'sine', g: .06 * g, shape: 'perc', so: { k: 30 } }); break;
    case 'footRun': for (let i = 0; i < 4; i++) sfx(B, 'footRunStep', t + i * .09, { g }); break;
    case 'jump': T(B, { t, d: .22, f0: 260, f1: 620, type: 'square', duty: .35, g: .1 * g, shape: 'blip', so: { a: .08, k: 9 } }); break;
    case 'landSoft': T(B, { t, d: .14, f0: 170, f1: 90, type: 'tri', g: .13 * g, shape: 'perc', so: { k: 16 } }); N(B, { t, d: .1, g: .06 * g, lp: 1600, shape: 'perc', so: { k: 20 }, seed: 33 }); break;
    case 'thud': case 'thudSoft': case 'sitThud': T(B, { t, d: .22, f0: 130, f1: 58, type: 'sine', g: (name === 'thud' ? .24 : .15) * g, shape: 'perc', so: { k: 12 } }); N(B, { t, d: .12, g: .06 * g, lp: 1200, shape: 'perc', so: { k: 18 }, seed: 21 }); break;
    case 'doink': T(B, { t, d: .3, f0: 420, f1: 180, type: 'sine', g: .16 * g, shape: 'perc', so: { k: 8 } }); T(B, { t, d: .2, f0: 840, type: 'sine', g: .05 * g, shape: 'perc', so: { k: 16 } }); break;
    case 'whoosh': N(B, { t, d: .34, g: .09 * g, lp: 900, lp1: 6000, shape: 'swell', seed: 400 + (t * 17 | 0) }); break;
    case 'mapWhoosh': N(B, { t, d: .6, g: .09 * g, lp: 600, lp1: 5000, shape: 'swell', seed: 12 }); T(B, { t, d: .6, f0: 120, f1: 320, type: 'sine', g: .05 * g, shape: 'swell' }); break;
    case 'lookSwish': N(B, { t, d: .18, g: .05 * g, lp: 1800, lp1: 5200, shape: 'swell', seed: 66 }); break;
    case 'slideIn': N(B, { t, d: .26, g: .06 * g, lp: 3600, hp: 400, shape: 'swell', seed: 51 }); break;
    case 'dragSlide': N(B, { t, d: d || 1, g: .05 * g, lp: 1500, hp: 200, shape: 'pad', so: { a: .1, r: .2 }, seed: 29 }); break;
    case 'scrape': N(B, { t, d: .4, g: .07 * g, lp: 2600, hp: 500, shape: 'swell', seed: 37 }); break;
    case 'skid': case 'skidStop': N(B, { t, d: .34, g: .1 * g, lp: 4200, hp: 900, shape: 'perc', so: { k: 7 }, seed: 13 }); T(B, { t, d: .3, f0: 700, f1: 260, type: 'saw', g: .05 * g, shape: 'perc', so: { k: 8 } }); break;
    case 'skateRoll': N(B, { t, d: d || 1, g: .045 * g, lp: 3000, hp: 700, shape: 'pad', so: { a: .15, r: .25 }, seed: 61 }); for (let i = 0; i < Math.ceil((d || 1) / .22); i++) click(B, t + i * .22, .03 * g, pan, 3400, .01); break;
    case 'slideFloor': N(B, { t, d: .55, g: .07 * g, lp: 2200, hp: 300, shape: 'swell', seed: 73 }); break;
    case 'slideDown': N(B, { t, d: 1.0, g: .05 * g, lp: 1400, hp: 200, shape: 'swell', seed: 83 }); break;
    case 'doorSlide': N(B, { t, d: .5, g: .07 * g, lp: 1600, hp: 200, shape: 'swell', seed: 43 }); break;
    case 'doorThunk': T(B, { t, d: .4, f0: 96, f1: 42, type: 'sine', g: .26 * g, shape: 'perc', so: { k: 8 } }); N(B, { t, d: .16, g: .1 * g, lp: 1100, shape: 'perc', so: { k: 14 }, seed: 7 }); break;
    case 'shutterDrop': N(B, { t, d: .5, g: .1 * g, lp: 2600, hp: 300, shape: 'swell', seed: 27 }); for (let i = 0; i < 7; i++) click(B, t + i * .06, .05 * g, 0, 3000, .012); break;
    case 'creak': T(B, { t, d: .4, f0: 380, f1: 430, type: 'saw', g: .04 * g, shape: 'swell', vib: .04, vibHz: 9 }); break;
    case 'grab': click(B, t, .1 * g, pan, 2600, .03); T(B, { t, d: .1, f0: 200, f1: 130, type: 'tri', g: .09 * g, shape: 'perc', so: { k: 18 } }); break;
    case 'coin': case 'coinDrop': [1568, 2093].forEach((f, i) => bell(B, t + i * .05, f, .7, .1 * g, 0)); if (name === 'coinDrop') for (let i = 0; i < 4; i++) click(B, t + .55 + i * .07 * (i + 1), .05 * g, 0, 6000, .01); break;
    case 'boxLift': N(B, { t, d: .25, g: .06 * g, lp: 2200, hp: 300, shape: 'swell', seed: 57 }); break;
    case 'boxSet': T(B, { t, d: .2, f0: 150, f1: 80, type: 'tri', g: .14 * g, shape: 'perc', so: { k: 13 } }); N(B, { t, d: .14, g: .07 * g, lp: 2600, shape: 'perc', so: { k: 16 }, seed: 63 }); break;
    case 'boxDrop': T(B, { t, d: .18, f0: 190, f1: 100, type: 'tri', g: .13 * g, shape: 'perc', so: { k: 14 } }); N(B, { t, d: .12, g: .06 * g, lp: 3000, shape: 'perc', so: { k: 18 }, seed: 67 }); break;
    case 'boxOpen': case 'boxOpenSmall': N(B, { t, d: .3, g: .06 * g, lp: 3200, hp: 400, shape: 'swell', seed: 79 }); T(B, { t: t + .18, d: .1, f0: 240, f1: 180, type: 'tri', g: .07 * g, shape: 'perc', so: { k: 18 } }); break;
    case 'flap': for (let i = 0; i < 3; i++) N(B, { t: t + i * .12, d: .1, g: .05 * g, lp: 4000, hp: 900, shape: 'perc', so: { k: 16 }, seed: 900 + i * 5 }); break;
    case 'hoverIn': T(B, { t, d: d || 2, f0: 210, f1: 180, type: 'sine', g: .05 * g, shape: 'pad', so: { a: .2, r: .3 } }); N(B, { t, d: d || 2, g: .02 * g, lp: 1200, shape: 'pad', so: { a: .2, r: .3 }, seed: 87 }); break;
    case 'blipSoft': T(B, { t, d: .08, f0: 1200, type: 'sine', g: .05 * g, shape: 'perc', so: { k: 22 } }); break;
    case 'shutterSoft': click(B, t, .08 * g, 0, 5000, .02); break;

    // --- cartoon department -------------------------------------------------
    case 'boing': T(B, { t, d: .5, f0: 520, f1: 150, type: 'sine', g: .17 * g, shape: 'perc', so: { k: 5 }, vib: .28, vibHz: 17, pan }); T(B, { t, d: .3, f0: 1040, f1: 300, type: 'sine', g: .05 * g, shape: 'perc', so: { k: 9 }, vib: .28, vibHz: 17 }); break;
    case 'slideWhistleUp': T(B, { t, d: d || .55, f0: 420, f1: 1750, type: 'sine', g: .12 * g, shape: 'swell', glide: 'exp', vib: .012, vibHz: 9, pan }); N(B, { t, d: d || .55, g: .022 * g, lp: 4200, hp: 1200, shape: 'swell', seed: 311 }); break;
    case 'slideWhistleDown': T(B, { t, d: d || .7, f0: 1650, f1: 300, type: 'sine', g: .12 * g, shape: 'swell', glide: 'exp', vib: .012, vibHz: 8, pan }); N(B, { t, d: d || .7, g: .022 * g, lp: 3600, hp: 900, shape: 'swell', seed: 312 }); break;
    case 'sadTrombone': [233.1, 220, 196, 174.6].forEach((fr, i) => { T(B, { t: t + i * .3, d: .42, f0: fr * 1.06, f1: fr, type: 'saw', g: .12 * g, shape: 'blip', so: { a: .12, k: 5 }, vib: .02, vibHz: 6, pan }); T(B, { t: t + i * .3, d: .42, f0: fr * .5, type: 'sine', g: .07 * g, shape: 'blip', so: { a: .12, k: 5 } }); }); break;
    case 'cashRegister': click(B, t, .12 * g, pan, 5200, .02); bell(B, t + .02, 1568, .5, .13 * g, .15); bell(B, t + .09, 2093, .55, .1 * g, -.15); N(B, { t: t + .3, d: .3, g: .07 * g, lp: 2600, hp: 300, shape: 'swell', seed: 313 }); T(B, { t: t + .52, d: .12, f0: 150, f1: 80, type: 'tri', g: .13 * g, shape: 'perc', so: { k: 15 } }); break;
    case 'recordScratch': { const dd = d || .45; N(B, { t, d: dd, g: .12 * g, lp: 2400, lp1: 7000, hp: 400, shape: 'perc', so: { k: 5 }, seed: 314 }); T(B, { t, d: dd, f0: 900, f1: 120, type: 'saw', g: .08 * g, shape: 'perc', so: { k: 4 }, vib: .2, vibHz: 22 }); break; }
    case 'cartoonRun': { const n = Math.ceil((d || .9) / .055); for (let i = 0; i < n; i++) { click(B, t + i * .055, .05 * g, ((i % 2) ? .3 : -.3), 3600 + i * 60, .012); T(B, { t: t + i * .055, d: .04, f0: 300 + i * 26, type: 'square', g: .035 * g, shape: 'perc', so: { k: 40 } }); } break; }
    case 'partyHorn': T(B, { t, d: .36, f0: 300, f1: 760, type: 'saw', g: .12 * g, shape: 'rise', so: { a: .5, r: .3 }, pan }); T(B, { t: t + .34, d: .5, f0: 760, f1: 240, type: 'saw', g: .1 * g, shape: 'perc', so: { k: 5 } }); N(B, { t, d: .8, g: .03 * g, lp: 5000, hp: 900, shape: 'swell', seed: 315 }); break;
    case 'squeakyToy': T(B, { t, d: .17, f0: 900, f1: 2100, type: 'sine', g: .1 * g, shape: 'blip', so: { a: .3, k: 10 }, pan }); T(B, { t: t + .18, d: .2, f0: 2100, f1: 800, type: 'sine', g: .09 * g, shape: 'blip', so: { a: .2, k: 9 } }); break;
    case 'popCork': click(B, t, .16 * g, pan, 2600, .014); T(B, { t, d: .18, f0: 420, f1: 180, type: 'sine', g: .16 * g, shape: 'perc', so: { k: 14 } }); N(B, { t: t + .04, d: .2, g: .04 * g, lp: 6000, hp: 1800, shape: 'perc', so: { k: 12 }, seed: 316 }); break;
    case 'rubberStretch': T(B, { t, d: d || .8, f0: 160, f1: 430, type: 'saw', g: .07 * g, shape: 'swell', vib: .06, vibHz: 11, pan }); N(B, { t, d: d || .8, g: .03 * g, lp: 1800, shape: 'swell', seed: 317 }); break;
    case 'bigGulp': [190, 150, 118, 92].forEach((fr, i) => T(B, { t: t + i * .12, d: .12, f0: fr, f1: fr * .7, type: 'sine', g: .13 * g, shape: 'perc', so: { k: 14 } })); break;
    case 'wetSplat': N(B, { t, d: .16, g: .16 * g, lp: 2400, shape: 'perc', so: { k: 16 }, seed: 318 }); T(B, { t, d: .2, f0: 190, f1: 60, type: 'sine', g: .16 * g, shape: 'perc', so: { k: 11 } }); break;
    case 'tinyApplause': for (let i = 0; i < 9; i++) N(B, { t: t + i * .085 + (i % 3) * .015, d: .1, g: .045 * g, lp: 6500, hp: 1300, shape: 'perc', so: { k: 22 }, pan: ((i % 3) - 1) * .4, seed: 700 + i * 17 }); break;
    case 'elevatorDing': bell(B, t, 1318, .9, .12 * g, .1); bell(B, t + .26, 1046, 1.1, .1 * g, -.1); break;
    case 'snore': { const n = Math.ceil((d || 3) / 1.5); for (let i = 0; i < n; i++) { const st = t + i * 1.5; N(B, { t: st, d: .6, g: .055 * g, lp: 700, lp1: 340, shape: 'swell', seed: 400 + i * 13 }); T(B, { t: st, d: .6, f0: 92, f1: 74, type: 'saw', g: .06 * g, shape: 'swell', vib: .16, vibHz: 12 }); T(B, { t: st + .78, d: .38, f0: 210, f1: 150, type: 'sine', g: .035 * g, shape: 'swell' }); } break; }
    case 'clockTick': click(B, t, .055 * g, pan, 5200, .009); break;
    case 'plantGrow': T(B, { t, d: d || 1.1, f0: 200, f1: 900, type: 'sine', g: .05 * g, shape: 'rise', so: { a: .75, r: .2 }, glide: 'exp' }); for (let i = 0; i < 7; i++) click(B, t + i * .13, .03 * g, ((i % 2) ? .25 : -.25), 3400, .01); break;
    case 'stampBig': T(B, { t, d: .34, f0: 110, f1: 44, type: 'square', duty: .4, g: .3 * g, shape: 'perc', so: { k: 8 } }); N(B, { t, d: .2, g: .17 * g, lp: 2400, shape: 'perc', so: { k: 14 }, seed: 319 }); break;
    case 'toggleFlip': click(B, t, .07 * g, pan, 4600, .012); T(B, { t, d: .06, f0: 620, f1: 900, type: 'square', g: .05 * g, shape: 'perc', so: { k: 28 } }); break;
    case 'paperSlide': N(B, { t, d: d || .3, g: .05 * g, lp: 3800, hp: 600, shape: 'swell', seed: 320 }); break;
    case 'tabbiSmug': case 'tabbiCheer': case 'tabbiShout': case 'tabbiHuff': case 'tabbiSmall': case 'dashSigh': case 'retainWarm': case 'retainSad': break; // handled as reactions
    default: break;
  }
}
