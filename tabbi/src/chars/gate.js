// GATE — the CAPTCHA checkpoint guard. Deadpan, literal, immovable.
// Silhouette: a tall dark slab with a peaked cap. Nothing about him is round.
import { C } from '../core/palette.js';
import { S, rr, circ, ell, line, poly, shadow, noShadow, groundShadow, text } from '../core/draw.js';
import { clamp, lerp, TAU, D2R, sinw, sin01 } from '../core/util.js';

export const GATE_H = 330;

/**
 * mood: 'neutral' | 'deny' | 'approve' | 'scan'  → drives the visor colour,
 * which is the only thing on him that ever changes.
 */
export function drawGate(ctx, o = {}) {
  const {
    x = 0, y = 0, s = 1, flip = 1, mood = 'neutral', look = 0, lean = 0,
    armL = 8, armR = 8, clip: hasClip = true, talk = 0, visorK = 1,
    scanBeam = 0, bob = 0, shadowA = .2, tilt = 0,
  } = o;
  const visor = mood === 'deny' ? C.red : mood === 'approve' ? C.mint : mood === 'scan' ? C.mint : C.mintMid;
  S(ctx, () => {
    ctx.translate(x, y); ctx.scale(s * flip, s); ctx.rotate(tilt * D2R);
    if (shadowA > 0) groundShadow(ctx, 0, 0, 78, shadowA);
    ctx.translate(0, bob);
    // legs — two short dark posts
    rr(ctx, -44, -66, 30, 68, 12, '#33333F', C.ink, 5);
    rr(ctx, 14, -66, 30, 68, 12, '#33333F', C.ink, 5);
    rr(ctx, -52, -14, 46, 18, 9, C.ink);
    rr(ctx, 8, -14, 46, 18, 9, C.ink);

    S(ctx, () => {
      ctx.rotate(lean * D2R);
      // torso: a slab
      shadow(ctx, 24, 10, 'rgba(32,32,39,.28)');
      rr(ctx, -66, -250, 132, 192, 16, '#3C3C4A', C.ink, 6);
      noShadow(ctx);
      // uniform placket + belt
      line(ctx, 0, -244, 0, -70, 'rgba(245,245,247,.22)', 4);
      line(ctx, -66, -250, -66, -58, 'rgba(245,245,247,.30)', 5);
      rr(ctx, -66, -112, 132, 22, 5, C.ink);
      rr(ctx, 4, -226, 56, 22, 4, C.white);
      text(ctx, 'GATE', 32, -215, { size: 15, weight: 800, color: C.ink, letter: 1.5 });
      rr(ctx, -14, -112, 28, 22, 5, C.mintDeep);
      // epaulettes — wider than the body, so he reads as authority
      rr(ctx, -86, -252, 46, 22, 9, C.ink);
      rr(ctx, 40, -252, 46, 22, 9, C.ink);
      // badge: a checkbox, because that is his whole jurisdiction
      rr(ctx, -52, -226, 34, 34, 8, C.white, C.ink, 5);
      S(ctx, () => {
        ctx.strokeStyle = C.mint; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(-46, -210); ctx.lineTo(-38, -201); ctx.lineTo(-24, -219); ctx.stroke();
      });

      // head block
      const hy = -250;
      rr(ctx, -58, hy - 92, 116, 96, 14, '#3C3C4A', C.ink, 6);
      // visor band
      rr(ctx, -58, hy - 66, 116, 40, 8, C.ink);
      S(ctx, () => {
        ctx.globalAlpha = clamp(visorK);
        const ex = look * 16;
        rr(ctx, -34 + ex, hy - 57, 22, 22, 5, visor);
        rr(ctx, 12 + ex, hy - 57, 22, 22, 5, visor);
        if (mood === 'scan') { ctx.globalAlpha = .35 * clamp(visorK); rr(ctx, -56, hy - 56, 112, 20, 6, visor); }
      });
      // speaker grille instead of a mouth: he does not emote, he transmits
      S(ctx, () => {
        const n = 4;
        for (let i = 0; i < n; i++) {
          const a = .32 + (talk > 0 ? sin01(talk * 9 + i * .3) * .55 : 0);
          ctx.globalAlpha = a;
          rr(ctx, -26 + i * 15, hy - 18, 9, 10 + (talk > 0 ? sin01(talk * 11 + i) * 6 : 0), 3, C.white35);
        }
      });
      // peaked cap
      rr(ctx, -64, hy - 122, 128, 36, [12, 12, 4, 4], '#26262F');
      rr(ctx, -74, hy - 92, 148, 14, 7, C.ink);
      rr(ctx, -20, hy - 116, 40, 14, 4, C.mintDeep);

      // arms
      S(ctx, () => {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 15;
        const a1 = armR * D2R;
        ctx.beginPath(); ctx.moveTo(60, -226);
        ctx.lineTo(60 + Math.sin(a1) * 46, -226 + Math.cos(a1) * 46);
        ctx.lineTo(60 + Math.sin(a1) * 46 + Math.sin(a1 + .9) * 40, -226 + Math.cos(a1) * 46 + Math.cos(a1 + .9) * 40);
        ctx.stroke();
        const a2 = -armL * D2R;
        ctx.beginPath(); ctx.moveTo(-60, -226);
        ctx.lineTo(-60 + Math.sin(a2) * 46, -226 + Math.cos(a2) * 46);
        ctx.lineTo(-60 + Math.sin(a2) * 46 + Math.sin(a2 - .9) * 40, -226 + Math.cos(a2) * 46 + Math.cos(a2 - .9) * 40);
        ctx.stroke();
      });
      if (hasClip) {
        S(ctx, () => {
          ctx.translate(-104, -128); ctx.rotate(-.22);
          rr(ctx, -30, -40, 60, 78, 6, C.gray, C.ink, 5);
          rr(ctx, -14, -46, 28, 12, 4, C.ink);
          for (let i = 0; i < 4; i++) line(ctx, -20, -22 + i * 16, 20, -22 + i * 16, 'rgba(32,32,39,.35)', 4);
        });
      }
    });
    if (scanBeam > 0) S(ctx, () => {
      ctx.globalAlpha = scanBeam * .5;
      poly(ctx, [[62, -300], [78, -292], [420, -160], [420, -30]], C.mint);
    });
  });
}
