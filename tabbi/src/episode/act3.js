// ACT 3 — THE ORDER (1:40 – 2:20). A form, treated as a place with a counter.
import { C, W, H } from '../core/palette.js';
import { S, rr, rrPath, circ, ell, line, poly, text, shadow, noShadow, lightPool, ring, spinner } from '../core/draw.js';
import { clamp, lerp, p01, E, ramp, pulse, sinw, sin01, shake, hash, TAU } from '../core/util.js';
import { shot, say, sys, talk, withCam, finish, wash, hit, pointer, speedLines, split } from './kit.js';
import { drawTabbi, pose, blinkAt } from '../chars/tabbi.js';
import { drawHelper } from '../chars/helper.js';
import { counterRoom } from '../rooms/rooms.js';
import { receipt, coin, badge, olive } from '../rooms/props.js';
import { field, chip, button } from '../core/ui.js';

const TX = -560, HX = 240;      // Tabbi and Helper at the counter

/** a floating form card: the field, but as furniture */
function formCard(ctx, x, y, w, o = {}) {
  const k = clamp(o.k ?? 1); if (k <= .002) return;
  const h = o.h || 150;
  S(ctx, () => {
    ctx.translate(x, y); ctx.globalAlpha = clamp(k * 1.4);
    ctx.scale(lerp(.92, 1, E.outBack(k)), lerp(.92, 1, E.outBack(k)));
    shadow(ctx, 26, 12, 'rgba(32,32,39,.18)');
    rr(ctx, -w / 2, -h / 2, w, h, 20, o.bad ? C.redSoft : C.cream, o.bad ? C.red : C.ink, 5); noShadow(ctx);
    text(ctx, o.label, -w / 2 + 28, -h / 2 + 34, { size: 24, weight: 800, color: o.bad ? C.redDeep : 'rgba(32,32,39,.5)', align: 'left', letter: 2 });
    const val = o.value || '';
    text(ctx, val || o.placeholder || '', -w / 2 + 28, h / 2 - 42, { size: o.size || 42, weight: 800, color: val ? C.ink : 'rgba(32,32,39,.3)', align: 'left', maxW: w - 56 });
    if (o.caret) {
      ctx.font = `800 ${o.size || 42}px "Liberation Sans",Arial`;
      const tw = ctx.measureText(val).width;
      line(ctx, -w / 2 + 34 + tw, h / 2 - 62, -w / 2 + 34 + tw, h / 2 - 22, C.ink, 4);
    }
    if (o.required) text(ctx, 'REQUIRED', w / 2 - 28, -h / 2 + 34, { size: 21, weight: 800, color: C.red, align: 'right', letter: 2 });
  });
}
/** an instruction with a box you must tick */
function checkRow(ctx, x, y, w, label, o = {}) {
  const k = clamp(o.k ?? 1); if (k <= .002) return;
  S(ctx, () => {
    ctx.translate(x, y); ctx.globalAlpha = clamp(k * 1.4);
    rr(ctx, -w / 2, -48, w, 96, 18, o.bad ? C.redSoft : C.cream, o.bad ? C.red : 'rgba(32,32,39,.2)', o.bad ? 5 : 4);
    rr(ctx, -w / 2 + 26, -26, 52, 52, 12, C.white, C.ink, 5);
    if (o.checked > 0) S(ctx, () => {
      ctx.strokeStyle = C.mint; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const kk = clamp(o.checked), bx = -w / 2 + 26;
      ctx.beginPath(); ctx.moveTo(bx + 12, 2);
      ctx.lineTo(lerp(bx + 12, bx + 22, Math.min(1, kk * 2.2)), lerp(2, 14, Math.min(1, kk * 2.2)));
      if (kk > .45) ctx.lineTo(lerp(bx + 22, bx + 40, (kk - .45) / .55), lerp(14, -14, (kk - .45) / .55));
      ctx.stroke();
    });
    text(ctx, label, -w / 2 + 104, 2, { size: o.size || 34, weight: 800, color: C.ink, align: 'left', maxW: w - 140 });
  });
}
/** deterministic celebration */
function confetti(ctx, cx, cy, k, n = 46) {
  if (k <= 0) return;
  S(ctx, () => {
    for (let i = 0; i < n; i++) {
      const a = hash(i * 3.7) * TAU, sp = 220 + hash(i * 5.1) * 460;
      const t = k * (0.6 + hash(i * 2.3) * .6);
      const x = cx + Math.cos(a) * sp * t, y = cy + Math.sin(a) * sp * t + 620 * t * t;
      ctx.globalAlpha = clamp(1 - t * 1.1);
      S(ctx, () => {
        ctx.translate(x, y); ctx.rotate(a + t * 7);
        const col = [C.mint, C.cheese, C.ink, C.mintMid][i % 4];
        rr(ctx, -9, -5, 18, 10, 3, col);
      });
    }
  });
}

