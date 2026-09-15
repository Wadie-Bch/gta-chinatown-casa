// B7 — THE CALLBACK (4:30 – 5:00).
import { C, W, H } from '../core/palette.js';
import { S, rr, circ, ell, line, text, shadow, noShadow, lightPool } from '../core/draw.js';
import { clamp, lerp, p01, E, sinw, sin01 } from '../core/util.js';
import { shot, say, sys, talk, withCam, finish, hit } from './kit.js';
import { drawTabbi, pose, blinkAt, tabbiMark } from '../chars/tabbi.js';
import { streemPage, pet, NIGHT } from '../rooms/streem.js';
import { receipt } from '../rooms/props.js';

export default function b7() {
  // ---- 65. He reads it again. 4.6s
  shot('b7-read', 4.6, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: -420, y: -330, z: 1.5 }, { t: 4.6, x: -414, y: -334, z: 1.56, e: E.linear }], lt, () => {
      ctx.fillStyle = C.white; ctx.fillRect(-5000, -3000, 14000, 6000);
      S(ctx, () => { ctx.globalAlpha = .9; ctx.translate(-120, -260); ctx.rotate(.1); ctx.scale(.7, .7); receipt(ctx, 0, -300, 560, [{ l: 'STATUS', r: 'CANCELLED', hi: 1 }, { l: '' }, { l: 'EFFECTIVE IN', r: '11 MONTHS', hi: 1 }], { k: 1 }); });
      drawTabbi(ctx, {
        ...pose('holding', 0), x: -520, y: 0, s: 1.5, flip: 1,
        armL: { a: 74, b: 42, l1: 30, l2: 26 }, armR: { a: 74, b: 42, l1: 30, l2: 26 },
        eye: { open: blinkAt(lt, [1.4, 3.4], .12), wide: 1.02, look: [.45, .35], shape: 'normal', shine: 1 },
        brow: { l: -18, r: -18, y: -3, show: 1 }, mouth: { shape: 'flat', open: 0, w: 1.05 },
      });
    });
    finish(ctx, { vig: .26 });
  }, { tr: { type: 'cut' }, sfx: [{ t: 1.4, n: 'blink' }, { t: 3.4, n: 'blink' }, { t: 2.4, n: 'clockTick' }] });

  // ---- 66. He looks at us. 4.0s
  shot('b7-viewer', 4.0, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: -520, y: -330, z: 2.3 }], lt, () => {
      ctx.fillStyle = C.white; ctx.fillRect(-5000, -3000, 14000, 6000);
      drawTabbi(ctx, {
        ...pose('toViewer', 0), x: -520, y: 0, s: 1.5, flip: 1,
        eye: { open: blinkAt(lt, [1.1, 3.0], .11), wide: 1.06, look: [0, 0], shape: 'normal', shine: 1 },
        mouth: { shape: 'flat', open: 0, w: 1.2 },
      });
    });
    finish(ctx, { vig: .26 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .05, n: 'doink' }, { t: 1.1, n: 'blink' }, { t: 3.0, n: 'blink' }] });

  // ---- 67. He sits down on the floor. 5.0s
  shot('b7-sit', 5.0, (ctx, lt) => {
    const sl = E.io3(p01(lt, .3, 2.0));
    withCam(ctx, [{ t: 0, x: -440, y: -380, z: 1.3 }, { t: 2.4, x: -430, y: -250, z: 1.35, e: E.io2 },
                  { t: 5.0, x: -426, y: -248, z: 1.38, e: E.linear }], lt, () => {
      ctx.fillStyle = C.white; ctx.fillRect(-5000, -3000, 14000, 6000);
      S(ctx, () => { ctx.globalAlpha = .35; lightPool(ctx, -520, 20, 900, 260, 'rgba(32,32,39,.14)', 1); });
      drawTabbi(ctx, {
        ...pose(sl > .8 ? 'sitting' : 'defeated', 0), x: -520, y: 0, s: 1.5, flip: 1,
        bob: lerp(0, -30, sl),
        eye: { open: .55, wide: 1, look: [.1, .25], shape: 'narrow', shine: .6 },
        brow: { l: -16, r: -16, y: 0, show: 1 }, mouth: { shape: 'flat', open: 0, w: 1.1 },
      });
    });
    finish(ctx, { vig: .28 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .35, n: 'slideDown' }, { t: 1.9, n: 'sitThud' }, { t: 3.4, n: 'sigh' }] });

  // ---- 68. Ping. 4.4s
  shot('b7-ping', 4.4, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: -430, y: -250, z: 1.38 }, { t: 1.0, x: -200, y: -420, z: 1.16, e: E.io3 },
                  { t: 4.4, x: -194, y: -424, z: 1.19, e: E.linear }], lt, () => {
      ctx.fillStyle = C.white; ctx.fillRect(-5000, -3000, 14000, 6000);
      drawTabbi(ctx, {
        ...pose('sitting', 0), x: -520, y: 0, s: 1.5, flip: 1, bob: -30,
        eye: { open: 1.05, wide: 1.02, look: [.6, -.3], shape: 'normal', shine: 1 },
        brow: { l: -14, r: -14, y: -3, show: 1 }, mouth: { shape: 'flat', open: 0, w: 1 },
      });
      S(ctx, () => {
        const k = E.outBack(p01(lt, .5, 1.1));
        ctx.globalAlpha = clamp(k * 1.3);
        ctx.translate(180, -760); ctx.scale(k, k);
        shadow(ctx, 26, 12, 'rgba(32,32,39,.2)');
        rr(ctx, -400, -110, 800, 220, 26, C.cream, C.ink, 6); noShadow(ctx);
        rr(ctx, -400, -110, 14, 220, [26, 0, 0, 26], C.red);
        text(ctx, 'PAYMENT TAKEN', -330, -50, { size: 22, weight: 800, color: 'rgba(32,32,39,.5)', align: 'left', letter: 3 });
        text(ctx, 'STREEM+ PREMIUM', -330, 4, { size: 34, weight: 800, color: C.ink, align: 'left' });
        text(ctx, 'MONTH 12 OF 12', -330, 54, { size: 22, weight: 700, color: 'rgba(32,32,39,.45)', align: 'left' });
        text(ctx, '−€9.99', 330, 2, { size: 54, weight: 800, color: C.red, align: 'right' });
      });
    });
    finish(ctx, { vig: .26 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .45, n: 'notif3' }, { t: 1.1, n: 'cashRegister' }] });

  // ---- 69. And the pet arrives anyway. 5.0s
  shot('b7-charge', 5.0, (ctx, lt) => {
    const land = E.outBounce(p01(lt, .6, 1.5));
    const open = p01(lt, 2.2, 2.9);
    withCam(ctx, [{ t: 0, x: -200, y: -420, z: 1.19 }, { t: 2.0, x: -260, y: -280, z: 1.42, e: E.io3 },
                  { t: 5.0, x: -256, y: -282, z: 1.46, e: E.linear }], lt, () => {
      ctx.fillStyle = C.white; ctx.fillRect(-5000, -3000, 14000, 6000);
      drawTabbi(ctx, {
        ...pose('sitting', 0), x: -520, y: 0, s: 1.5, flip: 1, bob: -30,
        eye: { open: lt > 1.4 ? 1.15 : 1.0, wide: lt > 1.4 ? 1.05 : 1, look: [.6, .2], shape: 'normal', shine: 1 },
        brow: { l: lt > 1.4 ? -20 : -14, r: lt > 1.4 ? -20 : -14, y: -3, show: 1 },
        mouth: { shape: lt > 2.6 ? 'wavy' : 'flat', open: 0, w: 1 },
      });
      S(ctx, () => {
        const bx = -60, by = lerp(-1200, -40, land);
        ctx.translate(bx, by);
        shadow(ctx, 18, 9, 'rgba(32,32,39,.25)');
        rr(ctx, -120, -110, 240, 110, 16, C.cream, C.ink, 6); noShadow(ctx);
        S(ctx, () => { ctx.translate(0, -110); ctx.transform(1, 0, 0, Math.max(.03, Math.cos(open * 1.5)), 0, 0); rr(ctx, -120, -86, 240, 86, 14, C.cream, C.ink, 6); });
        if (open > .5) S(ctx, () => { ctx.translate(0, -12); pet(ctx, 0, 0, .62, { t: lt, tag: lt > 3.6 ? '€9.99/MONTH' : null }); });
      });
    });
    finish(ctx, { vig: .26 });
  }, {
    tr: { type: 'cut' },
    sfx: [{ t: .6, n: 'slideWhistleDown', d: .8 }, { t: 1.42, n: 'boxDrop' }, { t: 2.25, n: 'boxOpenSmall' },
          { t: 2.9, n: 'squeakyToy' }, { t: 3.6, n: 'cashRegister', g: .7 }],
  });

  // ---- 70. One flat look. 4.8s
  shot('b7-last', 4.8, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: -400, y: -300, z: 1.6 }, { t: 2.0, x: -470, y: -320, z: 2.05, e: E.io3 },
                  { t: 4.8, x: -466, y: -322, z: 2.1, e: E.linear }], lt, () => {
      ctx.fillStyle = C.white; ctx.fillRect(-5000, -3000, 14000, 6000);
      S(ctx, () => { ctx.translate(-60, -52); pet(ctx, 0, 0, .62, { t: lt, tag: '€9.99/MONTH' }); });
      drawTabbi(ctx, {
        ...pose('toViewer', 0), x: -520, y: 0, s: 1.5, flip: 1, bob: -30,
        legL: { a: -70, b: 84 }, legR: { a: 70, b: 84 },
        eye: { open: blinkAt(lt, [1.5, 3.6], .11), wide: 1.06, look: [0, 0], shape: 'normal', shine: 1 },
        brow: { l: 0, r: 0, y: -1, show: 1 }, mouth: { shape: 'flat', open: 0, w: 1.25 },
      });
    });
    finish(ctx, { vig: .28 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .1, n: 'doink' }, { t: 1.5, n: 'blink' }, { t: 2.6, n: 'squeakyToy', g: .35 }, { t: 3.6, n: 'blink' }] });

  // ---- 71. Mark. 2.2s
  shot('b7-mark', 2.2, (ctx, lt) => {
    ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
    const k = E.outBack(p01(lt, .1, .7));
    S(ctx, () => {
      ctx.translate(W / 2, H / 2 - 30); ctx.scale(k, k); ctx.globalAlpha = clamp(k * 1.4);
      tabbiMark(ctx, 0, 170, 1.55);
    });
    S(ctx, () => {
      ctx.globalAlpha = clamp(p01(lt, .6, 1.0));
      text(ctx, 'TABBI', W / 2, H / 2 + 280, { size: 86, weight: 800, color: C.ink, letter: 14 });
    });
    S(ctx, () => { ctx.globalAlpha = clamp(p01(lt, 1.6, 2.2)); ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H); });
    finish(ctx, { vig: .12 });
  }, { tr: { type: 'flash', d: .2, color: C.white }, sfx: [{ t: .12, n: 'markSting' }] });
}
