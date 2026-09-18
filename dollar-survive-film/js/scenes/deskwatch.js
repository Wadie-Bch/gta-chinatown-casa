// SET H — a human at a desk, watching, not intervening. Relatability beats.
import { W, H, lerp, span, ease, clamp, text, poly, circle, line, fillRR, strokeRR,
         measure, contactShadow, clipRR, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, GREEN, RED, GOLD, BLUE, shade, alpha, mix } from '../palette.js';

function person(ctx, x, y, { nod = 0 } = {}) {
  const breathe = Math.sin(y * 0 + nod * 6) * 3;
  ctx.save();
  ctx.translate(x, y + Math.sin(nod * 6) * 6);
  ctx.fillStyle = INK_3;
  ctx.beginPath();
  ctx.moveTo(-120, 280);
  ctx.quadraticCurveTo(-118, 50, -56, 18);
  ctx.lineTo(56, 18);
  ctx.quadraticCurveTo(118, 50, 120, 280);
  ctx.closePath(); ctx.fill();
  circle(ctx, 0, -40, 60, INK_3);
  ctx.restore();
}

export function draw(ctx, t, cut) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = INK_2; ctx.fillRect(0, H * 0.72, W, H * 0.28);

  const deskY = H * 0.64;
  fillRR(ctx, W * 0.20, deskY, W * 0.60, 20, 4, mix(INK_2, PAPER, 0.06));

  // a small monitor on the desk showing whatever this beat needs
  const mw = 460, mh = 280, mx = W * 0.5 - mw / 2, my = deskY - mh - 20;
  fillRR(ctx, mx - 8, my - 8, mw + 16, mh + 16, 10, INK_3);
  fillRR(ctx, mx, my, mw, mh, 4, INK);
  ctx.save();
  clipRR(ctx, mx, my, mw, mh, 4, () => {
    if (cut.screen === 'receipt') {
      ctx.fillStyle = INK; ctx.fillRect(mx, my, mw, mh);
      const items = cut.screenItems ?? [];
      let yy = my + 50;
      for (const it of items) {
        text(ctx, it[0], mx + 30, yy, { size: 20, fill: PAPER_2, font: MONO, weight: 500 });
        text(ctx, it[1], mx + mw - 30, yy, { size: 20, fill: it[1].startsWith('+') ? GREEN : RED, font: MONO, weight: 600, align: 'right' });
        yy += 36;
      }
    } else {
      ctx.fillStyle = INK; ctx.fillRect(mx, my, mw, mh);
      text(ctx, cut.screenText ?? '$0.06', mx + mw / 2, my + mh / 2 + 24, { size: 70, fill: RED, align: 'center', font: MONO, weight: 700 });
    }
  });
  ctx.restore();
  fillRR(ctx, mx + mw / 2 - 34, deskY - 20, 68, 20, 4, INK_3);

  person(ctx, W * 0.5, deskY + 14, { nod: t });

  if (cut.nodAt != null) {
    const nk = ease.out(span(t, cut.nodAt, cut.nodAt + 0.5));
    if (nk > 0) {
      ctx.save();
      ctx.globalAlpha = nk;
      text(ctx, cut.nodLabel ?? 'yeah, that tracks', W / 2, H - 110, { size: 28, fill: alpha(PAPER, 0.55), align: 'center', font: UI, weight: 500,
        maxWidth: W - 260 });
      ctx.restore();
    }
  }
}
