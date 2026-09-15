// ACT 1 — THE CAPTCHA (0:20 – 1:00). Three different humiliations, not one repeated.
import { C, W, H } from '../core/palette.js';
import { S, rr, rrPath, circ, ell, line, poly, text, shadow, noShadow, lightPool, ring } from '../core/draw.js';
import { clamp, lerp, p01, E, ramp, pulse, sinw, sin01, shake, hash, noise1, TAU } from '../core/util.js';
import { shot, say, sys, talk, withCam, finish, wash, hit, pointer, speedLines, lineK } from './kit.js';
import { drawTabbi, pose, blinkAt } from '../chars/tabbi.js';
import { drawGate } from '../chars/gate.js';
import { checkpoint } from '../rooms/rooms.js';
import { checkbox } from '../core/ui.js';
import { grid9 } from '../rooms/captcha.js';

const GX = 980, TBX = 180;          // Gate and Tabbi marks on the checkpoint floor

/** a word that has given up on being a word */
function captchaWord(ctx, x, y, word, o = {}) {
  const w = clamp(o.wob ?? 1), seed = o.seed || 0, sz = o.size || 92;
  S(ctx, () => {
    ctx.translate(x, y);
    shadow(ctx, 20, 8, 'rgba(0,0,0,.35)');
    rr(ctx, -300, -80, 600, 160, 16, C.cream, C.ink, 5); noShadow(ctx);
    S(ctx, () => {
      rrPath(ctx, -300, -80, 600, 160, 16); ctx.clip();
      const n = word.length, step = 520 / n;
      for (let i = 0; i < n; i++) {
        S(ctx, () => {
          ctx.translate(-260 + step * (i + .5), 8 + noise1(i * 2.7 + seed, 3) * 22 * w);
          ctx.rotate(noise1(i * 1.9 + seed + 9, 5) * .5 * w);
          ctx.transform(1, noise1(i + seed, 7) * .3 * w, noise1(i + seed + 4, 2) * .25 * w, 1, 0, 0);
          text(ctx, word[i], 0, 0, { size: sz * (1 + noise1(i * 3.3 + seed, 1) * .16 * w), weight: 800, color: C.ink });
        });
      }
      S(ctx, () => {
        ctx.globalAlpha = .55 * w; ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          for (let k = 0; k <= 10; k++) {
            const px = -300 + k * 60, py = noise1(k * .8 + i * 5 + seed, i + 1) * 60;
            k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
          }
          ctx.stroke();
        }
      });
    });
  });
}
/** typed-in answer box */
function answerBox(ctx, x, y, str, caret) {
  S(ctx, () => {
    ctx.translate(x, y);
    rr(ctx, -300, -46, 600, 92, 14, C.white, C.ink, 5);
    text(ctx, str, -270, 2, { size: 46, weight: 800, color: C.ink, align: 'left', letter: 6 });
    if (caret) { ctx.font = '800 46px "Liberation Sans",Arial'; ctx.letterSpacing = '6px'; const tw = ctx.measureText(str).width; line(ctx, -266 + tw, -26, -266 + tw, 26, C.ink, 4); }
  });
}

