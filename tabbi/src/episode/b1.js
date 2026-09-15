// B1 — THE LINK THAT MOVES (0:20 – 1:00). Three escalations, never the same gag.
import { C, W, H } from '../core/palette.js';
import { S, rr, rrPath, circ, ell, line, poly, text, shadow, noShadow, lightPool, spinner, cursor } from '../core/draw.js';
import { clamp, lerp, p01, E, sinw, sin01, shake, TAU } from '../core/util.js';
import { shot, say, sys, talk, withCam, finish, hit, pointer, speedLines } from './kit.js';
import { drawTabbi, pose, blinkAt } from '../chars/tabbi.js';
import { streemPage, settingsRoom, accordion, NIGHT, PANEL, PANEL2 } from '../rooms/streem.js';
import { TX, FOOT } from './b0.js';
import { button } from '../core/ui.js';

/** the dialog that would rather you did not */
function stayDialog(ctx, x, y, k, o = {}) {
  const kk = clamp(k); if (kk <= .002) return;
  S(ctx, () => {
    ctx.translate(x, y); ctx.globalAlpha = clamp(kk * 1.35);
    const s = lerp(.9, 1, E.outBack(kk)); ctx.scale(s, s);
    shadow(ctx, 40, 18, 'rgba(0,0,0,.45)');
    rr(ctx, -540, -290, 1080, 580, 30, C.cream, C.ink, 7); noShadow(ctx);
    text(ctx, 'ARE YOU SURE?', 0, -196, { size: 58, weight: 800, color: C.ink });
    text(ctx, 'You will lose access to everything', 0, -126, { size: 30, weight: 700, color: 'rgba(32,32,39,.55)' });
    text(ctx, 'you were not watching anyway.', 0, -84, { size: 30, weight: 700, color: 'rgba(32,32,39,.55)' });
    button(ctx, 0, 44, 840, 140, 'KEEP MY SUBSCRIPTION', { size: 42, letter: 2, glowK: o.pulse ?? 0 });
    // and, somewhere down here, the other option
    text(ctx, 'cancel anyway', 0, 208, { size: 19, weight: 700, color: 'rgba(32,32,39,.30)', underline: 1 });
    if (o.hot) S(ctx, () => { ctx.globalAlpha = .5 + sin01(o.t * 2.4) * .5; rr(ctx, -84, 190, 168, 36, 8, null, C.mint, 3.5); });
  });
}

