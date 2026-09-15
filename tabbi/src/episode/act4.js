// ACT 4 — THE DELIVERY (2:20 – 3:00). The shortcut arrives, on time, literally.
import { C, W, H } from '../core/palette.js';
import { S, rr, rrPath, circ, ell, line, poly, text, shadow, noShadow, lightPool, ring, cursor } from '../core/draw.js';
import { clamp, lerp, p01, E, ramp, pulse, sinw, sin01, shake, hash, TAU } from '../core/util.js';
import { shot, say, sys, talk, withCam, finish, wash, hit, pointer, speedLines, split } from './kit.js';
import { drawTabbi, pose, blinkAt } from '../chars/tabbi.js';
import { drawDash, sliceMark } from '../chars/dash.js';
import { mapWorld, doorRoom, trackScreen, miniMap } from '../rooms/rooms.js';
import { chatPanel, chip } from '../core/ui.js';
import { pizzaBox } from '../rooms/props.js';

export const DEST = [1180, -240];
export const ROUTE = [[-2100, 900], [-2100, 160], [-820, 160], [-820, -540], [460, -540], [460, -240], [1180, -240]];
const DOORX = 0, TX = -520, DASHX = 620;

/** where the courier is, as a point on the route */
function onRoute(k) {
  let total = 0; const segs = [];
  for (let i = 0; i < ROUTE.length - 1; i++) {
    const d = Math.hypot(ROUTE[i + 1][0] - ROUTE[i][0], ROUTE[i + 1][1] - ROUTE[i][1]);
    segs.push(d); total += d;
  }
  let want = clamp(k) * total;
  for (let i = 0; i < segs.length; i++) {
    if (want <= segs[i]) { const u = want / segs[i]; return [lerp(ROUTE[i][0], ROUTE[i + 1][0], u), lerp(ROUTE[i][1], ROUTE[i + 1][1], u)]; }
    want -= segs[i];
  }
  return ROUTE[ROUTE.length - 1];
}
/** the courier's dot on the map */
function dot(ctx, x, y, t, o = {}) {
  S(ctx, () => {
    ctx.translate(x, y);
    S(ctx, () => { ctx.globalAlpha = .28; circ(ctx, 0, 0, 52 + sin01(t * 1.6) * 26, C.mint); });
    circ(ctx, 0, 0, 30, C.mint, C.white, 8);
    if (o.label) text(ctx, o.label, 0, -74, { size: 30, weight: 800, color: C.ink, back: C.cream, backPadX: 16, backPadY: 10, backR: 10 });
  });
}
/** ETA readout, drawn as part of the app not as a caption */
function eta(ctx, x, y, mins, o = {}) {
  S(ctx, () => {
    ctx.translate(x, y);
    shadow(ctx, 26, 12, 'rgba(32,32,39,.20)');
    rr(ctx, -270, -86, 540, 172, 28, C.cream, C.ink, 5); noShadow(ctx);
    text(ctx, 'ARRIVING IN', 0, -44, { size: 26, weight: 800, color: 'rgba(32,32,39,.5)', letter: 4 });
    text(ctx, mins + ' MIN', 0, 26, { size: 76, weight: 800, color: o.bad ? C.red : C.mint });
  });
}

