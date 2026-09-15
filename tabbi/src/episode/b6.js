// B6 — THE SYSTEM WINS, THEN LOSES (3:45 – 4:30).
import { C, W, H } from '../core/palette.js';
import { S, rr, circ, ell, line, text, shadow, noShadow, lightPool, spinner } from '../core/draw.js';
import { clamp, lerp, p01, E, sinw, sin01, hash } from '../core/util.js';
import { shot, say, sys, talk, withCam, finish, hit, pointer, speedLines } from './kit.js';
import { drawTabbi, pose, blinkAt } from '../chars/tabbi.js';
import { drawRetain } from '../chars/retain.js';
import { streemPage, settingsRoom, offerRoom, holdRoom, offerCard, NIGHT } from '../rooms/streem.js';
import { receipt } from '../rooms/props.js';
import { TX, FOOT } from './b0.js';
import { RX, BX } from './b2.js';
import { chip } from '../core/ui.js';

export default function b6() {
  // ---- 56. A long look at a small creature. 5.2s
  shot('b6-face', 5.2, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 920, y: -320, z: 1.45 }, { t: 5.2, x: 924, y: -330, z: 1.82, e: E.ioSine }], lt, () => {
      streemPage(ctx, { t: lt, footer: false, account: false });
      drawTabbi(ctx, {
        ...pose('stare', 0), x: 900, y: 0, s: 1.45, flip: 1,
        eye: { open: lerp(1, .6, E.io3(p01(lt, 1.4, 4.4))) * blinkAt(lt, [1.0, 3.2, 4.8], .12), wide: 1.02, look: [lerp(.4, 0, p01(lt, 2.0, 4.0)), lerp(0, .2, p01(lt, 3.0, 5.0))], shape: 'normal', shine: lerp(1, .55, p01(lt, 2.6, 5.0)) },
        brow: { l: lerp(-8, -22, p01(lt, 1.0, 4.0)), r: lerp(-8, -22, p01(lt, 1.0, 4.0)), y: -3, show: 1 },
        mouth: { shape: lt > 3.6 ? 'frown' : 'flat', open: 0, w: lerp(1.05, .84, p01(lt, 3.0, 5.2)) },
        sy: lerp(1, .985, p01(lt, 2.6, 5.2)),
      });
    });
    finish(ctx, { vig: lerp(.28, .38, p01(lt, 0, 5.2)) });
  }, { tr: { type: 'cut' }, sfx: [{ t: 1.0, n: 'blink' }, { t: 3.2, n: 'blink' }, { t: 4.8, n: 'blink' }, { t: 2.4, n: 'swallow' }] });

  // ---- 57. The link is still there. 4.6s
  shot('b6-again', 4.6, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 900, y: -420, z: 1.2 }, { t: 1.8, x: 660, y: FOOT - 62, z: 1.5, e: E.io3 },
                  { t: 4.6, x: 666, y: FOOT - 66, z: 1.55, e: E.linear }], lt, () => {
      streemPage(ctx, { t: lt, hotFooter: lt > 2.0 });
      S(ctx, () => { ctx.globalAlpha = .95; drawTabbi(ctx, { ...pose(lt > 2.4 ? 'angry' : 'defeated', lt * 3), x: 120, y: -20, s: 1.2, flip: 1 }); });
    });
    finish(ctx, { vig: .28 });
  }, { tr: { type: 'cut' }, sfx: [{ t: 2.05, n: 'chimeSoft' }, { t: 2.5, n: 'tabbiHuff' }] });

  // ---- 58. He speedruns the entire maze. 4.4s
  shot('b6-fast', 4.4, (ctx, lt) => {
    // six hard cuts, each a beat of the earlier maze, at speed
    const beat = Math.min(5, Math.floor(lt / .733));
    const bt = lt - beat * .733;
    withCam(ctx, [{ t: 0, x: 0, y: -520, z: .9 }], lt, () => {
      if (beat === 0) { streemPage(ctx, { t: lt, hotFooter: true, footerY: FOOT }); drawTabbi(ctx, { ...pose('running', lt * 12), x: 200, y: 0, s: 1.4, flip: 1 }); }
      else if (beat === 1) { settingsRoom(ctx, { t: lt }); drawTabbi(ctx, { ...pose('running', lt * 12), x: -200 + bt * 900, y: 0, s: 1.4, flip: 1 }); }
      else if (beat === 2) { settingsRoom(ctx, { t: lt }); drawTabbi(ctx, { ...pose('typing', lt * 16), x: 100, y: 0, s: 1.4, flip: 1 }); }
      else if (beat === 3) { ctx.fillStyle = NIGHT; ctx.fillRect(-4000, -3000, 12000, 6000); drawTabbi(ctx, { ...pose('point', 0), x: 0, y: 0, s: 1.5, flip: 1 }); }
      else if (beat === 4) { offerRoom(ctx, { t: lt, spotX: RX - 120 }); drawRetain(ctx, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: 'delighted', arms: 1 }); drawTabbi(ctx, { ...pose('running', lt * 12), x: BX + bt * 500, y: 0, s: 1.4, flip: 1 }); }
      else { holdRoom(ctx, { t: lt, playing: true }); drawTabbi(ctx, { ...pose('running', lt * 12), x: -600 + bt * 1400, y: 0, s: 1.4, flip: 1 }); }
      speedLines(ctx, -200, -300, 6, 320, .3, beat);
    });
    finish(ctx, { vig: .28 });
  }, {
    tr: { type: 'cut' },
    sfx: [0, 1, 2, 3, 4, 5].map(i => ({ t: i * .733, n: 'whoosh' }))
      .concat([{ t: .05, n: 'cartoonRun', d: 4.2 }]),
  });

  // ---- 59. "Before you go—" / "NO." 4.6s
  shot('b6-retain', 4.6, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 40, y: -440, z: 1.0 }, { t: 2.0, x: -180, y: -400, z: 1.22, e: E.io3 },
                  { t: 4.6, x: -174, y: -404, z: 1.26, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawRetain(ctx, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: lt > 2.2 ? 'listening' : 'delighted', arms: lerp(1, .3, p01(lt, 2.0, 3.0)), talk: talk(sh, lt, 'retain'), look: -.5 });
      drawTabbi(ctx, {
        ...pose('angry', lt * 4), x: BX, y: 0, s: 1.5, flip: 1,
        armR: { a: 120, b: -20, l1: 31, l2: 26 },
        mouth: { shape: 'shout', open: 1, w: 1.1, talk: talk(sh, lt, 'tabbi') },
      });
    });
    say(ctx, sh, lt, 0, W * .66, H * .17, { size: 40, tail: [.3, 1], maxW: 520 });
    say(ctx, sh, lt, 1, W * .24, H * .17, { size: 72 });
    finish(ctx, { vig: .24 });
  }, {
    tr: { type: 'cut' },
    say: [
      { t: .3, d: 1.5, who: 'retain', text: 'Before you go—' },
      { t: 1.9, d: 1.5, who: 'tabbi', text: 'NO.' },
    ],
    sfx: [{ t: .25, n: 'retainWarm' }, { t: 1.85, n: 'tabbiShout' }, { t: 1.95, n: 'stampBig' }],
  });

  // ---- 60. "I respect that." 4.4s
  shot('b6-respect', 4.4, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: RX - 80, y: -300, z: 1.45 }, { t: 4.4, x: RX - 74, y: -302, z: 1.5, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawRetain(ctx, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: lt > 2.4 ? 'delighted' : 'listening', arms: .25, talk: talk(sh, lt, 'retain'), look: -.5, glow: p01(lt, 2.6, 3.4) });
      if (lt > 2.6) S(ctx, () => {
        const k = E.outBack(p01(lt, 2.6, 3.0));
        ctx.globalAlpha = clamp(k * 1.3);
        ctx.translate(RX - 480, -760); ctx.scale(k, k);
        circ(ctx, 0, 0, 70, C.mint, C.ink, 6);
        ctx.strokeStyle = C.white; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(-28, 2); ctx.lineTo(-8, 24); ctx.lineTo(30, -24); ctx.stroke();
      });
    });
    say(ctx, sh, lt, 0, W * .26, H * .2, { size: 46, tail: [.62, 1], maxW: 560 });
    finish(ctx, { vig: .24 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .4, d: 1.8, who: 'retain', text: 'I respect that.' }],
    sfx: [{ t: .35, n: 'retainWarm' }, { t: 2.6, n: 'successSoft' }],
  });

  // ---- 61. Real. 5.0s
  shot('b6-cancel', 5.0, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 0, y: -700, z: 1.0 }, { t: 5.0, x: 6, y: -706, z: 1.05, e: E.linear }], lt, () => {
      ctx.fillStyle = C.white; ctx.fillRect(-5000, -3000, 14000, 6000);
      S(ctx, () => { ctx.globalAlpha = .6; lightPool(ctx, 0, -700, 1700, 900, 'rgba(24,133,103,.22)', 1); });
      S(ctx, () => {
        ctx.globalAlpha = clamp(E.outBack(p01(lt, .2, .8)) * 1.3);
        const k = lerp(.9, 1, E.outBack(p01(lt, .2, .8)));
        ctx.translate(0, -700); ctx.scale(k, k);
        rr(ctx, -760, -180, 1520, 360, 32, C.mint, C.ink, 7);
        text(ctx, 'CANCELLATION CONFIRMED', 0, -30, { size: 62, weight: 800, color: C.white, letter: 2, maxW: 1400 });
        text(ctx, 'We are sorry to see you go.', 0, 60, { size: 30, weight: 700, color: 'rgba(245,245,247,.82)' });
      });
    });
    hit(ctx, lt, .25, C.white, .18);
    finish(ctx, { vig: .2 });
  }, { tr: { type: 'flash', d: .25, color: C.white }, sfx: [{ t: .22, n: 'successBig' }, { t: .3, n: 'stampBig' }] });

  // ---- 62. Genuine joy. 4.8s
  shot('b6-joy', 4.8, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 0, y: -400, z: 1.0 }, { t: 4.8, x: 6, y: -410, z: 1.05, e: E.linear }], lt, () => {
      ctx.fillStyle = C.white; ctx.fillRect(-5000, -3000, 14000, 6000);
      S(ctx, () => { ctx.globalAlpha = .5; lightPool(ctx, 0, -300, 1600, 600, 'rgba(24,133,103,.18)', 1); });
      drawTabbi(ctx, { ...pose('celebrating', lt * 2.6), x: 0, y: 0, s: 1.6, flip: 1, mouth: { shape: 'bigSmile', open: .7, w: 1.1, talk: talk(sh, lt, 'tabbi') } });
      S(ctx, () => {
        for (let i = 0; i < 46; i++) {
          const a = hash(i * 3.7) * Math.PI * 2, sp = 240 + hash(i * 5.1) * 520, t = p01(lt, .05, 3.2) * (.6 + hash(i * 2.3) * .6);
          ctx.globalAlpha = clamp(1 - t * 1.1);
          S(ctx, () => {
            ctx.translate(Math.cos(a) * sp * t, -560 + Math.sin(a) * sp * t + 640 * t * t);
            ctx.rotate(a + t * 7);
            rr(ctx, -10, -6, 20, 12, 3, [C.mint, C.cheese, C.ink, C.mintMid][i % 4]);
          });
        }
      });
    });
    say(ctx, sh, lt, 0, W * .3, H * .17, { size: 58, tail: [-.2, 1] });
    finish(ctx, { vig: .18 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .3, d: 1.2, who: 'tabbi', text: 'FREE!' }],
    sfx: [{ t: .05, n: 'confetti' }, { t: .1, n: 'partyHorn' }, { t: .28, n: 'tabbiCheer' }, { t: 1.4, n: 'tinyApplause' }],
  });

  // ---- 63. A receipt prints. 5.0s
  shot('b6-receipt', 5.0, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 0, y: -600, z: 1.1 }, { t: 3.6, x: 0, y: -170, z: 1.0, e: E.io2 },
                  { t: 5.0, x: 4, y: -160, z: .99, e: E.linear }], lt, () => {
      ctx.fillStyle = C.white; ctx.fillRect(-5000, -3000, 14000, 6000);
      receipt(ctx, 0, -620, 560, [
        { l: 'STREEM+ PREMIUM' },
        { l: 'MONTHS PAID', r: '11' },
        { l: 'EPISODES WATCHED', r: '1' },
        { l: 'TOTAL', r: '109.89', hi: 1 },
        { l: '' },
        { l: 'STATUS', r: 'CANCELLED', hi: 1 },
        { l: '' },
        { l: 'EFFECTIVE IN', r: '11 MONTHS', hi: 1 },
      ], { k: p01(lt, .2, 3.4) });
      S(ctx, () => { ctx.globalAlpha = .55; drawTabbi(ctx, { ...pose('celebrating', lt * 2.2), x: -720, y: 0, s: 1.2, flip: 1 }); });
    });
    finish(ctx, { vig: .22 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .2, n: 'printer', d: 3.2 }] });

  // ---- 64. The line at the bottom. 7.0s
  shot('b6-effect', 7.0, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 0, y: -150, z: 1.0 }, { t: 1.8, x: 0, y: -80, z: 2.1, e: E.io3 },
                  { t: 7.0, x: 4, y: -80, z: 2.2, e: E.linear }], lt, () => {
      ctx.fillStyle = C.white; ctx.fillRect(-5000, -3000, 14000, 6000);
      receipt(ctx, 0, -620, 560, [
        { l: 'STREEM+ PREMIUM' }, { l: 'MONTHS PAID', r: '11' }, { l: 'EPISODES WATCHED', r: '1' },
        { l: 'TOTAL', r: '109.89', hi: 1 }, { l: '' }, { l: 'STATUS', r: 'CANCELLED', hi: 1 }, { l: '' },
        { l: 'EFFECTIVE IN', r: '11 MONTHS', hi: 1 },
      ], { k: 1 });
      if (lt > 2.4) S(ctx, () => {
        ctx.globalAlpha = clamp(p01(lt, 2.4, 2.8)) * (.55 + sin01(lt * 1.3) * .45);
        rr(ctx, -250, -158, 500, 46, 8, null, C.red, 4);
      });
    });
    finish(ctx, { vig: .24 });
  }, { tr: { type: 'cut' }, sfx: [{ t: 2.45, n: 'sting' }, { t: 4.6, n: 'sadTrombone', g: .7 }] });
}
