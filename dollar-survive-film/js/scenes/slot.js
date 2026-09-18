// SET D — macro on a coin slot. Every thought the agent has physically
// posts one coin into a machine. Chunky, mechanical, no typography.
import { W, H, lerp, span, ease, clamp, rng, text, poly, circle, line, fillRR, strokeRR,
         measure, contactShadow, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, GREEN, RED, GOLD, BLUE, shade, alpha, mix } from '../palette.js';

export function draw(ctx, t, cut) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);

  // the machine face: a big slab of brushed metal filling the frame
  const fy = -H * 0.08;
  fillRR(ctx, -W * 0.04, fy, W * 1.08, H * 1.02, 18, mix(PAPER_3, INK, 0.62));
  strokeRR(ctx, -W * 0.04, fy, W * 1.08, H * 1.02, 18, alpha(PAPER, 0.16), 3);
  // panel seams and rivets, so it reads as a built object
  for (let i = 0; i < 4; i++) {
    circle(ctx, W * 0.06 + (i % 2) * (W * 0.88), fy + 70 + Math.floor(i / 2) * (H * 0.82), 10, alpha(PAPER, 0.18));
  }

  // the slot itself
  const sx = W / 2, sy = H * 0.52, sw = 420, sh = 56;
  fillRR(ctx, sx - sw / 2 - 22, sy - sh / 2 - 22, sw + 44, sh + 44, 12, mix(PAPER_3, INK, 0.4));
  fillRR(ctx, sx - sw / 2, sy - sh / 2, sw, sh, 6, '#04060A');
  text(ctx, cut.slotLabel ?? 'INSERT 1', sx, sy + 116, { size: 32, fill: alpha(PAPER, 0.5), align: 'center', font: UI, weight: 700, track: 4 });

  // coins posted into it — each one falls, tips, and disappears into the dark
  for (const c of cut.coins ?? []) {
    const dt = t - c.t;
    if (dt < 0) continue;
    const fall = clamp(dt / 0.42, 0, 1);
    const y = lerp(-140, sy - 6, ease.in(fall));
    const swallow = clamp((dt - 0.42) / 0.22, 0, 1);
    ctx.save();
    ctx.translate(sx + (c.x ?? 0), y);
    // once it reaches the slot it turns edge-on and drops through
    ctx.scale(1, lerp(1, 0.06, swallow));
    ctx.globalAlpha = 1 - swallow * 0.2;
    circle(ctx, 0, 0, 72, GOLD);
    circle(ctx, 0, 0, 72, null, alpha(INK, 0.55), 5);
    circle(ctx, 0, 0, 44, alpha(INK, 0.18));
    ctx.restore();
    // the counter wheel clicks over as each coin lands
  }

  // a mechanical counter, physically mounted on the panel
  const counted = (cut.coins ?? []).filter(c => t - c.t > 0.5).length + (cut.counterBase ?? 0);
  const cxp = W * 0.79, cyp = H * 0.20;
  fillRR(ctx, cxp - 96, cyp - 44, 192, 88, 8, '#04060A');
  strokeRR(ctx, cxp - 96, cyp - 44, 192, 88, 8, alpha(PAPER, 0.25), 3);
  const digits = String(counted).padStart(3, '0');
  for (let i = 0; i < 3; i++) {
    text(ctx, digits[i], cxp - 56 + i * 56, cyp + 20, { size: 54, fill: GOLD, align: 'center', font: MONO, weight: 700 });
  }
}