export default function act3() {
  // ---- 1. Match-cut: the badge's mint becomes the counter's mint. 2.4s
  shot('a3-counter', 3.8, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 60, y: -470, z: 1.040 }, { t: 3.8, x: 100, y: -470, z: 1.085, e: E.linear }], lt, () => {
      counterRoom(ctx, { t: lt });
      drawHelper(ctx, { x: HX, y: 0, s: 1.3, t: lt, face: 'happy', badge: 1, look: -.3 });
      drawTabbi(ctx, { ...pose('walking', lt * 2.2), x: lerp(TX - 400, TX, E.io2(p01(lt, .2, 2.2))), y: 0, s: 1.3, flip: 1, badge: (c, bx, by) => { S(c, () => { c.globalAlpha = .9; badge(c, bx, by + 6, 'ASSISTANT', { size: 15, kind: 'gray' }); }); } });
    });
    finish(ctx, { vig: .2 });
  }, { tr: { type: 'matchScale', d: .45, x: W * .52, y: H * .46, outZ: 2.6 }, sfx: [{ t: .1, n: 'roomHum', d: 3.6 }, { t: .4, n: 'footStep' }, { t: .85, n: 'footStep' }, { t: 1.3, n: 'footStep' }, { t: 1.75, n: 'footStep' }] });

  // ---- 2. Address. Then address again. 3.4s
  shot('a3-addr', 3.4, (ctx, lt) => {
    const v1 = 'TAB 3'.slice(0, Math.floor(p01(lt, .25, .95) * 5));
    const v2 = 'TAB 3'.slice(0, Math.floor(p01(lt, 1.95, 2.7) * 5));
    withCam(ctx, [{ t: 0, x: -180, y: -350, z: 1.235 }, { t: 1.7, x: -150, y: -350, z: 1.274 }, { t: 3.4, x: -142, y: -350, z: 1.300, e: E.linear }], lt, () => {
      counterRoom(ctx, { t: lt });
      formCard(ctx, 120, -660, 1000, { label: 'DELIVERY ADDRESS', value: v1, caret: lt < 1.6 && Math.floor(lt * 4) % 2, k: p01(lt, .05, .3) });
      formCard(ctx, 120, -470, 1000, { label: 'APARTMENT / FLOOR / UNIT', value: v2, caret: lt > 1.8 && Math.floor(lt * 4) % 2, k: p01(lt, 1.7, 1.95) });
      drawTabbi(ctx, { ...pose('typing', lt * 8), x: TX, y: 0, s: 1.45, flip: 1 });
      drawHelper(ctx, { x: HX + 560, y: 0, s: 1.25, t: lt, face: 'happy', badge: 1, look: -.4 });
    });
    finish(ctx, { vig: .2 });
  }, {
    tr: { type: 'cut' },
    sfx: [0, 1, 2, 3, 4].map(i => ({ t: .3 + i * .14, n: 'typeKey' }))
      .concat([{ t: 1.72, n: 'uiPop' }])
      .concat([0, 1, 2, 3, 4].map(i => ({ t: 2.0 + i * .14, n: 'typeKey' }))),
  });

  // ---- 3. "Landmark near you." 2.6s — there is nothing near him
  shot('a3-landmark', 2.6, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: TX + 180, y: -350, z: 1.625 }, { t: .9, x: TX + 300, y: -350, z: 1.118, e: E.io3 }, { t: 2.6, x: TX + 308, y: -350, z: 1.105, e: E.linear }], lt, () => {
      counterRoom(ctx, { t: lt });
      formCard(ctx, TX + 640, -560, 900, {
        label: 'NEAREST LANDMARK', required: true,
        value: lt > 1.75 ? 'NOTHING'.slice(0, Math.floor(p01(lt, 1.75, 2.35) * 7)) : '',
        placeholder: 'e.g. the big tree', caret: lt > 1.7 && Math.floor(lt * 4) % 2, k: p01(lt, .05, .3),
      });
      const look = lt > .6 && lt < 1.7 ? sinw(p01(lt, .6, 1.7)) : 0;
      drawTabbi(ctx, {
        ...pose(lt > 1.7 ? 'typing' : 'suspicious', lt * 8), x: TX, y: 0, s: 1.45, flip: 1,
        eye: { open: .95, wide: 1, look: [look, -.2], shape: 'normal', shine: .9 },
      });
    });
    finish(ctx, { vig: .2 });
  }, {
    tr: { type: 'cut' },
    sfx: [{ t: .06, n: 'uiPop' }, { t: .7, n: 'lookSwish' }, { t: 1.2, n: 'lookSwish' }]
      .concat([0, 1, 2, 3, 4, 5, 6].map(i => ({ t: 1.8 + i * .09, n: 'typeKey' }))),
  });

  // ---- 4. Two instructions. Both required. They disagree. 3.6s
  shot('a3-contra', 3.6, (ctx, lt, gt, sh) => {
    const bad = lt > 1.5 && lt < 2.45;
    withCam(ctx, [{ t: 0, x: 60, y: -350, z: 1.196 }, { t: 1.5, x: 66, y: -350, z: 1.222 }, { t: 1.6, x: 66, y: -350, z: 1.287, e: E.out4 }, { t: 3.6, x: 70, y: -350, z: 1.313, e: E.linear }], lt, () => {
      counterRoom(ctx, { t: lt });
      text(ctx, 'DELIVERY PREFERENCES', 60, -840, { size: 30, weight: 800, color: 'rgba(32,32,39,.45)', letter: 5 });
      checkRow(ctx, 60, -730, 1120, 'DO NOT RING THE BELL', { k: p01(lt, .1, .35), checked: p01(lt, 2.5, 2.8), bad });
      checkRow(ctx, 60, -600, 1120, 'RING THE BELL TWICE', { k: p01(lt, .45, .7), checked: p01(lt, 2.85, 3.15), bad });
      if (bad) S(ctx, () => {
        ctx.globalAlpha = clamp(p01(lt, 1.5, 1.7));
        text(ctx, 'BOTH REQUIRED', 60, -480, { size: 34, weight: 800, color: C.white, back: C.red, backPadX: 24, backPadY: 14, backR: 12, letter: 3 });
      });
      drawTabbi(ctx, { ...pose(bad ? 'suspicious' : 'typing', lt * 6), x: TX - 120, y: 0, s: 1.45, flip: 1 });
    });
    finish(ctx, { vig: .2 });
  }, {
    tr: { type: 'cut' },
    sfx: [{ t: .12, n: 'uiPop' }, { t: .48, n: 'uiPop' }, { t: 1.52, n: 'errorSoft' }, { t: 2.52, n: 'tick' }, { t: 2.88, n: 'tick' }],
  });

  // ---- 5. The shortcut. It will be honoured to the letter. 3.4s
  shot('a3-instr', 3.4, (ctx, lt, gt, sh) => {
    const txt = 'JUST FOLLOW THE CURSOR';
    const v = txt.slice(0, Math.floor(p01(lt, .35, 1.75) * txt.length));
    withCam(ctx, [{ t: 0, x: 40, y: -350, z: 1.300 }, { t: 2.0, x: 60, y: -350, z: 1.209, e: E.io3 }, { t: 3.4, x: 66, y: -350, z: 1.222, e: E.linear }], lt, () => {
      counterRoom(ctx, { t: lt });
      formCard(ctx, 60, -600, 1240, { label: 'DELIVERY INSTRUCTIONS (OPTIONAL)', value: v, caret: lt < 1.9 && Math.floor(lt * 6) % 2, k: p01(lt, .02, .25), size: 44 });
      drawTabbi(ctx, { ...pose(lt > 2.1 ? 'smug' : 'typing', lt * 9), x: TX - 120, y: 0, s: 1.45, flip: 1 });
      drawHelper(ctx, { x: HX + 620, y: 0, s: 1.25, t: lt, face: 'happy', badge: 1, look: -.5, talk: talk(sh, lt, 'helper') });
    });
    say(ctx, sh, lt, 0, W * .74, H * .30, { size: 38, tail: [.3, 1], maxW: 460 });
    finish(ctx, { vig: .2 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: 2.15, d: 1.2, who: 'helper', text: 'That is very efficient.' }],
    sfx: Array.from({ length: 14 }, (_, i) => ({ t: .4 + i * .1, n: 'typeKey' })).concat([{ t: 2.12, n: 'helperChime', g: .6 }]),
  });

  // ---- 6. The optional extra. 3.6s
  shot('a3-extra', 3.6, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 120, y: -350, z: 1.235 }, { t: 2.3, x: 120, y: -350, z: 1.313 }, { t: 3.6, x: 124, y: -350, z: 1.339, e: E.linear }], lt, () => {
      counterRoom(ctx, { t: lt });
      S(ctx, () => {
        ctx.globalAlpha = clamp(p01(lt, .1, .4) * 1.3);
        rr(ctx, -560, -780, 1360, 300, 24, C.cream, C.ink, 5);
        text(ctx, 'RECOMMENDED FOR YOU', -520, -730, { size: 24, weight: 800, color: 'rgba(32,32,39,.45)', align: 'left', letter: 3 });
        text(ctx, 'A SECOND, DECORATIVE PIZZA', -520, -668, { size: 46, weight: 800, color: C.ink, align: 'left' });
        text(ctx, 'NOT EDIBLE', -520, -610, { size: 28, weight: 800, color: C.redDeep, align: 'left', letter: 2 });
        chip(ctx, 640, -668, 'FREE', { size: 34, bg: C.mint, color: C.white, letter: 3 });
        const un = p01(lt, 2.5, 2.8);
        rr(ctx, 560, -560, 56, 56, 12, un > .5 ? C.white : C.mint, C.ink, 5);
        if (un < .5) S(ctx, () => { ctx.strokeStyle = C.white; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(574, -534); ctx.lineTo(585, -522); ctx.lineTo(604, -548); ctx.stroke(); });
      });
      if (lt > 2.35 && lt < 2.85) pointer(ctx, 596, -520, { s: 2.0, grab: lt * 6 });
      drawTabbi(ctx, { ...pose(lt > 2.5 ? 'smug' : 'stare', lt), x: TX - 60, y: 0, s: 1.45, flip: 1, eye: { open: lt > 1.0 && lt < 2.4 ? .45 : .9, wide: 1, look: [.4, -.2], shape: lt > 1.0 && lt < 2.4 ? 'narrow' : 'normal', shine: .9 }, mouth: { shape: 'flat', open: 0, w: 1.1 } });
    });
    finish(ctx, { vig: .2 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .12, n: 'uiPop' }, { t: 2.52, n: 'tick' }] });

  // ---- 7. The olive. Pre-ticked. Nobody reads it. 2.0s
  shot('a3-olive', 2.4, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 250, y: -520, z: 2.106 }, { t: 2.4, x: 258, y: -520, z: 2.184, e: E.linear }], lt, () => {
      counterRoom(ctx, { t: lt });
      S(ctx, () => {
        rr(ctx, -180, -610, 940, 180, 22, C.cream, C.ink, 5);
        rr(ctx, -140, -550, 58, 58, 13, C.mint, C.ink, 5);
        S(ctx, () => { ctx.strokeStyle = C.white; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-126, -522); ctx.lineTo(-114, -510); ctx.lineTo(-94, -536); ctx.stroke(); });
        text(ctx, 'INCLUDES ONE (1) FREE OLIVE', -58, -520, { size: 38, weight: 800, color: C.ink, align: 'left' });
        olive(ctx, 672, -520, 34, { rot: .3 });
      });
    });
    finish(ctx, { vig: .22 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .05, n: 'chimeSoft', g: .5 }] });

  // ---- 8. Payment. 4.0s
  shot('a3-pay', 4.0, (ctx, lt) => {
    const drop = p01(lt, .3, .95);
    const think = lt > 1.1 && lt < 2.7;
    const done = lt >= 2.7;
    withCam(ctx, [{ t: 0, x: 1320, y: -360, z: 2.210 }, { t: 1.1, x: 1330, y: -350, z: 2.795, e: E.io3 }, { t: 2.65, x: 1330, y: -350, z: 2.860 }, { t: 2.8, x: 1220, y: -470, z: 1.586, e: E.out4 }, { t: 4.0, x: 1216, y: -472, z: 1.560, e: E.linear }], lt, () => {
      counterRoom(ctx, {
        t: lt, termText: done ? 'PAID' : think ? '' : '€7.40', termColor: done ? C.mint : C.mint,
      });
      if (think) spinner(ctx, 1320, -388, 26, lt, C.mint, 7, 1.6);
      if (drop < 1) S(ctx, () => { coin(ctx, 1320, lerp(-660, -470, E.in2(drop)), 40, { spin: lt * 9 }); });
      if (done) S(ctx, () => {
        const k = E.outBack(p01(lt, 2.7, 3.05));
        ctx.globalAlpha = clamp(k * 1.4);
        ctx.translate(1220, -760); ctx.scale(k, k);
        rr(ctx, -430, -86, 860, 172, 28, C.mint, C.ink, 6);
        text(ctx, 'ORDER CONFIRMED', 0, 2, { size: 56, weight: 800, color: C.white, letter: 3 });
      });
    });
    finish(ctx, { vig: .2 });
  }, {
    tr: { type: 'cut' },
    sfx: [{ t: .3, n: 'coinDrop' }, { t: .96, n: 'clack' }, { t: 1.15, n: 'spinLoop', d: 1.5 }, { t: 2.7, n: 'successBig' }],
  });

  // ---- 9. One sincere, unqualified victory. 3.6s
  shot('a3-win', 3.6, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: -180, y: -350, z: 1.235 }, { t: 3.6, x: -160, y: -350, z: 1.287, e: E.linear }], lt, () => {
      counterRoom(ctx, { t: lt });
      drawTabbi(ctx, { ...pose('celebrating', lt * 2.4), x: TX, y: 0, s: 1.5, flip: 1, mouth: { shape: 'bigSmile', open: .6, w: 1.05, talk: talk(sh, lt, 'tabbi') } });
      drawHelper(ctx, { x: HX, y: 0, s: 1.3, t: lt, face: 'happy', badge: 1, look: -.5, armL: 30 + sinw(lt * 3) * 26, armR: 30 - sinw(lt * 3) * 26 });
      confetti(ctx, TX, -520, p01(lt, .05, 2.6));
    });
    say(ctx, sh, lt, 0, W * .30, H * .18, { size: 52, tail: [-.2, 1] });
    finish(ctx, { vig: .16 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .25, d: 1.1, who: 'tabbi', text: 'PIZZA!' }],
    sfx: [{ t: .05, n: 'confetti' }, { t: .22, n: 'tabbiCheer' }, { t: 1.3, n: 'clapSoft' }, { t: 1.6, n: 'clapSoft' }, { t: 1.9, n: 'clapSoft' }],
  });

  // ---- 10. The receipt prints, and keeps printing. 4.0s
  shot('a3-receipt', 4.0, (ctx, lt) => {
    const k = p01(lt, .2, 3.0);
    withCam(ctx, [{ t: 0, x: 1180, y: -440, z: 1.495 }, { t: 3.0, x: 1180, y: -130, z: 1.365, e: E.io2 }, { t: 4.0, x: 1180, y: -110, z: 1.352, e: E.linear }], lt, () => {
      counterRoom(ctx, { t: lt, termText: 'PAID' });
      receipt(ctx, 1180, -420, 520, [
        { l: 'MARGHERITA', r: '7.40' },
        { l: 'FREE OLIVE', r: '0.00' },
        { l: 'TOTAL', r: '7.40', hi: 1 },
        { l: '' },
        { l: 'ADDRESS', r: 'TAB 3' },
        { l: 'NOTES', r: 'FOLLOW CURSOR' },
        { l: '' },
        { l: 'DELIVER TO', r: 'VERIFIED HUMAN', hi: 1 },
      ], { k });
      S(ctx, () => { ctx.globalAlpha = .9; drawTabbi(ctx, { ...pose('celebrating', lt * 2.2), x: 620, y: 0, s: 1.1, flip: 1 }); });
    });
    finish(ctx, { vig: .2 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .2, n: 'printer', d: 2.8 }] });

  // ---- 11. The line he does not read. 4.4s — hold on it
  shot('a3-irony', 5.6, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 1000, y: -220, z: 1.235 }, { t: 1.6, x: 1180, y: -110, z: 2.730, e: E.io3 }, { t: 5.6, x: 1184, y: -110, z: 2.860, e: E.linear }], lt, () => {
      counterRoom(ctx, { t: lt, termText: 'PAID' });
      receipt(ctx, 1180, -420, 520, [
        { l: 'MARGHERITA', r: '7.40' }, { l: 'FREE OLIVE', r: '0.00' },
        { l: 'TOTAL', r: '7.40', hi: 1 }, { l: '' },
        { l: 'ADDRESS', r: 'TAB 3' }, { l: 'NOTES', r: 'FOLLOW CURSOR' }, { l: '' },
        { l: 'DELIVER TO', r: 'VERIFIED HUMAN', hi: 1 },
      ], { k: 1 });
      if (lt > 2.1) S(ctx, () => {
        ctx.globalAlpha = clamp(p01(lt, 2.1, 2.5)) * (.55 + sin01(lt * 1.3) * .45);
        rr(ctx, 1180 - 250, -126, 500, 46, 8, null, C.red, 4);
      });
      S(ctx, () => { ctx.globalAlpha = .5; drawTabbi(ctx, { ...pose('celebrating', lt * 2.0), x: 560, y: 0, s: 1.1, flip: 1 }); });
    });
    finish(ctx, { vig: .24 });
  }, { tr: { type: 'cut' }, sfx: [{ t: 2.15, n: 'sting' }] });
}
