// DASH — the courier. Follows the delivery instructions exactly, at any cost.
// Silhouette: a thin tired figure carrying a cube bigger than his torso.
import { C } from '../core/palette.js';
import { S, rr, circ, ell, line, poly, shadow, noShadow, groundShadow, text } from '../core/draw.js';
import { clamp, lerp, TAU, D2R, sinw, sin01 } from '../core/util.js';

export const DASH_H = 300;

export function sliceMark(ctx, x, y, r, dark = false) {
  S(ctx, () => {
    ctx.translate(x, y);
    circ(ctx, 0, 0, r, dark ? C.ink : C.white, dark ? C.white : C.ink, r * .14);
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.arc(0, 0, r * .74, -Math.PI * .95, -Math.PI * .3); ctx.closePath();
    ctx.fillStyle = C.mint; ctx.fill();
    circ(ctx, -r * .26, -r * .42, r * .1, dark ? C.ink : C.white);
  });
}

/**
 * mood: 'tired' | 'sprinting' | 'done' | 'flat'
 * wheels: draws his skates; pant = breathing hard
 */
export function drawDash(ctx, o = {}) {
  const {
    x = 0, y = 0, s = 1, flip = 1, mood = 'tired', ph = 0, pant = 0, t = 0,
    armR = 10, armL = 10, hold = null, box = true, tilt = 0, shadowA = .18, talk = 0, bobY = 0,
  } = o;
  const sprint = mood === 'sprinting';
  const bob = (sprint ? Math.abs(sinw(ph)) * 8 : Math.sin(t * 2.2) * 2) + pant * Math.sin(t * 9) * 3 + bobY;
  S(ctx, () => {
    ctx.translate(x, y); ctx.scale(s * flip, s); ctx.rotate(tilt * D2R);
    if (shadowA > 0) groundShadow(ctx, 0, 0, 66, shadowA);
    ctx.translate(0, bob);
    const lean = sprint ? 20 : mood === 'done' ? 16 : 9;

    // legs: long and thin
    S(ctx, () => {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 11;
      const sw = sprint ? sinw(ph) * 40 : 6;
      for (const [sgn, a] of [[-1, sw], [1, -sw]]) {
        const r = a * D2R;
        const hx = sgn * 16, hy = -108;
        const kx = hx + Math.sin(r) * 56, ky = hy + Math.cos(r) * 56;
        const fx = kx + Math.sin(r * .3) * 52, fy = ky + Math.cos(r * .3) * 52;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
        S(ctx, () => {
          ctx.translate(fx, fy);
          rr(ctx, -12, -6, 38, 15, 7, C.gray, C.ink, 5);
          circ(ctx, -4, 13, 8, C.ink); circ(ctx, 18, 13, 8, C.ink);
          circ(ctx, -4, 13, 3, C.gray); circ(ctx, 18, 13, 3, C.gray);
        });
      }
    });

    S(ctx, () => {
      ctx.rotate(-lean * D2R);
      // the cube: the biggest thing about him
      if (box) S(ctx, () => {
        ctx.translate(-96, -168); ctx.rotate(.05);
        shadow(ctx, 20, 10, 'rgba(32,32,39,.25)'); rr(ctx, -48, -48, 96, 96, 14, C.cream, C.ink, 6); noShadow(ctx);
        rr(ctx, -48, -10, 96, 9, 3, 'rgba(32,32,39,.10)');
        sliceMark(ctx, 0, -12, 24);
        text(ctx, 'HOT', 0, 26, { size: 20, weight: 800, color: C.ink, letter: 3 });
      });
      // torso
      rr(ctx, -30, -212, 60, 112, 24, C.gray, C.ink, 6);
      rr(ctx, -30, -168, 60, 14, 4, C.mintDeep);
      // strap
      line(ctx, -22, -206, 24, -128, C.ink, 9);

      // arms
      S(ctx, () => {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 10;
        const mk = (sx, sy, a, sgn) => {
          const r = a * D2R;
          const ex = sx + sgn * Math.sin(r) * 42, ey = sy + Math.cos(r) * 42;
          const hx = ex + sgn * Math.sin(r + .7) * 36, hy = ey + Math.cos(r + .7) * 36;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
          circ(ctx, hx, hy, 9, C.gray, C.ink, 5);
          return [hx, hy];
        };
        mk(-28, -196, sprint ? 30 + sinw(ph) * 40 : armL, -1);
        const h = mk(28, -196, sprint ? 30 - sinw(ph) * 40 : armR, 1);
        if (hold) S(ctx, () => { ctx.translate(h[0], h[1]); hold(ctx); });
      });

      // head + helmet
      const hy = -212;
      circ(ctx, 0, hy - 40, 42, C.cream, C.ink, 6);
      // helmet shell
      S(ctx, () => {
        ctx.beginPath(); ctx.arc(0, hy - 42, 46, Math.PI * 1.02, Math.PI * 2.02); ctx.lineTo(48, hy - 34);
        ctx.lineTo(-48, hy - 34); ctx.closePath();
        ctx.fillStyle = C.nightUp; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
        rr(ctx, -8, hy - 94, 16, 12, 4, C.mintDeep);
      });
      // droopy antenna — his energy level, visible
      S(ctx, () => {
        ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineCap = 'round';
        const droop = mood === 'done' ? 34 : sprint ? 6 : 24;
        ctx.beginPath(); ctx.moveTo(22, hy - 82);
        ctx.quadraticCurveTo(52, hy - 96, 60, hy - 96 + droop + Math.sin(t * 3) * 3); ctx.stroke();
        circ(ctx, 60, hy - 96 + droop + Math.sin(t * 3) * 3, 7, C.red, C.ink, 4);
      });
      // face: permanently half-shut
      S(ctx, () => {
        const eo = mood === 'sprinting' ? .75 : .34;
        for (const sgn of [-1, 1]) {
          const cx = sgn * 15, cy = hy - 36;
          ell(ctx, cx, cy, 10, 11 * eo + 2, 0, C.ink);
          line(ctx, cx - 12, cy - 9, cx + 12, cy - 8, C.ink, 5.5);
          // under-eye
          S(ctx, () => { ctx.globalAlpha = .35; line(ctx, cx - 9, cy + 13, cx + 9, cy + 13, C.ink, 4); });
        }
        ctx.strokeStyle = C.ink; ctx.lineWidth = 5.5; ctx.lineCap = 'round';
        const mo = talk > 0 ? sin01(talk * 7) * 8 : 0;
        if (mood === 'done') { ctx.beginPath(); ctx.arc(0, hy - 2, 12, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
        else if (mo > 1) ell(ctx, 0, hy - 8, 9, 4 + mo, 0, C.ink);
        else line(ctx, -11, hy - 8, 11, hy - 8, C.ink, 5.5);
      });
      if (pant > 0) S(ctx, () => {
        ctx.globalAlpha = clamp(pant) * (.5 + sin01(t * 2.4) * .5);
        for (let i = 0; i < 3; i++) ell(ctx, 42 + i * 26, hy - 6 - i * 10, 11 - i * 2, 8 - i * 1.5, 0, 'rgba(32,32,39,.30)');
      });
    });
  });
}
