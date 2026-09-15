// ACT 6 — THE SYSTEM CHOOSES (3:45 – 4:30). The identity swap comes due.
import { C, W, H } from '../core/palette.js';
import { S, rr, rrPath, circ, ell, line, poly, text, shadow, noShadow, lightPool, ring, cursor } from '../core/draw.js';
import { clamp, lerp, p01, E, ramp, pulse, sinw, sin01, shake, hash, TAU } from '../core/util.js';
import { shot, say, sys, talk, withCam, finish, wash, hit, pointer, speedLines, split } from './kit.js';
import { drawTabbi, pose, blinkAt } from '../chars/tabbi.js';
import { drawDash } from '../chars/dash.js';
import { drawHelper } from '../chars/helper.js';
import { drawGate } from '../chars/gate.js';
import { doorRoom } from '../rooms/rooms.js';
import { codeChip, badge, pizzaBox } from '../rooms/props.js';
import { chip } from '../core/ui.js';

const DOORX = 0, TX = -560, DASHX = 660, HX = 180;

/** the final check panel at the door */
function finalCheck(ctx, x, y, k, o = {}) {
  const kk = clamp(k); if (kk <= .002) return;
  S(ctx, () => {
    ctx.translate(x, y); ctx.globalAlpha = clamp(kk * 1.4); ctx.scale(lerp(.92, 1, E.outBack(kk)), lerp(.92, 1, E.outBack(kk)));
    shadow(ctx, 34, 16, 'rgba(32,32,39,.22)');
    rr(ctx, -470, -140, 940, 280, 28, C.cream, C.ink, 6); noShadow(ctx);
    text(ctx, 'FINAL CHECK', 0, -84, { size: 26, weight: 800, color: 'rgba(32,32,39,.5)', letter: 5 });
    text(ctx, 'ARE YOU THE VERIFIED HUMAN?', 0, -14, { size: 40, weight: 800, color: C.ink, maxW: 880 });
    if (o.pass > 0) S(ctx, () => {
      const p = clamp(o.pass);
      ctx.globalAlpha = p;
      rr(ctx, -200, 44, 400, 76, 38, C.mint);
      text(ctx, 'APPROVED', 0, 84, { size: 32, weight: 800, color: C.white, letter: 4 });
    });
  });
}

