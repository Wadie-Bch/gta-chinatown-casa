// RETAIN — a retention specialist. Wide, soft, low, and sincerely delighted
// that you are thinking of leaving, because now he gets to help.
// Silhouette: a hug. Nothing about him is tall or sharp.
import { C } from '../core/palette.js';
import { S, rr, circ, ell, line, poly, shadow, noShadow, groundShadow, text } from '../core/draw.js';
import { clamp, lerp, TAU, D2R, sinw, sin01 } from '../core/util.js';

export const RETAIN_H = 230;
const SHELL = '#BFD9CB', SHELL_D = '#A6C5B5';

/** face: 'warm' | 'delighted' | 'listening' | 'sorry' | 'hopeful' */
export function drawRetain(ctx, o = {}) {
  const {
    x = 0, y = 0, s = 1, flip = 1, t = 0, face = 'warm', talk = 0,
    arms = 0,            // 0 = folded, 1 = wide open hug
    lean = 0, look = 0, bob = 1, shadowA = .18, tilt = 0, glow = 0,
  } = o;
  const by = Math.sin(t * 1.5) * 3 * bob;
  S(ctx, () => {
    ctx.translate(x, y); ctx.scale(s * flip, s); ctx.rotate(tilt * D2R);
    if (shadowA > 0) groundShadow(ctx, 0, 0, 132, shadowA);
    ctx.translate(0, by);
    if (glow > 0) S(ctx, () => { ctx.globalAlpha = glow * .5; ell(ctx, 0, -110, 240, 150, 0, 'rgba(24,133,103,.16)'); });

    // the stool he never gets up from
    rr(ctx, -52, -44, 104, 44, 16, C.gray, C.ink, 5);
    circ(ctx, -40, -6, 13, C.ink); circ(ctx, 40, -6, 13, C.ink);

    S(ctx, () => {
      ctx.rotate(lean * D2R);
      // arms: they open, and they keep opening
      const a = clamp(arms);
      S(ctx, () => {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (const sgn of [-1, 1]) {
          const a1 = lerp(38, 104, a) * sgn, a2 = lerp(26, 52, a) * sgn;
          const sx = sgn * 118, sy = -150;
          const r1 = a1 * D2R, r2 = (a1 + a2) * D2R;
          const ex = sx + Math.sin(r1) * 74, ey = sy + Math.cos(r1) * 74;
          const hx = ex + Math.sin(r2) * 62, hy = ey + Math.cos(r2) * 62;
          ctx.strokeStyle = C.ink; ctx.lineWidth = 26;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
          ctx.strokeStyle = SHELL; ctx.lineWidth = 17;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
          circ(ctx, hx, hy, 19, SHELL, C.ink, 5);
        }
      });

      // body: a wide, low dome
      shadow(ctx, 30, 14, 'rgba(32,32,39,.16)');
      ctx.beginPath();
      ctx.moveTo(-150, -34);
      ctx.quadraticCurveTo(-150, -216, 0, -216);
      ctx.quadraticCurveTo(150, -216, 150, -34);
      ctx.quadraticCurveTo(150, -6, 118, -6);
      ctx.lineTo(-118, -6);
      ctx.quadraticCurveTo(-150, -6, -150, -34);
      ctx.closePath();
      ctx.fillStyle = SHELL; ctx.fill(); noShadow(ctx);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 6.5; ctx.lineJoin = 'round'; ctx.stroke();
      // a soft belt, because a low shape needs a waist
      S(ctx, () => {
        ctx.save(); ctx.beginPath();
        ctx.moveTo(-150, -34); ctx.quadraticCurveTo(-150, -216, 0, -216);
        ctx.quadraticCurveTo(150, -216, 150, -34); ctx.quadraticCurveTo(150, -6, 118, -6);
        ctx.lineTo(-118, -6); ctx.quadraticCurveTo(-150, -6, -150, -34); ctx.closePath(); ctx.clip();
        rr(ctx, -160, -74, 320, 26, 0, SHELL_D);
        ctx.restore();
      });
      // a tie, the one sharp thing, and it is soft anyway
      poly(ctx, [[0, -128], [16, -110], [10, -62], [-10, -62], [-16, -110]], C.cheese, C.ink, 5);
      rr(ctx, -13, -140, 26, 18, 6, C.cheese, C.ink, 5);

      // name badge — un-mirror it so the text reads when he faces left
      S(ctx, () => {
        ctx.translate(-92, -96); ctx.scale(flip, 1);
        rr(ctx, -40, -18, 80, 36, 8, C.white, C.ink, 4);
        text(ctx, 'RETAIN', 0, -6, { size: 14, weight: 800, color: C.ink, letter: 1 });
        text(ctx, 'here to help', 0, 8, { size: 9, weight: 700, color: 'rgba(32,32,39,.55)' });
      });

      // face
      const ex = look * 12;
      S(ctx, () => {
        ctx.translate(ex, -156);
        const shut = face === 'delighted' || face === 'warm';
        for (const sgn of [-1, 1]) {
          const cx = sgn * 42;
          if (shut) {
            ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.arc(cx, 4, 17, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke();
          } else if (face === 'sorry') {
            ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.arc(cx, 16, 17, Math.PI * .18, Math.PI * .82); ctx.stroke();
          } else {
            ell(ctx, cx, 0, 15, 17, 0, C.ink);
            circ(ctx, cx - 4, -5, 5, C.white);
          }
        }
        // the smile that never moves
        const open = talk > 0 ? sin01(talk * 7) * 13 : 0;
        ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.lineCap = 'round';
        if (open > 2) { ell(ctx, 0, 48, 24, 10 + open, 0, C.ink); ell(ctx, 0, 52 + open * .4, 12, 4, 0, C.red); }
        else { ctx.beginPath(); ctx.arc(0, 34, 30, Math.PI * .17, Math.PI * .83); ctx.stroke(); }
        S(ctx, () => { ctx.globalAlpha = .45; ell(ctx, -74, 30, 18, 10, 0, C.red); ell(ctx, 74, 30, 18, 10, 0, C.red); });
      });

      // headset — he is, technically, support
      S(ctx, () => {
        ctx.strokeStyle = C.ink; ctx.lineWidth = 9; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(0, -196, 92, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
        rr(ctx, -112, -206, 26, 46, 11, C.ink);
        rr(ctx, 86, -206, 26, 46, 11, C.ink);
        ctx.beginPath(); ctx.moveTo(92, -170); ctx.quadraticCurveTo(112, -138, 62, -122); ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.stroke();
        circ(ctx, 62, -122, 10, C.ink);
        circ(ctx, -99, -184, 6, talk > 0 ? C.mint : 'rgba(245,245,247,.5)');
      });
    });
  });
}
