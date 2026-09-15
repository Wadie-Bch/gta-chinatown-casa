// ACT 7 — FALSE RESOLUTION (4:30 – 4:52) and the CALLBACK (4:52 – 5:00).
import { C, W, H } from '../core/palette.js';
import { S, rr, rrPath, circ, ell, line, poly, text, shadow, noShadow, lightPool, ring, spinner } from '../core/draw.js';
import { clamp, lerp, p01, E, ramp, pulse, sinw, sin01, hash, TAU } from '../core/util.js';
import { shot, say, sys, talk, withCam, finish, wash, hit, pointer, split } from './kit.js';
import { drawTabbi, pose, blinkAt, tabbiMark } from '../chars/tabbi.js';
import { drawHelper } from '../chars/helper.js';
import { doorRoom } from '../rooms/rooms.js';
import { pizzaBox, pizza, linkCard, dome, olive, badge } from '../rooms/props.js';
import { chip } from '../core/ui.js';

const DOORX = 0, TX = -560, HX = 520;

export default function act7() {
  // ---- 1. He asks. 3.6s
  shot('a7-ask', 3.6, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: -180, y: -300, z: 1.16 }, { t: 3.6, x: -172, y: -304, z: 1.19, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX, note: true });
      drawHelper(ctx, { x: HX, y: -20, s: 1.28, t: lt, face: 'happy', badge: 1, look: -.4, hold: c => { S(c, () => { c.translate(0, -132); pizzaBox(c, 0, 0, 250, { t: lt, open: 0, glow: .4 }); }); } });
      drawTabbi(ctx, {
        ...pose('sitting', 0), x: TX, y: 0, s: 1.5, flip: 1,
        eye: { open: 1.05, wide: 1.06, look: [.5, -.15], shape: 'wet', shine: 1 },
        brow: { l: -22, r: -22, y: -4, show: 1 },
        mouth: { shape: 'wavy', open: .15, w: .8, talk: talk(sh, lt, 'tabbi') },
      });
    });
    say(ctx, sh, lt, 0, W * .30, H * .32, { size: 44, tail: [-.2, 1] });
    finish(ctx, { vig: .3 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .8, d: 1.9, who: 'tabbi', text: 'Can you share it?' }],
    sfx: [{ t: .78, n: 'tabbiSmall' }],
  });

  // ---- 2. "Of course. Sharing." 4.4s
  shot('a7-share', 4.4, (ctx, lt, gt, sh) => {
    const open = E.out3(p01(lt, 1.5, 2.6));
    withCam(ctx, [{ t: 0, x: HX - 40, y: -400, z: 1.3 }, { t: 1.4, x: HX, y: -440, z: 1.6, e: E.io3 }, { t: 4.4, x: HX + 4, y: -442, z: 1.63, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX });
      drawHelper(ctx, {
        x: HX, y: -20, s: 1.28, t: lt, face: 'proud', badge: 1, talk: talk(sh, lt, 'helper'), armL: 20 + open * 50, armR: 20 + open * 50,
        hold: c => { S(c, () => { c.translate(0, -132); pizzaBox(c, 0, 0, 250, { t: lt, open, glow: .4 + open * .4 }); }); },
      });
    });
    say(ctx, sh, lt, 0, W * .70, H * .22, { size: 46, tail: [-.4, 1], maxW: 540 });
    finish(ctx, { vig: .28 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .25, d: 1.5, who: 'helper', text: 'Of course! Sharing.' }],
    sfx: [{ t: .22, n: 'helperChime' }, { t: 1.55, n: 'boxOpen' }],
  });

  // ---- 3. He does share it. As a link. 4.6s
  shot('a7-link', 4.6, (ctx, lt) => {
    const rise = E.out3(p01(lt, .3, 1.6));
    withCam(ctx, [{ t: 0, x: HX - 60, y: -460, z: 1.25 }, { t: 1.6, x: 180, y: -620, z: 1.02, e: E.io3 }, { t: 4.6, x: 176, y: -624, z: 1.03, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX });
      drawHelper(ctx, { x: HX, y: -20, s: 1.28, t: lt, face: 'proud', badge: 1, hold: c => { S(c, () => { c.translate(0, -132); pizzaBox(c, 0, 0, 250, { t: lt, open: 1, glow: .7 }); }); } });
      S(ctx, () => {
        ctx.translate(HX - 40, lerp(-360, -880, rise));
        ctx.rotate(sinw(lt * .7) * .02);
        linkCard(ctx, 0, 0, { k: clamp(rise * 1.4), copied: lt > 1.8, w: 660 });
      });
      drawTabbi(ctx, { ...pose('hopeful', lt), x: TX, y: 0, s: 1.5, flip: 1, eye: { open: 1.1, wide: 1.08, look: [.5, -.4], shape: lt < 2.4 ? 'sparkle' : 'normal', shine: 1 }, brow: { l: lt < 2.4 ? -18 : 12, r: lt < 2.4 ? -18 : 12, y: -5, show: 1 }, mouth: { shape: lt < 2.4 ? 'smile' : 'wavy', open: .15, w: .9 } });
    });
    finish(ctx, { vig: .28 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .32, n: 'linkPop' }, { t: 1.85, n: 'copied' }] });

  // ---- 4. The pizza is now behind a permission. 6.4s
  shot('a7-dome', 6.4, (ctx, lt, gt, sh) => {
    const domeK = E.out3(p01(lt, .2, .9));
    const tap = lt > 2.2 && lt < 3.0;
    withCam(ctx, [{ t: 0, x: HX - 180, y: -400, z: 1.1 }, { t: 2.0, x: 240, y: -380, z: 1.12, e: E.io3 }, { t: 6.4, x: 244, y: -382, z: 1.14, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX });
      // the pizza, set down on the floor, under glass
      S(ctx, () => { ctx.translate(HX + 60, -30); ctx.scale(1, .42); pizza(ctx, 0, -60, 190, { steam: .5, t: lt }); });
      dome(ctx, HX + 60, -30, 250, { k: domeK, lock: 1 });
      S(ctx, () => {
        ctx.globalAlpha = clamp(p01(lt, 1.0, 1.4));
        text(ctx, 'YOU NEED ACCESS', HX + 60, -430, { size: 40, weight: 800, color: C.white, back: C.ink, backPadX: 26, backPadY: 16, backR: 14, letter: 2 });
      });
      if (lt > 2.2) S(ctx, () => {
        ctx.globalAlpha = clamp(p01(lt, 2.2, 2.5));
        const pending = lt > 3.2;
        rr(ctx, HX - 200, -330, 520, 96, 48, pending ? C.gray : C.mint, C.ink, 5);
        text(ctx, pending ? 'PENDING' : 'REQUEST ACCESS', HX + 60, -282, { size: 32, weight: 800, color: pending ? 'rgba(32,32,39,.6)' : C.white, letter: 3 });
        if (pending) spinner(ctx, HX + 250, -282, 22, lt, 'rgba(32,32,39,.45)', 6, 1.4);
      });
      if (tap) pointer(ctx, HX + 60, -250, { s: 2.2, grab: lt * 6 });
      drawTabbi(ctx, {
        ...pose(lt > 3.4 ? 'defeated' : 'hopeful', lt), x: TX, y: 0, s: 1.5, flip: 1,
        eye: { open: lt > 3.4 ? .45 : 1.05, wide: 1, look: [.6, .1], shape: lt > 3.4 ? 'narrow' : 'normal', shine: .9 },
      });
      drawHelper(ctx, { x: HX + 620, y: -20, s: 1.28, t: lt, face: 'happy', badge: 1, talk: talk(sh, lt, 'helper'), look: -.4 });
    });
    say(ctx, sh, lt, 0, W * .74, H * .20, { size: 40, tail: [.2, 1], maxW: 480 });
    finish(ctx, { vig: .3 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: 4.3, d: 1.8, who: 'helper', text: 'You will receive an email.' }],
    sfx: [{ t: .22, n: 'domeSeal' }, { t: 2.3, n: 'tick' }, { t: 3.2, n: 'spinLoop', d: 2.2 }, { t: 4.25, n: 'helperChime', g: .7 }],
  });

  // ---- 5. Face against the glass. 3.0s
  shot('a7-face', 3.0, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: HX - 220, y: -300, z: 1.75 }, { t: 3.0, x: HX - 216, y: -302, z: 1.8, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX });
      S(ctx, () => { ctx.translate(HX + 60, -30); ctx.scale(1, .42); pizza(ctx, 0, -60, 190, { steam: .3, t: lt }); });
      dome(ctx, HX + 60, -30, 250, { k: 1, lock: 0 });
      drawTabbi(ctx, {
        ...pose('toViewer', 0), x: HX - 220, y: 0, s: 1.5, flip: 1,
        eye: { open: blinkAt(lt, [1.5], .12), wide: 1.06, look: [0, 0], shape: 'normal', shine: 1 },
        mouth: { shape: 'flat', open: 0, w: 1.2 }, sx: 1.04, sy: .98,
        armL: { a: 88, b: 8, l1: 30, l2: 26 }, armR: { a: 88, b: 8, l1: 30, l2: 26 },
      });
    });
    finish(ctx, { vig: .3 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .1, n: 'glassPress' }, { t: 1.5, n: 'blink' }] });

  // ---- 6. PING. 3.2s
  shot('a7-ping', 3.2, (ctx, lt) => {
    const land = E.outBounce(p01(lt, .15, .9));
    const open = p01(lt, 1.6, 2.3);
    withCam(ctx, [{ t: 0, x: TX + 160, y: -260, z: 1.5 }, { t: 1.5, x: TX + 170, y: -230, z: 1.85, e: E.io3 }, { t: 3.2, x: TX + 172, y: -232, z: 1.88, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX, note: true });
      drawTabbi(ctx, {
        ...pose(lt > 1.0 ? 'stare' : 'sitting', 0), x: TX, y: 0, s: 1.5, flip: 1,
        eye: { open: 1.05, wide: 1.04, look: [.55, lt > .9 ? .35 : 0], shape: 'normal', shine: 1 },
        brow: { l: lt > .9 ? 12 : -14, r: lt > .9 ? 12 : -14, y: -3, show: 1 }, mouth: { shape: 'flat', open: 0, w: 1 },
      });
      S(ctx, () => {
        const bx = TX + 330, by = lerp(-1100, -52, land);
        ctx.translate(bx, by);
        shadow(ctx, 16, 8, 'rgba(32,32,39,.25)');
        rr(ctx, -70, -60, 140, 62, 12, C.cream, C.ink, 5); noShadow(ctx);
        S(ctx, () => { ctx.translate(0, -60); ctx.transform(1, 0, 0, Math.cos(open * 1.5), 0, 0); rr(ctx, -70, -46, 140, 46, 10, C.cream, C.ink, 5); });
        if (open > .5) olive(ctx, 0, -28, 22, { rot: .4 });
      });
    });
    finish(ctx, { vig: .28 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .12, n: 'notif3' }, { t: .9, n: 'boxDrop' }, { t: 1.62, n: 'boxOpenSmall' }] });

  // ---- 7. One (1) free olive. 2.6s
  shot('a7-olive', 2.6, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: TX + 120, y: -300, z: 2.4 }, { t: 1.4, x: TX + 40, y: -330, z: 2.1, e: E.io3 }, { t: 2.6, x: TX + 38, y: -332, z: 2.12, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX });
      const eaten = lt > 1.75;
      drawTabbi(ctx, {
        ...pose('toViewer', 0), x: TX, y: 0, s: 1.5, flip: 1,
        eye: { open: blinkAt(lt, [.9], .1), wide: 1.06, look: [0, 0], shape: 'normal', shine: 1 },
        mouth: eaten ? { shape: 'chew', open: .3, w: 1, talk: lt } : { shape: 'flat', open: 0, w: 1.15 },
        armR: { a: eaten ? 150 : 110, b: eaten ? -56 : -10, l1: 30, l2: 25 },
        hold: eaten ? null : c => olive(c, 0, 0, 20, { rot: .3 }),
      });
      if (!eaten) S(ctx, () => { ctx.globalAlpha = .9; text(ctx, 'ONE (1) FREE OLIVE', TX + 330, -640, { size: 30, weight: 800, color: 'rgba(32,32,39,.55)', letter: 2 }); });
    });
    finish(ctx, { vig: .28 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .05, n: 'chimeSoft', g: .5 }, { t: 1.78, n: 'crunch' }] });

  // ---- 8. Mark. 2.2s
  shot('a7-mark', 2.2, (ctx, lt) => {
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