export default function act6() {
  // ---- 1. The verified human arrives to collect. 3.4s
  shot('a6-arrive', 3.4, (ctx, lt, gt) => {
    const k = E.io3(p01(lt, .1, 2.2));
    withCam(ctx, [{ t: 0, x: 60, y: -460, z: .92 }, { t: 3.4, x: 76, y: -466, z: .95, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX, note: true });
      drawDash(ctx, { x: DASHX, y: 0, s: .92, flip: -1, mood: 'done', t: lt, pant: 1 });
      drawTabbi(ctx, { ...pose('defeated', 0), x: TX, y: 0, s: 1.5, flip: 1 });
      cursor(ctx, TX + 220, -30, 3.4, 1.5, { t: gt, mood: 'worried' });
      drawHelper(ctx, { x: lerp(-1500, HX, k), y: -20, s: 1.28, t: lt, face: 'happy', badge: 1, look: .3 });
      if (k > .5) S(ctx, () => { ctx.globalAlpha = clamp((k - .5) * 3); codeChip(ctx, HX, -700, '8806', { s: .5, glow: .5 }); });
    });
    finish(ctx, { vig: .22 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .15, n: 'hoverIn', d: 2.0 }, { t: 1.4, n: 'helperChime', g: .6 }] });

  // ---- 2. He passes, because he is a person. 4.0s
  shot('a6-check', 4.0, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 120, y: -640, z: 1.0 }, { t: 2.2, x: 150, y: -560, z: 1.12, e: E.io3 }, { t: 4.0, x: 154, y: -562, z: 1.14, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX, note: true });
      finalCheck(ctx, 200, -980, p01(lt, .1, .5), { pass: p01(lt, 2.7, 3.0) });
      drawHelper(ctx, { x: HX, y: -20, s: 1.28, t: lt, face: 'proud', badge: 1, talk: talk(sh, lt, 'helper'), look: .2, glow: p01(lt, 2.7, 3.1) });
      drawTabbi(ctx, { ...pose('suspicious', 0), x: TX, y: 0, s: 1.5, flip: 1 });
      drawDash(ctx, { x: DASHX + 260, y: 0, s: .92, flip: -1, mood: 'done', t: lt, pant: 1 });
    });
    say(ctx, sh, lt, 0, W * .60, H * .44, { size: 46, tail: [-.4, 1], maxW: 520 });
    finish(ctx, { vig: .22 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: 1.5, d: 1.2, who: 'helper', text: 'I am a person!' }],
    sfx: [{ t: .12, n: 'uiPop' }, { t: 1.45, n: 'helperChime' }, { t: 2.7, n: 'successSoft' }],
  });

  // ---- 3. Tabbi produces his own paperwork. 4.2s
  shot('a6-object', 4.2, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: TX + 220, y: -420, z: 1.35 }, { t: 4.2, x: TX + 228, y: -424, z: 1.38, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX, note: true });
      drawTabbi(ctx, {
        ...pose('angry', lt * 4), x: TX, y: 0, s: 1.5, flip: 1,
        armR: { a: 130 + sinw(lt * 3) * 26, b: -34, l1: 30, l2: 25 },
        mouth: { shape: 'shout', open: .8, w: 1, talk: talk(sh, lt, 'tabbi') },
      });
      S(ctx, () => { ctx.translate(TX + 150, -430 + sinw(lt * 3) * 26); ctx.rotate(sinw(lt * 3) * .12); badge(ctx, 0, 0, 'ASSISTANT', { size: 30, kind: 'gray' }); });
      drawHelper(ctx, { x: HX + 360, y: -20, s: 1.28, t: lt, face: 'happy', badge: 1, look: -.3 });
    });
    say(ctx, sh, lt, 0, W * .30, H * .17, { size: 46, tail: [-.1, 1] });
    finish(ctx, { vig: .22 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .3, d: 1.5, who: 'tabbi', text: "I'm the one who ordered it!" }],
    sfx: [{ t: .28, n: 'tabbiShout' }, { t: 1.9, n: 'flap' }],
  });

  // ---- 4. Gate, on a small screen, unmoved. 3.6s
  shot('a6-gate', 3.6, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 240, y: -840, z: 1.5 }, { t: 3.6, x: 244, y: -842, z: 1.54, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX });
      S(ctx, () => {
        ctx.translate(240, -840);
        shadow(ctx, 30, 14, 'rgba(32,32,39,.3)');
        rr(ctx, -380, -270, 760, 540, 26, C.gray, C.ink, 6); noShadow(ctx);
        S(ctx, () => {
          rrPath(ctx, -344, -234, 688, 468, 14); ctx.clip();
          ctx.fillStyle = C.night; ctx.fillRect(-344, -234, 688, 468);
          S(ctx, () => { ctx.translate(0, 300); ctx.scale(.86, .86); drawGate(ctx, { x: 0, y: 0, s: 1.0, flip: 1, mood: 'deny', look: 0, clip: false, talk: talk(sh, lt, 'gate'), shadowA: 0 }); });
          S(ctx, () => { ctx.globalAlpha = .1; for (let i = -6; i < 12; i++) rr(ctx, -344, -234 + i * 26 + (lt * 40 % 26), 688, 10, 0, C.white); });
        });
        circ(ctx, 300, -200, 12, C.red);
      });
    });
    sys(ctx, sh, lt, 0, W * .5, H * .82, { size: 44, bg: C.ink, accent: C.red, letter: 2 });
    finish(ctx, { vig: .24 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .5, d: 2.4, who: 'sysv', text: 'ASSISTANTS MAY NOT RECEIVE ORDERS' }],
    sfx: [{ t: .1, n: 'screenOn' }, { t: .5, n: 'gateBeep' }],
  });

  // ---- 5. The sentence, said plainly. 3.4s
  shot('a6-iordered', 3.4, (ctx, lt, gt, sh) => {
    split(ctx,
      c => withCam(c, [{ t: 0, x: TX + 20, y: -400, z: 1.75 }], lt, () => {
        doorRoom(c, { t: lt, doorX: DOORX });
        drawTabbi(c, { ...pose('sad', 0), x: TX, y: 0, s: 1.5, flip: 1, mouth: { shape: 'wavy', open: .2, w: .9, talk: talk(sh, lt, 'tabbi') } });
      }),
      c => withCam(c, [{ t: 0, x: HX, y: -400, z: 1.75 }], lt, () => {
        doorRoom(c, { t: lt, doorX: DOORX + 2200 });
        drawHelper(c, { x: HX, y: -20, s: 1.28, t: lt, face: 'happy', badge: 1 });
      }), p01(lt, 0, .3));
    say(ctx, sh, lt, 0, W * .25, H * .17, { size: 44 });
    sys(ctx, sh, lt, 1, W * .74, H * .17, { size: 40, bg: C.ink, letter: 2, maxW: 600 });
    finish(ctx, { vig: .26 });
  }, {
    tr: { type: 'cut' },
    say: [
      { t: .2, d: 1.2, who: 'tabbi', text: 'I ordered it.' },
      { t: 1.6, d: 1.6, who: 'sysv', text: 'THE HUMAN ORDERED IT' },
    ],
    sfx: [{ t: 0, n: 'splitSwish' }, { t: 1.58, n: 'sting', g: .7 }],
  });

  // ---- 6. Dash follows the instructions exactly. 4.4s
  shot('a6-hand', 4.4, (ctx, lt, gt) => {
    const give = E.io3(p01(lt, .8, 2.6));
    withCam(ctx, [{ t: 0, x: 420, y: -440, z: 1.15 }, { t: 2.6, x: 340, y: -450, z: 1.22, e: E.io2 }, { t: 4.4, x: 336, y: -452, z: 1.24, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX, note: true });
      drawDash(ctx, { x: DASHX, y: 0, s: .95, flip: -1, mood: 'done', t: lt, pant: 1, box: give < .5, armL: lerp(10, 86, give) });
      drawHelper(ctx, { x: HX + 340, y: -20, s: 1.28, t: lt, face: 'happy', badge: 1, look: .4, armL: lerp(20, 76, give), armR: lerp(20, 60, give) });
      // the box, crossing from one to the other
      S(ctx, () => {
        const bx = lerp(DASHX - 130, HX + 400, give), by = lerp(-330, -300, Math.sin(give * Math.PI) * .6 + give * .4);
        pizzaBox(ctx, bx, by - Math.sin(give * Math.PI) * 70, 260, { t: lt, open: 0, glow: give > .95 ? .5 : 0 });
      });
      drawTabbi(ctx, { ...pose('sad', 0), x: TX, y: 0, s: 1.5, flip: 1, eye: { open: 1.0, wide: 1.04, look: [.6, -.1], shape: 'wet', shine: 1 } });
    });
    finish(ctx, { vig: .24 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .85, n: 'boxLift' }, { t: 2.6, n: 'boxSet' }] });

  // ---- 7. "Forty-one minutes." 3.4s
  shot('a6-41', 3.4, (ctx, lt, gt, sh) => {
    const go = E.io2(p01(lt, 1.5, 3.4));
    withCam(ctx, [{ t: 0, x: DASHX - 40, y: -420, z: 1.5 }, { t: 1.5, x: DASHX - 30, y: -420, z: 1.52 }, { t: 3.4, x: DASHX + 300, y: -430, z: 1.2, e: E.io2 }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX, note: true });
      drawDash(ctx, { x: DASHX + go * 1200, y: 0, s: .95, flip: go > .05 ? 1 : -1, mood: go > .05 ? 'tired' : 'done', t: lt, pant: 1, box: false, talk: talk(sh, lt, 'dash') });
    });
    say(ctx, sh, lt, 0, W * .46, H * .22, { size: 48, tail: [.2, 1] });
    finish(ctx, { vig: .24 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .25, d: 1.3, who: 'dash', text: 'Forty-one minutes.' }],
    sfx: [{ t: .22, n: 'dashSigh' }, { t: 1.6, n: 'skateRoll', d: 1.7 }],
  });

  // ---- 8. The wide shot that says everything. 6.0s
  shot('a6-wide', 6.0, (ctx, lt, gt) => {
    withCam(ctx, [{ t: 0, x: -140, y: -460, z: .84 }, { t: 6.0, x: -150, y: -476, z: .87, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX, note: true });
      drawHelper(ctx, {
        x: HX + 340, y: -20, s: 1.28, t: lt, face: 'happy', badge: 1, look: -.2,
        hold: c => { S(c, () => { c.translate(0, -132); pizzaBox(c, 0, 0, 250, { t: lt, open: 0, glow: .45 + sin01(lt * .8) * .25 }); }); },
      });
      drawTabbi(ctx, { ...pose('stare', 0), x: TX, y: 0, s: 1.5, flip: 1, eye: { open: blinkAt(lt, [1.9, 4.4], .12), wide: 1.02, look: [.55, 0], shape: 'normal', shine: 1 }, brow: { l: -12, r: -12, y: -3, show: 1 }, mouth: { shape: 'flat', open: 0, w: 1 } });
      S(ctx, () => { ctx.globalAlpha = .5; lightPool(ctx, HX + 340, -60, 520, 150, 'rgba(24,133,103,.6)', 1); });
    });
    finish(ctx, { vig: .26 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .1, n: 'roomHum', d: 5.8 }, { t: 1.9, n: 'blink' }, { t: 4.4, n: 'blink' }] });

  // ---- 9. A long look at a small creature. 6.6s
  shot('a6-hold', 6.6, (ctx, lt, gt) => {
    withCam(ctx, [{ t: 0, x: TX + 20, y: -400, z: 1.4 }, { t: 6.6, x: TX + 24, y: -410, z: 1.78, e: E.ioSine }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX });
      drawTabbi(ctx, {
        ...pose('stare', 0), x: TX, y: 0, s: 1.5, flip: 1,
        eye: { open: lerp(1, .62, E.io3(p01(lt, 1.6, 5.2))) * blinkAt(lt, [1.2, 3.4, 5.6], .12), wide: 1.02, look: [lerp(.5, .05, p01(lt, 2.4, 4.4)), lerp(0, .22, p01(lt, 3.4, 6.0))], shape: 'normal', shine: lerp(1, .55, p01(lt, 3.0, 6.0)) },
        brow: { l: lerp(-10, -22, p01(lt, 1.2, 4.6)), r: lerp(-10, -22, p01(lt, 1.2, 4.6)), y: -3, show: 1 },
        mouth: { shape: lt > 4.2 ? 'frown' : 'flat', open: 0, w: lerp(1.05, .82, p01(lt, 3.6, 6.2)) },
        sy: lerp(1, .985, p01(lt, 3.0, 6.4)),
      });
    });
    finish(ctx, { vig: lerp(.26, .36, p01(lt, 0, 6.6)) });
  }, { tr: { type: 'cut' }, sfx: [{ t: 1.2, n: 'blink' }, { t: 3.4, n: 'blink' }, { t: 5.6, n: 'blink' }, { t: 4.3, n: 'swallow' }] });

  // ---- 10. He sits down. 6.0s
  shot('a6-slide', 6.0, (ctx, lt, gt) => {
    const sl = E.io3(p01(lt, .4, 2.4));
    withCam(ctx, [{ t: 0, x: TX + 80, y: -400, z: 1.2 }, { t: 2.6, x: TX + 90, y: -280, z: 1.3, e: E.io2 }, { t: 6.0, x: TX + 92, y: -276, z: 1.33, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX, note: true });
      drawHelper(ctx, { x: HX + 340, y: -20, s: 1.28, t: lt, face: 'happy', badge: 1, hold: c => { S(c, () => { c.translate(0, -132); pizzaBox(c, 0, 0, 250, { t: lt, open: 0, glow: .4 }); }); } });
      drawTabbi(ctx, {
        ...pose(sl > .8 ? 'sitting' : 'defeated', 0), x: TX, y: 0, s: 1.5, flip: 1,
        bob: lerp(0, -34, sl) + (sl > .8 ? 0 : 0),
        eye: lt > 3.4 ? { open: 1, wide: 1.04, look: [0, 0], shape: 'normal', shine: 1 } : { open: .5, wide: 1, look: [.1, .3], shape: 'narrow', shine: .6 },
        brow: { l: -16, r: -16, y: 0, show: 1 },
        mouth: { shape: 'flat', open: 0, w: 1.1 },
      });
    });
    finish(ctx, { vig: .3 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .45, n: 'slideDown' }, { t: 2.3, n: 'sitThud' }, { t: 3.5, n: 'doink', g: .5 }] });
}
