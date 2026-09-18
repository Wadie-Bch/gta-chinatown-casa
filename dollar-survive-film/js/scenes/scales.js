// SET C — a literal pair of balance scales. "The balance" as a physical object:
// coins in one pan, costs in the other, and the beam actually tips.
import { W, H, lerp, span, ease, clamp, rng, text, poly, circle, line, fillRR, strokeRR,
         measure, contactShadow, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, GREEN, RED, GOLD, BLUE, shade, alpha, mix } from '../palette.js';

function pan(ctx, x, y, r, coins, col) {
  // dish
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - r, y);
  ctx.quadraticCurveTo(x, y + r * 0.62, x + r, y);
  ctx.closePath();
  ctx.fillStyle = mix(PAPER_3, INK, 0.45); ctx.fill();
  ctx.strokeStyle = alpha(PAPER, 0.35); ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
  // stacked coins sitting in it
  const n = Math.min(coins, 26);
  const r2 = rng(99 + Math.round(x));
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 6), col2 = i % 6;
    const cx = x - 62 + col2 * 25 + row * 11 + (r2() - 0.5) * 3;
    const cy = y - 8 - row * 11;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.42);
    circle(ctx, 0, 0, 15, col);
    circle(ctx, 0, 0, 15, null, alpha(INK, 0.5), 2);
    ctx.restore();
  }
}

export function draw(ctx, t, cut) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = INK_2; ctx.fillRect(0, H * 0.80, W, H * 0.20);

  const cx = W / 2, top = H * 0.26;
  // tilt: -1 = costs win (right pan down), +1 = coins win
  const k = ease.inOut(span(t, cut.tipFrom ?? 0.25, cut.tipTo ?? (cut.dur * 0.8)));
  const tilt = lerp(cut.tiltFrom ?? 0, cut.tiltTo ?? -0.34, k);

  // column + base
  ctx.fillStyle = mix(PAPER_3, INK, 0.55);
  ctx.fillRect(cx - 16, top, 32, H * 0.50);
  poly(ctx, [[cx - 150, H * 0.80], [cx + 150, H * 0.80], [cx + 110, H * 0.76], [cx - 110, H * 0.76]], mix(PAPER_3, INK, 0.45));

  // beam
  const armLen = 330;
  const lx = cx - Math.cos(tilt) * armLen, ly = top - Math.sin(tilt) * armLen * -1;
  const rx = cx + Math.cos(tilt) * armLen, ry = top + Math.sin(tilt) * armLen * -1;
  line(ctx, lx, ly, rx, ry, mix(PAPER_3, INK, 0.25), 12);
  circle(ctx, cx, top, 18, mix(PAPER_2, INK, 0.3));

  // hangers + pans
  const drop = 150;
  line(ctx, lx, ly, lx, ly + drop, alpha(PAPER, 0.45), 3);
  line(ctx, rx, ry, rx, ry + drop, alpha(PAPER, 0.45), 3);
  pan(ctx, lx, ly + drop, 110, cut.leftCoins ?? 0, GOLD);
  pan(ctx, rx, ry + drop, 110, cut.rightCoins ?? 0, cut.rightCol === 'red' ? RED : GOLD);

  // engraved labels on the base — physical signage, not floating captions
  if (cut.leftLabel) text(ctx, cut.leftLabel, lx, ly + drop + 92, { size: 24, fill: alpha(PAPER, 0.5), align: 'center', font: UI, weight: 700, track: 3 });
  if (cut.rightLabel) text(ctx, cut.rightLabel, rx, ry + drop + 92, { size: 24, fill: alpha(PAPER, 0.5), align: 'center', font: UI, weight: 700, track: 3 });
  if (cut.plate) {
    const wdt = measure(ctx, cut.plate, 26, UI, 700) + 54;
    fillRR(ctx, cx - wdt / 2, H * 0.83, wdt, 52, 8, INK_3);
    text(ctx, cut.plate, cx, H * 0.83 + 35, { size: 26, fill: alpha(PAPER, 0.7), align: 'center', font: UI, weight: 700, track: 3 });
  }
}
