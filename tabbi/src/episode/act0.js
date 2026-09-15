// ACT 0 — HUNGER (0:00 – 0:20). We open inside the problem.
import { C, W, H } from '../core/palette.js';
import { S, rr, circ, ell, line, poly, text, shadow, noShadow, cursor, lightPool, vignette } from '../core/draw.js';
import { clamp, lerp, p01, E, ramp, pulse, sinw, sin01, shake, TAU } from '../core/util.js';
import { shot, say, sys, talk, withCam, finish, wash, hit, pointer, speedLines, lineK } from './kit.js';
import { drawTabbi, pose, blinkAt, TABBI } from '../chars/tabbi.js';
import { shopRoom } from '../rooms/rooms.js';
import { pizzaAd, pizza, coin } from '../rooms/props.js';
import { button, chip } from '../core/ui.js';

const BTN = { x: 250, y: -400, w: 620, h: 160 };
const TX = -620;              // where Tabbi stands on the floor
const BTOP = BTN.y - BTN.h / 2 + 8;   // standing surface once he is on the button

/** the ORDER button, in whatever state the story has left it */
function orderBtn(ctx, o = {}) {
  const label = o.label || 'ORDER';
  button(ctx, BTN.x, BTN.y + (o.dy || 0), BTN.w, BTN.h, label, {
    state: o.state || 'go', press: o.press || 0, size: o.size || 60, glowK: o.glow || 0, letter: 2,
  });
}

