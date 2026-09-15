// EPISODE 2, ACT B0 — THE CHARGE (0:00 – 0:20).
// Episode 1 was about not being let in. This one is about not being let out.
import { C, W, H } from '../core/palette.js';
import { S, rr, rrPath, circ, ell, line, poly, text, shadow, noShadow, lightPool, cursor } from '../core/draw.js';
import { clamp, lerp, p01, E, sinw, sin01, shake, TAU } from '../core/util.js';
import { shot, say, sys, talk, withCam, finish, hit, pointer, speedLines } from './kit.js';
import { drawTabbi, pose, blinkAt } from '../chars/tabbi.js';
import { streemPage, showTile, NIGHT, PANEL } from '../rooms/streem.js';
import { chip } from '../core/ui.js';

export const TX = -520;          // Tabbi's mark on the STREEM+ floor
export const FOOT = -150;        // the footer line

/** the money leaving, drawn as a thing that happens to you */
function charge(ctx, x, y, k, o = {}) {
  S(ctx, () => {
    ctx.translate(x, y); ctx.globalAlpha = clamp(k * 1.3);
    ctx.scale(lerp(.9, 1, E.outBack(k)), lerp(.9, 1, E.outBack(k)));
    shadow(ctx, 30, 14, 'rgba(0,0,0,.4)');
    rr(ctx, -430, -120, 860, 240, 26, C.cream, C.ink, 6); noShadow(ctx);
    rr(ctx, -430, -120, 14, 240, [26, 0, 0, 26], C.red);
    text(ctx, 'PAYMENT TAKEN', -352, -66, { size: 24, weight: 800, color: 'rgba(32,32,39,.5)', align: 'left', letter: 3 });
    text(ctx, 'STREEM+ PREMIUM', -352, -14, { size: 38, weight: 800, color: C.ink, align: 'left' });
    text(ctx, o.sub || 'MONTH 11 OF 11', -352, 42, { size: 24, weight: 700, color: 'rgba(32,32,39,.45)', align: 'left' });
    text(ctx, '−€9.99', 352, -12, { size: 62, weight: 800, color: C.red, align: 'right' });
  });
}

