// ACT 5 — THE VERIFICATION CODE (3:00 – 3:45). A helpful robot destroys it.
import { C, W, H } from '../core/palette.js';
import { S, rr, rrPath, circ, ell, line, poly, text, shadow, noShadow, lightPool, ring, spinner, cursor } from '../core/draw.js';
import { clamp, lerp, p01, E, ramp, pulse, sinw, sin01, shake, hash, TAU } from '../core/util.js';
import { shot, say, sys, talk, withCam, finish, wash, hit, pointer, speedLines, split } from './kit.js';
import { drawTabbi, pose, blinkAt } from '../chars/tabbi.js';
import { drawDash } from '../chars/dash.js';
import { drawHelper } from '../chars/helper.js';
import { doorRoom, tabHall, HALL_TABS, robotRoom } from '../rooms/rooms.js';
import { codeChip, badge } from '../rooms/props.js';
import { notification, chip } from '../core/ui.js';

const DOORX = 0, TX = -520, DASHX = 620;
const INBOX = HALL_TABS[4].x;      // 3300
const HOME = HALL_TABS[0].x - 900; // Tabbi's door, off the left end of the hall

export default function act5() {
  // ---- 1. "Code." 3.2s
  shot('a5-code', 3.2, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 220, y: -420, z: 1.02 }, { t: 3.2, x: 228, y: -424, z: 1.05, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX, note: true });
      drawDash(ctx, { x: DASHX, y: 0, s: .92, flip: -1, mood: 'done', t: lt, pant: 1, talk: talk(sh, lt, 'dash') });
      drawTabbi(ctx, { ...pose('holding', 0), x: TX, y: 0, s: 1.5, flip: 1, armL: { a: 72, b: 40, l1: 30, l2: 26 }, armR: { a: 72, b: 40, l1: 30, l2: 26 } });
      cursor(ctx, TX + 150, -215, 3.4, .16, { grab: lt * 3, t: gt, mood: 'strain' });
      if (lt > .9) S(ctx, () => {
        const k = E.outBack(p01(lt, .9, 1.35));
        ctx.globalAlpha = clamp(k * 1.4); ctx.translate(140, -760); ctx.scale(k, k);
        rr(ctx, -420, -110, 840, 220, 26, C.cream, C.ink, 6);
        text(ctx, 'DELIVERY CODE', 0, -56, { size: 26, weight: 800, color: 'rgba(32,32,39,.5)', letter: 4 });
        for (let i = 0; i < 4; i++) rr(ctx, -300 + i * 160, -14, 120, 100, 16, C.white, 'rgba(32,32,39,.3)', 4);
      });
    });
    say(ctx, sh, lt, 0, W * .72, H * .46, { size: 52, tail: [.3, 1] });
    finish(ctx, { vig: .22 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .15, d: .9, who: 'dash', text: 'Code.' }],
    sfx: [{ t: .92, n: 'uiPop' }],
  });

  // ---- 2. "What code?" 2.6s
  shot('a5-what', 2.6, (ctx, lt, gt, sh) => {
    split(ctx,
      c => withCam(c, [{ t: 0, x: TX + 20, y: -400, z: 1.7 }], lt, () => {
        doorRoom(c, { t: lt, doorX: DOORX });
        drawTabbi(c, { ...pose('suspicious', 0), x: TX, y: 0, s: 1.5, flip: 1, mouth: { shape: 'wavy', open: .2, w: .9, talk: talk(sh, lt, 'tabbi') } });
      }),
      c => withCam(c, [{ t: 0, x: DASHX - 20, y: -400, z: 1.7 }], lt, () => {
        doorRoom(c, { t: lt, doorX: DOORX + 2000 });
        drawDash(c, { x: DASHX, y: 0, s: .92, flip: -1, mood: 'done', t: lt, pant: 1, talk: talk(sh, lt, 'dash') });
      }), p01(lt, 0, .3));
    say(ctx, sh, lt, 0, W * .25, H * .18, { size: 44 });
    say(ctx, sh, lt, 1, W * .75, H * .18, { size: 44 });
    finish(ctx, { vig: .24 });
  }, {
    tr: { type: 'cut' },
    say: [
      { t: .2, d: 1.0, who: 'tabbi', text: 'What code?' },
      { t: 1.35, d: 1.0, who: 'dash', text: 'The code.' },
    ],
    sfx: [{ t: 0, n: 'splitSwish' }],
  });

  // ---- 3. It is, of course, in another tab. 3.4s
  shot('a5-notif', 3.4, (ctx, lt, gt) => {
    const k = E.outBack(p01(lt, .25, .8));
    withCam(ctx, [{ t: 0, x: 60, y: -540, z: .95 }, { t: 3.4, x: 66, y: -546, z: .97, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX, note: true });
      drawTabbi(ctx, { ...pose('holding', 0), x: TX, y: 0, s: 1.5, flip: 1, armL: { a: 72, b: 40, l1: 30, l2: 26 }, armR: { a: 72, b: 40, l1: 30, l2: 26 }, eye: { open: 1.1, wide: 1, look: [.5, -.4], shape: 'normal', shine: 1 } });
      cursor(ctx, TX + 150, -215, 3.4, .16, { grab: lt * 3, t: gt, mood: 'strain' });
      S(ctx, () => {
        ctx.globalAlpha = clamp(k * 1.3);
        ctx.translate(lerp(1400, 300, E.out4(p01(lt, .25, .8))), -960);
        notification(ctx, 0, 0, { w: 820, title: 'INBOX · 1 new message', body: 'Your delivery code is in tab 5', kind: 'neutral', k: 1 });
      });
    });
    finish(ctx, { vig: .22 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .25, n: 'notifSlide' }, { t: .3, n: 'notif1' }] });

  // ---- 4. Move the cursor, move the courier. 3.4s
  shot('a5-dilemma', 3.4, (ctx, lt, gt) => {
    withCam(ctx, [{ t: 0, x: -200, y: -400, z: 1.2 }, { t: 1.2, x: -420, y: -300, z: 1.75, e: E.io3 }, { t: 2.3, x: 340, y: -560, z: 1.2, e: E.io3 }, { t: 3.4, x: 346, y: -562, z: 1.22, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX, note: true });
      drawDash(ctx, { x: DASHX, y: 0, s: .92, flip: -1, mood: 'done', t: lt, pant: 1 });
      drawTabbi(ctx, {
        ...pose('holding', 0), x: TX, y: 0, s: 1.5, flip: 1,
        armL: { a: 72, b: 40, l1: 30, l2: 26 }, armR: { a: 72, b: 40, l1: 30, l2: 26 },
        eye: { open: 1.05, wide: 1, look: [lt < 1.6 ? -.2 : .8, lt < 1.6 ? .5 : -.3], shape: 'normal', shine: 1 },
        brow: { l: 14, r: 14, y: -4, show: 1 }, mouth: { shape: 'wavy', open: 0, w: .9 },
      });
      cursor(ctx, TX + 150, -215, 3.4, .16, { grab: lt * 3, t: gt, mood: 'strain' });
      S(ctx, () => { ctx.globalAlpha = .85; text(ctx, 'TAB 5 →', 900, -980, { size: 44, weight: 800, color: C.ink, back: C.cream, backStroke: C.ink, backLW: 4, backPadX: 22, backPadY: 14, letter: 3 }); });
    });
    finish(ctx, { vig: .22 });
  }, { tr: { type: 'cut' }, sfx: [{ t: 1.2, n: 'lookSwish' }, { t: 2.3, n: 'lookSwish' }] });

  // ---- 5. He wedges the cursor under the doormat. "I got this." 2.8s
  shot('a5-wedge', 2.8, (ctx, lt, gt, sh) => {
    const wedge = E.io3(p01(lt, .15, 1.0));
    withCam(ctx, [{ t: 0, x: TX + 60, y: -320, z: 1.5 }, { t: 2.8, x: TX + 66, y: -322, z: 1.53, e: E.linear }], lt, () => {
      doorRoom(ctx, { t: lt, doorX: DOORX, note: true });
      drawTabbi(ctx, {
        ...pose(lt > 1.35 ? 'smug' : 'holding', lt * .8), x: TX, y: 0, s: 1.5, flip: 1,
        ...(lt > 1.35 ? { armR: { a: 128, b: -30, l1: 30, l2: 25 } } : { armL: { a: 100, b: 30, l1: 30, l2: 26 }, armR: { a: 100, b: 30, l1: 30, l2: 26 } }),
        mouth: { shape: lt > 1.35 ? 'smirk' : 'line', open: 0, w: 1, talk: talk(sh, lt, 'tabbi') },
      });
      cursor(ctx, TX + 150 + wedge * 70, lerp(-215, -30, wedge), 3.4, lerp(.16, 1.5, wedge), { grab: lt * 3, t: gt, mood: wedge > .5 ? 'worried' : 'strain' });
      if (wedge > .9) S(ctx, () => { ctx.globalAlpha = .9; rr(ctx, TX + 20, -46, 320, 54, 20, C.gray, 'rgba(32,32,39,.25)', 4); text(ctx, 'WELCOME?', TX + 180, -18, { size: 26, weight: 800, color: 'rgba(32,32,39,.45)', letter: 3 }); });
    });
    say(ctx, sh, lt, 0, W * .70, H * .24, { size: 52, tail: [-.5, 1] });
    finish(ctx, { vig: .22 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: 1.45, d: 1.1, who: 'tabbi', text: 'I got this.' }],
    sfx: [{ t: .2, n: 'scrape' }, { t: 1.0, n: 'thudSoft' }, { t: 1.42, n: 'tabbiSmug' }],
  });

  // ---- 6. The run. 4.6s
  shot('a5-race', 4.6, (ctx, lt, gt) => {
    const x = lerp(HOME, INBOX - 300, E.io2(p01(lt, .05, 4.3)));
    const jump = lt > 1.9 && lt < 2.6 ? Math.sin(p01(lt, 1.9, 2.6) * Math.PI) * 300 : 0;
    withCam(ctx, [{ t: 0, x: HOME + 300, y: -640, z: .78 }, { t: .05, x: HOME + 300, y: -640, z: .78 },
                  { t: 4.3, x: INBOX, y: -640, z: .78, e: E.io2 }, { t: 4.6, x: INBOX + 40, y: -640, z: .80, e: E.linear }], lt, () => {
      tabHall(ctx, { t: lt, active: 4, poolX: INBOX });
      // a loading spinner, parked in the corridor like roadworks
      S(ctx, () => {
        spinner(ctx, 1500, -280, 190, lt, C.mint, 34, .9);
        S(ctx, () => { ctx.globalAlpha = .5; ell(ctx, 1500, 20, 200, 44, 0, C.ink); });
      });
      speedLines(ctx, x - 150, -240 - jump, 5, 240, .22, 5);
      drawTabbi(ctx, { ...pose('running', lt * 8), x, y: -jump, s: 1.4, flip: 1, rot: jump > 0 ? .12 : 0 });
    });
    finish(ctx, { vig: .2 });
  }, {
    tr: { type: 'whip', d: .24, dir: 1 },
    sfx: Array.from({ length: 16 }, (_, i) => ({ t: .15 + i * .25, n: 'footRunStep', g: .5 }))
      .concat([{ t: 1.2, n: 'spinLoop', d: 1.6 }, { t: 1.9, n: 'jump' }, { t: 2.6, n: 'landSoft' }]),
  });

  // ---- 7. A notification comes down like a shutter. 3.4s
  shot('a5-banner', 3.4, (ctx, lt, gt) => {
    const drop = E.out4(p01(lt, .35, .85));
    const slide = p01(lt, 1.2, 2.2);
    const x = lerp(INBOX - 300, INBOX - 20, E.io2(slide));
    withCam(ctx, [{ t: 0, x: INBOX - 120, y: -620, z: .9 }, { t: 3.4, x: INBOX - 60, y: -600, z: .93, e: E.linear }], lt, () => {
      tabHall(ctx, { t: lt, active: 4, poolX: INBOX });
      const slideDuck = slide > .1 && slide < .9;
      drawTabbi(ctx, {
        ...pose('running', lt * 8), x, y: 0, s: 1.4, flip: 1,
        ...(slideDuck ? { rot: -1.15, y: -60, legL: { a: -60, b: 30 }, legR: { a: -40, b: 20 }, mouth: { shape: 'gasp', open: .8, w: .9 } } : {}),
      });
      // the shutter itself
      S(ctx, () => {
        const h = 760 * drop;
        rr(ctx, INBOX - 700, -1300, 1400, h, [0, 0, 22, 22], C.cream, C.ink, 6);
        for (let i = 0; i < 7; i++) if (-1300 + 90 + i * 100 < -1300 + h) line(ctx, INBOX - 700, -1300 + 90 + i * 100, INBOX + 700, -1300 + 90 + i * 100, 'rgba(32,32,39,.12)', 5);
        if (drop > .6) {
          text(ctx, 'ALLOW NOTIFICATIONS?', INBOX, -1300 + h - 190, { size: 46, weight: 800, color: C.ink, letter: 2 });
          rr(ctx, INBOX - 300, -1300 + h - 130, 270, 86, 43, C.mint);
          text(ctx, 'ALLOW', INBOX - 165, -1300 + h - 86, { size: 32, weight: 800, color: C.white, letter: 3 });
          rr(ctx, INBOX + 30, -1300 + h - 130, 270, 86, 43, C.gray);
          text(ctx, 'LATER', INBOX + 165, -1300 + h - 86, { size: 32, weight: 800, color: 'rgba(32,32,39,.6)', letter: 3 });
        }
      });
    });
    finish(ctx, { vig: .2 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .35, n: 'shutterDrop' }, { t: .86, n: 'thud' }, { t: 1.3, n: 'slideFloor' }, { t: 2.2, n: 'landSoft' }] });

  // ---- 8. The code, and its shelf life. 3.6s
  shot('a5-inbox', 3.6, (ctx, lt, gt) => {
    withCam(ctx, [{ t: 0, x: INBOX + 40, y: -640, z: .95 }, { t: 1.0, x: INBOX, y: -760, z: 1.35, e: E.io3 }, { t: 3.6, x: INBOX + 4, y: -762, z: 1.38, e: E.linear }], lt, () => {
      tabHall(ctx, { t: lt, active: 4, poolX: INBOX });
      S(ctx, () => {
        ctx.translate(INBOX, -760);
        const k = E.outBack(p01(lt, .15, .6));
        ctx.globalAlpha = clamp(k * 1.4); ctx.scale(k, k);
        shadow(ctx, 34, 16, 'rgba(32,32,39,.22)');
        rr(ctx, -520, -250, 1040, 500, 30, C.cream, C.ink, 6); noShadow(ctx);
        text(ctx, 'ONE-TIME DELIVERY CODE', 0, -175, { size: 28, weight: 800, color: 'rgba(32,32,39,.5)', letter: 4 });
        codeChip(ctx, -60, -20, '4712', { s: .95, timer: 1 - p01(lt, .6, 26) });
        text(ctx, 'DO NOT SHARE THIS CODE', 0, 170, { size: 26, weight: 800, color: C.redDeep, letter: 2 });
      });
      drawTabbi(ctx, { ...pose('hopeful', lt), x: INBOX - 700, y: 0, s: 1.4, flip: 1 });
    });
    finish(ctx, { vig: .2 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .18, n: 'uiPop' }, { t: .62, n: 'chimeSoft' }, { t: 1.6, n: 'tickSlow' }, { t: 2.6, n: 'tickSlow' }] });

  // ---- 9. He asks for help. 3.0s
  shot('a5-shout', 3.0, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: INBOX - 560, y: -420, z: 1.2 }, { t: 3.0, x: INBOX - 554, y: -424, z: 1.23, e: E.linear }], lt, () => {
      tabHall(ctx, { t: lt, active: 4, poolX: INBOX });
      drawTabbi(ctx, {
        ...pose('angry', lt * 3), x: INBOX - 700, y: 0, s: 1.4, flip: -1,
        mouth: { shape: 'shout', open: .9, w: 1.1, talk: talk(sh, lt, 'tabbi') },
        armR: { a: 140, b: -40, l1: 30, l2: 25 }, armL: { a: 30, b: 20, l1: 30, l2: 26 },
      });
      S(ctx, () => {
        ctx.globalAlpha = .4;
        for (let i = 0; i < 3; i++) { const k = ((lt * 1.6 + i * .33) % 1); ctx.strokeStyle = C.ink; ctx.lineWidth = 8 * (1 - k); ctx.beginPath(); ctx.arc(INBOX - 830, -420, 80 + k * 300, Math.PI * .72, Math.PI * 1.28); ctx.stroke(); }
      });
    });
    say(ctx, sh, lt, 0, W * .62, H * .20, { size: 50, tail: [-.45, 1], maxW: 720 });
    finish(ctx, { vig: .2 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .2, d: 1.9, who: 'tabbi', text: 'HELPER! READ ME THE CODE!' }],
    sfx: [{ t: .18, n: 'tabbiShout' }],
  });

  // ---- 10. He is extremely happy to help. 3.6s
  shot('a5-helper', 3.6, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 320, y: -420, z: 1.15 }, { t: 3.6, x: 326, y: -424, z: 1.18, e: E.linear }], lt, () => {
      robotRoom(ctx, { t: lt });
      drawHelper(ctx, { x: 300, y: -20, s: 1.35, t: lt, face: lt > 1.4 ? 'reading' : 'happy', talk: talk(sh, lt, 'helper'), badge: 1, look: .2 });
      if (lt > 1.2) S(ctx, () => {
        ctx.globalAlpha = clamp(p01(lt, 1.2, 1.5));
        codeChip(ctx, 300, -740, '4712', { s: .62, glow: .6 + sin01(lt * 2) * .4 });
      });
    });
    say(ctx, sh, lt, 0, W * .70, H * .30, { size: 42, tail: [-.4, 1], maxW: 520 });
    say(ctx, sh, lt, 1, W * .70, H * .30, { size: 54, tail: [-.4, 1], maxW: 520 });
    finish(ctx, { vig: .2 });
  }, {
    tr: { type: 'cut' },
    say: [
      { t: .15, d: 1.0, who: 'helper', text: 'Of course!' },
      { t: 1.55, d: 1.8, who: 'helper', text: 'FOUR. SEVEN. ONE. TWO.' },
    ],
    sfx: [{ t: .12, n: 'helperChime' }, { t: 1.6, n: 'helperRead' }],
  });

  // ---- 11. Said out loud, it stops being a secret. 4.0s
  shot('a5-revoked', 4.0, (ctx, lt, gt) => {
    const dead = lt > .8;
    withCam(ctx, [{ t: 0, x: 300, y: -700, z: 1.12 }, { t: .8, x: 300, y: -700, z: 1.16 }, { t: .95, x: 300, y: -690, z: 1.3, e: E.out4 }, { t: 4.0, x: 304, y: -692, z: 1.33, e: E.linear }], lt, () => {
      robotRoom(ctx, { t: lt });
      codeChip(ctx, 300, -820, '4712', { s: .7, dead, glow: dead ? .9 : .4 });
      drawHelper(ctx, { x: 300, y: -20, s: 1.35, t: lt, face: dead ? 'concern' : 'reading', badge: 1 });
      if (dead) S(ctx, () => {
        const k = E.outBack(p01(lt, .85, 1.25));
        ctx.globalAlpha = clamp(k * 1.4);
        ctx.translate(300, -560); ctx.scale(k, k);
        rr(ctx, -560, -100, 1120, 200, 24, C.red, C.ink, 6);
        text(ctx, 'CODE SPOKEN ALOUD', 0, -36, { size: 46, weight: 800, color: C.white, letter: 3 });
        text(ctx, 'REVOKED FOR YOUR SAFETY', 0, 32, { size: 34, weight: 800, color: 'rgba(245,245,247,.82)', letter: 2 });
      });
    });
    hit(ctx, lt, .82, C.red, .12);
    finish(ctx, { vig: .24 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .8, n: 'deny' }, { t: .84, n: 'stampHeavy' }] });

  // ---- 12. 2.6s of no sound at all.
  shot('a5-scream', 2.6, (ctx, lt, gt) => {
    withCam(ctx, [{ t: 0, x: INBOX - 700, y: -400, z: 1.7 }, { t: 2.6, x: INBOX - 700, y: -400, z: 2.0, e: E.io3 }], lt, () => {
      tabHall(ctx, { t: lt, active: 4, poolX: INBOX });
      drawTabbi(ctx, {
        ...pose('shocked', 0), x: INBOX - 700, y: 0, s: 1.4, flip: 1,
        mouth: { shape: 'gasp', open: 1, w: 1 },
        eye: { open: 1.25, wide: 1.08, look: [0, 0], shape: 'shock', shine: 1 },
        sx: 1 + Math.sin(lt * 30) * .006, sy: 1 - Math.sin(lt * 30) * .006,
      });
    });
    finish(ctx, { vig: lerp(.24, .42, p01(lt, 0, 2.6)) });
  }, { tr: { type: 'cut' }, sfx: [{ t: .05, n: 'silenceHit' }] });

  // ---- 13. A new code is issued. To the human. 4.8s
  shot('a5-newcode', 4.8, (ctx, lt, gt) => {
    withCam(ctx, [{ t: 0, x: INBOX, y: -700, z: 1.0 }, { t: 2.4, x: INBOX, y: -700, z: 1.04 }, { t: 2.6, x: INBOX, y: -660, z: 1.5, e: E.out4 }, { t: 4.8, x: INBOX + 4, y: -662, z: 1.54, e: E.linear }], lt, () => {
      tabHall(ctx, { t: lt, active: 4, poolX: INBOX });
      S(ctx, () => {
        const k = E.outBack(p01(lt, .3, .8));
        ctx.translate(INBOX, -760); ctx.globalAlpha = clamp(k * 1.4); ctx.scale(k, k);
        shadow(ctx, 34, 16, 'rgba(32,32,39,.22)');
        rr(ctx, -560, -230, 1120, 460, 30, C.cream, C.ink, 6); noShadow(ctx);
        text(ctx, 'NEW CODE ISSUED', 0, -160, { size: 30, weight: 800, color: 'rgba(32,32,39,.5)', letter: 4 });
        text(ctx, 'SENT TO', 0, -84, { size: 34, weight: 800, color: 'rgba(32,32,39,.45)', letter: 3 });
        S(ctx, () => { ctx.translate(0, 20); badge(ctx, 0, 0, 'VERIFIED HUMAN · HELPER', { size: 42, glow: lt > 2.6 ? .6 + sin01(lt * 2) * .4 : 0 }); });
        text(ctx, 'ASSISTANTS MAY NOT RECEIVE CODES', 0, 152, { size: 26, weight: 800, color: C.redDeep, letter: 1.5 });
      });
      drawTabbi(ctx, {
        ...pose(lt > 2.6 ? 'defeated' : 'stare', 0), x: INBOX - 760, y: 0, s: 1.4, flip: 1,
        eye: { open: lt > 2.6 ? .34 : 1.05, wide: 1, look: [.5, 0], shape: lt > 2.6 ? 'dead' : 'normal', shine: .8 },
      });
    });
    finish(ctx, { vig: .24 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .3, n: 'uiSlam' }, { t: 2.6, n: 'sting' }] });
}
