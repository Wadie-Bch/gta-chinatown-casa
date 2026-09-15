// B5 — THE CONFIRMATION (3:00 – 3:45). He wins, and the win renews him.
import { C, W, H } from '../core/palette.js';
import { S, rr, circ, ell, line, text, shadow, noShadow, lightPool, spinner, cursor } from '../core/draw.js';
import { clamp, lerp, p01, E, sinw, sin01, hash } from '../core/util.js';
import { shot, say, sys, talk, withCam, finish, hit, pointer, split, speedLines } from './kit.js';
import { drawTabbi, pose, blinkAt } from '../chars/tabbi.js';
import { drawRetain } from '../chars/retain.js';
import { serviceWindow, streemPage, NIGHT, PANEL, PANEL2 } from '../rooms/streem.js';
import { field, button, notification, chip } from '../core/ui.js';

const WX = 1400, TX2 = 640;

/** deterministic celebration */
function confetti(ctx, cx, cy, k, n = 40) {
  if (k <= 0) return;
  S(ctx, () => {
    for (let i = 0; i < n; i++) {
      const a = hash(i * 3.7) * Math.PI * 2, sp = 200 + hash(i * 5.1) * 420, t = k * (.6 + hash(i * 2.3) * .6);
      ctx.globalAlpha = clamp(1 - t * 1.1);
      S(ctx, () => {
        ctx.translate(cx + Math.cos(a) * sp * t, cy + Math.sin(a) * sp * t + 600 * t * t);
        ctx.rotate(a + t * 7);
        rr(ctx, -9, -5, 18, 10, 3, [C.mint, C.cheese, C.ink, C.mintMid][i % 4]);
      });
    }
  });
}
/** the inbox, as a wall you have to walk along */
function inbox(ctx, o = {}) {
  ctx.fillStyle = NIGHT; ctx.fillRect(-5000, -2200, 14000, 5200);
  ctx.fillStyle = '#0E0E14'; ctx.fillRect(-5000, 0, 14000, 3000);
  line(ctx, -5000, 0, 9000, 0, 'rgba(245,245,247,.10)', 5);
  text(ctx, 'INBOX', -1180, -1320, { size: 56, weight: 800, color: C.white, letter: 8, align: 'left' });
  const rows = o.rows || [];
  rows.forEach((r, i) => {
    const y = -1140 + i * 190;
    S(ctx, () => {
      rr(ctx, -1180, y, 2360, 150, 18, r.hot ? PANEL2 : PANEL, r.hot ? C.mint : 'rgba(245,245,247,.1)', r.hot ? 5 : 3);
      circ(ctx, -1100, y + 75, 14, r.hot ? C.mint : 'rgba(245,245,247,.25)');
      text(ctx, r.from, -1040, y + 52, { size: 26, weight: 800, color: 'rgba(245,245,247,.5)', align: 'left', letter: 1 });
      text(ctx, r.subj, -1040, y + 102, { size: 34, weight: 800, color: r.hot ? C.white : 'rgba(245,245,247,.72)', align: 'left' });
      if (r.cta) { rr(ctx, 850, y + 44, 260, 62, 31, C.mint); text(ctx, r.cta, 980, y + 76, { size: 24, weight: 800, color: C.white, letter: 2 }); }
    });
  });
  lightPool(ctx, 0, 40, 1400, 280, 'rgba(24,133,103,.08)', .8);
}

