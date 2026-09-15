// B4 — THE HOLD ROOM (2:20 – 3:00). Beige is a design decision.
import { C, W, H } from '../core/palette.js';
import { S, rr, circ, ell, line, poly, text, shadow, noShadow, lightPool, ring } from '../core/draw.js';
import { clamp, lerp, p01, E, sinw, sin01, hash } from '../core/util.js';
import { shot, say, sys, talk, withCam, finish, hit, split } from './kit.js';
import { drawTabbi, pose, blinkAt } from '../chars/tabbi.js';
import { drawGate } from '../chars/gate.js';
import { holdRoom, nowServing, ticketStub, serviceWindow } from '../rooms/streem.js';

export const HTX = -260;           // Tabbi's chair
const MACH = -1180, BOARD = 760;

/** the machine that gives you a number you will not like */
function ticketMachine(ctx, x, y, o = {}) {
  S(ctx, () => {
    ctx.translate(x, y);
    rr(ctx, -90, -420, 180, 420, 20, '#C6BCA9', C.ink, 6);
    rr(ctx, -62, -386, 124, 96, 12, C.ink);
    text(ctx, 'TAKE A', 0, -356, { size: 20, weight: 800, color: 'rgba(245,245,247,.6)', letter: 2 });
    text(ctx, 'NUMBER', 0, -326, { size: 22, weight: 800, color: C.cheese, letter: 2 });
    rr(ctx, -54, -250, 108, 18, 6, C.ink);
    if (o.out > 0) S(ctx, () => { ctx.globalAlpha = clamp(o.out); ticketStub(ctx, 0, -180 + clamp(o.out) * 40, o.num, { s: .55 }); });
  });
}

