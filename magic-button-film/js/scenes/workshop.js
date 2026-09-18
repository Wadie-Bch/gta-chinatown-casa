// SET G — a miniature workshop where the hidden repair work happens, and the
// magician's cloth that comes away to show a human hand doing it.
import { W, H, lerp, span, ease, clamp, rng, text, poly, circle, line, fillRR, strokeRR,
         contactShadow, clipRR, measure, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, LIME, BLUE, CORAL, TEAL, YELLOW, WHITE, shade, alpha, mix } from '../palette.js';

export function draw(ctx, t, cut) {
  if (cut.view === 'cloth') return drawCloth(ctx, t, cut);
  return drawWorkshop(ctx, t, cut);
}

/** A small lit workbench with the game's guts open, tools moving. */
function drawWorkshop(ctx, t, cut) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = mix(PAPER_3, INK, 0.62); ctx.fillRect(0, H * 0.60, W, H * 0.40);
  ctx.fillStyle = alpha(INK, 0.55); ctx.fillRect(0, H * 0.60, W, 5);

  // one work light, as an object with a visible cone
  ctx.save();
  ctx.globalAlpha = 0.16;
  poly(ctx, [[W * 0.30, 130], [W * 0.42, 130], [W * 0.78, H], [W * 0.05, H]], LIME);
  ctx.restore();
  ctx.fillStyle = INK_3; ctx.fillRect(W * 0.355 - 8, 0, 16, 110);
  poly(ctx, [[W * 0.30, 130], [W * 0.42, 130], [W * 0.405, 92], [W * 0.315, 92]], INK_3, alpha(PAPER, 0.2), 3);
  circle(ctx, W * 0.36, 128, 16, LIME);

  // the opened-up game on the bench
  const cx = W * 0.44, cy = H * 0.63;
  contactShadow(ctx, cx, cy + 120, 300, 26, 0.4);
  ctx.save();
  ctx.translate(cx, cy);
  fillRR(ctx, -310, -180, 620, 300, 16, INK_2);
  strokeRR(ctx, -310, -180, 620, 300, 16, alpha(PAPER, 0.18), 3);
  // internals: boards and wires that visibly get worked on
  const r = rng(8821);
  for (let i = 0; i < 6; i++) {
    const bx = -270 + i * 96, by = -140 + (i % 2) * 120;
    fillRR(ctx, bx, by, 82, 82, 6, i === 3 ? CORAL : INK_3);
    for (let j = 0; j < 4; j++) ctx.fillRect(bx + 10 + j * 18, by + 10, 10, 10);
    ctx.fillStyle = alpha(LIME, 0.65);
  }
  for (let i = 0; i < 5; i++) {
    const y0 = -120 + i * 44;
    ctx.beginPath();
    ctx.moveTo(-280, y0);
    ctx.quadraticCurveTo(0, y0 + Math.sin(t * 1.2 + i) * 18, 280, y0 + 20);
    ctx.strokeStyle = [LIME, BLUE, CORAL, PAPER_3, TEAL][i]; ctx.lineWidth = 5; ctx.stroke();
  }
  ctx.restore();

  // a hand with a soldering iron, working in small repeated motions
  const workK = span(t, 0.2, cut.dur);
  ctx.save();
  ctx.translate(W * 0.70 + Math.sin(t * 2.4) * 14, H * 0.42 + Math.cos(t * 3.1) * 10);
  ctx.rotate(0.5 + Math.sin(t * 2.4) * 0.05);
  fillRR(ctx, -22, -40, 44, 300, 20, mix(PAPER_2, '#C98F6A', 0.5));
  ctx.restore();
  ctx.save();
  ctx.translate(W * 0.62 + Math.sin(t * 2.4) * 18, H * 0.50 + Math.cos(t * 3.1) * 12);
  ctx.rotate(-0.85 + Math.sin(t * 2.4) * 0.06);
  fillRR(ctx, -14, -190, 28, 230, 12, INK_3);
  fillRR(ctx, -7, -250, 14, 66, 6, PAPER_3);
  ctx.restore();
  // sparks land where the iron touches — brief, not ambient
  if (((t * 2.4) % 1) > 0.78) {
    const sr = rng(Math.floor(t * 2.4) * 97 + 3);
    for (let i = 0; i < 6; i++) {
      const a = sr() * Math.PI * 2, d = sr() * 50;
      circle(ctx, W * 0.60 + Math.cos(a) * d, H * 0.44 + Math.sin(a) * d, 3, LIME);
    }
  }
  if (cut.label) {
    text(ctx, cut.label, W / 2, H - 152, { size: 44, fill: PAPER, align: 'center', track: 6,
      alpha: ease.out(span(t, 0.8, 1.4)) });
  }
}

