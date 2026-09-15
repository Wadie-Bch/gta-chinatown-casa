// ACT 2 — THE SHORTCUT (1:00 – 1:40). He outsources being a person.
import { C, W, H } from '../core/palette.js';
import { S, rr, rrPath, circ, ell, line, poly, text, shadow, noShadow, lightPool, ring, spinner } from '../core/draw.js';
import { clamp, lerp, p01, E, ramp, pulse, sinw, sin01, shake, hash, TAU } from '../core/util.js';
import { shot, say, sys, talk, withCam, finish, wash, hit, pointer, speedLines, split, lineK } from './kit.js';
import { drawTabbi, pose, blinkAt } from '../chars/tabbi.js';
import { drawGate } from '../chars/gate.js';
import { drawHelper } from '../chars/helper.js';
import { checkpoint, robotRoom, tabHall, HALL_TABS } from '../rooms/rooms.js';
import { badge } from '../rooms/props.js';
import { chip } from '../core/ui.js';
import { grid9 } from '../rooms/captcha.js';

const GX = 980, TBX = 180;
const HELPER_DOOR = HALL_TABS[2].x;   // 900
const GATE_DOOR = HALL_TABS[1].x;     // -300

/** the verdict card the whole episode turns on */
function verdictCard(ctx, x, y, k, o = {}) {
  const kk = clamp(k);
  S(ctx, () => {
    ctx.translate(x, y); ctx.globalAlpha = clamp(kk * 1.4);
    ctx.scale(lerp(.9, 1, E.outBack(kk)), lerp(.9, 1, E.outBack(kk)));
    shadow(ctx, 40, 18, 'rgba(0,0,0,.45)');
    rr(ctx, -430, -215, 860, 430, 28, C.cream, C.ink, 6); noShadow(ctx);
    rr(ctx, -430, -215, 860, 88, [28, 28, 0, 0], C.mint);
    text(ctx, 'VERIFICATION COMPLETE', 0, -171, { size: 30, weight: 800, color: C.white, letter: 4 });
    S(ctx, () => {
      rr(ctx, -388, -96, 776, 128, 18, 'rgba(24,133,103,.14)', C.mint, 5);
      text(ctx, 'VERIFIED HUMAN', -356, -60, { size: 25, weight: 800, color: C.mintDeep, align: 'left', letter: 3 });
      text(ctx, o.human || 'HELPER', -356, -6, { size: 56, weight: 800, color: C.ink, align: 'left' });
      circ(ctx, 320, -32, 34, C.mint);
      ctx.strokeStyle = C.white; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(306, -32); ctx.lineTo(316, -21); ctx.lineTo(336, -45); ctx.stroke();
    });
    S(ctx, () => {
      ctx.globalAlpha = clamp((kk - .45) / .4) * clamp(kk * 1.4);
      rr(ctx, -388, 54, 776, 120, 18, 'rgba(32,32,39,.06)', 'rgba(32,32,39,.2)', 4);
      text(ctx, 'ASSISTANT', -356, 90, { size: 25, weight: 800, color: 'rgba(32,32,39,.45)', align: 'left', letter: 3 });
      text(ctx, o.bot || 'TABBI', -356, 138, { size: 50, weight: 800, color: 'rgba(32,32,39,.62)', align: 'left' });
    });
  });
}

