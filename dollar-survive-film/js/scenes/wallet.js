// SET A — the physical dollar. Macro object shots on a stark black surface.
import { W, H, lerp, span, ease, clamp, rng, text, poly, circle, line, fillRR, strokeRR,
         measure, contactShadow, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, GREEN, RED, GOLD, BLUE, shade, alpha, mix } from '../palette.js';

function surface(ctx) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = INK_2; ctx.fillRect(0, H * 0.74, W, H * 0.26);
}

/** A single stylised bill: a flat rounded rect, one bold "$1", a hairline border. */
function bill(ctx, cx, cy, w, h, rot = 0) {
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(rot);
  contactShadow(ctx, 0, h * 0.55, w * 0.6, 18, 0.5);
  fillRR(ctx, -w / 2, -h / 2, w, h, 10, mix(PAPER, GOLD, 0.06));
  strokeRR(ctx, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 4, alpha(GOLD, 0.55), 2);
  text(ctx, '$1', 0, h * 0.14, { size: h * 0.5, fill: mix(GOLD, INK, 0.15), align: 'center', font: MONO, weight: 700 });
  ctx.restore();
}

export function draw(ctx, t, cut) {
  if (cut.view === 'twenty') return drawTwenty(ctx, t, cut);
  return drawMacro(ctx, t, cut);
}

/** The dollar drops into a spotlight. Opening image of the whole film. */
function drawMacro(ctx, t, cut) {
  surface(ctx);
  const dropK = ease.bounce(span(t, cut.dropAt ?? 0.15, (cut.dropAt ?? 0.15) + 0.7));
  const y = lerp(-H * 0.4, H / 2 - 20, dropK);
  // a single hard spotlight, restrained — no glow spam elsewhere in the shot
  ctx.save();
  const g = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, 460);
  g.addColorStop(0, alpha(GOLD, 0.10)); g.addColorStop(1, alpha(GOLD, 0));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  bill(ctx, W / 2, y, 560, 260, Math.sin(dropK * Math.PI) * 0.08);
  if (cut.label) {
    text(ctx, cut.label, W / 2, H - 150, { size: 30, fill: alpha(PAPER, 0.5), align: 'center', font: UI, weight: 600, track: 4,
      alpha: ease.out(span(t, (cut.dropAt ?? 0.15) + 0.8, (cut.dropAt ?? 0.15) + 1.2)) });
  }
}

/** The temptation: a $20 hovers near, then gets crossed out. Dry sight gag. */
function drawTwenty(ctx, t, cut) {
  surface(ctx);
  bill(ctx, W / 2 - 260, H / 2, 420, 200, -0.03);
  const hoverK = ease.out(span(t, 0.15, 0.6));
  ctx.save();
  ctx.globalAlpha = hoverK;
  ctx.translate(W / 2 + 300, H / 2 - 10 + (1 - hoverK) * -60);
  contactShadow(ctx, 0, 120, 220, 18, 0.4 * hoverK);
  fillRR(ctx, -230, -120, 460, 220, 10, mix(PAPER, BLUE, 0.10));
  strokeRR(ctx, -220, -110, 440, 200, 4, alpha(BLUE, 0.55), 2);
  text(ctx, '$20', 0, 30, { size: 100, fill: mix(BLUE, INK, 0.1), align: 'center', font: MONO, weight: 700 });
  ctx.restore();
  const xK = ease.out(span(t, 0.75, 1.05));
  if (xK > 0) {
    ctx.save();
    ctx.globalAlpha = xK;
    ctx.translate(W / 2 + 300, H / 2 - 10);
    ctx.strokeStyle = RED; ctx.lineWidth = 16; ctx.lineCap = 'round';
    const r = 220 * ease.out(xK);
    ctx.beginPath(); ctx.moveTo(-r, -r * 0.5); ctx.lineTo(r, r * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r, r * 0.5); ctx.lineTo(r, -r * 0.5); ctx.stroke();
    ctx.restore();
  }
  if (cut.label) text(ctx, cut.label, W / 2, H - 150, { size: 30, fill: RED, align: 'center', font: UI, weight: 700, track: 4,
    alpha: ease.out(span(t, 1.05, 1.35)) });
}