export default function b1() {
  // ---- 7. He clicks it and the page moves. 3.4s
  shot('b1-click1', 3.4, (ctx, lt) => {
    const jolt = p01(lt, .55, 1.25);
    withCam(ctx, [{ t: 0, x: 660, y: FOOT - 62, z: 1.56 }, { t: .55, x: 660, y: FOOT - 62, z: 1.56 },
                  { t: 1.25, x: 400, y: -1240, z: 1.05, e: E.io4 }, { t: 3.4, x: 410, y: -1246, z: 1.08, e: E.linear }], lt, () => {
      streemPage(ctx, { t: lt, hotFooter: lt < .55, footerY: lt > .6 ? -2400 : FOOT });
      if (lt > .6) S(ctx, () => {
        ctx.globalAlpha = clamp(p01(lt, .85, 1.2));
        rr(ctx, 60, -1300, 700, 66, 14, null, C.mint, 4);
        text(ctx, 'Cancel subscription', 410, -1266, { size: 26, weight: 700, color: 'rgba(245,245,247,.55)' });
      });
      if (lt < .7) pointer(ctx, 700, FOOT - 120, { s: 2.0, t: lt, grab: lt > .5 ? lt * 5 : 0, mood: 'idle' });
    });
    if (lt > .55 && lt < .75) S(ctx, () => { ctx.globalAlpha = (1 - p01(lt, .55, .75)) * .5; speedLines(ctx, W * .5, H * .5, 9, 700, 1, 3); });
    finish(ctx, { vig: .28 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .5, n: 'click' }, { t: .58, n: 'boing' }, { t: .6, n: 'paperSlide', d: .7 }] });

  // ---- 8. He runs up. It goes into Settings. 3.6s
  shot('b1-chase1', 3.6, (ctx, lt) => {
    const gone = lt > 1.9;
    withCam(ctx, [{ t: 0, x: 200, y: -900, z: .72 }, { t: 1.7, x: 380, y: -1200, z: .95, e: E.io3 },
                  { t: 3.6, x: 386, y: -1206, z: .98, e: E.linear }], lt, () => {
      streemPage(ctx, { t: lt, footerY: -2400 });
      if (!gone) S(ctx, () => {
        ctx.globalAlpha = .5 + sin01(lt * 3) * .5;
        rr(ctx, 60, -1300, 700, 66, 14, null, C.mint, 4);
        text(ctx, 'Cancel subscription', 410, -1266, { size: 26, weight: 700, color: 'rgba(245,245,247,.6)' });
      });
      else S(ctx, () => {
        ctx.globalAlpha = clamp(p01(lt, 1.9, 2.2));
        text(ctx, 'moved to Settings', 410, -1266, { size: 30, weight: 800, color: C.cheese });
      });
      drawTabbi(ctx, { ...pose('running', lt * 8), x: lerp(240, 300, E.io2(p01(lt, .1, 1.6))), y: lerp(0, -1060, E.io3(p01(lt, .1, 1.7))), s: 1.45, flip: 1 });
      if (lt > 1.75 && lt < 1.95) pointer(ctx, 410, -1200, { s: 2.0, t: lt, grab: lt * 6 });
    });
    finish(ctx, { vig: .28 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .1, n: 'cartoonRun', d: 1.5 }, { t: 1.8, n: 'click' }, { t: 1.92, n: 'slideWhistleUp', d: .45 }] });

  // ---- 9. Settings: every switch except the one. 4.2s
  shot('b1-settings', 4.2, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: -760, y: -760, z: .66 }, { t: 4.2, x: 240, y: -790, z: .70, e: E.io2 }], lt, () => {
      settingsRoom(ctx, { t: lt });
      drawTabbi(ctx, { ...pose(lt > 2.6 ? 'suspicious' : 'walking', lt * 2.2), x: lerp(-1300, 500, E.io2(p01(lt, .2, 3.0))), y: 0, s: 1.45, flip: 1 });
    });
    finish(ctx, { vig: .3 });
  }, {
    tr: { type: 'push', d: .4, dir: 1 },
    sfx: [{ t: .3, n: 'footStep' }, { t: .9, n: 'footStep' }, { t: 1.5, n: 'footStep' }, { t: 2.1, n: 'footStep' },
          { t: .6, n: 'toggleFlip' }, { t: 1.4, n: 'toggleFlip' }, { t: 2.2, n: 'toggleFlip' }, { t: 3.2, n: 'sadTrombone' }],
  });

  // ---- 10. Manage preferences. 4.6s
  shot('b1-accordion', 4.6, (ctx, lt) => {
    const o1 = lt > 1.0, o2 = lt > 2.4;
    withCam(ctx, [{ t: 0, x: 0, y: -700, z: 1.0 }, { t: 2.4, x: 40, y: -640, z: .94, e: E.io3 },
                  { t: 4.6, x: 44, y: -644, z: .96, e: E.linear }], lt, () => {
      settingsRoom(ctx, { t: lt });
      accordion(ctx, 0, -900, 1500, o2 ? 3 : o1 ? 2 : 1, {
        open: [o1, o2, false],
        labels: ['Manage preferences', 'More preferences', 'Additional preferences'],
      });
      drawTabbi(ctx, { ...pose('typing', lt * 5), x: -1000, y: 0, s: 1.4, flip: 1 });
      if (lt > .75 && lt < 1.1) pointer(ctx, 640, -830, { s: 2.0, t: lt, grab: lt * 6 });
      if (lt > 2.15 && lt < 2.5) pointer(ctx, 620, -700, { s: 2.0, t: lt, grab: lt * 6 });
    });
    finish(ctx, { vig: .3 });
  }, {
    tr: { type: 'cut' },
    sfx: [{ t: .9, n: 'click' }, { t: 1.02, n: 'paperSlide', d: .3 }, { t: 2.3, n: 'click' }, { t: 2.42, n: 'paperSlide', d: .3 }, { t: 2.5, n: 'squeakyToy', g: .5 }],
  });

  // ---- 11. Three deep, and the answer is "see footer". 4.0s
  shot('b1-nesting', 4.0, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 120, y: -640, z: .92 }, { t: 1.6, x: 190, y: -520, z: 1.22, e: E.io3 },
                  { t: 4.0, x: 194, y: -522, z: 1.25, e: E.linear }], lt, () => {
      settingsRoom(ctx, { t: lt });
      accordion(ctx, 0, -900, 1500, 3, {
        open: [true, true, true],
        labels: ['Manage preferences', 'More preferences', 'Additional preferences'],
        inner: (c, cw) => {
          S(c, () => {
            c.globalAlpha = clamp(p01(lt, .6, 1.0) * 1.3);
            rr(c, -cw / 2, 0, cw, 120, 16, PANEL2, 'rgba(245,245,247,.14)', 3);
            text(c, 'To cancel, see footer.', 0, 62, { size: 38, weight: 800, color: C.cheese });
          });
        },
      });
      drawTabbi(ctx, {
        ...pose('stare', 0), x: -1000, y: 0, s: 1.4, flip: 1,
        eye: { open: lt > 1.3 ? 1.2 : 1, wide: lt > 1.3 ? 1.06 : 1, look: [.7, -.2], shape: lt > 1.3 ? 'shock' : 'normal', shine: 1 },
        mouth: { shape: lt > 1.3 ? 'gasp' : 'flat', open: .7, w: .9 },
      });
    });
    finish(ctx, { vig: .3 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .62, n: 'uiPop' }, { t: 1.32, n: 'recordScratch', d: .5 }] });

  // ---- 12. Hard cut. The footer. Again. 3.8s
  shot('b1-footer', 3.8, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 660, y: FOOT - 62, z: 1.5 }, { t: 3.8, x: 668, y: FOOT - 64, z: 1.56, e: E.linear }], lt, () => {
      streemPage(ctx, { t: lt, hotFooter: true });
      if (lt > .9) pointer(ctx, lerp(1200, 700, E.io3(p01(lt, .9, 2.0))), FOOT - 120, { s: 2.0, t: lt, mood: 'worried' });
      S(ctx, () => { ctx.globalAlpha = .9; drawTabbi(ctx, { ...pose('defeated', 0), x: 60, y: -20, s: 1.2, flip: 1 }); });
    });
    finish(ctx, { vig: .28 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .05, n: 'wetSplat', g: .5 }, { t: 2.0, n: 'hoverTick' }] });

  // ---- 13. The dialog. One button is enormous. 3.4s
  shot('b1-click2', 3.4, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 0, y: -640, z: .92 }, { t: 3.4, x: 6, y: -644, z: .95, e: E.linear }], lt, () => {
      ctx.fillStyle = NIGHT; ctx.fillRect(-4000, -3000, 12000, 6000);
      S(ctx, () => { ctx.globalAlpha = .55; lightPool(ctx, 0, -640, 1500, 800, 'rgba(24,133,103,.12)', 1); });
      stayDialog(ctx, 0, -640, p01(lt, .15, .6), { pulse: .4 + sin01(lt * 1.6) * .4, t: lt });
    });
    finish(ctx, { vig: .3 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .1, n: 'click' }, { t: .18, n: 'uiSlam' }] });

  // ---- 14. He hunts for the small one. 4.0s
  shot('b1-sure', 4.0, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 0, y: -640, z: .95 }, { t: 1.5, x: 0, y: -440, z: 1.55, e: E.io3 },
                  { t: 4.0, x: 4, y: -442, z: 1.6, e: E.linear }], lt, () => {
      ctx.fillStyle = NIGHT; ctx.fillRect(-4000, -3000, 12000, 6000);
      S(ctx, () => { ctx.globalAlpha = .55; lightPool(ctx, 0, -640, 1500, 800, 'rgba(24,133,103,.12)', 1); });
      stayDialog(ctx, 0, -640, 1, { pulse: .3, hot: lt > 1.6, t: lt });
      const px = lerp(-360, 0, E.io3(p01(lt, .5, 2.4)));
      if (lt < 3.1) pointer(ctx, px, -432, { s: 1.9, t: lt, grab: lt > 2.6 ? lt * 6 : 0, mood: lt > 2.6 ? 'happy' : 'idle' });
    });
    hit(ctx, lt, 3.0, C.white, .1);
    finish(ctx, { vig: .3 });
  }, { tr: { type: 'cut' }, sfx: [{ t: 1.6, n: 'hoverTick' }, { t: 2.2, n: 'hoverTick' }, { t: 2.95, n: 'click' }, { t: 3.0, n: 'popCork' }] });

  // ---- 15. Loading. At length. 4.2s
  shot('b1-loading', 4.2, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 0, y: -600, z: 1.0 }, { t: 4.2, x: 4, y: -602, z: 1.03, e: E.linear }], lt, () => {
      ctx.fillStyle = NIGHT; ctx.fillRect(-4000, -3000, 12000, 6000);
      spinner(ctx, 0, -700, 120, lt, C.mint, 20, .9);
      S(ctx, () => {
        ctx.globalAlpha = clamp(p01(lt, 2.4, 2.9) * 1.3);
        text(ctx, 'CONNECTING YOU TO A SPECIALIST', 0, -420, { size: 44, weight: 800, color: C.white, letter: 3, maxW: 1500 });
      });
      S(ctx, () => { ctx.globalAlpha = .9; drawTabbi(ctx, { ...pose('stare', 0), x: -20, y: -20, s: 1.2, flip: 1, eye: { open: .9, wide: 1, look: [0, -.5], shape: 'normal', shine: .9 }, mouth: { shape: 'wavy', open: 0, w: .8 } }); });
    });
    finish(ctx, { vig: .32 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .05, n: 'spinLoop', d: 2.4 }, { t: 2.42, n: 'errorSoft' }, { t: 2.5, n: 'elevatorDing' }] });

  // ---- 16. Something wide is arriving. 4.8s
  shot('b1-dread', 4.8, (ctx, lt) => {
    const sh2 = lt > 3.2 ? shake(lt, 3.2, 1.6, 5, 9, 2) : { x: 0, y: 0 };
    withCam(ctx, [{ t: 0, x: -20, y: -330, z: 1.9 }, { t: 4.8, x: -16, y: -334, z: 2.15, e: E.ioSine }], lt, () => {
      ctx.fillStyle = NIGHT; ctx.fillRect(-4000, -3000, 12000, 6000);
      S(ctx, () => { ctx.globalAlpha = .4; lightPool(ctx, -20, -200, 900, 500, 'rgba(24,133,103,.2)', 1); });
      S(ctx, () => {
        ctx.translate(sh2.x, sh2.y);
        drawTabbi(ctx, {
          ...pose('stare', 0), x: -20, y: 0, s: 1.45, flip: 1,
          eye: { open: blinkAt(lt, [1.4], .12) * (lt > 3.2 ? 1.2 : 1), wide: lt > 3.2 ? 1.06 : 1, look: [.2, 0], shape: 'normal', shine: 1 },
          brow: { l: lerp(-6, -18, p01(lt, 2.0, 4.0)), r: lerp(-6, -18, p01(lt, 2.0, 4.0)), y: -3, show: 1 },
          mouth: { shape: lt > 3.2 ? 'wavy' : 'flat', open: 0, w: 1 },
        });
      });
      // a very wide shadow, growing
      if (lt > 2.6) S(ctx, () => {
        ctx.globalAlpha = clamp(p01(lt, 2.6, 4.6)) * .55;
        ell(ctx, 240, 10, lerp(60, 620, p01(lt, 2.6, 4.8)), lerp(16, 90, p01(lt, 2.6, 4.8)), 0, C.ink);
      });
    });
    finish(ctx, { vig: .34 });
  }, { tr: { type: 'cut' }, sfx: [{ t: 1.4, n: 'blink' }, { t: 2.7, n: 'riser', d: 2.0 }, { t: 3.2, n: 'rubberStretch', d: 1.4 }] });
}
