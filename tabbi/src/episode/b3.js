// B3 — THE ABSURD OFFERS (1:40 – 2:20). Generosity, weaponised.
import { C, W, H } from '../core/palette.js';
import { S, rr, circ, ell, line, poly, text, shadow, noShadow, lightPool } from '../core/draw.js';
import { clamp, lerp, p01, E, sinw, sin01, hash } from '../core/util.js';
import { shot, say, sys, talk, withCam, finish, hit, split } from './kit.js';
import { drawTabbi, pose, blinkAt } from '../chars/tabbi.js';
import { drawRetain } from '../chars/retain.js';
import { offerRoom, offerCard, pet } from '../rooms/streem.js';
import { RX, BX } from './b2.js';

export default function b3() {
  // ---- 27. "A second account. For a friend." 4.6s
  shot('b3-friend', 4.6, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 60, y: -700, z: .92 }, { t: 4.6, x: 66, y: -704, z: .95, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawRetain(ctx, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: 'delighted', arms: 1, talk: talk(sh, lt, 'retain'), look: -.5 });
      offerCard(ctx, -60, -820, {
        k: E.outBack(p01(lt, .2, .8)), title: 'A SECOND ACCOUNT', titleSize: 48,
        sub: 'for a friend', kicker: 'SHARE THE JOY', accent: C.mintMid, foot: 'Friend not included.',
      });
      drawTabbi(ctx, {
        ...pose('stare', 0), x: BX, y: 0, s: 1.45, flip: 1,
        eye: { open: 1, wide: 1, look: [lt > 2.4 ? sinw(p01(lt, 2.4, 4.0)) : .5, -.2], shape: 'normal', shine: 1 },
        mouth: { shape: 'flat', open: 0, w: 1 },
      });
    });
    say(ctx, sh, lt, 0, W * .58, H * .18, { size: 40, tail: [.3, 1], maxW: 520 });
    finish(ctx, { vig: .24 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .9, d: 1.5, who: 'retain', text: 'For a friend!' }],
    sfx: [{ t: .22, n: 'paperSlide' }, { t: .85, n: 'retainWarm' }, { t: 2.5, n: 'lookSwish' }, { t: 3.2, n: 'lookSwish' }],
  });

  // ---- 28. Wide. There is nobody. 3.4s
  shot('b3-nobody', 3.4, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: -400, y: -560, z: .42 }, { t: 3.4, x: -404, y: -562, z: .43, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawTabbi(ctx, { ...pose('stare', 0), x: BX, y: 0, s: 1.45, flip: 1, eye: { open: blinkAt(lt, [1.6], .12), wide: 1, look: [0, 0], shape: 'normal', shine: 1 } });
    });
    finish(ctx, { vig: .3 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .05, n: 'silenceHit', g: .5 }, { t: 1.6, n: 'blink' }] });

  // ---- 29. A pet. 4.8s
  shot('b3-pet', 4.8, (ctx, lt, gt, sh) => {
    const arrive = E.outBack(p01(lt, .4, 1.4));
    withCam(ctx, [{ t: 0, x: 120, y: -600, z: .9 }, { t: 2.4, x: 60, y: -420, z: 1.15, e: E.io3 },
                  { t: 4.8, x: 64, y: -422, z: 1.18, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawRetain(ctx, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: 'delighted', arms: 1, talk: talk(sh, lt, 'retain'), look: -.5 });
      // a rail the offer rides in on
      S(ctx, () => { ctx.globalAlpha = .35; line(ctx, -1400, -560, 1400, -560, C.ink, 7); });
      S(ctx, () => {
        const px = lerp(1200, -20, arrive);
        line(ctx, px, -560, px, -300, 'rgba(32,32,39,.4)', 6);
        rr(ctx, px - 130, -300, 260, 230, 20, C.cream, C.ink, 6);
        rr(ctx, px - 130, -300, 260, 44, [20, 20, 0, 0], C.mint);
        text(ctx, 'ONE (1) FREE PET', px, -278, { size: 19, weight: 800, color: C.white, letter: 1 });
        pet(ctx, px, -92, .85, { t: lt });
      });
      drawTabbi(ctx, { ...pose('stare', 0), x: BX, y: 0, s: 1.45, flip: 1, eye: { open: 1.1, wide: 1.04, look: [.5, .2], shape: 'normal', shine: 1 } });
    });
    say(ctx, sh, lt, 0, W * .62, H * .16, { size: 42, tail: [.3, 1], maxW: 540 });
    finish(ctx, { vig: .24 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: 1.6, d: 1.6, who: 'retain', text: 'Would a pet help?' }],
    sfx: [{ t: .42, n: 'rubberStretch', d: 1.0 }, { t: 1.4, n: 'elevatorDing' }, { t: 1.55, n: 'retainWarm' }, { t: 2.6, n: 'squeakyToy', g: .5 }],
  });

  // ---- 30. Hold. They look at each other. 4.0s
  shot('b3-petlook', 4.0, (ctx, lt) => {
    split(ctx,
      c => withCam(c, [{ t: 0, x: BX + 20, y: -300, z: 1.9 }], lt, () => {
        offerRoom(c, { t: lt, spotX: RX - 120 });
        drawTabbi(c, {
          ...pose('stare', 0), x: BX, y: 0, s: 1.45, flip: 1,
          eye: { open: blinkAt(lt, [1.2, 3.0], .12), wide: 1.02, look: [.3, .1], shape: 'normal', shine: 1 },
          mouth: { shape: 'flat', open: 0, w: 1.05 },
        });
      }),
      c => withCam(c, [{ t: 0, x: -20, y: -110, z: 2.6 }], lt, () => {
        offerRoom(c, { t: lt, spotX: RX - 120 });
        pet(c, -20, -20, 1.0, { t: lt });
      }), p01(lt, 0, .3));
    finish(ctx, { vig: .28 });
  }, { tr: { type: 'cut' }, sfx: [{ t: 0, n: 'splitSwish' }, { t: 1.2, n: 'blink' }, { t: 2.2, n: 'squeakyToy', g: .3 }, { t: 3.0, n: 'blink' }] });

  // ---- 31. "No." The pet is retracted. 3.6s
  shot('b3-petno', 3.6, (ctx, lt, gt, sh) => {
    const go = E.io3(p01(lt, 1.0, 3.0));
    withCam(ctx, [{ t: 0, x: 60, y: -420, z: 1.1 }, { t: 3.6, x: 66, y: -424, z: 1.13, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawRetain(ctx, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: 'sorry', arms: .8, look: -.5 });
      S(ctx, () => { ctx.globalAlpha = .35; line(ctx, -1400, -560, 1400, -560, C.ink, 7); });
      S(ctx, () => {
        const px = lerp(-20, 1400, go);
        line(ctx, px, -560, px, -300, 'rgba(32,32,39,.4)', 6);
        rr(ctx, px - 130, -300, 260, 230, 20, C.cream, C.ink, 6);
        rr(ctx, px - 130, -300, 260, 44, [20, 20, 0, 0], C.mint);
        pet(ctx, px, -92, .85, { t: lt });
      });
      drawTabbi(ctx, { ...pose('stare', 0), x: BX, y: 0, s: 1.45, flip: 1, mouth: { shape: 'flat', open: 0, w: 1.15, talk: talk(sh, lt, 'tabbi') }, brow: { l: 18, r: 18, y: 0, show: 1 } });
    });
    say(ctx, sh, lt, 0, W * .22, H * .2, { size: 56 });
    finish(ctx, { vig: .24 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .15, d: .8, who: 'tabbi', text: 'No.' }],
    sfx: [{ t: .12, n: 'tabbiHuff' }, { t: 1.0, n: 'slideWhistleDown', d: .9 }, { t: 2.0, n: 'sadTrombone', g: .6 }],
  });

  // ---- 32. "One last offer." 4.4s
  shot('b3-final', 4.4, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: RX - 60, y: -300, z: 1.4 }, { t: 2.3, x: 40, y: -680, z: .95, e: E.io3 },
                  { t: 4.4, x: 44, y: -684, z: .98, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawRetain(ctx, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: 'delighted', arms: 1, talk: talk(sh, lt, 'retain'), look: -.5 });
      offerCard(ctx, -60, -840, {
        k: E.outBack(p01(lt, 2.4, 3.0)), title: '€9.99 / MONTH', titleSize: 54,
        sub: 'our very best price', kicker: 'FINAL OFFER', accent: C.red, foot: 'Available today only.',
      });
      drawTabbi(ctx, { ...pose('suspicious', 0), x: BX, y: 0, s: 1.45, flip: 1 });
    });
    say(ctx, sh, lt, 0, W * .3, H * .2, { size: 44, tail: [.6, 1], maxW: 620 });
    finish(ctx, { vig: .24 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .2, d: 1.8, who: 'retain', text: 'One last offer.' }],
    sfx: [{ t: .15, n: 'retainWarm' }, { t: 2.42, n: 'paperSlide' }, { t: 2.5, n: 'cashRegister', g: .7 }],
  });

  // ---- 33. It is the price he already pays. 4.0s
  shot('b3-same', 4.0, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: BX + 30, y: -320, z: 1.75 }, { t: 4.0, x: BX + 36, y: -322, z: 1.82, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawTabbi(ctx, {
        ...pose('stare', 0), x: BX, y: 0, s: 1.45, flip: 1,
        eye: { open: lerp(1.05, .42, p01(lt, .6, 2.0)) * blinkAt(lt, [2.6], .12), wide: 1, look: [.4, 0], shape: lt > 1.6 ? 'narrow' : 'normal', shine: 1 },
        brow: { l: lerp(0, 26, p01(lt, .8, 2.2)), r: lerp(0, 26, p01(lt, .8, 2.2)), y: 3, show: 1 },
        mouth: { shape: 'flat', open: 0, w: lerp(1, 1.2, p01(lt, 1.4, 3.0)) },
      });
    });
    finish(ctx, { vig: .26 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .7, n: 'recordScratch', d: .4 }, { t: 2.0, n: 'clockTick' }, { t: 2.9, n: 'clockTick' }] });

  // ---- 34. He stands up straight. 4.0s
  shot('b3-refuse', 4.0, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 20, y: -420, z: 1.12 }, { t: 4.0, x: 26, y: -424, z: 1.16, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawRetain(ctx, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: lt > 1.2 ? 'listening' : 'delighted', arms: lerp(1, .4, p01(lt, 1.0, 2.0)), look: -.5 });
      drawTabbi(ctx, {
        ...pose('angry', lt * 3), x: BX, y: 0, s: 1.5, flip: 1,
        armR: { a: 118, b: -18, l1: 31, l2: 26 },
        mouth: { shape: 'shout', open: .9, w: 1.05, talk: talk(sh, lt, 'tabbi') },
      });
    });
    say(ctx, sh, lt, 0, W * .26, H * .18, { size: 62 });
    finish(ctx, { vig: .24 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .3, d: 1.4, who: 'tabbi', text: 'CANCEL.' }],
    sfx: [{ t: .28, n: 'tabbiShout' }, { t: .34, n: 'stampBig' }],
  });

  // ---- 35. Still delighted. 4.4s
  shot('b3-phone', 4.4, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: RX - 60, y: -300, z: 1.45 }, { t: 4.4, x: RX - 54, y: -302, z: 1.5, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawRetain(ctx, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: 'delighted', arms: .9, talk: talk(sh, lt, 'retain'), look: -.5 });
    });
    say(ctx, sh, lt, 0, W * .26, H * .21, { size: 42, tail: [.65, 1], maxW: 600 });
    finish(ctx, { vig: .24 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .4, d: 2.6, who: 'retain', text: 'Cancellation is available by phone.' }],
    sfx: [{ t: .35, n: 'retainWarm' }, { t: 3.3, n: 'elevatorDing', g: .5 }],
  });

  // ---- 36. 2.8s of "...by phone?"
  shot('b3-what', 2.8, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: BX + 20, y: -320, z: 2.0 }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawTabbi(ctx, {
        ...pose('toViewer', 0), x: BX, y: 0, s: 1.45, flip: 1,
        eye: { open: blinkAt(lt, [1.0], .1), wide: 1.06, look: [0, 0], shape: 'normal', shine: 1 },
        mouth: { shape: 'flat', open: 0, w: 1.2, talk: talk(sh, lt, 'tabbi') },
      });
    });
    say(ctx, sh, lt, 0, W * .70, H * .22, { size: 46, tail: [-.4, 1] });
    finish(ctx, { vig: .26 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .35, d: 1.4, who: 'tabbi', text: '...By phone?' }],
    sfx: [{ t: .1, n: 'doink' }, { t: 1.0, n: 'blink' }],
  });
}
