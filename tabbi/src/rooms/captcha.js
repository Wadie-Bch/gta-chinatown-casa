// The challenge itself: nine tiles, one bureaucracy.
import { C, f } from '../core/palette.js';
import { S, rr, rrPath, circ, ell, line, poly, text, shadow, noShadow } from '../core/draw.js';
import { clamp, lerp, p01, E, hash, TAU } from '../core/util.js';

/** a traffic light, drawn small enough to be annoying */
export function trafficLight(ctx, x, y, s, lit = 0) {
  S(ctx, () => {
    ctx.translate(x, y); ctx.scale(s, s);
    rr(ctx, -16, -42, 32, 84, 10, C.nightUp, C.ink, 4);
    line(ctx, 0, 42, 0, 78, C.ink, 7);
    const cols = [C.red, C.cheese, C.mint];
    for (let i = 0; i < 3; i++) circ(ctx, 0, -26 + i * 26, 9, lit === i ? cols[i] : 'rgba(245,245,247,.18)');
  });
}
/** the nine-tile challenge */
export function grid9(ctx, x, y, cell, o = {}) {
  const sel = o.sel || [], k = clamp(o.k ?? 1), gap = 12;
  const size = cell * 3 + gap * 2;
  S(ctx, () => {
    ctx.translate(x, y); ctx.scale(lerp(.86, 1, E.outBack(k)), lerp(.86, 1, E.outBack(k))); ctx.globalAlpha = clamp(k * 1.5);
    shadow(ctx, 36, 16, 'rgba(0,0,0,.45)');
    rr(ctx, -size / 2 - 26, -size / 2 - 96, size + 52, size + 128, 22, C.cream, C.ink, 5); noShadow(ctx);
    text(ctx, o.prompt || 'SELECT ALL TRAFFIC LIGHTS', 0, -size / 2 - 56, { size: 25, weight: 800, color: C.ink, letter: 1.4, maxW: size + 20 });
    for (let i = 0; i < 9; i++) {
      const cx = -size / 2 + (i % 3) * (cell + gap) + cell / 2;
      const cy = -size / 2 + Math.floor(i / 3) * (cell + gap) + cell / 2;
      S(ctx, () => {
        rrPath(ctx, cx - cell / 2, cy - cell / 2, cell, cell, 10); ctx.save(); ctx.clip();
        ctx.fillStyle = ['#D8DCE0', '#C8CED4', '#DFE3E6'][i % 3]; ctx.fillRect(cx - cell / 2, cy - cell / 2, cell, cell);
        // a street, sort of
        rr(ctx, cx - cell / 2, cy + cell * .18, cell, cell * .34, 0, '#B9BFC6');
        S(ctx, () => { ctx.globalAlpha = .5; rr(ctx, cx - cell / 2 + hash(i) * cell * .2, cy - cell * .5, cell * .3, cell * .7, 4, '#AEB5BD'); });
        trafficLight(ctx, cx + (hash(i + 3) - .5) * cell * .4, cy - cell * .04, cell / 150, i % 3);
        ctx.restore();
      });
      rr(ctx, cx - cell / 2, cy - cell / 2, cell, cell, 10, null, 'rgba(32,32,39,.25)', 3);
      const s = sel.indexOf(i);
      if (s >= 0) {
        const sk = clamp(o.selK ? o.selK[s] : 1);
        S(ctx, () => {
          ctx.globalAlpha = sk;
          rr(ctx, cx - cell / 2, cy - cell / 2, cell, cell, 10, 'rgba(24,133,103,.30)', C.mint, 6);
          circ(ctx, cx + cell / 2 - 22, cy - cell / 2 + 22, 15 * sk, C.mint);
          S(ctx, () => {
            ctx.strokeStyle = C.white; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); ctx.moveTo(cx + cell / 2 - 28, cy - cell / 2 + 22); ctx.lineTo(cx + cell / 2 - 23, cy - cell / 2 + 27); ctx.lineTo(cx + cell / 2 - 15, cy - cell / 2 + 16); ctx.stroke();
          });
        });
      }
    }
    if (o.verdict) {
      S(ctx, () => {
        ctx.globalAlpha = clamp(o.verdictK ?? 1);
        const good = o.verdict === 'ok';
        rr(ctx, -size / 2 - 26, size / 2 + 8, size + 52, 56, [0, 0, 22, 22], good ? C.mint : C.red);
        text(ctx, o.verdictText || (good ? 'CORRECT' : 'INCORRECT'), 0, size / 2 + 36, { size: 28, weight: 800, color: C.white, letter: 4 });
      });
    }
  });
}