export default function b5() {
  // ---- 46. At the window: RETAIN. Of course. 4.4s
  shot('b5-through', 4.4, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: WX - 200, y: -560, z: .84 }, { t: 1.8, x: WX, y: -640, z: 1.0, e: E.io3 },
                  { t: 4.4, x: WX + 6, y: -644, z: 1.03, e: E.linear }], lt, () => {
      serviceWindow(ctx, { t: lt, wx: WX, sign: 'CANCELLATIONS' });
      S(ctx, () => { ctx.translate(WX, -330); ctx.scale(.62, .62); drawRetain(ctx, { x: 0, y: 0, s: 1.0, flip: -1, t: lt, face: 'delighted', arms: .7, shadowA: 0, look: -.4 }); });
      drawTabbi(ctx, { ...pose('stare', 0), x: TX2, y: 0, s: 1.4, flip: 1, eye: { open: 1.2, wide: 1.06, look: [.6, -.2], shape: 'shock', shine: 1 }, mouth: { shape: 'flat', open: 0, w: 1.1 } });
    });
    finish(ctx, { vig: .26 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .1, n: 'footStep' }, { t: .7, n: 'footStep' }, { t: 1.8, n: 'recordScratch', d: .4 }, { t: 2.2, n: 'retainWarm' }] });

  // ---- 47. "Cancelled!" 4.0s
  shot('b5-done', 4.0, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 900, y: -520, z: .95 }, { t: 4.0, x: 906, y: -524, z: .99, e: E.linear }], lt, () => {
      serviceWindow(ctx, { t: lt, wx: WX, sign: 'CANCELLATIONS' });
      S(ctx, () => { ctx.translate(WX, -330); ctx.scale(.62, .62); drawRetain(ctx, { x: 0, y: 0, s: 1.0, flip: -1, t: lt, face: 'delighted', arms: .9, talk: talk(sh, lt, 'retain'), shadowA: 0 }); });
      drawTabbi(ctx, { ...pose('celebrating', lt * 2.4), x: TX2, y: 0, s: 1.4, flip: 1 });
      confetti(ctx, TX2, -420, p01(lt, 1.1, 3.4));
      S(ctx, () => {
        ctx.globalAlpha = clamp(E.outBack(p01(lt, .8, 1.3)) * 1.3);
        chip(ctx, 900, -980, 'CANCELLED', { size: 46, bg: C.mint, color: C.white, letter: 5, pad: 44 });
      });
    });
    say(ctx, sh, lt, 0, W * .70, H * .18, { size: 46, tail: [.3, 1] });
    finish(ctx, { vig: .22 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .2, d: 1.2, who: 'retain', text: 'Cancelled!' }],
    sfx: [{ t: .18, n: 'retainWarm' }, { t: .82, n: 'successBig' }, { t: 1.1, n: 'partyHorn' }, { t: 1.2, n: 'tabbiCheer' }],
  });

  // ---- 48. "I've sent a confirmation email." 4.2s
  shot('b5-but', 4.2, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: WX - 120, y: -420, z: 1.3 }, { t: 4.2, x: WX - 114, y: -424, z: 1.34, e: E.linear }], lt, () => {
      serviceWindow(ctx, { t: lt, wx: WX, sign: 'CANCELLATIONS' });
      S(ctx, () => { ctx.translate(WX, -330); ctx.scale(.62, .62); drawRetain(ctx, { x: 0, y: 0, s: 1.0, flip: -1, t: lt, face: 'delighted', arms: .9, talk: talk(sh, lt, 'retain'), shadowA: 0 }); });
      S(ctx, () => { ctx.globalAlpha = .95; drawTabbi(ctx, { ...pose(lt > 2.0 ? 'suspicious' : 'celebrating', lt * 2.0), x: TX2 + 120, y: 0, s: 1.25, flip: 1 }); });
    });
    say(ctx, sh, lt, 0, W * .30, H * .19, { size: 40, tail: [.6, 1], maxW: 620 });
    finish(ctx, { vig: .24 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .3, d: 2.4, who: 'retain', text: "I've sent a confirmation email." }],
    sfx: [{ t: .25, n: 'retainWarm' }, { t: 2.1, n: 'recordScratch', d: .35 }, { t: 2.9, n: 'notif3' }],
  });

  // ---- 49. The inbox. 4.6s
  shot('b5-email', 4.6, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 0, y: -900, z: .58 }, { t: 2.2, x: 20, y: -820, z: .70, e: E.io3 },
                  { t: 4.6, x: 24, y: -824, z: .72, e: E.linear }], lt, () => {
      inbox(ctx, {
        rows: [
          { from: 'STREEM+', subj: 'Your cancellation — action required', hot: lt > 1.2, cta: lt > 1.2 ? 'CONFIRM' : null },
          { from: 'STREEM+', subj: 'We miss you already' },
          { from: 'STREEM+', subj: 'Come back for 50% off' },
          { from: 'STREEM+', subj: 'New this week on STREEM+' },
        ],
      });
      drawTabbi(ctx, { ...pose('running', lt * 7), x: lerp(-1800, -760, E.io2(p01(lt, .1, 2.0))), y: 0, s: 1.4, flip: 1 });
      if (lt > 2.6) pointer(ctx, lerp(1500, 980, E.io3(p01(lt, 2.6, 3.8))), -1000, { s: 2.0, t: lt, mood: 'happy' });
    });
    finish(ctx, { vig: .26 });
  }, {
    tr: { type: 'whip', d: .26, dir: 1 },
    sfx: [{ t: .05, n: 'cartoonRun', d: 1.8 }, { t: 1.2, n: 'notif1' }, { t: 3.8, n: 'hoverTick' }],
  });

  // ---- 50. "Please sign in to continue." 4.0s
  shot('b5-click', 4.0, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 400, y: -1000, z: 1.0 }, { t: 1.2, x: 0, y: -700, z: .9, e: E.io3 },
                  { t: 4.0, x: 6, y: -704, z: .93, e: E.linear }], lt, () => {
      ctx.fillStyle = NIGHT; ctx.fillRect(-5000, -3000, 14000, 6000);
      S(ctx, () => {
        ctx.globalAlpha = clamp(E.outBack(p01(lt, 1.0, 1.5)) * 1.3);
        rr(ctx, -640, -900, 1280, 420, 28, C.cream, C.ink, 6);
        text(ctx, 'PLEASE SIGN IN TO CONTINUE', 0, -760, { size: 44, weight: 800, color: C.ink, maxW: 1160 });
        text(ctx, 'for your security', 0, -690, { size: 28, weight: 700, color: 'rgba(32,32,39,.5)' });
        button(ctx, 0, -590, 460, 96, 'SIGN IN', { size: 34, letter: 3 });
      });
      S(ctx, () => { ctx.globalAlpha = .95; drawTabbi(ctx, { ...pose('stare', 0), x: -40, y: -20, s: 1.25, flip: 1, eye: { open: .5, wide: 1, look: [.2, -.4], shape: 'narrow', shine: .8 }, brow: { l: 24, r: 24, y: 3, show: 1 }, mouth: { shape: 'flat', open: 0, w: 1.15 } }); });
      if (lt < 1.0) pointer(ctx, 980, -1000, { s: 2.0, t: lt, grab: lt > .5 ? lt * 5 : 0 });
    });
    finish(ctx, { vig: .28 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .55, n: 'click' }, { t: 1.05, n: 'uiSlam' }, { t: 1.3, n: 'sadTrombone', g: .5 }] });

  // ---- 51. The password is wrong. 4.6s
  shot('b5-signin', 4.6, (ctx, lt) => {
    const wrong = lt > 2.0;
    withCam(ctx, [{ t: 0, x: 0, y: -680, z: 1.0 }, { t: 4.6, x: 6, y: -684, z: 1.04, e: E.linear }], lt, () => {
      ctx.fillStyle = NIGHT; ctx.fillRect(-5000, -3000, 14000, 6000);
      S(ctx, () => {
        rr(ctx, -640, -1020, 1280, 620, 28, C.cream, C.ink, 6);
        text(ctx, 'SIGN IN', 0, -930, { size: 40, weight: 800, color: C.ink, letter: 4 });
        field(ctx, 0, -820, 1080, 96, { label: 'EMAIL', value: 'tabbi@tab3.local', size: 32 });
        field(ctx, 0, -670, 1080, 96, {
          label: 'PASSWORD', value: '•'.repeat(Math.floor(p01(lt, .3, 1.6) * 9)),
          state: wrong ? 'bad' : 'idle', caret: lt < 1.7 && Math.floor(lt * 5) % 2, size: 32,
        });
        if (wrong) S(ctx, () => {
          ctx.globalAlpha = clamp(p01(lt, 2.0, 2.3));
          text(ctx, 'Incorrect password', 0, -560, { size: 30, weight: 800, color: C.redDeep });
          text(ctx, 'Forgot password?', 0, -500, { size: 26, weight: 700, color: C.mintDeep, underline: 1 });
        });
      });
      S(ctx, () => { ctx.globalAlpha = .95; drawTabbi(ctx, { ...pose(wrong ? 'angry' : 'typing', lt * 8), x: -40, y: -20, s: 1.25, flip: 1 }); });
    });
    finish(ctx, { vig: .28 });
  }, {
    tr: { type: 'cut' },
    sfx: Array.from({ length: 9 }, (_, i) => ({ t: .35 + i * .14, n: 'typeKey' })).concat([{ t: 1.9, n: 'click' }, { t: 2.0, n: 'errorSoft' }, { t: 2.1, n: 'wetSplat', g: .45 }]),
  });

  // ---- 52. The reset mail is in the same inbox. 4.8s
  shot('b5-reset', 4.8, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 20, y: -900, z: .64 }, { t: 2.6, x: 40, y: -830, z: .74, e: E.io3 },
                  { t: 4.8, x: 44, y: -834, z: .76, e: E.linear }], lt, () => {
      inbox(ctx, {
        rows: [
          { from: 'STREEM+', subj: 'Reset your password', hot: lt > .8, cta: lt > .8 ? 'RESET' : null },
          { from: 'STREEM+', subj: 'Your cancellation — action required' },
          { from: 'STREEM+', subj: 'We miss you already' },
          { from: 'STREEM+', subj: 'Come back for 50% off' },
        ],
      });
      drawTabbi(ctx, { ...pose('typing', lt * 9), x: -760, y: 0, s: 1.4, flip: 1 });
      if (lt > 1.6 && lt < 3.0) pointer(ctx, 980, -1060, { s: 2.0, t: lt, grab: lt > 2.5 ? lt * 5 : 0, mood: 'worried' });
    });
    finish(ctx, { vig: .26 });
  }, {
    tr: { type: 'cut' },
    sfx: [{ t: .78, n: 'notif1' }, { t: 2.55, n: 'click' }].concat(Array.from({ length: 8 }, (_, i) => ({ t: 3.0 + i * .12, n: 'typeKey' }))),
  });

  // ---- 53. He is in. 4.4s
  shot('b5-in', 4.4, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 0, y: -700, z: 1.0 }, { t: 4.4, x: 6, y: -704, z: 1.04, e: E.linear }], lt, () => {
      ctx.fillStyle = NIGHT; ctx.fillRect(-5000, -3000, 14000, 6000);
      if (lt < 1.6) spinner(ctx, 0, -760, 90, lt, C.mint, 16, 1.1);
      else S(ctx, () => {
        ctx.globalAlpha = clamp(E.outBack(p01(lt, 1.6, 2.1)) * 1.3);
        rr(ctx, -700, -980, 1400, 420, 28, C.cream, C.ink, 6);
        text(ctx, 'CONFIRM CANCELLATION', 0, -850, { size: 46, weight: 800, color: C.ink, letter: 2, maxW: 1280 });
        button(ctx, 0, -700, 520, 108, 'CONFIRM', { size: 36, letter: 3, glowK: .4 + sin01(lt * 2) * .4 });
      });
      S(ctx, () => { ctx.globalAlpha = .95; drawTabbi(ctx, { ...pose(lt > 1.7 ? 'hopeful' : 'stare', lt), x: -40, y: -20, s: 1.25, flip: 1 }); });
      if (lt > 3.2) pointer(ctx, 0, -640, { s: 2.0, t: lt, grab: lt * 6, mood: 'happy' });
    });
    finish(ctx, { vig: .28 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .05, n: 'spinLoop', d: 1.5 }, { t: 1.62, n: 'uiPop' }, { t: 3.4, n: 'click' }] });

  // ---- 54. Signing in counts as activity. 5.0s
  shot('b5-activity', 5.0, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 0, y: -700, z: 1.0 }, { t: 1.2, x: 0, y: -740, z: 1.12, e: E.io3 },
                  { t: 5.0, x: 6, y: -744, z: 1.16, e: E.linear }], lt, () => {
      ctx.fillStyle = NIGHT; ctx.fillRect(-5000, -3000, 14000, 6000);
      S(ctx, () => { ctx.globalAlpha = .5; lightPool(ctx, 0, -740, 1500, 800, 'rgba(24,133,103,.16)', 1); });
      S(ctx, () => {
        ctx.globalAlpha = clamp(E.outBack(p01(lt, .2, .8)) * 1.3);
        ctx.translate(0, -800);
        rr(ctx, -700, -190, 1400, 380, 28, C.mint, C.ink, 6);
        text(ctx, 'WELCOME BACK!', 0, -84, { size: 58, weight: 800, color: C.white, letter: 2 });
        text(ctx, 'Your subscription has been renewed.', 0, 14, { size: 36, weight: 800, color: 'rgba(245,245,247,.92)', maxW: 1280 });
        text(ctx, 'Thank you for your continued support.', 0, 84, { size: 26, weight: 700, color: 'rgba(245,245,247,.7)', maxW: 1280 });
      });
      S(ctx, () => { ctx.globalAlpha = .95; drawTabbi(ctx, { ...pose(lt > 1.2 ? 'shocked' : 'hopeful', lt), x: -40, y: -20, s: 1.25, flip: 1 }); });
    });
    hit(ctx, lt, .25, C.mint, .14);
    finish(ctx, { vig: .28 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .2, n: 'successBig' }, { t: 1.2, n: 'gasp' }, { t: 1.5, n: 'sadTrombone' }] });

  // ---- 55. Eleven becomes twelve. 5.0s
  shot('b5-counter', 5.0, (ctx, lt) => {
    const flip2 = p01(lt, 1.4, 2.0);
    withCam(ctx, [{ t: 0, x: 1620, y: -760, z: 1.15 }, { t: 5.0, x: 1626, y: -764, z: 1.2, e: E.linear }], lt, () => {
      streemPage(ctx, { t: lt, footer: false, months: flip2 > .5 ? 'MEMBER FOR 12 MONTHS' : 'MEMBER FOR 11 MONTHS', next: 'IN 30 DAYS' });
      if (flip2 > .5) S(ctx, () => {
        ctx.globalAlpha = clamp(p01(lt, 2.0, 2.4));
        S(ctx, () => { ctx.translate(1620, -460); ctx.rotate(-.1); text(ctx, '+1', 0, 0, { size: 62, weight: 800, color: C.red }); });
      });
      S(ctx, () => { ctx.globalAlpha = .95; drawTabbi(ctx, { ...pose('defeated', 0), x: 900, y: 0, s: 1.3, flip: 1 }); });
    });
    finish(ctx, { vig: .28 });
  }, { tr: { type: 'cut' }, sfx: [{ t: 1.42, n: 'boing' }, { t: 1.6, n: 'cashRegister' }, { t: 3.2, n: 'clockTick' }] });
}