export default function act1() {
  // ---- 1. Push into the checkbox until it is a doorway. 3.0s
  shot('a1-push', 3.0, (ctx, lt) => {
    const k = E.io3(p01(lt, .35, 2.7));
    withCam(ctx, [{ t: 0, x: 0, y: 0, z: 1 }, { t: .35, x: 0, y: 0, z: 1 },
                  { t: 2.7, x: -236, y: -6, z: 13, e: E.io3 }, { t: 3.0, x: -236, y: -6, z: 15, e: E.linear }], lt, () => {
      ctx.fillStyle = C.white; ctx.fillRect(-9000, -6000, 22000, 12000);
      checkbox(ctx, 0, 0, 120, { checked: 0, hover: 0, glowK: .3 + sin01(lt * 1.4) * .3 });
      // the inside of the box turns into a lit corridor
      if (k > .5) S(ctx, () => {
        const a = p01(k, .5, 1);
        ctx.globalAlpha = a;
        const bw = 128 * a;
        rr(ctx, -236 - bw / 2, -6 - bw / 2, bw, bw, 14 * a, C.night);
        S(ctx, () => { ctx.globalAlpha = a * .9; lightPool(ctx, -236, -6 + bw * .34, bw * .5, bw * .18, 'rgba(24,133,103,.9)', 1); });
      });
    });
    finish(ctx, { vig: lerp(.18, .4, k) });
  }, { tr: { type: 'cut' }, sfx: [{ t: .3, n: 'whoosh' }, { t: 1.9, n: 'riser', d: 1.1 }] });

  // ---- 2. Inside. Door shuts. 3.0s
  shot('a1-arrive', 3.0, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 480, y: -430, z: .98 }, { t: 3.0, x: 522, y: -418, z: 1.04, e: E.io2 }], lt, () => {
      checkpoint(ctx, { t: lt });
      drawGate(ctx, { x: GX, y: 0, s: 1.05, flip: -1, mood: 'neutral', look: -.3 });
      drawTabbi(ctx, { ...pose('suspicious', 0), x: TBX, y: 0, s: 1.35, flip: 1, eye: { open: .9, wide: 1, look: [.5, -.2], shape: 'normal', shine: .8 } });
      // the door behind him, closing
      const dk = E.io3(p01(lt, .15, .85));
      if (dk < 1) S(ctx, () => {
        const dx = lerp(0, -900, dk);
        rr(ctx, TBX - 1180 + dx, -1300, 900, 1300, 0, C.white);
        rr(ctx, TBX - 292 + dx, -1300, 14, 1300, 0, C.gray);
        S(ctx, () => { ctx.globalAlpha = (1 - dk) * .5; lightPool(ctx, TBX - 420 + dx, -300, 700, 700, 'rgba(245,245,247,.9)', 1); });
      });
    });
    finish(ctx, { vig: .34 });
  }, { tr: { type: 'iris', d: .5, x: 1180, y: 520, edge: C.mint }, sfx: [{ t: .2, n: 'doorSlide' }, { t: .9, n: 'doorThunk' }, { t: 1.0, n: 'roomHumDark', d: 2 }] });

  // ---- 3. Gate, in close-up, being completely reasonable. 2.6s
  shot('a1-gate-cu', 2.6, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: GX - 60, y: -292, z: 2.35 }, { t: 2.6, x: GX - 54, y: -290, z: 2.42, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt });
      drawGate(ctx, { x: GX, y: 0, s: 1.05, flip: -1, mood: 'neutral', look: -.4, talk: talk(sh, lt, 'gate'), armR: 10 });
    });
    say(ctx, sh, lt, 0, W * .32, H * .26, { size: 46, maxW: 560, tail: [.75, 1] });
    finish(ctx, { vig: .34 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .35, d: 2.0, who: 'gate', text: 'Select all images with traffic lights.' }],
    sfx: [{ t: .2, n: 'gateBeep' }],
  });

  // ---- 4. The challenge arrives, physically. 2.4s
  shot('a1-grid', 2.4, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 500, y: -470, z: .95 }, { t: 2.4, x: 512, y: -478, z: .975, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt });
      drawGate(ctx, { x: GX, y: 0, s: 1.05, flip: -1, mood: 'neutral', look: -.4, armR: 52 });
      drawTabbi(ctx, { ...pose('smug', lt), x: TBX, y: 0, s: 1.35, flip: 1 });
      grid9(ctx, 600, -580, 158, { k: E.outBack(p01(lt, .15, .8)) });
    });
    finish(ctx, { vig: .34 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .15, n: 'uiSlam' }] });

  // ---- 5. He solves it instantly. That is the mistake. 2.2s
  shot('a1-solve', 2.2, (ctx, lt) => {
    const order = [0, 4, 8, 1, 5, 3, 7, 2];
    const selK = order.map((_, i) => p01(lt, .25 + i * .075, .34 + i * .075));
    withCam(ctx, [{ t: 0, x: 470, y: -540, z: 1.16 }, { t: 2.2, x: 478, y: -534, z: 1.2, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt });
      grid9(ctx, 600, -580, 158, { sel: order, selK });
      const ci = Math.min(7, Math.floor(p01(lt, .25, .85) * 8));
      const cx = 600 - 249 + (order[ci] % 3) * 170, cy = -580 - 249 + Math.floor(order[ci] / 3) * 170;
      if (lt > .2 && lt < .95) pointer(ctx, cx, cy, { s: 1.7, grab: lt * 9 });
      drawTabbi(ctx, { ...pose('typing', lt * 5), x: TBX, y: 0, s: 1.35, flip: 1 });
    });
    finish(ctx, { vig: .34 });
  }, {
    tr: { type: 'cut' },
    sfx: [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ t: .27 + i * .075, n: 'tick', g: .8 })),
  });

  // ---- 6. "Too correct." 3.0s
  shot('a1-toofast', 3.0, (ctx, lt, gt, sh) => {
    const deny = lt > 1.55;
    withCam(ctx, [{ t: 0, x: 520, y: -500, z: .92 }, { t: 1.5, x: 532, y: -500, z: .94 }, { t: 1.62, x: 700, y: -470, z: 1.08, e: E.out4 }, { t: 3.0, x: 708, y: -470, z: 1.1, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt, alarm: deny ? p01(lt, 1.55, 1.8) * .6 : 0 });
      grid9(ctx, 600, -580, 158, { sel: [0, 4, 8, 1, 5, 3, 7, 2], verdict: lt > .3 ? (deny ? 'bad' : 'ok') : null, verdictText: deny ? 'TOO CORRECT' : 'CORRECT', verdictK: deny ? p01(lt, 1.55, 1.75) : p01(lt, .3, .5) });
      drawGate(ctx, { x: GX, y: 0, s: 1.05, flip: -1, mood: deny ? 'deny' : 'neutral', look: -.4, talk: talk(sh, lt, 'gate'), armR: deny ? 46 : 10 });
      drawTabbi(ctx, { ...pose(deny ? 'shocked' : 'smug', lt), x: TBX, y: 0, s: 1.35, flip: 1, talk: 0 });
    });
    say(ctx, sh, lt, 0, W * .70, H * .20, { size: 48, tail: [-.4, 1] });
    say(ctx, sh, lt, 1, W * .70, H * .20, { size: 48, tail: [-.4, 1] });
    say(ctx, sh, lt, 2, W * .70, H * .20, { size: 46, tail: [-.4, 1] });
    finish(ctx, { vig: .34 });
  }, {
    tr: { type: 'cut' },
    say: [
      { t: .35, d: .85, who: 'gate', text: 'Correct.' },
      { t: 1.6, d: 1.0, who: 'gate', text: 'Too correct.' },
      { t: 2.0, d: .95, who: 'gate', text: 'Humans hesitate.' },
    ],
    sfx: [{ t: .3, n: 'gateBeep' }, { t: 1.55, n: 'deny' }, { t: 1.58, n: 'uiSlam', g: .6 }],
  });

  // ---- 7. "Blink." 1.8s
  shot('a1-blink', 1.8, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: TBX + 20, y: -330, z: 1.85 }], lt, () => {
      checkpoint(ctx, { t: lt });
      drawTabbi(ctx, {
        ...pose('stare', 0), x: TBX, y: 0, s: 1.35, flip: 1,
        eye: { open: blinkAt(lt, [1.15], .1), wide: 1, look: [.3, 0], shape: 'normal', shine: .9 },
        brow: { l: -8, r: -8, y: -2, show: 1 }, mouth: { shape: 'flat', open: 0, w: 1 },
      });
    });
    say(ctx, sh, lt, 0, W * .74, H * .17, { size: 56 });
    finish(ctx, { vig: .34 });
  }, { tr: { type: 'cut' }, say: [{ t: .1, d: .8, who: 'gate', text: 'Blink.' }], sfx: [{ t: 1.15, n: 'blink' }] });

  // ---- 8. "Slower." 2.2s — the joke is the hold, not the line
  shot('a1-blink2', 2.2, (ctx, lt, gt, sh) => {
    const slow = clamp(1 - Math.abs(p01(lt, .7, 1.9) - .5) * 2) ;
    withCam(ctx, [{ t: 0, x: TBX + 20, y: -330, z: 2.15 }], lt, () => {
      checkpoint(ctx, { t: lt });
      drawTabbi(ctx, {
        ...pose('stare', 0), x: TBX, y: 0, s: 1.35, flip: 1,
        eye: { open: 1 - slow, wide: 1, look: [.3, 0], shape: 'normal', shine: .9 },
        brow: { l: -8, r: -8, y: -2 - slow * 4, show: 1 }, mouth: { shape: 'flat', open: 0, w: 1 },
      });
    });
    say(ctx, sh, lt, 0, W * .74, H * .17, { size: 56 });
    finish(ctx, { vig: .34 });
  }, { tr: { type: 'cut' }, say: [{ t: 0, d: .7, who: 'gate', text: 'Slower.' }], sfx: [{ t: .72, n: 'blinkSlow' }] });

  // ---- 9. The scan. His body becomes evidence. 3.4s
  shot('a1-scan', 3.4, (ctx, lt, gt, sh) => {
    const beam = p01(lt, .25, .5);
    const sweep = p01(lt, .4, 2.0);
    withCam(ctx, [{ t: 0, x: 520, y: -460, z: .96 }, { t: 2.1, x: 430, y: -450, z: 1.06 }, { t: 3.4, x: 424, y: -450, z: 1.08, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt });
      drawGate(ctx, { x: GX, y: 0, s: 1.05, flip: -1, mood: 'scan', look: -.4, armR: 88, scanBeam: beam, talk: talk(sh, lt, 'gate') });
      drawTabbi(ctx, { ...pose('stare', 0), x: TBX, y: 0, s: 1.35, flip: 1, eye: { open: 1.05, wide: 1.04, look: [.2, 0], shape: 'normal', shine: 1 }, brow: { l: -14, r: -14, y: -5, show: 1 }, mouth: { shape: 'wavy', open: 0, w: .8 } });
      // the scanning line travelling up him
      if (beam > .2) S(ctx, () => {
        const yy = lerp(20, -330, sweep);
        ctx.globalAlpha = .85;
        line(ctx, TBX - 190, yy, TBX + 190, yy, C.mint, 6);
        S(ctx, () => { ctx.globalAlpha = .10; rr(ctx, TBX - 190, yy, 380, -yy + 20, 0, C.mint); });
      });
      // the readout: he is, technically, a tab
      if (lt > 1.6) S(ctx, () => {
        const k = E.outBack(p01(lt, 1.6, 2.0));
        ctx.globalAlpha = clamp(k * 1.3);
        ctx.translate(TBX + 400, -560); ctx.scale(k, k);
        rr(ctx, -30, -120, 520, 240, 18, C.cream, C.ink, 5);
        text(ctx, 'OBJECT IDENTIFIED', 230, -78, { size: 24, weight: 800, color: 'rgba(32,32,39,.5)', letter: 2 });
        text(ctx, 'BROWSER TAB', 230, -22, { size: 46, weight: 800, color: C.ink, letter: 1 });
        rr(ctx, 30, 22, 400, 62, 14, C.redSoft, C.red, 4);
        text(ctx, 'CLOSABLE OBJECT', 230, 54, { size: 28, weight: 800, color: C.redDeep, letter: 2 });
      });
    });
    finish(ctx, { vig: .34 });
  }, { tr: { type: 'cut' }, say: [], sfx: [{ t: .25, n: 'scanUp', d: 1.7 }, { t: 1.62, n: 'uiPop' }, { t: 1.75, n: 'errorSoft' }] });

  // ---- 10. The ruling. 2.8s
  shot('a1-tabs', 2.8, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 470, y: -470, z: .98 }, { t: 1.5, x: 250, y: -400, z: 1.32, e: E.io3 }, { t: 2.8, x: 246, y: -400, z: 1.34, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt, alarm: p01(lt, .1, .3) * .5 });
      drawGate(ctx, { x: GX, y: 0, s: 1.05, flip: -1, mood: 'deny', look: -.4 });
      drawTabbi(ctx, { ...pose(lt > 1.35 ? 'angry' : 'shocked', lt * 3), x: TBX, y: 0, s: 1.35, flip: 1, mouth: { shape: lt > 1.35 ? 'shout' : 'gasp', open: .8, w: 1, talk: talk(sh, lt, 'tabbi') } });
    });
    sys(ctx, sh, lt, 0, W * .5, H * .20, { size: 64, bg: C.red, letter: 3 });
    say(ctx, sh, lt, 1, W * .34, H * .26, { size: 46, tail: [.2, 1] });
    finish(ctx, { vig: .34 });
  }, {
    tr: { type: 'cut' },
    say: [
      { t: .1, d: 1.3, who: 'sysv', text: 'TABS ARE NOT PEOPLE' },
      { t: 1.45, d: 1.25, who: 'tabbi', text: "I'm a person WITH a tab." },
    ],
    sfx: [{ t: .05, n: 'stamp' }, { t: 1.42, n: 'tabbiHuff' }],
  });

  // ---- 11. Third challenge. 2.6s
  shot('a1-type', 2.6, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 470, y: -450, z: .96 }, { t: 2.6, x: 478, y: -452, z: .99, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt });
      drawGate(ctx, { x: GX, y: 0, s: 1.05, flip: -1, mood: 'neutral', look: -.4, talk: talk(sh, lt, 'gate'), armR: 40 });
      drawTabbi(ctx, { ...pose('suspicious', 0), x: TBX, y: 0, s: 1.35, flip: 1 });
      S(ctx, () => {
        ctx.globalAlpha = clamp(E.outBack(p01(lt, .7, 1.2)) * 1.3);
        captchaWord(ctx, 640, -700, 'h4nwq', { seed: 2, size: 84 });
        answerBox(ctx, 640, -510, '', lt > 1.4 ? (Math.floor(lt * 2) % 2) : 0);
      });
    });
    say(ctx, sh, lt, 0, W * .72, H * .14, { size: 46 });
    say(ctx, sh, lt, 1, W * .22, H * .44, { size: 42, tail: [.2, 1] });
    finish(ctx, { vig: .34 });
  }, {
    tr: { type: 'cut' },
    say: [
      { t: .1, d: 1.1, who: 'gate', text: 'Type the word you see.' },
      { t: 1.5, d: 1.0, who: 'tabbi', text: "That's not a word." },
    ],
    sfx: [{ t: .72, n: 'uiPop' }],
  });

  // ---- 12. He tries anyway. 2.4s
  shot('a1-type2', 2.4, (ctx, lt) => {
    const typed = 'h4nwq'.slice(0, Math.floor(p01(lt, .1, .9) * 5));
    const wrong = lt > 1.25;
    withCam(ctx, [{ t: 0, x: 560, y: -520, z: 1.06 }, { t: 2.4, x: 566, y: -522, z: 1.09, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt });
      captchaWord(ctx, 640, -700, 'h4nwq', { seed: wrong ? 11 : 2, size: 84 });
      answerBox(ctx, 640, -510, typed, Math.floor(lt * 4) % 2);
      if (wrong) S(ctx, () => {
        const k = E.outBack(p01(lt, 1.25, 1.55));
        ctx.globalAlpha = clamp(k * 1.4);
        ctx.translate(640, -352); ctx.scale(k, k);
        rr(ctx, -180, -36, 360, 72, 36, C.red);
        text(ctx, 'INCORRECT', 0, 2, { size: 34, weight: 800, color: C.white, letter: 4 });
      });
      drawTabbi(ctx, { ...pose('typing', lt * 9), x: TBX, y: 0, s: 1.3, flip: 1 });
    });
    finish(ctx, { vig: .34 });
  }, {
    tr: { type: 'cut' },
    sfx: [0, 1, 2, 3, 4].map(i => ({ t: .12 + i * .16, n: 'typeKey' })).concat([{ t: 1.24, n: 'errorSoft' }, { t: 1.26, n: 'wobble' }]),
  });

  // ---- 13. The third word is honest. 3.0s
  shot('a1-robot', 3.0, (ctx, lt, gt, sh) => {
    const typed = 'ROBOT'.slice(0, Math.floor(p01(lt, 1.5, 2.25) * 5));
    withCam(ctx, [{ t: 0, x: 640, y: -700, z: 1.62 }, { t: 1.2, x: 570, y: -520, z: 1.02, e: E.io3 }, { t: 3.0, x: 574, y: -520, z: 1.04, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt });
      captchaWord(ctx, 640, -700, 'ROBOT', { seed: 0, size: 96, wob: .12 });
      answerBox(ctx, 640, -510, typed, Math.floor(lt * 4) % 2);
      drawTabbi(ctx, { ...pose(lt < 1.4 ? 'suspicious' : 'typing', lt * 9), x: TBX, y: 0, s: 1.3, flip: 1 });
    });
    say(ctx, sh, lt, 0, W * .23, H * .40, { size: 42, tail: [-.2, 1] });
    say(ctx, sh, lt, 1, W * .76, H * .16, { size: 46 });
    finish(ctx, { vig: .34 });
  }, {
    tr: { type: 'cut' },
    say: [
      { t: .25, d: 1.05, who: 'tabbi', text: 'That says robot.' },
      { t: 1.3, d: .8, who: 'gate', text: 'Type it.' },
    ],
    sfx: [{ t: .05, n: 'uiPop' }].concat([0, 1, 2, 3, 4].map(i => ({ t: 1.55 + i * .15, n: 'typeKey' }))),
  });

  // ---- 14. The stamp. 2.0s
  shot('a1-stamp', 2.0, (ctx, lt) => {
    const k = p01(lt, .1, .34);
    withCam(ctx, [{ t: 0, x: 640, y: -530, z: 1.45 }], lt, () => {
      checkpoint(ctx, { t: lt, alarm: p01(lt, .3, .45) * .8 });
      answerBox(ctx, 640, -510, 'ROBOT', 0);
      S(ctx, () => {
        ctx.translate(640, -380); ctx.rotate(-.13);
        const z = lerp(4.5, 1, E.out5(k));
        ctx.globalAlpha = clamp(k * 3); ctx.scale(z, z);
        rr(ctx, -330, -84, 660, 168, 14, null, C.red, 12);
        text(ctx, 'NOT A HUMAN', 0, 2, { size: 78, weight: 800, color: C.red, letter: 3 });
      });
    });
    hit(ctx, lt, .31, C.red, .14);
    finish(ctx, { vig: .34 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .3, n: 'stampHeavy' }] });

  // ---- 15. "Next." 2.0s
  shot('a1-next', 2.0, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 570, y: -400, z: .88 }, { t: 2.0, x: 578, y: -394, z: .895, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt });
      drawGate(ctx, { x: GX, y: 0, s: 1.05, flip: -1, mood: 'neutral', look: -.1, talk: talk(sh, lt, 'gate') });
      drawTabbi(ctx, { ...pose('defeated', 0), x: TBX, y: 0, s: 1.35, flip: 1 });
    });
    say(ctx, sh, lt, 0, W * .74, H * .18, { size: 52 });
    finish(ctx, { vig: .36 });
  }, { tr: { type: 'cut' }, say: [{ t: .55, d: .8, who: 'gate', text: 'Next.' }], sfx: [{ t: .5, n: 'gateBeep' }] });

  // ---- 16. There is no next. There is a timer. 1.6s
  shot('a1-cool', 1.6, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: TBX + 120, y: -360, z: 1.5 }], lt, () => {
      checkpoint(ctx, { t: lt });
      drawTabbi(ctx, { ...pose('defeated', 0), x: TBX, y: 0, s: 1.35, flip: 1, eye: { open: .34, wide: .95, look: [.55, .1], shape: 'dead', shine: .25 } });
      S(ctx, () => {
        ctx.translate(TBX + 330, -300);
        ring(ctx, 0, 0, 78, 1 - p01(lt, 0, 12), C.mint, 14, 'rgba(245,245,247,.14)');
        text(ctx, '30', 0, 2, { size: 52, weight: 800, color: C.white });
        text(ctx, 'TRY AGAIN IN', 0, -128, { size: 26, weight: 800, color: 'rgba(245,245,247,.55)', letter: 3 });
      });
    });
    finish(ctx, { vig: .36 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .1, n: 'tickSlow' }, { t: 1.1, n: 'tickSlow' }] });
}
