// HELPER — a polite robot assistant. Everything he does is correct and ruinous.
// Silhouette: a floating capsule with a wide screen face. No legs, no hurry.
import { C } from '../core/palette.js';
import { S, rr, circ, ell, line, poly, shadow, noShadow, text } from '../core/draw.js';
import { clamp, lerp, TAU, D2R, sinw, sin01 } from '../core/util.js';

export const HELPER_H = 250;

/** face: 'happy' | 'neutral' | 'thinking' | 'reading' | 'proud' | 'concern' | 'off' */
export function drawHelper(ctx, o = {}) {
  const {
    x = 0, y = 0, s = 1, flip = 1, face = 'happy', t = 0, talk = 0, tilt = 0,
    armL = 20, armR = 20, hold = null, badge = 0, hoverA = 1, look = 0, glow = 0, dim = 0,
  } = o;
  const bob = Math.sin(t * 1.9) * 6 * hoverA;
  S(ctx, () => {
    ctx.translate(x, y); ctx.scale(s * flip, s);
    // hover cushion — he never touches the floor, which is part of the joke
    S(ctx, () => {
      ctx.globalAlpha = .5 * hoverA;
      ell(ctx, 0, 0, 62 - Math.sin(t * 1.9) * 5, 15, 0, 'rgba(32,32,39,.18)');
      ctx.globalAlpha = .35 * hoverA;
      ell(ctx, 0, -14, 46, 12, 0, C.mintSoft);
    });
    ctx.translate(0, bob - 30);
    ctx.rotate(tilt * D2R);
    if (glow > 0) S(ctx, () => { ctx.globalAlpha = glow * .5; circ(ctx, 0, -96, 130, 'rgba(24,133,103,.20)'); });

    // thruster skirt
    rr(ctx, -40, -44, 80, 30, 14, C.gray, C.ink, 5.5);
    rr(ctx, -26, -22, 52, 12, 6, C.mintMid);

    // arms: little paddles
    S(ctx, () => {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 11;
      for (const [sgn, a] of [[-1, armL], [1, armR]]) {
        const r = a * D2R;
        const sx = sgn * 58, sy = -128;
        const ex = sx + sgn * Math.sin(r) * 40, ey = sy + Math.cos(r) * 40;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
        S(ctx, () => { ctx.translate(ex, ey); ctx.rotate(sgn * r * .6); rr(ctx, -11, -9, 22, 26, 10, C.gray, C.ink, 5); });
      }
    });

    // body capsule
    shadow(ctx, 26, 12, 'rgba(32,32,39,.18)');
    rr(ctx, -62, -210, 124, 172, 58, C.gray, C.ink, 6);
    noShadow(ctx);
    rr(ctx, -46, -70, 92, 12, 6, 'rgba(32,32,39,.10)');
    // antenna
    line(ctx, 0, -210, 0, -244, C.ink, 7);
    circ(ctx, 0, -252, 11, face === 'thinking' ? C.mint : C.white, C.ink, 5);

    // face screen
    rr(ctx, -50, -196, 100, 74, 22, C.ink);
    S(ctx, () => {
      const ex = look * 10;
      const eye = (cx) => {
        if (face === 'off') { line(ctx, cx - 11, -160, cx + 11, -160, 'rgba(24,133,103,.35)', 6); return; }
        if (face === 'happy' || face === 'proud') {
          ctx.strokeStyle = C.mint; ctx.lineWidth = 6.5; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.arc(cx, -158, 11, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
        } else if (face === 'thinking') {
          circ(ctx, cx, -164 + Math.sin(t * 6 + (cx > 0 ? 1 : 0)) * 3, 8, C.mint);
        } else if (face === 'reading') {
          rr(ctx, cx - 9, -170, 18, 16, 4, C.mint);
        } else if (face === 'concern') {
          circ(ctx, cx, -162, 8.5, C.mint); line(ctx, cx - 12, -176, cx + 10, -172, C.mint, 5);
        } else circ(ctx, cx, -162, 9, C.mint);
      };
      S(ctx, () => { ctx.translate(ex, 0); eye(-24); eye(24); });
      // mouth
      const mo = talk > 0 ? sin01(talk * 8) : 0;
      ctx.strokeStyle = C.mint; ctx.lineWidth = 5.5; ctx.lineCap = 'round';
      if (face === 'concern') { ctx.beginPath(); ctx.arc(0, -128, 13, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); }
      else if (face === 'off') { }
      else if (mo > .05) { ell(ctx, 0, -137, 12, 5 + mo * 8, 0, C.mint); }
      else { ctx.beginPath(); ctx.arc(0, -142, 15, Math.PI * .15, Math.PI * .85); ctx.stroke(); }
    });
    if (badge > 0) S(ctx, () => {
      ctx.globalAlpha = clamp(badge);
      rr(ctx, -54, -112, 108, 34, 17, C.mint, C.ink, 4);
      text(ctx, 'HUMAN', 0, -95, { size: 19, weight: 800, color: C.white, letter: 2 });
    });
    if (dim > 0) S(ctx, () => { ctx.globalAlpha = dim; rr(ctx, -62, -210, 124, 172, 58, C.ink); });
    if (hold) S(ctx, () => { ctx.translate(0, -60); hold(ctx); });
  });
}
