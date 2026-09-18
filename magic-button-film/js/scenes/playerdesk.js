// SET H — a player's desk. Nobody is standing behind them.
import { W, H, lerp, span, ease, clamp, rng, text, poly, circle, line, fillRR, strokeRR,
         contactShadow, clipRR, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, LIME, BLUE, CORAL, TEAL, YELLOW, WHITE, shade, alpha, mix } from '../palette.js';

export function draw(ctx, t, cut) {
  if (cut.close) {
    // tighter framing on the same desk: the screen and the hand, nothing else
    ctx.save();
    ctx.translate(W / 2, H * 0.62);
    ctx.scale(1.72, 1.72);
    ctx.translate(-W * 0.44, -H * 0.55);
    drawRoom(ctx, t, cut);
    ctx.restore();
    return;
  }
  drawRoom(ctx, t, cut);
}

function drawRoom(ctx, t, cut) {
  // a room, side on
  ctx.fillStyle = mix(PAPER_3, INK, 0.72); ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = mix(PAPER_3, INK, 0.80); ctx.fillRect(0, H * 0.74, W, H * 0.26);
  ctx.fillStyle = alpha(INK, 0.5); ctx.fillRect(0, H * 0.735, W, 5);

  // desk
  const deskY = H * 0.66;
  ctx.fillStyle = mix(PAPER_2, '#8C6838', 0.38);
  ctx.fillRect(W * 0.14, deskY, W * 0.60, 30);
  ctx.fillStyle = mix(PAPER_2, '#5A3F20', 0.6);
  ctx.fillRect(W * 0.14, deskY + 30, W * 0.60, 10);
  ctx.fillStyle = mix(PAPER_2, '#6B4F2A', 0.55);
  ctx.fillRect(W * 0.18, deskY + 40, 26, H * 0.735 - deskY - 40);
  ctx.fillRect(W * 0.70, deskY + 40, 26, H * 0.735 - deskY - 40);

  // monitor with the game actually playing
  const mw = 520, mh = 310, mx = W * 0.30, my = deskY - mh - 26;
  contactShadow(ctx, mx + mw / 2, deskY + 6, 200, 14, 0.4);
  fillRR(ctx, mx - 10, my - 10, mw + 20, mh + 20, 12, INK_3);
  fillRR(ctx, mx, my, mw, mh, 6, INK);
  ctx.save();
  clipRR(ctx, mx, my, mw, mh, 6, () => {
    ctx.fillStyle = mix(BLUE, INK, 0.65); ctx.fillRect(mx, my, mw, mh);
    ctx.fillStyle = PAPER_3; ctx.fillRect(mx, my + mh * 0.66, mw, mh * 0.34);
    const px = ((t * 120) % (mw + 80)) - 40;
    ctx.fillStyle = TEAL; ctx.fillRect(mx + px, my + mh * 0.66 - 44, 24, 44);
    ctx.fillStyle = YELLOW; ctx.fillRect(mx + mw * 0.62, my + mh * 0.66 - 26, 24, 24);
    ctx.fillStyle = WHITE; ctx.fillRect(mx + mw * 0.80, my + mh * 0.66 - 40, 60, 40);
    // lose -> press retry -> lose again, in one continuous shot
    const failed = cut.failAt != null && t > cut.failAt;
    const retried = cut.retryAt != null && t > cut.retryAt;
    const failedAgain = cut.refailAt != null && t > cut.refailAt;
    if ((failed && !retried) || failedAgain) {
      ctx.fillStyle = alpha(INK, 0.60); ctx.fillRect(mx, my, mw, mh);
      ctx.fillStyle = CORAL; ctx.fillRect(mx, my + mh / 2 - 44, mw, 88);
      text(ctx, failedAgain ? 'SAME RUN' : 'RETRY?', mx + mw / 2, my + mh / 2 + 16, {
        size: 52, fill: INK, align: 'center', track: 4 });
    }
  });
  ctx.restore();
  fillRR(ctx, mx + mw / 2 - 40, deskY - 26, 80, 26, 4, INK_3);

  // chair back, so the desk reads as a place somebody sits
  ctx.fillStyle = mix(INK_2, INK, 0.3);
  fillRR(ctx, W * 0.50 - 150, deskY + 150, 300, 200, 18, mix(INK_2, INK, 0.35));

  // the player, seen from behind — a silhouette, deliberately unremarkable
  ctx.save();
  ctx.translate(W * 0.50, deskY + 10);
  const breathe = Math.sin(t * 1.1) * 4;
  ctx.fillStyle = INK_2;
  ctx.beginPath();
  ctx.moveTo(-130, 320);
  ctx.quadraticCurveTo(-128, 60 + breathe, -62, 24 + breathe);
  ctx.lineTo(62, 24 + breathe);
  ctx.quadraticCurveTo(128, 60 + breathe, 130, 320);
  ctx.closePath(); ctx.fill();
  circle(ctx, 0, -46 + breathe, 66, INK_2);
  ctx.restore();

  // their hand reaching for the key, when the shot calls for it
  if (cut.retryAt != null) {
    const rk = span(t, cut.retryAt - 0.35, cut.retryAt);
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.translate(W * 0.585, deskY - 8 - (1 - rk) * 26);
    fillRR(ctx, -26, -14, 90, 28, 14, mix(PAPER_2, '#C98F6A', 0.5));
    ctx.restore();
  }

  // the empty space behind them, pointed at once
  if (cut.emptyAt != null) {
    const k = ease.out(span(t, cut.emptyAt, cut.emptyAt + 0.5));
    if (k > 0) {
      ctx.save();
      ctx.globalAlpha = k;
      ctx.setLineDash([14, 10]);
      strokeRR(ctx, W * 0.74, H * 0.30, 330, 420, 16, alpha(CORAL, 0.9), 4);
      ctx.setLineDash([]);
      text(ctx, cut.label ?? 'NO DEVELOPER', W * 0.74 + 165, H * 0.30 - 26, {
        size: 34, fill: CORAL, align: 'center', track: 3, font: UI, weight: 700,
      });
      ctx.restore();
    }
  }
}