export default function b0() {
  // ---- 1. Nine ninety-nine, leaving. 3.4s
  shot('b0-charge', 3.4, (ctx, lt) => {
    const bal = lerp(47.20, 37.21, E.io3(p01(lt, 1.0, 2.0)));
    withCam(ctx, [{ t: 0, x: 0, y: -640, z: 1.28 }, { t: 3.4, x: 10, y: -644, z: 1.32, e: E.linear }], lt, () => {
      ctx.fillStyle = NIGHT; ctx.fillRect(-4000, -3000, 12000, 6000);
      S(ctx, () => { ctx.globalAlpha = .5; lightPool(ctx, 0, -640, 1400, 700, 'rgba(24,133,103,.16)', 1); });
      charge(ctx, 0, -760, p01(lt, .1, .5));
      S(ctx, () => {
        ctx.globalAlpha = clamp(p01(lt, .7, 1.0) * 1.3);
        text(ctx, 'BALANCE', 0, -470, { size: 26, weight: 800, color: 'rgba(245,245,247,.45)', letter: 5 });
        text(ctx, '€' + bal.toFixed(2), 0, -390, { size: 92, weight: 800, color: lt > 1.9 ? C.red : C.white });
      });
    });
    finish(ctx, { vig: .3 });
  }, { sfx: [{ t: .12, n: 'notif3' }, { t: 1.0, n: 'cashRegister' }, { t: 2.0, n: 'errorSoft' }] });

  // ---- 2. He has been paying for this for eleven months. 2.6s
  shot('b0-again', 2.6, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 200, y: -620, z: .62 }, { t: 2.6, x: 220, y: -628, z: .635, e: E.linear }], lt, () => {
      streemPage(ctx, { t: lt });
      drawTabbi(ctx, {
        ...pose('stare', 0), x: TX, y: 0, s: 1.45, flip: 1,
        eye: { open: 1, wide: 1, look: [.7, -.4], shape: 'normal', shine: 1 },
        brow: { l: -8, r: -8, y: -3, show: 1 }, mouth: { shape: 'flat', open: 0, w: 1 },
      });
    });
    finish(ctx, { vig: .28 });
  }, { tr: { type: 'cut' }, sfx: [{ t: 0, n: 'roomHumDark', d: 2.5 }] });

  // ---- 3. One show. Once. 3.6s
  shot('b0-history', 3.6, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: -1300, y: -1020, z: 1.05 }, { t: 3.6, x: -1280, y: -1024, z: 1.09, e: E.linear }], lt, () => {
      streemPage(ctx, { t: lt });
      S(ctx, () => {
        ctx.globalAlpha = clamp(p01(lt, .4, .8) * 1.3);
        ctx.translate(-1400, -560);
        rr(ctx, -300, -60, 900, 132, 18, PANEL, 'rgba(245,245,247,.16)', 4);
        text(ctx, 'VIEWING ACTIVITY', -270, -18, { size: 22, weight: 800, color: 'rgba(245,245,247,.45)', align: 'left', letter: 3 });
        text(ctx, 'MONSTER BARN · EPISODE 1', -270, 34, { size: 32, weight: 800, color: C.white, align: 'left' });
        text(ctx, '11 MONTHS AGO', 570, 12, { size: 26, weight: 800, color: C.cheese, align: 'right' });
      });
    });
    finish(ctx, { vig: .28 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .42, n: 'uiPop' }, { t: 1.4, n: 'clockTick' }, { t: 2.2, n: 'clockTick' }] });

  // ---- 4. The arithmetic. 3.0s
  shot('b0-math', 3.0, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 0, y: -700, z: 1.12 }, { t: 3.0, x: 6, y: -702, z: 1.15, e: E.linear }], lt, () => {
      ctx.fillStyle = NIGHT; ctx.fillRect(-4000, -3000, 12000, 6000);
      S(ctx, () => {
        ctx.globalAlpha = clamp(E.outBack(p01(lt, .1, .5)) * 1.3);
        chip(ctx, -420, -700, '€109.89 PAID', { size: 46, bg: C.red, color: C.white, letter: 2, pad: 40 });
      });
      S(ctx, () => {
        ctx.globalAlpha = clamp(E.outBack(p01(lt, 1.0, 1.4)) * 1.3);
        chip(ctx, 420, -700, '1 EPISODE', { size: 46, bg: C.gray, color: C.ink, letter: 2, pad: 40 });
      });
      if (lt > 1.7) S(ctx, () => {
        const k = E.outBack(p01(lt, 1.7, 2.0)); ctx.globalAlpha = k;
        text(ctx, 'FOR', 0, -700, { size: 34 * k, weight: 800, color: 'rgba(245,245,247,.5)', letter: 4 });
      });
    });
    finish(ctx, { vig: .3 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .12, n: 'uiSlam' }, { t: 1.02, n: 'uiSlam' }, { t: 1.72, n: 'sadTrombone' }] });

  // ---- 5. A decision, arriving late. 3.2s
  shot('b0-decide', 3.2, (ctx, lt) => {
    const k = p01(lt, .6, 1.4);
    withCam(ctx, [{ t: 0, x: TX + 20, y: -300, z: 2.2 }, { t: 3.2, x: TX + 26, y: -302, z: 2.3, e: E.linear }], lt, () => {
      streemPage(ctx, { t: lt });
      drawTabbi(ctx, {
        ...pose(k > .6 ? 'angry' : 'stare', lt), x: TX, y: 0, s: 1.45, flip: 1,
        eye: { open: lerp(1, .55, k), wide: 1, look: [.3, 0], shape: k > .5 ? 'narrow' : 'normal', shine: 1 },
        brow: { l: lerp(-6, 28, k), r: lerp(-6, 28, k), y: lerp(-3, 4, k), show: 1 },
        mouth: { shape: k > .6 ? 'flat' : 'line', open: 0, w: lerp(1, 1.2, k) },
      });
    });
    finish(ctx, { vig: .3 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .62, n: 'eyeNarrow' }, { t: 1.5, n: 'boing', g: .4 }] });

  // ---- 6. The link, nine pixels tall, at the bottom of everything. 4.2s
  shot('b0-find', 4.2, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 200, y: -820, z: .66 }, { t: 1.6, x: 640, y: FOOT - 60, z: 1.5, e: E.io3 },
                  { t: 4.2, x: 660, y: FOOT - 62, z: 1.56, e: E.linear }], lt, () => {
      streemPage(ctx, { t: lt, hotFooter: lt > 1.7 });
      drawTabbi(ctx, { ...pose('walking', lt * 2.4), x: lerp(TX, 240, E.io2(p01(lt, .3, 2.6))), y: 0, s: 1.45, flip: 1 });
      if (lt > 2.2) pointer(ctx, lerp(1100, 700, E.io3(p01(lt, 2.2, 3.6))), FOOT - 120, { s: 2.0, t: lt, mood: 'idle' });
    });
    finish(ctx, { vig: .28 });
  }, {
    tr: { type: 'cut' },
    sfx: [{ t: .35, n: 'footStep' }, { t: .8, n: 'footStep' }, { t: 1.25, n: 'footStep' }, { t: 1.7, n: 'footStep' },
          { t: 1.72, n: 'chimeSoft' }, { t: 3.5, n: 'hoverTick' }],
  });
}
