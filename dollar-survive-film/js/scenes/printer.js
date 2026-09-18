// SET E — a physical receipt printer. The tape is an object that unrolls,
// curls, and piles on the floor. Line items are printed ON it, not floated.
import { W, H, lerp, span, ease, clamp, rng, text, poly, circle, line, fillRR, strokeRR,
         measure, contactShadow, clipRR, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, GREEN, RED, GOLD, BLUE, shade, alpha, mix } from '../palette.js';

export function draw(ctx, t, cut) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = INK_2; ctx.fillRect(0, H * 0.78, W, H * 0.22);

  const px = W / 2, py = H * 0.13;
  const rows = cut.rows ?? [];
  const rowH = 66;
  const feed = ease.out(span(t, cut.feedFrom ?? 0.1, cut.feedTo ?? (cut.dur * 0.82)));
  const outLen = feed * (rows.length * rowH + 60);

  // the tape, hanging out of the machine and curling at the bottom
  const tapeW = 620;
  ctx.save();
  ctx.translate(px, py + 74);
  ctx.beginPath();
  ctx.moveTo(-tapeW / 2, 0);
  ctx.lineTo(tapeW / 2, 0);
  const curl = Math.max(0, outLen - (H * 0.60));
  ctx.lineTo(tapeW / 2 + curl * 0.18, Math.min(outLen, H * 0.60));
  ctx.lineTo(-tapeW / 2 + curl * 0.18, Math.min(outLen, H * 0.60));
  ctx.closePath();
  ctx.fillStyle = mix(PAPER, INK, 0.08); ctx.fill();
  // printed line items
  ctx.save();
  ctx.clip();
  for (let i = 0; i < rows.length; i++) {
    const y = 46 + i * rowH;
    if (y > outLen) break;
    const col = rows[i][1].startsWith('+') ? mix(GREEN, INK, 0.45) : mix(RED, INK, 0.25);
    text(ctx, rows[i][0], -tapeW / 2 + 38, y, { size: 30, fill: mix(INK, PAPER, 0.15), font: MONO, weight: 500 });
    text(ctx, rows[i][1], tapeW / 2 - 38, y, { size: 30, fill: col, font: MONO, weight: 700, align: 'right' });
    ctx.fillStyle = alpha(INK, 0.10);
    ctx.fillRect(-tapeW / 2 + 38, y + 16, tapeW - 76, 1);
  }
  ctx.restore();
  ctx.restore();

  // the printer body, on top, with a feed roller that turns while printing
  fillRR(ctx, px - 420, py - 90, 840, 172, 16, mix(PAPER_3, INK, 0.58));
  strokeRR(ctx, px - 420, py - 90, 840, 172, 16, alpha(PAPER, 0.16), 3);
  fillRR(ctx, px - 320, py + 46, 640, 28, 6, '#04060A');
  const spin = feed * 26;
  for (const rx of [px - 340, px + 340]) {
    circle(ctx, rx, py - 8, 36, mix(PAPER_3, INK, 0.35));
    line(ctx, rx, py - 8, rx + Math.cos(spin) * 28, py - 8 + Math.sin(spin) * 28, alpha(PAPER, 0.5), 5);
  }
  const lit = (t * 3) % 1 < 0.5 && feed < 1;
  circle(ctx, px + 340, py - 62, 10, lit ? GREEN : alpha(PAPER, 0.2));

  if (cut.plate) {
    const wdt = measure(ctx, cut.plate, 24, UI, 700) + 48;
    fillRR(ctx, 60, H - 96, wdt, 46, 8, INK_3);
    text(ctx, cut.plate, 60 + wdt / 2, H - 64, { size: 24, fill: alpha(PAPER, 0.65), align: 'center', font: UI, weight: 700, track: 3 });
  }
}