export default function b4() {
  // ---- 37. Into beige. 4.4s
  shot('b4-enter', 4.4, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 200, y: -700, z: .48 }, { t: 4.4, x: 120, y: -690, z: .52, e: E.io2 }], lt, () => {
      holdRoom(ctx, { t: lt, playing: lt > .8 });
      drawTabbi(ctx, { ...pose('walking', lt * 2.0), x: lerp(-1900, HTX - 500, E.io2(p01(lt, .3, 4.0))), y: 0, s: 1.45, flip: 1 });
    });
    finish(ctx, { vig: .26 });
  }, {
    tr: { type: 'shutter', d: .6, n: 9 },
    sfx: [{ t: .1, n: 'doorThunk' }, { t: .85, n: 'elevatorDing' }]
      .concat([0, 1, 2, 3, 4, 5].map(i => ({ t: .5 + i * .58, n: 'footStep' }))),
  });

  // ---- 38. He takes a number. 4.0s
  shot('b4-ticket', 4.0, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: MACH + 120, y: -420, z: 1.15 }, { t: 4.0, x: MACH + 128, y: -424, z: 1.19, e: E.linear }], lt, () => {
      holdRoom(ctx, { t: lt, playing: true });
      ticketMachine(ctx, MACH, 0, { out: p01(lt, .9, 1.6), num: '4,312' });
      drawTabbi(ctx, { ...pose(lt > 1.8 ? 'holding' : 'idle', lt), x: MACH + 320, y: 0, s: 1.45, flip: -1 });
    });
    finish(ctx, { vig: .26 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .85, n: 'printer', d: .7 }, { t: 1.6, n: 'paperSlide' }, { t: 1.9, n: 'popCork', g: .4 }] });

  // ---- 39. The board says twelve. 4.2s
  shot('b4-board', 4.2, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: BOARD, y: -1000, z: 1.0 }, { t: 4.2, x: BOARD + 6, y: -1004, z: 1.04, e: E.linear }], lt, () => {
      holdRoom(ctx, { t: lt, playing: true });
      nowServing(ctx, BOARD, -1000, 12);
      S(ctx, () => { ctx.globalAlpha = .95; drawTabbi(ctx, { ...pose('hopeful', lt), x: BOARD - 620, y: -60, s: 1.1, flip: 1 }); });
    });
    finish(ctx, { vig: .26 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .1, n: 'holdBedIn' }, { t: 2.0, n: 'clockTick' }, { t: 3.2, n: 'clockTick' }] });

  // ---- 40. He sits. It goes down. 5.0s
  shot('b4-wait1', 5.0, (ctx, lt) => {
    const n = lt > 3.0 ? 11 : 12;
    withCam(ctx, [{ t: 0, x: 120, y: -560, z: .62 }, { t: 5.0, x: 126, y: -564, z: .645, e: E.linear }], lt, () => {
      holdRoom(ctx, { t: lt, playing: true });
      nowServing(ctx, BOARD, -1000, n, { col: n === 11 ? C.red : C.cheese });
      drawTabbi(ctx, {
        ...pose('sitting', 0), x: HTX, y: -150, s: 1.45, flip: 1,
        eye: { open: blinkAt(lt, [1.4, 4.0], .12) * (lt > 3.1 ? 1.15 : 1), wide: lt > 3.1 ? 1.04 : 1, look: [.5, -.3], shape: 'normal', shine: 1 },
        mouth: { shape: lt > 3.1 ? 'o' : 'flat', open: .4, w: .9 },
      });
    });
    finish(ctx, { vig: .26 });
  }, { tr: { type: 'cut' }, sfx: [{ t: 1.4, n: 'blink' }, { t: 3.0, n: 'errorSoft' }, { t: 3.1, n: 'slideWhistleDown', d: .5 }] });

  // ---- 41. His ticket goes up. 4.0s
  shot('b4-down', 4.0, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: HTX + 200, y: -300, z: 1.55 }, { t: 4.0, x: HTX + 206, y: -302, z: 1.6, e: E.linear }], lt, () => {
      holdRoom(ctx, { t: lt, playing: true });
      drawTabbi(ctx, { ...pose('sitting', 0), x: HTX, y: -150, s: 1.45, flip: 1, eye: { open: 1.15, wide: 1.04, look: [.4, .4], shape: 'normal', shine: 1 }, mouth: { shape: 'wavy', open: 0, w: .9 } });
      S(ctx, () => { ticketStub(ctx, HTX + 300, -280, lt > 1.6 ? '4,313' : '4,312', { s: .9, rot: -.08 }); });
      if (lt > 1.6) S(ctx, () => {
        ctx.globalAlpha = clamp(p01(lt, 1.6, 1.9));
        S(ctx, () => { ctx.translate(HTX + 430, -400); ctx.rotate(-.2); text(ctx, '+1', 0, 0, { size: 52, weight: 800, color: C.red }); });
      });
    });
    finish(ctx, { vig: .26 });
  }, { tr: { type: 'cut' }, sfx: [{ t: 1.58, n: 'boing' }, { t: 1.7, n: 'slideWhistleUp', d: .4 }] });

  // ---- 42. The operator. 4.6s
  shot('b4-gate', 4.6, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 1400, y: -640, z: .86 }, { t: 4.6, x: 1408, y: -644, z: .89, e: E.linear }], lt, () => {
      serviceWindow(ctx, { t: lt, wx: 1400, dark: true, sign: 'POSITION 1' });
      S(ctx, () => { ctx.translate(1400, -390); ctx.scale(.86, .86); drawGate(ctx, { x: 0, y: 0, s: 1.0, flip: -1, mood: 'neutral', look: -.2, clip: false, talk: talk(sh, lt, 'gate'), shadowA: 0 }); });
      S(ctx, () => { ctx.globalAlpha = .9; drawTabbi(ctx, { ...pose('hopeful', lt), x: 640, y: 0, s: 1.3, flip: 1 }); });
    });
    say(ctx, sh, lt, 0, W * .32, H * .18, { size: 38, tail: [.55, 1], maxW: 640 });
    finish(ctx, { vig: .28 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .5, d: 2.8, who: 'gate', text: 'You are number four thousand three hundred and thirteen.' }],
    sfx: [{ t: .2, n: 'gateBeep' }, { t: 3.6, n: 'gateBeep', g: .6 }],
  });

  // ---- 43. The music loops. Badly. 4.2s
  shot('b4-music', 4.2, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 1180, y: -1180, z: 1.5 }, { t: 2.0, x: 700, y: -700, z: .82, e: E.io3 },
                  { t: 4.2, x: 704, y: -704, z: .84, e: E.linear }], lt, () => {
      holdRoom(ctx, { t: lt, playing: true });
      drawTabbi(ctx, {
        ...pose('sitting', 0), x: HTX, y: -150, s: 1.45, flip: 1,
        eye: { open: .45, wide: 1, look: [.6, -.5], shape: 'narrow', shine: .6 },
        brow: { l: 22, r: 22, y: 3, show: 1 }, mouth: { shape: 'flat', open: 0, w: 1.15 },
      });
    });
    finish(ctx, { vig: .26 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .05, n: 'squeakyToy', g: .3 }, { t: 2.6, n: 'clockTick' }, { t: 3.6, n: 'clockTick' }] });

  // ---- 44. Time passes. A plant grows. 4.8s
  shot('b4-sleep', 4.8, (ctx, lt) => {
    const grow = E.io3(p01(lt, 1.2, 4.0));
    withCam(ctx, [{ t: 0, x: 60, y: -560, z: .66 }, { t: 4.8, x: 66, y: -566, z: .69, e: E.linear }], lt, () => {
      holdRoom(ctx, { t: lt, playing: true });
      nowServing(ctx, BOARD, -1000, 9, { col: C.red });
      drawTabbi(ctx, {
        ...pose('sitting', 0), x: HTX, y: -150, s: 1.45, flip: 1,
        eye: { open: 0, wide: 1, look: [0, 0], shape: 'closed', shine: 0 },
        brow: { l: 0, r: 0, y: 0, show: 0 }, mouth: { shape: 'o', open: .35, w: .7 },
        lean: 10, bob: 4 + Math.sin(lt * 1.6) * 4,
      });
      // a plant, arriving over time
      S(ctx, () => {
        ctx.translate(HTX + 420, 0); ctx.globalAlpha = clamp(grow * 1.2);
        rr(ctx, -56, -110, 112, 110, 16, '#C6A184', C.ink, 5);
        for (let i = 0; i < 6; i++) {
          const a = -Math.PI / 2 + (i - 2.5) * .34, h = 40 + grow * (90 + hash(i) * 70);
          S(ctx, () => { ctx.translate(0, -110); ctx.rotate(a); ell(ctx, 0, -h * .55, 22 * grow + 6, h * .55, 0, i % 2 ? '#7FA579' : '#658B60', C.ink, 4); });
        }
      });
      // Zs
      S(ctx, () => {
        ctx.globalAlpha = .6;
        for (let i = 0; i < 3; i++) {
          const k = (lt * .5 + i * .33) % 1;
          text(ctx, 'z', HTX + 180 + k * 90, -520 - k * 220, { size: 30 + k * 34, weight: 800, color: 'rgba(32,32,39,' + (1 - k) * .7 + ')' });
        }
      });
    });
    finish(ctx, { vig: .28 });
  }, { tr: { type: 'dissolve', d: .5 }, sfx: [{ t: .1, n: 'snore', d: 4.6 }, { t: 1.2, n: 'plantGrow', d: 2.6 }] });

  // ---- 45. DING. 4.8s
  shot('b4-called', 4.8, (ctx, lt) => {
    const wake = p01(lt, .5, 1.0);
    withCam(ctx, [{ t: 0, x: BOARD, y: -1000, z: 1.0 }, { t: .9, x: HTX + 120, y: -420, z: 1.2, e: E.out4 },
                  { t: 4.8, x: HTX + 128, y: -424, z: 1.24, e: E.linear }], lt, () => {
      holdRoom(ctx, { t: lt, playing: lt < 1.2 });
      nowServing(ctx, BOARD, 4313, { col: C.mint });
      drawTabbi(ctx, {
        ...pose(wake > .5 ? 'shocked' : 'sitting', 0), x: HTX, y: wake > .5 ? 0 : -150, s: 1.45, flip: 1,
        ...(wake > .5 ? {} : { eye: { open: 0, wide: 1, look: [0, 0], shape: 'closed', shine: 0 }, mouth: { shape: 'o', open: .35, w: .7 }, lean: 10 }),
      });
    });
    hit(ctx, lt, .45, C.white, .12);
    finish(ctx, { vig: .26 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .42, n: 'elevatorDing' }, { t: .5, n: 'gasp' }, { t: .9, n: 'boing', g: .5 }] });
}