/** The cloth comes away: underneath, a human hand is holding the thing up. */
function drawCloth(ctx, t, cut) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = INK_2; ctx.fillRect(0, H * 0.72, W, H * 0.28);

  const cx = W / 2, cy = H * 0.46;
  const pull = ease.inOut(span(t, cut.pullAt ?? 0.7, (cut.pullAt ?? 0.7) + 1.25));

  // the arm comes up from below and behind, revealed as the cloth leaves
  if (pull > 0.2) {
    ctx.save();
    ctx.globalAlpha = clamp((pull - 0.2) / 0.3, 0, 1);
    ctx.translate(cx + 20, cy + 200);
    ctx.rotate(-0.1);
    fillRR(ctx, -66, 0, 132, 520, 50, mix(PAPER_2, '#C98F6A', 0.5));
    fillRR(ctx, -66, 0, 132, 520, 50, mix(PAPER_2, '#C98F6A', 0.5));
    ctx.restore();
  }

  // the thing being held up: a small running game
  fillRR(ctx, cx - 250, cy - 150, 500, 300, 14, INK_3);
  ctx.save();
  clipRR(ctx, cx - 250, cy - 150, 500, 300, 14, () => {
    ctx.fillStyle = mix(BLUE, INK, 0.6); ctx.fillRect(cx - 250, cy - 150, 500, 300);
    ctx.fillStyle = PAPER_3; ctx.fillRect(cx - 250, cy + 60, 500, 90);
    const rx = ((t * 110) % 440) - 220;
    ctx.fillStyle = TEAL; ctx.fillRect(cx + rx, cy + 10, 30, 52);
    ctx.fillStyle = YELLOW; ctx.fillRect(cx + 120, cy + 26, 30, 30);
  });
  ctx.restore();
  // fingers curling over the front edge — the giveaway
  if (pull > 0.2) {
    ctx.save();
    ctx.globalAlpha = clamp((pull - 0.2) / 0.3, 0, 1);
    ctx.translate(cx + 20, cy + 150);
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(-78 + i * 52, -6);
      ctx.rotate((i - 1.5) * 0.10);
      fillRR(ctx, -22, -88, 44, 116, 22, mix(PAPER_2, '#D6A079', 0.45));
      ctx.strokeStyle = alpha(INK, 0.25); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-14, -34); ctx.lineTo(14, -34); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
  // the cloth itself, sliding off to the right with a wave in it
  if (pull < 1) {
    ctx.save();
    const dx = pull * (W * 0.95);
    ctx.translate(dx, -pull * 70);
    ctx.beginPath();
    ctx.moveTo(cx - 330, cy - 230);
    for (let i = 0; i <= 24; i++) {
      const u = i / 24;
      ctx.lineTo(cx - 330 + u * 680, cy - 230 + Math.sin(u * 7 + t * 3) * 16 * (1 - pull));
    }
    ctx.lineTo(cx + 350, H * 0.92);
    for (let i = 24; i >= 0; i--) {
      const u = i / 24;
      ctx.lineTo(cx - 330 + u * 680, H * 0.92 + Math.sin(u * 5 + t * 2.4) * 26);
    }
    ctx.closePath();
    ctx.fillStyle = BLUE; ctx.fill();
    ctx.strokeStyle = shade(BLUE, -0.3); ctx.lineWidth = 4; ctx.stroke();
    // fold lines so it reads as fabric, not a blue rectangle
    for (let i = 1; i < 6; i++) {
      const x = cx - 330 + (i / 6) * 680;
      ctx.beginPath();
      ctx.moveTo(x, cy - 220);
      ctx.quadraticCurveTo(x + Math.sin(i + t) * 22, cy + 120, x + Math.sin(i * 2) * 14, H * 0.9);
      ctx.strokeStyle = alpha(shade(BLUE, -0.35), 0.8); ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.restore();
  }
  if (cut.label) {
    text(ctx, cut.label, W / 2, 120, { size: 46, fill: PAPER, align: 'center', track: 6,
      alpha: ease.out(span(t, (cut.pullAt ?? 0.7) + 0.7, (cut.pullAt ?? 0.7) + 1.2)) });
  }
}
