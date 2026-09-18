// SET D — a physical assembly line standing in for automated work.
import { W, H, lerp, span, ease, clamp, rng, text, poly, circle, line, fillRR, strokeRR,
         contactShadow, measure, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, LIME, BLUE, CORAL, TEAL, YELLOW, WHITE, shade, alpha, mix } from '../palette.js';

export function draw(ctx, t, cut) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = INK_2; ctx.fillRect(0, H * 0.70, W, H * 0.30);

  const beltY = H * 0.66;
  const speed = cut.speed ?? 190;
  const shift = t * speed;

  // belt
  ctx.fillStyle = '#39424F'; ctx.fillRect(-20, beltY, W + 40, 54);
  ctx.fillStyle = alpha(PAPER, 0.10);
  for (let i = -2; i < 26; i++) {
    const x = ((i * 72 - shift) % (W + 150) + W + 150) % (W + 150) - 75;
    ctx.fillRect(x, beltY + 8, 8, 38);
  }
  for (const rx of [70, W - 70]) circle(ctx, rx, beltY + 27, 27, '#5C6675', alpha(PAPER, 0.2), 3);

  // an overhead gantry the arms hang from, so they read as machinery
  ctx.fillStyle = '#39424F'; ctx.fillRect(0, 54, W, 34);
  ctx.fillStyle = alpha(INK, 0.45); ctx.fillRect(0, 84, W, 6);

  // robot arms stamping in time
  const METAL = '#8A93A3', METAL_D = '#5C6675';
  const arms = cut.arms ?? 3;
  for (let i = 0; i < arms; i++) {
    const ax = W * (0.22 + i * 0.28);
    const phase = (t * 1.9 + i * 0.4) % 1;
    const down = Math.pow(Math.sin(phase * Math.PI), 2);
    ctx.save();
    ctx.translate(ax, 0);
    fillRR(ctx, -34, 60, 68, 96, 10, METAL_D);
    ctx.save();
    ctx.translate(0, 150);
    ctx.rotate(lerp(-0.5, -0.12, down));
    fillRR(ctx, -22, -14, 44, 204, 16, METAL);
    ctx.fillStyle = alpha(INK, 0.28); ctx.fillRect(-22, 40, 44, 8); ctx.fillRect(-22, 120, 44, 8);
    ctx.translate(0, 190);
    circle(ctx, 0, 0, 22, METAL_D);
    ctx.rotate(lerp(0.9, 0.34, down));
    fillRR(ctx, -18, -10, 36, 184, 14, shade(METAL, 0.1));
    ctx.translate(0, 172);
    fillRR(ctx, -42, -8, 84, 46, 9, i === 1 ? BLUE : LIME);
    fillRR(ctx, -30, 34, 60, 14, 5, METAL_D);
    ctx.restore();
    ctx.restore();
    if (down > 0.92) {
      ctx.save(); ctx.globalAlpha = (down - 0.92) / 0.08 * 0.8;
      circle(ctx, ax, beltY - 8, 26, null, LIME, 4);
      ctx.restore();
    }
  }

  // parts riding the belt: each one is a "tool call"
  const labels = cut.parts ?? ['read_file', 'write_file', 'run_tests', 'edit', 'search', 'bash', 'screenshot'];
  for (let i = -1; i < 12; i++) {
    const x = ((i * 205 - shift * 1.0) % (W + 420) + W + 420) % (W + 420) - 210;
    const lab = labels[((i % labels.length) + labels.length) % labels.length];
    const wob = Math.sin((x + shift) * 0.02) * 2;
    let vanish = 1;
    if (cut.vanish) {
      // each part is taken off the line as it passes the second arm
      const gate = W * 0.50;
      vanish = x < gate ? clamp((x - (gate - 190)) / 190, 0, 1) : 1;
      if (vanish <= 0.01) continue;
    }
    ctx.save();
    ctx.globalAlpha = vanish;
    ctx.translate(x, beltY - 38 + wob);
    if (cut.vanish) ctx.scale(vanish, vanish);
    fillRR(ctx, -78, -46, 156, 84, 10, PAPER_2);
    fillRR(ctx, -78, -46, 156, 22, 10, i % 3 === 2 ? CORAL : BLUE);
    // rides the belt: deliberately cropped at the frame edges
    text(ctx, lab, 0, 22, { size: 25, fill: INK, align: 'center', font: MONO, weight: 600, crop: true });
    ctx.restore();
  }

  // counters — the honest cost of "one prompt"
  if (cut.counters) {
    const k = clamp(span(t, 0.3, cut.dur * 0.9), 0, 1);
    const items = cut.counters;
    const bw = 300, gap = 34;
    const totalW = items.length * bw + (items.length - 1) * gap;
    let x = W / 2 - totalW / 2;
    for (const it of items) {
      const shown = Math.floor(it.to * ease.out(k));
      fillRR(ctx, x, 96, bw, 150, 14, alpha(PAPER, 0.06));
      strokeRR(ctx, x, 96, bw, 150, 14, alpha(PAPER, 0.14), 2);
      text(ctx, shown.toLocaleString('en-US') + (it.suffix || ''), x + bw / 2, 186, {
        size: 64, fill: it.col || LIME, align: 'center', font: MONO, weight: 700,
      });
      text(ctx, it.label, x + bw / 2, 224, { size: 21, fill: alpha(PAPER, 0.5), align: 'center', font: UI, weight: 600, track: 2 });
      x += bw + gap;
    }
    text(ctx, 'ILLUSTRATIVE — NOT MEASURED', W / 2, 286, {
      size: 19, fill: alpha(CORAL, 0.9), align: 'center', font: UI, weight: 700, track: 3,
    });
  }
  if (cut.label) {
    text(ctx, cut.label, W / 2, H - 150, { size: 46, fill: PAPER, align: 'center', track: 6,
      alpha: ease.out(span(t, 0.4, 0.9)) });
  }
}
