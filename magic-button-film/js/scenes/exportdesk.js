// SET E — a desktop, outside any editor. Also the .html / .exe tag-swap gag.
import { W, H, lerp, span, ease, clamp, rng, text, poly, circle, line, fillRR, strokeRR,
         contactShadow, clipRR, measure, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, LIME, BLUE, CORAL, TEAL, YELLOW, WHITE, shade, alpha, mix } from '../palette.js';

export function draw(ctx, t, cut) {
  if (cut.view === 'boxes') return drawBoxes(ctx, t, cut);
  return drawOpen(ctx, t, cut);
}

/** Two identical crates. Swap the tags; the contents do not change. */
function drawBoxes(ctx, t, cut) {
  ctx.fillStyle = mix(PAPER_3, INK, 0.55); ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = mix(PAPER_3, INK, 0.66); ctx.fillRect(0, H * 0.68, W, H * 0.32);

  const swap = ease.inOut(span(t, cut.swapAt ?? 1.3, (cut.swapAt ?? 1.3) + 1.0));
  const positions = [W * 0.31, W * 0.69];
  const tags = ['.html', '.exe'];
  const tagCol = [BLUE, CORAL];

  for (let i = 0; i < 2; i++) {
    const x = positions[i], y = H * 0.56;
    contactShadow(ctx, x, y + 138, 190, 26, 0.4);
    crate(ctx, x, y, 320, 250);
    if (cut.openAt != null) {
      const k = ease.out(span(t, cut.openAt + i * 0.25, cut.openAt + 0.7 + i * 0.25));
      if (k > 0) {
        ctx.save(); ctx.globalAlpha = k;
        // identical contents: the same small game, in both crates
        ctx.translate(x, y - 36 - k * 40);
        ctx.scale(0.62, 0.62);
        miniGame(ctx, t);
        ctx.restore();
      }
    }
  }
  // the tags fly across and trade places
  for (let i = 0; i < 2; i++) {
    const from = positions[i], to = positions[1 - i];
    const x = lerp(from, to, swap);
    const lift = Math.sin(swap * Math.PI) * 190;
    const y = H * 0.56 - 150 - lift;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(swap * Math.PI) * (i ? -0.3 : 0.3));
    const w = measure(ctx, tags[i], 46, MONO, 700) + 60;
    fillRR(ctx, -w / 2, -34, w, 68, 10, tagCol[i]);
    text(ctx, tags[i], 0, 15, { size: 46, fill: INK, align: 'center', font: MONO, weight: 700 });
    // string to the crate
    line(ctx, 0, 34, 0, 34 + 74 + lift, alpha(INK, 0.5), 3);
    ctx.restore();
  }
  if (cut.label) {
    text(ctx, cut.label, W / 2, H - 154, { size: 44, fill: PAPER, align: 'center', track: 6,
      alpha: ease.out(span(t, (cut.swapAt ?? 1.3) + 0.9, (cut.swapAt ?? 1.3) + 1.4)) });
  }
}

function crate(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);
  poly(ctx, [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], mix(PAPER_2, '#A8804C', 0.55), alpha(INK, 0.6), 4);
  poly(ctx, [[-w / 2, -h / 2], [-w / 2 + 52, -h / 2 - 44], [w / 2 + 52, -h / 2 - 44], [w / 2, -h / 2]], mix(PAPER_2, '#C09A62', 0.5), alpha(INK, 0.6), 4);
  poly(ctx, [[w / 2, -h / 2], [w / 2 + 52, -h / 2 - 44], [w / 2 + 52, h / 2 - 44], [w / 2, h / 2]], mix(PAPER_2, '#8C6838', 0.6), alpha(INK, 0.6), 4);
  ctx.fillStyle = alpha(INK, 0.22);
  ctx.fillRect(-w / 2 + 14, -14, w - 28, 12);
  ctx.restore();
}

function miniGame(ctx, t) {
  fillRR(ctx, -210, -130, 420, 250, 12, INK);
  ctx.save();
  clipRR(ctx, -210, -130, 420, 250, 12, () => {
    ctx.fillStyle = INK_2; ctx.fillRect(-210, 20, 420, 100);
    ctx.fillStyle = PAPER_3; ctx.fillRect(-210, 14, 420, 8);
    const x = ((t * 90) % 360) - 180;
    ctx.fillStyle = TEAL; ctx.fillRect(x, -40, 26, 60);
    ctx.fillStyle = YELLOW; ctx.fillRect(90, -24, 26, 26);
    ctx.fillStyle = WHITE; ctx.fillRect(140, -46, 60, 46);
  });
  ctx.restore();
}

/** The export actually opening, on a desktop, outside the editor. */
function drawOpen(ctx, t, cut) {
  // desktop
  ctx.fillStyle = mix(BLUE, INK, 0.72); ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = alpha(INK, 0.5); ctx.fillRect(0, H - 54, W, 54);
  for (let i = 0; i < 5; i++) fillRR(ctx, 26 + i * 62, H - 46, 44, 38, 8, alpha(PAPER, 0.16));
  // desktop icons
  for (let i = 0; i < 2; i++) {
    fillRR(ctx, 54, 60 + i * 130, 76, 76, 10, alpha(PAPER, 0.2));
    text(ctx, i ? 'build' : 'courier', 92, 160 + i * 130, { size: 20, fill: alpha(PAPER, 0.7), align: 'center', font: UI, weight: 600 });
  }

  const k = ease.out(span(t, cut.openAt ?? 0.5, (cut.openAt ?? 0.5) + 0.45));
  if (k <= 0) return;
  const ww = 900 * k + 60, wh = 560 * k + 40;
  const wx = W / 2 - ww / 2, wy = H / 2 - wh / 2 - 10;
  contactShadow(ctx, W / 2, wy + wh + 20, ww * 0.5, 30, 0.45 * k);
  fillRR(ctx, wx, wy, ww, wh, 12, INK_2);
  // title bar — generic OS chrome, no branding
  ctx.save();
  clipRR(ctx, wx, wy, ww, wh, 12, () => {
    ctx.fillStyle = INK_3; ctx.fillRect(wx, wy, ww, 46);
    for (let i = 0; i < 3; i++) circle(ctx, wx + 26 + i * 26, wy + 23, 8, [CORAL, YELLOW, LIME][i]);
    if (k > 0.85) {
      text(ctx, cut.title ?? 'courier — build', wx + ww / 2, wy + 31, { size: 22, fill: alpha(PAPER, 0.7), align: 'center', font: UI, weight: 600 });
      // the game running inside
      ctx.save();
      ctx.translate(wx + ww / 2, wy + 46 + (wh - 46) / 2);
      ctx.scale(1.5, 1.5);
      miniGame(ctx, t);
      ctx.restore();
    }
  });
  ctx.restore();
  if (cut.label && k > 0.9) {
    text(ctx, cut.label, W / 2, H - 162, { size: 42, fill: PAPER, align: 'center', track: 5,
      alpha: ease.out(span(t, (cut.openAt ?? 0.5) + 0.5, (cut.openAt ?? 0.5) + 0.95)) });
  }
}