export default function act2() {
  // ---- 1. An idea, which is the dangerous part. 2.4s
  shot('a2-idea', 2.4, (ctx, lt) => {
    const idea = p01(lt, .75, 1.15);
    withCam(ctx, [{ t: 0, x: TBX + 40, y: -320, z: 2.0 }, { t: .75, x: TBX + 40, y: -320, z: 2.05 }, { t: 1.1, x: TBX + 30, y: -330, z: 2.35, e: E.out4 }, { t: 2.4, x: TBX + 28, y: -330, z: 2.4, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt });
      drawTabbi(ctx, {
        ...pose(idea > .5 ? 'hopeful' : 'defeated', lt), x: TBX, y: 0, s: 1.35, flip: 1,
        eye: idea > .5 ? { open: 1.15, wide: 1.1, look: [.15, -.15], shape: 'sparkle', shine: 1 } : { open: .34, wide: .95, look: [.4, .2], shape: 'dead', shine: .25 },
      });
      if (idea > .5) S(ctx, () => {
        const k = p01(lt, 1.1, 1.5);
        ctx.globalAlpha = (1 - k) * .9;
        for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; line(ctx, TBX + Math.cos(a) * (150 + k * 60), -330 + Math.sin(a) * (150 + k * 60), TBX + Math.cos(a) * (200 + k * 90), -330 + Math.sin(a) * (200 + k * 90), C.mint, 9); }
      });
    });
    finish(ctx, { vig: .34 });
  }, { tr: { type: 'cut' }, sfx: [{ t: 1.08, n: 'idea' }] });

  // ---- 2. Tracking shot: through the tabs. 3.6s
  shot('a2-run', 3.6, (ctx, lt) => {
    const x = lerp(GATE_DOOR - 260, HELPER_DOOR - 30, E.io2(p01(lt, .1, 3.3)));
    withCam(ctx, [{ t: 0, x: GATE_DOOR - 100, y: -640, z: .80 }, { t: .1, x: GATE_DOOR - 100, y: -640, z: .80 },
                  { t: 3.3, x: HELPER_DOOR + 130, y: -640, z: .80, e: E.io2 }, { t: 3.6, x: HELPER_DOOR + 160, y: -640, z: .82, e: E.linear }], lt, () => {
      tabHall(ctx, { t: lt, active: 2, poolX: HELPER_DOOR });
      speedLines(ctx, x - 130, -220, 5, 210, .22, 3);
      drawTabbi(ctx, { ...pose('running', lt * 7.5), x, y: 0, s: 1.35, flip: 1 });
    });
    finish(ctx, { vig: .2 });
  }, {
    tr: { type: 'whip', d: .26, dir: 1 },
    sfx: [{ t: .05, n: 'whoosh' }].concat(Array.from({ length: 12 }, (_, i) => ({ t: .2 + i * .26, n: 'footRunStep', g: .55 }))),
  });

  // ---- 3. He arrives somewhere calm. 2.6s
  shot('a2-arrive', 2.6, (ctx, lt) => {
    const x = lerp(HELPER_DOOR - 30, HELPER_DOOR + 40, E.out4(p01(lt, 0, .5)));
    withCam(ctx, [{ t: 0, x: HELPER_DOOR + 90, y: -640, z: .86 }, { t: .5, x: HELPER_DOOR + 60, y: -600, z: .96, e: E.out3 }, { t: 2.6, x: HELPER_DOOR + 55, y: -596, z: .99, e: E.linear }], lt, () => {
      tabHall(ctx, { t: lt, active: 2, poolX: HELPER_DOOR });
      if (lt < .5) S(ctx, () => { ctx.globalAlpha = .35; for (let i = 0; i < 5; i++) ell(ctx, x - 60 - i * 40, -10, 40, 12, 0, C.ink); });
      drawTabbi(ctx, {
        ...pose(lt < .45 ? 'running' : 'hopeful', lt * 7), x, y: 0, s: 1.35, flip: 1,
        ...(lt < .45 ? { lean: -22, legL: { a: -34, b: 20 }, legR: { a: 12, b: 8 } } : {}),
      });
    });
    finish(ctx, { vig: .2 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .02, n: 'skid' }, { t: .52, n: 'chimeSoft' }] });

  // ---- 4. HELPER. Introduced by being helpful. 3.2s
  shot('a2-helper', 3.2, (ctx, lt, gt, sh) => {
    const wake = p01(lt, .3, .9);
    withCam(ctx, [{ t: 0, x: 300, y: -560, z: .92 }, { t: .8, x: 320, y: -540, z: 1.0, e: E.io3 }, { t: 3.2, x: 324, y: -538, z: 1.03, e: E.linear }], lt, () => {
      robotRoom(ctx, { t: lt });
      drawHelper(ctx, { x: 300, y: -20, s: 1.15, t: lt, face: wake > .5 ? 'happy' : 'off', talk: talk(sh, lt, 'helper'), hoverA: wake, armR: 20 + wake * 26, look: -.4 });
      drawTabbi(ctx, { ...pose('hopeful', lt * .9), x: -420, y: 0, s: 1.3, flip: 1 });
      if (wake > 0 && wake < 1) S(ctx, () => { ctx.globalAlpha = (1 - wake); circ(ctx, 300, -180, 60 + wake * 260, null, C.mint, 8); });
    });
    say(ctx, sh, lt, 0, W * .70, H * .24, { size: 44, tail: [-.3, 1], maxW: 540 });
    finish(ctx, { vig: .18 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: 1.05, d: 1.8, who: 'helper', text: 'Hello! How may I assist?' }],
    sfx: [{ t: .32, n: 'powerUp' }, { t: 1.0, n: 'helperChime' }],
  });

  // ---- 5. "I got this." 2.6s
  shot('a2-igot', 2.6, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: -400, y: -300, z: 2.05 }, { t: 2.6, x: -396, y: -300, z: 2.1, e: E.linear }], lt, () => {
      robotRoom(ctx, { t: lt });
      drawTabbi(ctx, {
        ...pose('smug', lt * .7), x: -420, y: 0, s: 1.3, flip: 1,
        mouth: { shape: 'smirk', open: 0, w: 1, talk: talk(sh, lt, 'tabbi') },
        armR: { a: 128, b: -30, l1: 30, l2: 25 },
      });
    });
    say(ctx, sh, lt, 0, W * .66, H * .26, { size: 58, tail: [-.55, 1] });
    finish(ctx, { vig: .2 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .45, d: 1.4, who: 'tabbi', text: 'I got this.' }],
    sfx: [{ t: .4, n: 'tabbiSmug' }],
  });

  // ---- 6. Consent was not requested. 2.8s
  shot('a2-drag', 2.8, (ctx, lt, gt, sh) => {
    const k = E.io2(p01(lt, .3, 2.5));
    const x = lerp(240, -1150, k);
    withCam(ctx, [{ t: 0, x: 120, y: -500, z: .88 }, { t: 2.8, x: -820, y: -500, z: .88, e: E.io2 }], lt, () => {
      robotRoom(ctx, { t: lt });
      drawHelper(ctx, { x, y: -20, s: 1.15, t: lt, face: 'happy', talk: talk(sh, lt, 'helper'), tilt: -12 * clamp(k * 3), armL: -60, armR: 84, look: .3 });
      drawTabbi(ctx, { ...pose('running', lt * 6), x: x - 250, y: 0, s: 1.3, flip: -1, lean: -16, armL: { a: 120, b: 20, l1: 30, l2: 26 }, armR: { a: 118, b: 22, l1: 30, l2: 26 } });
      S(ctx, () => { ctx.globalAlpha = .55; for (let i = 0; i < 4; i++) ell(ctx, x + 120 + i * 60, -10, 44, 10, 0, C.ink); });
    });
    say(ctx, sh, lt, 0, W * .60, H * .22, { size: 40, tail: [-.4, 1], maxW: 560 });
    finish(ctx, { vig: .2 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .75, d: 1.7, who: 'helper', text: 'Where are we going? Lovely.' }],
    sfx: [{ t: .3, n: 'dragSlide', d: 2.2 }],
  });

  // ---- 7. Exhibit A, presented. 2.6s
  shot('a2-present', 2.6, (ctx, lt) => {
    const push = E.outBack(p01(lt, .1, .7));
    withCam(ctx, [{ t: 0, x: 520, y: -430, z: .92 }, { t: 2.6, x: 540, y: -428, z: .95, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt });
      drawGate(ctx, { x: GX, y: 0, s: 1.05, flip: -1, mood: 'neutral', look: -.4 });
      drawHelper(ctx, { x: lerp(180, 520, push), y: -20, s: 1.1, t: lt, face: 'happy', look: .5 });
      drawTabbi(ctx, { ...pose('point', 0), x: lerp(0, 210, push), y: 0, s: 1.3, flip: 1, armR: { a: 92, b: -6, l1: 33, l2: 30 } });
    });
    finish(ctx, { vig: .34 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .12, n: 'dragSlide', d: .6 }, { t: .72, n: 'thudSoft' }] });

  // ---- 8. The same question, asked of someone else. 2.2s
  shot('a2-challenge', 2.2, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: GX - 120, y: -300, z: 1.7 }, { t: 2.2, x: GX - 116, y: -300, z: 1.74, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt });
      drawGate(ctx, { x: GX, y: 0, s: 1.05, flip: -1, mood: 'neutral', look: -.45, talk: talk(sh, lt, 'gate'), armR: 42 });
    });
    say(ctx, sh, lt, 0, W * .30, H * .24, { size: 44, maxW: 520, tail: [.7, 1] });
    finish(ctx, { vig: .34 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .18, d: 1.7, who: 'gate', text: 'Select all images with traffic lights.' }],
    sfx: [{ t: .1, n: 'gateBeep' }],
  });

  // ---- 9. Helper announces the hesitation. 3.0s — the hold is the joke
  shot('a2-hesitate', 3.0, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 540, y: -330, z: 1.35 }, { t: 3.0, x: 546, y: -330, z: 1.38, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt });
      drawHelper(ctx, { x: 520, y: -20, s: 1.1, t: lt, face: lt > 1.5 ? 'thinking' : 'happy', talk: talk(sh, lt, 'helper'), look: .4 });
      drawTabbi(ctx, { ...pose('suspicious', 0), x: 130, y: 0, s: 1.25, flip: 1 });
      if (lt > 1.6) S(ctx, () => {
        ctx.globalAlpha = clamp(p01(lt, 1.6, 1.9));
        for (let i = 0; i < 3; i++) circ(ctx, 480 + i * 42, -430, 11, i / 3 < ((lt - 1.6) % 1.2) / 1.2 ? C.mint : 'rgba(245,245,247,.25)');
      });
    });
    say(ctx, sh, lt, 0, W * .74, H * .22, { size: 42, tail: [-.3, 1], maxW: 480 });
    finish(ctx, { vig: .34 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .15, d: 1.4, who: 'helper', text: 'I will now hesitate.' }],
    sfx: [{ t: 1.7, n: 'thinkBlip' }, { t: 2.1, n: 'thinkBlip' }, { t: 2.5, n: 'thinkBlip' }],
  });

  // ---- 10. And then he is perfect. 2.4s
  shot('a2-solve', 2.4, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 600, y: -560, z: 1.02 }, { t: 2.4, x: 604, y: -562, z: 1.05, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt });
      grid9(ctx, 600, -580, 158, {
        sel: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        selK: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => p01(lt, .25 + i * .05, .38 + i * .05)),
        verdict: lt > .95 ? 'ok' : null, verdictK: p01(lt, .95, 1.15),
      });
      drawHelper(ctx, { x: 1180, y: -20, s: 1.0, t: lt, face: 'proud', armL: -50 });
    });
    finish(ctx, { vig: .34 });
  }, {
    tr: { type: 'cut' },
    sfx: Array.from({ length: 9 }, (_, i) => ({ t: .27 + i * .05, n: 'tick', g: .7 })).concat([{ t: .96, n: 'successSoft' }]),
  });

  // ---- 11. The system decides who is a person. 3.2s
  shot('a2-verdict', 3.2, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 560, y: -560, z: 1.34 }, { t: 3.2, x: 560, y: -566, z: 1.38, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt });
      verdictCard(ctx, 560, -560, p01(lt, .1, 1.5));
    });
    finish(ctx, { vig: .34 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .1, n: 'uiSlam' }, { t: .95, n: 'stampSoft' }, { t: 1.55, n: 'errorSoft', g: .6 }] });

  // ---- 12. Split screen: the face and the paperwork. 2.8s
  shot('a2-split', 2.8, (ctx, lt) => {
    const k = p01(lt, 0, .35);
    split(ctx,
      c => {
        withCam(c, [{ t: 0, x: TBX + 10, y: -330, z: 2.1 }], lt, () => {
          checkpoint(c, { t: lt });
          drawTabbi(c, {
            ...pose('stare', 0), x: TBX, y: 0, s: 1.35, flip: 1,
            eye: { open: lerp(1, 1.2, p01(lt, .4, 1.2)), wide: lerp(1, 1.06, p01(lt, .4, 1.2)), look: [.15, 0], shape: 'normal', shine: 1 },
            brow: { l: lerp(0, -18, p01(lt, .6, 1.6)), r: lerp(0, -18, p01(lt, .6, 1.6)), y: -4, show: 1 },
            mouth: { shape: lt > 1.5 ? 'flat' : 'line', open: 0, w: lerp(1, 1.2, p01(lt, 1.4, 2.0)) },
          });
        });
      },
      c => {
        withCam(c, [{ t: 0, x: 560, y: -560, z: .92 }], lt, () => {
          checkpoint(c, { t: lt });
          verdictCard(c, 560, -560, 1);
        });
      }, k);
    finish(ctx, { vig: .3 });
  }, { tr: { type: 'cut' }, sfx: [{ t: 0, n: 'splitSwish' }] });

  // ---- 13. He objects, correctly, and it does not matter. 3.0s
  shot('a2-object', 3.0, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 520, y: -400, z: 1.0 }, { t: 1.5, x: 640, y: -380, z: 1.12, e: E.io3 }, { t: 3.0, x: 646, y: -380, z: 1.14, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt });
      drawGate(ctx, { x: GX, y: 0, s: 1.05, flip: -1, mood: 'neutral', look: -.4, talk: talk(sh, lt, 'gate') });
      drawHelper(ctx, { x: 560, y: -20, s: 1.05, t: lt, face: 'happy', badge: p01(lt, 2.2, 2.8) });
      drawTabbi(ctx, { ...pose('angry', lt * 4), x: 120, y: 0, s: 1.3, flip: 1, mouth: { shape: 'shout', open: .8, w: 1, talk: talk(sh, lt, 'tabbi') } });
    });
    say(ctx, sh, lt, 0, W * .22, H * .24, { size: 46, tail: [.1, 1] });
    say(ctx, sh, lt, 1, W * .70, H * .18, { size: 44, tail: [.3, 1], maxW: 560 });
    finish(ctx, { vig: .34 });
  }, {
    tr: { type: 'cut' },
    say: [
      { t: .15, d: 1.2, who: 'tabbi', text: "I'm the human!" },
      { t: 1.55, d: 1.7, who: 'gate', text: 'The human hesitated.' },
    ],
    sfx: [{ t: .12, n: 'tabbiShout' }, { t: 1.5, n: 'gateBeep' }],
  });

  // ---- 14. He looks at the pizza and folds. 2.6s
  shot('a2-accept', 2.6, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 400, y: -380, z: 1.08 }, { t: 1.1, x: 250, y: -400, z: 1.3, e: E.io3 }, { t: 2.6, x: 246, y: -400, z: 1.32, e: E.linear }], lt, () => {
      checkpoint(ctx, { t: lt });
      drawHelper(ctx, { x: 620, y: -20, s: 1.05, t: lt, face: 'proud', talk: talk(sh, lt, 'helper'), badge: 1 });
      drawTabbi(ctx, {
        ...pose(lt > 1.6 ? 'defeated' : 'stare', 0), x: 120, y: 0, s: 1.3, flip: 1,
        eye: { open: lerp(1, .5, p01(lt, 1.3, 1.9)), wide: 1, look: [lerp(.2, -.6, p01(lt, .6, 1.2)), .1], shape: lt > 1.7 ? 'narrow' : 'normal', shine: .9 },
        mouth: { shape: lt > 1.7 ? 'flat' : 'wavy', open: 0, w: 1, talk: talk(sh, lt, 'tabbi') },
      });
      // the pizza, glowing through the doorway he came in by
      S(ctx, () => {
        ctx.globalAlpha = .9;
        rr(ctx, -880, -1080, 420, 1080, [60, 60, 0, 0], C.white);
        S(ctx, () => { ctx.globalAlpha = .5; lightPool(ctx, -670, -300, 520, 700, 'rgba(242,195,92,.85)', 1); });
        text(ctx, 'HOT SLICE', -670, -760, { size: 62, weight: 800, color: C.mintDeep, letter: 3 });
      });
    });
    say(ctx, sh, lt, 0, W * .72, H * .2, { size: 40, tail: [.2, 1], maxW: 520 });
    say(ctx, sh, lt, 1, W * .30, H * .68, { size: 52, tail: [-.2, -1] });
    finish(ctx, { vig: .34 });
  }, {
    tr: { type: 'cut' },
    say: [
      { t: .1, d: 1.35, who: 'helper', text: 'I am happy to be a person!' },
      { t: 1.85, d: .7, who: 'tabbi', text: '...Fine.' },
    ],
    sfx: [{ t: 1.82, n: 'sigh' }],
  });

  // ---- 15. Two badges. Remember the grey one. 1.0s
  shot('a2-badge', 1.0, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 380, y: -420, z: 1.6 }], lt, () => {
      checkpoint(ctx, { t: lt });
      badge(ctx, 620, -420, 'VERIFIED HUMAN', { size: 34, glow: .6 + sin01(lt * 2) * .4 });
      badge(ctx, 140, -420, 'ASSISTANT', { size: 34, kind: 'gray' });
    });
    finish(ctx, { vig: .3 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .02, n: 'badgeAttach' }] });
}