export default function act0() {
  // ---- 1. ECU: the ad, reflected in him. 2.4s
  shot('a0-eye', 2.4, (ctx, lt) => {
    ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
    S(ctx, () => {
      const z = lerp(1.06, 1.0, E.io3(p01(lt, 0, 2.4)));
      ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
      // the curve of his face, filling the frame
      S(ctx, () => { ctx.globalAlpha = .07; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(W * .5, H * 1.5, W * .92, 0, TAU); ctx.fill(); });
      const bk = blinkAt(lt, [1.55], .16);
      const ex = 760, ey = 560, rx = 300, ry = 330 * bk;
      // brow
      S(ctx, () => { ctx.strokeStyle = C.ink; ctx.lineWidth = 46; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ex - 250, ey - 430); ctx.lineTo(ex + 250, ey - 452); ctx.stroke(); });
      if (bk < .08) { line(ctx, ex - rx, ey, ex + rx, ey, C.ink, 40); }
      else {
        ell(ctx, ex, ey, rx, ry, 0, C.ink);
        S(ctx, () => {
          ctx.beginPath(); ctx.ellipse(ex, ey, rx, ry, 0, 0, TAU); ctx.clip();
          // the advertisement, living in his eye
          S(ctx, () => { ctx.translate(ex - 34, ey - 40); ctx.rotate(.05); pizzaAd(ctx, 0, 0, 420, 190, { t: lt }); });
          S(ctx, () => { ctx.globalAlpha = .35; circ(ctx, ex - 150, ey - 180, 90, C.white); });
        });
        circ(ctx, ex + 150, ey + 160, 40, 'rgba(245,245,247,.6)');
      }
      // the second eye, just off frame
      S(ctx, () => { ctx.globalAlpha = .55; ell(ctx, 1980, ey + 16, 300, 330 * bk, 0, C.ink); });
    });
    finish(ctx, { vig: .3 });
  }, {
    sfx: [{ t: 0, n: 'roomHum', d: 2.4 }, { t: .35, n: 'sizzle', d: 1.5, g: .3 }, { t: 1.55, n: 'blink' }],
  });

  // ---- 2. WIDE: one small creature, one enormous promise. 3.2s
  shot('a0-wide', 3.2, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 40, y: -600, z: .95 }, { t: 3.2, x: 60, y: -640, z: .965, e: E.linear }], lt, () => {
      shopRoom(ctx, { t: lt });
      orderBtn(ctx, { glow: .35 + sin01(lt * .7) * .25 });
      drawTabbi(ctx, { ...pose('stare', 0), x: TX, y: 0, s: 1.5, flip: 1, eye: { open: 1, wide: 1, look: [0, -.5], shape: 'normal', shine: 1 }, brow: { l: -6, r: -6, y: -3, show: 1 }, mouth: { shape: 'line', open: 0, w: .8 } });
    });
    finish(ctx);
  }, { tr: { type: 'cut' }, sfx: [{ t: 0, n: 'roomHum', d: 3.2 }] });

  // ---- 3. MCU: the stomach files a complaint. 2.2s
  shot('a0-growl', 2.2, (ctx, lt) => {
    const g = p01(lt, .35, 1.5);
    const sh = lt > .35 && lt < 1.5 ? shake(lt, .35, 1.15, 7, 30, 4) : { x: 0, y: 0 };
    withCam(ctx, [{ t: 0, x: TX, y: -230, z: 2.0 }, { t: 2.2, x: TX, y: -230, z: 2.08, e: E.linear }], lt, () => {
      shopRoom(ctx, { t: lt });
      orderBtn(ctx, { glow: .3 });
      S(ctx, () => {
        ctx.translate(sh.x, sh.y);
        const lookDown = p01(lt, 1.35, 1.85);
        drawTabbi(ctx, {
          ...pose('stare', 0), x: TX, y: 0, s: 1.5,
          eye: { open: lerp(1, .8, lookDown), wide: 1, look: [0, lerp(-.4, .8, lookDown)], shape: 'normal', shine: 1 },
          brow: { l: lerp(-6, -14, lookDown), r: lerp(-6, -14, lookDown), y: -3, show: 1 },
          mouth: { shape: g > .05 && g < 1 ? 'wavy' : 'line', open: 0, w: .8 },
          sx: 1 + Math.sin(lt * 26) * .012 * (g > 0 && g < 1 ? 1 : 0), sy: 1 - Math.sin(lt * 26) * .012 * (g > 0 && g < 1 ? 1 : 0),
        });
        // the growl, made visible
        if (g > 0 && g < 1) S(ctx, () => {
          ctx.globalAlpha = (1 - g) * .55;
          for (let i = 0; i < 3; i++) {
            const k = (g * 1.6 + i * .33) % 1;
            circ(ctx, TX, -90, 40 + k * 190, null, C.ink, 7 * (1 - k));
          }
        });
      });
    });
    finish(ctx);
  }, { tr: { type: 'cut' }, sfx: [{ t: .35, n: 'growl', d: 1.15 }] });

  // ---- 4. ECU on the belly. Hard cut, 1.2s, no dialogue. Let it land.
  shot('a0-belly', 1.2, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: TX, y: -120, z: 5.0 }], lt, () => {
      shopRoom(ctx, { t: lt });
      drawTabbi(ctx, { ...pose('stare', 0), x: TX, y: 0, s: 1.5, eye: { open: .6, wide: 1, look: [0, 1], shape: 'normal', shine: 1 }, mouth: { shape: 'wavy', open: 0, w: .9 } });
      S(ctx, () => {
        ctx.globalAlpha = (1 - p01(lt, 0, .8)) * .6;
        for (let i = 0; i < 2; i++) circ(ctx, TX, -95, 30 + ((lt * 2.2 + i * .5) % 1) * 130, null, C.ink, 8);
      });
    });
    finish(ctx, { vig: .26 });
  }, { tr: { type: 'cut' }, sfx: [{ t: 0, n: 'growlShort' }] });

  // ---- 5. CU: the arithmetic of desire. 2.8s
  shot('a0-balance', 2.8, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: -840, y: -570, z: 1.62 }, { t: 2.8, x: -760, y: -565, z: 1.5, e: E.io2 }], lt, () => {
      shopRoom(ctx, { t: lt });
      const slide = E.outBack(p01(lt, .45, 1.25));
      // the price, dragged over beside the balance
      S(ctx, () => {
        ctx.globalAlpha = clamp(slide * 1.4);
        const px = lerp(340, -330, slide) + 60;
        S(ctx, () => {
          shadow(ctx, 22, 10, 'rgba(32,32,39,.18)');
          rr(ctx, px - 180, -650, 360, 180, 26, C.cheese, C.ink, 5); noShadow(ctx);
          text(ctx, 'ONE PIZZA', px, -598, { size: 26, weight: 800, color: 'rgba(32,32,39,.6)', letter: 3 });
          text(ctx, '€7.40', px, -530, { size: 76, weight: 800, color: C.ink });
        });
        if (lt > 1.2) {
          const ek = E.outBack(p01(lt, 1.2, 1.6));
          S(ctx, () => { ctx.globalAlpha = ek; text(ctx, '=', -560, -560, { size: 86 * ek, weight: 800, color: C.mint }); });
        }
        if (slide < .98) pointer(ctx, px + 120, -470, { s: 2.2, grab: lt * 4 });
      });
      if (lt > 1.75) {
        const k = E.outBack(p01(lt, 1.75, 2.2));
        S(ctx, () => { ctx.globalAlpha = clamp(k * 1.4); ctx.translate(-800, -320); ctx.scale(k, k); chip(ctx, 0, 0, 'EXACTLY ENOUGH', { size: 38, bg: C.mint, color: C.white, letter: 3 }); });
      }
    });
    finish(ctx);
  }, { tr: { type: 'cut' }, sfx: [{ t: .45, n: 'slideIn' }, { t: 1.25, n: 'clack' }, { t: 1.78, n: 'coin' }] });

  // ---- 6. CU: he has done the maths and he likes it. 1.2s
  shot('a0-smug', 1.2, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: TX, y: -250, z: 2.7 }], lt, () => {
      shopRoom(ctx, { t: lt });
      drawTabbi(ctx, { ...pose('smug', lt * .8), x: TX, y: 0, s: 1.5, eye: { open: lerp(.9, .42, E.out3(p01(lt, .1, .55))), wide: 1, look: [.1, .05], shape: 'narrow', shine: 1 } });
    });
    finish(ctx);
  }, { tr: { type: 'cut' }, sfx: [{ t: .12, n: 'eyeNarrow' }] });

  // ---- 7. ECU: the button, breathing. 1.6s
  shot('a0-button', 1.6, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 250, y: -380, z: 2.5 }, { t: 1.6, x: 250, y: -380, z: 2.62, e: E.linear }], lt, () => {
      ctx.fillStyle = C.white; ctx.fillRect(-2000, -2000, 8000, 4000);
      orderBtn(ctx, { glow: .5 + sin01(lt * 1.2) * .5 });
      pointer(ctx, 250 + 110 - sinw(lt * .8) * 6, -300, { s: 2.4 });
    });
    finish(ctx, { vig: .24 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .1, n: 'hoverTick' }, { t: .9, n: 'hoverTick', g: .5 }] });

  // ---- 8. He does not click it. He lands on it. 1.8s
  shot('a0-click', 1.8, (ctx, lt) => {
    const jump = p01(lt, .25, .95);
    const air = Math.sin(jump * Math.PI) * 330;
    const x = lerp(TX + 80, 250, E.io2(jump));
    const landed = lt >= .95;
    const press = landed ? Math.max(0, 1 - p01(lt, .95, 1.3)) : 0;
    withCam(ctx, [{ t: 0, x: -180, y: -430, z: 1.05 }, { t: 1.8, x: 190, y: -500, z: 1.16, e: E.out3 }], lt, () => {
      shopRoom(ctx, { t: lt });
      orderBtn(ctx, { press: press * 1.1, glow: landed ? 0 : .4 });
      if (lt < .3) speedLines(ctx, x - 90, -120, 4, 150, .25, 2);
      drawTabbi(ctx, {
        ...(landed ? pose('celebrating', 0) : jump > .02 ? pose('running', lt * 7) : pose('running', lt * 7)),
        x, y: landed ? BTOP + press * 8 : -air,
        s: 1.5, flip: 1,
        ...(landed ? { legL: { a: -16, b: 10 }, legR: { a: 16, b: 10 }, armL: { a: 40, b: 30, l1: 30, l2: 26 }, armR: { a: 40, b: 30, l1: 30, l2: 26 }, mouth: { shape: 'bigSmile', open: .4, w: 1 }, bob: 0, sy: lerp(.86, 1, p01(lt, .95, 1.25)), sx: lerp(1.16, 1, p01(lt, .95, 1.25)) } : {}),
      });
      if (landed && lt < 1.25) S(ctx, () => {
        ctx.globalAlpha = 1 - p01(lt, .95, 1.25);
        circ(ctx, 250, BTN.y + 20, 60 + p01(lt, .95, 1.25) * 160, null, C.mint, 8);
      });
    });
    hit(ctx, lt, .95, C.white, .08);
    finish(ctx);
  }, { tr: { type: 'cut' }, sfx: [{ t: .06, n: 'footRun', d: .3 }, { t: .28, n: 'jump' }, { t: .95, n: 'clickHeavy' }] });

  // ---- 9. The button changes its mind. 2.4s
  shot('a0-nope', 2.4, (ctx, lt) => {
    const flip = p01(lt, .25, .55);
    withCam(ctx, [{ t: 0, x: 250, y: -580, z: 1.6 }, { t: .25, x: 250, y: -575, z: 1.68 }, { t: 2.4, x: 250, y: -572, z: 1.74, e: E.linear }], lt, () => {
      ctx.fillStyle = C.white; ctx.fillRect(-2000, -2000, 8000, 4000);
      S(ctx, () => {
        // the label turns over like a departure board
        ctx.translate(BTN.x, BTN.y); ctx.transform(1, 0, 0, Math.max(.02, Math.abs(Math.cos(flip * Math.PI))), 0, 0); ctx.translate(-BTN.x, -BTN.y);
        orderBtn(ctx, { label: flip < .5 ? 'ORDER' : 'FIRST, PROVE YOU EXIST', state: flip < .5 ? 'go' : 'dead', size: flip < .5 ? 60 : 42 });
      });
      drawTabbi(ctx, {
        ...pose('stare', 0), x: 250, y: BTOP, s: 1.5,
        eye: { open: 1, wide: flip > .6 ? 1.04 : 1, look: [0, .3], shape: 'normal', shine: 1 },
        brow: { l: flip > .6 ? -12 : 8, r: flip > .6 ? -12 : 8, y: -4, show: 1 },
        mouth: { shape: flip > .6 ? 'flat' : 'smile', open: 0, w: flip > .6 ? 1.1 : .9 },
      });
    });
    finish(ctx);
  }, { tr: { type: 'cut' }, sfx: [{ t: .26, n: 'flipCard' }, { t: .56, n: 'deny' }] });

  // ---- 10. He looks at us. We are also not going to help. 1.2s
  shot('a0-viewer', 1.2, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 250, y: -700, z: 2.85 }], lt, () => {
      ctx.fillStyle = C.white; ctx.fillRect(-2000, -2000, 8000, 4000);
      S(ctx, () => { ctx.globalAlpha = .5; ctx.fillStyle = C.gray; ctx.fillRect(-2000, BTN.y - BTN.h / 2, 8000, 4000); });
      drawTabbi(ctx, { ...pose('toViewer', 0), x: 250, y: BTOP, s: 1.5, eye: { open: blinkAt(lt, [.72], .1), wide: 1.06, look: [0, 0], shape: 'normal', shine: 1 } });
    });
    finish(ctx, { vig: .24 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .05, n: 'doink' }, { t: .72, n: 'blink' }] });
}