export default function act4() {
  // ---- 1. The receipt's dot becomes the delivery dot. 3.4s
  shot('a4-map', 3.4, (ctx, lt, gt) => {
    withCam(ctx, [{ t: 0, x: 200, y: -200, z: .40 }, { t: 3.4, x: 240, y: -220, z: .425, e: E.linear }], lt, () => {
      mapWorld(ctx, { t: lt, route: ROUTE, dest: DEST, destLabel: 'TAB 3', dash: true });
      dot(ctx, ...onRoute(.72), lt);
      eta(ctx, -1460, -1180, 2);
    });
    finish(ctx, { vig: .22 });
  }, { tr: { type: 'matchScale', d: .5, x: W * .5, y: H * .5, outZ: .35 }, sfx: [{ t: .05, n: 'mapWhoosh' }, { t: .6, n: 'blipSoft' }, { t: 1.8, n: 'blipSoft' }, { t: 3.0, n: 'blipSoft' }] });

  // ---- 2. Push into the dot until the map is a street. 3.0s
  shot('a4-push', 3.0, (ctx, lt, gt) => {
    const p = onRoute(.72);
    withCam(ctx, [{ t: 0, x: 240, y: -220, z: .42 }, { t: 2.8, x: p[0], y: p[1] - 120, z: 2.4, e: E.io3 }, { t: 3.0, x: p[0], y: p[1] - 124, z: 2.55, e: E.linear }], lt, () => {
      mapWorld(ctx, { t: lt, route: ROUTE, dest: DEST, destLabel: 'TAB 3' });
      const fade = 1 - p01(lt, 1.5, 2.4);
      if (fade > 0) S(ctx, () => { ctx.globalAlpha = fade; dot(ctx, p[0], p[1], lt); });
      if (lt > 1.9) S(ctx, () => {
        ctx.globalAlpha = p01(lt, 1.9, 2.5);
        drawDash(ctx, { x: p[0], y: p[1] + 40, s: .5, flip: 1, mood: 'sprinting', ph: lt * 3, t: lt });
      });
    });
    finish(ctx, { vig: .24 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .1, n: 'riser', d: 2.4 }, { t: 2.5, n: 'skateRoll', d: .5 }] });

  // ---- 3. DASH. Introduced doing his job. 3.2s
  shot('a4-dash', 3.2, (ctx, lt, gt) => {
    const p = onRoute(.72 + p01(lt, 0, 3.2) * .07);
    withCam(ctx, [{ t: 0, x: p[0] + 60, y: p[1] - 130, z: 1.55 }, { t: 3.2, x: p[0] + 80, y: p[1] - 134, z: 1.6, e: E.linear }], lt, () => {
      mapWorld(ctx, { t: lt, route: ROUTE, dest: DEST, destLabel: 'TAB 3' });
      drawDash(ctx, { x: p[0], y: p[1] + 30, s: .82, flip: 1, mood: 'tired', t: lt, pant: .8 });
      S(ctx, () => { ctx.globalAlpha = .55; text(ctx, '80 M TO GO', p[0] + 20, p[1] - 340, { size: 34, weight: 800, color: C.ink, back: C.cream, backPadX: 18, backPadY: 12, backR: 12, letter: 2 }); });
    });
    finish(ctx, { vig: .24 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .1, n: 'skateRoll', d: 3.0 }, { t: .4, n: 'panting', d: 2.6 }] });

  // ---- 4. Tabbi at his door, holding a plate, believing. 3.0s
  shot('a4-watch', 3.0, (ctx, lt, gt) => {
    withCam(ctx, [{ t: 0, x: -300, y: -480, z: .90 }, { t: 3.0, x: -290, y: -486, z: .93, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX, note: true });
      trackScreen(ctx, -1080, -700, 700, 440, {
        t: lt, caption: 'SLICE TRACK',
        inner: (c, iw, ih) => miniMap(c, iw, ih, { t: lt, eta: '2 MIN', dot: [1180, 360] }),
      });
      drawTabbi(ctx, {
        ...pose('hopeful', lt * 1.2), x: TX, y: 0, s: 1.5, flip: 1,
        hold: c => { S(c, () => { c.translate(6, 4); ell(c, 0, 0, 62, 16, 0, C.cream, C.ink, 5); ell(c, 0, -6, 46, 10, 0, C.white); }); },
      });
    });
    finish(ctx, { vig: .2 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .1, n: 'roomHum', d: 2.9 }, { t: .5, n: 'blipSoft' }, { t: 1.9, n: 'blipSoft' }] });

  // ---- 5. The dot changes its mind. 3.4s
  shot('a4-veer', 3.4, (ctx, lt, gt) => {
    const k = p01(lt, .5, 2.9);
    const off = [lerp(onRoute(.79)[0], -1400, E.io3(k)), lerp(onRoute(.79)[1], 700, E.io3(k))];
    const mins = lt < .7 ? 2 : lt < 1.7 ? 14 : 41;
    withCam(ctx, [{ t: 0, x: 200, y: -240, z: .42 }, { t: 3.4, x: 60, y: -180, z: .40, e: E.io2 }], lt, () => {
      mapWorld(ctx, { t: lt, route: ROUTE, dest: DEST, destLabel: 'TAB 3' });
      if (k > .02) S(ctx, () => {
        ctx.strokeStyle = C.red; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.setLineDash([40, 30]);
        ctx.beginPath(); ctx.moveTo(onRoute(.79)[0], onRoute(.79)[1]); ctx.lineTo(off[0], off[1]); ctx.stroke(); ctx.setLineDash([]);
      });
      dot(ctx, off[0], off[1], lt);
      eta(ctx, -1460, -1180, mins, { bad: mins > 3 });
    });
    finish(ctx, { vig: .24 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .5, n: 'wrongWay' }, { t: .72, n: 'errorSoft' }, { t: 1.72, n: 'errorSoft' }] });

  // ---- 6. 2.0s of face.
  shot('a4-shock', 2.0, (ctx, lt, gt) => {
    withCam(ctx, [{ t: 0, x: TX + 10, y: -400, z: 1.9 }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX });
      drawTabbi(ctx, { ...pose('shocked', 0), x: TX, y: 0, s: 1.5, flip: 1, sx: lerp(1, 1.06, p01(lt, 0, .2)) });
    });
    finish(ctx, { vig: .22 });
  }, { tr: { type: 'cut' }, sfx: [{ t: 0, n: 'gasp' }] });

  // ---- 7. They argue in writing. 4.2s
  shot('a4-chat', 4.2, (ctx, lt, gt) => {
    withCam(ctx, [{ t: 0, x: -80, y: -520, z: 1.05 }, { t: 4.2, x: -74, y: -524, z: 1.07, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX + 1400 });
      chatPanel(ctx, -280, -520, 1180, 700, [
        { who: 'me', text: 'you passed my street', k: p01(lt, .2, .4) },
        { who: 'them', text: 'following instructions', k: p01(lt, 1.3, 1.5) },
        { who: 'me', text: 'WHAT instructions', k: p01(lt, 2.5, 2.7) },
      ], { t: lt, typing: lt > .6 && lt < 1.3, title: 'DASH', sub: 'courier · moving' });
      drawTabbi(ctx, { ...pose('angry', lt * 5), x: 700, y: 0, s: 1.4, flip: -1 });
    });
    finish(ctx, { vig: .2 });
  }, {
    tr: { type: 'cut' },
    sfx: [{ t: .2, n: 'sendMsg' }, { t: 1.3, n: 'recvMsg' }, { t: 2.5, n: 'sendMsg' }],
  });

  // ---- 8. He sends the evidence. 3.0s
  shot('a4-photo', 3.0, (ctx, lt, gt) => {
    withCam(ctx, [{ t: 0, x: -280, y: -520, z: 1.18 }, { t: 3.0, x: -274, y: -524, z: 1.21, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX + 1400 });
      chatPanel(ctx, -280, -520, 1180, 700, [
        { who: 'them', text: 'following instructions', k: 1 },
        { who: 'me', text: 'WHAT instructions', k: 1 },
      ], { t: lt, title: 'DASH', sub: 'courier · moving' });
      S(ctx, () => {
        const k = E.outBack(p01(lt, .5, .95));
        ctx.globalAlpha = clamp(k * 1.4);
        ctx.translate(-520, -450); ctx.scale(k * .82, k * .82); ctx.rotate(-.04);
        shadow(ctx, 26, 12, 'rgba(32,32,39,.3)');
        rr(ctx, -330, -120, 660, 240, 20, C.cream, C.ink, 6); noShadow(ctx);
        text(ctx, 'DELIVERY INSTRUCTIONS', 0, -62, { size: 22, weight: 800, color: 'rgba(32,32,39,.5)', letter: 2 });
        text(ctx, 'JUST FOLLOW', 0, 0, { size: 52, weight: 800, color: C.ink });
        text(ctx, 'THE CURSOR', 0, 58, { size: 52, weight: 800, color: C.ink });
      });
    });
    finish(ctx, { vig: .2 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .5, n: 'recvMsg' }, { t: .55, n: 'shutterSoft' }] });

  // ---- 9. The reveal. The cursor is dragging him. 4.0s
  shot('a4-reveal', 4.0, (ctx, lt, gt) => {
    const cw = [lerp(-260, 780, E.ioSine(p01(lt, .6, 3.4))), lerp(-420, -900, sin01(p01(lt, .6, 3.4) * 1.4))];
    withCam(ctx, [{ t: 0, x: 60, y: -300, z: .50 }, { t: 1.1, x: 140, y: -360, z: .62, e: E.io3 }, { t: 4.0, x: 160, y: -370, z: .63, e: E.linear }], lt, () => {
      mapWorld(ctx, { t: lt, route: ROUTE, dest: DEST, destLabel: 'TAB 3' });
      S(ctx, () => { ctx.globalAlpha = .5; ctx.setLineDash([26, 22]); line(ctx, cw[0], cw[1], cw[0], cw[1] + 240, C.red, 8); ctx.setLineDash([]); });
      drawDash(ctx, { x: cw[0] - 30, y: cw[1] + 250, s: .75, flip: 1, mood: 'sprinting', ph: lt * 5, t: lt });
      cursor(ctx, cw[0], cw[1], 4.2, .1, { grab: lt * 4, t: gt, mood: 'happy' });
      S(ctx, () => { ctx.globalAlpha = .9; text(ctx, 'FOLLOWING INSTRUCTIONS', cw[0] + 40, cw[1] - 130, { size: 36, weight: 800, color: C.redDeep, back: C.cream, backStroke: C.red, backLW: 4, backPadX: 20, backPadY: 12, letter: 2 }); });
    });
    finish(ctx, { vig: .24 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .6, n: 'dragSlide', d: 2.8 }, { t: .62, n: 'panting', d: 3.2 }] });

  // ---- 10. He types. It gets worse. 3.4s
  shot('a4-whip', 3.4, (ctx, lt, gt) => {
    const sw = Math.sin(lt * 7.5) * 900;
    withCam(ctx, [{ t: 0, x: 200, y: -300, z: .45 }, { t: 3.4, x: 200, y: -300, z: .47, e: E.linear }], lt, () => {
      mapWorld(ctx, { t: lt, route: ROUTE, dest: DEST, destLabel: 'TAB 3' });
      speedLines(ctx, sw + (sw > 0 ? -240 : 240), -600, 6, 320, .3, 4, sw > 0 ? -1 : 1);
      drawDash(ctx, { x: sw - 40, y: -300, s: .75, flip: sw > 0 ? 1 : -1, mood: 'sprinting', ph: lt * 9, t: lt, tilt: sw > 0 ? -16 : 16 });
      cursor(ctx, sw, -560, 4.2, .1, { grab: lt * 9, t: gt, mood: 'strain' });
      // the split: what he is actually doing
      S(ctx, () => {
        ctx.globalAlpha = .96;
        const bx = -1800, by = -1500;
        rr(ctx, bx, by, 1100, 620, 26, C.cream, C.ink, 6);
        S(ctx, () => { rrPath(ctx, bx + 14, by + 14, 1072, 592, 18); ctx.clip(); ctx.translate(bx + 550, by + 560); ctx.scale(1.5, 1.5); drawTabbi(ctx, { ...pose('typing', lt * 14), x: 0, y: 0, s: 1.0, flip: 1 }); });
        text(ctx, 'TABBI, TYPING', bx + 550, by + 56, { size: 28, weight: 800, color: 'rgba(32,32,39,.45)', letter: 4 });
      });
    });
    finish(ctx, { vig: .24 });
  }, { tr: { type: 'cut' }, sfx: Array.from({ length: 14 }, (_, i) => ({ t: .1 + i * .22, n: 'typeKey' })).concat(Array.from({ length: 7 }, (_, i) => ({ t: .25 + i * .44, n: 'whoosh', g: .5 }))) });

  // ---- 11. He stops. Everything stops. 4.4s
  shot('a4-freeze', 4.4, (ctx, lt, gt) => {
    withCam(ctx, [{ t: 0, x: -140, y: -420, z: .78 }, { t: 1.4, x: -120, y: -430, z: .86, e: E.io3 }, { t: 4.4, x: -116, y: -432, z: .88, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX, note: true });
      const arrive = E.out3(p01(lt, 1.2, 2.6));
      drawDash(ctx, { x: lerp(1900, DASHX, arrive), y: 0, s: .92, flip: -1, mood: arrive > .95 ? 'done' : 'sprinting', ph: lt * 6, t: lt, pant: arrive > .9 ? 1 : 0 });
      // the cursor, held in both arms like a struggling animal
      drawTabbi(ctx, {
        ...pose('holding', 0), x: TX, y: 0, s: 1.5, flip: 1,
        armL: { a: 72, b: 40, l1: 30, l2: 26 }, armR: { a: 72, b: 40, l1: 30, l2: 26 },
        eye: { open: 1.1, wide: 1.04, look: [.3, 0], shape: 'normal', shine: 1 },
        brow: { l: 16, r: 16, y: -4, show: 1 }, mouth: { shape: 'flat', open: 0, w: 1.1 },
        sx: 1 + Math.sin(lt * 22) * .004, sy: 1 - Math.sin(lt * 22) * .004,
      });
      cursor(ctx, TX + 150, -215, 3.4, .16, { grab: lt * 3, t: gt, mood: 'strain' });
    });
    finish(ctx, { vig: .22 });
  }, {
    tr: { type: 'cut' },
    sfx: [{ t: 1.2, n: 'skateRoll', d: 1.4 }, { t: 2.5, n: 'skidStop' }, { t: 2.7, n: 'panting', d: 1.6 }],
  });

  // ---- 12. One millimetre. 3.0s
  shot('a4-twitch', 3.0, (ctx, lt, gt) => {
    const drift = lt > .9 && lt < 1.5 ? E.out3(p01(lt, .9, 1.5)) * 26 : lt >= 1.5 ? 26 - E.out4(p01(lt, 1.5, 1.9)) * 26 : 0;
    withCam(ctx, [{ t: 0, x: 120, y: -380, z: 1.1 }, { t: 3.0, x: 124, y: -382, z: 1.13, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX, note: true });
      drawDash(ctx, { x: DASHX + drift * 6, y: 0, s: .92, flip: -1, mood: 'done', t: lt, pant: 1, tilt: drift * .3 });
      drawTabbi(ctx, {
        ...pose('holding', 0), x: TX, y: 0, s: 1.5, flip: 1,
        armL: { a: 72, b: 40, l1: 30, l2: 26 }, armR: { a: 72, b: 40, l1: 30, l2: 26 },
        eye: { open: lt > 1.0 ? 1.2 : 1.0, wide: 1.06, look: [.4, 0], shape: 'normal', shine: 1 },
        mouth: { shape: lt > 1.0 ? 'gasp' : 'flat', open: .5, w: .9 },
      });
      cursor(ctx, TX + 150 + drift, -215, 3.4, .16, { grab: lt * 3, t: gt, mood: drift > 4 ? 'happy' : 'strain' });
    });
    finish(ctx, { vig: .22 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .92, n: 'creak' }, { t: 1.5, n: 'grab' }] });
}
