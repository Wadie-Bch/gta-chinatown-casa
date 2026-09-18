// SET J — one abstract state diagram, used briefly to explain a single failure.
import { W, H, lerp, span, ease, clamp, text, poly, circle, line, fillRR, strokeRR,
         measure, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, LIME, BLUE, CORAL, TEAL, YELLOW, WHITE, shade, alpha } from '../palette.js';

const NODES = [
  { id: 'play', label: 'PLAYING', x: 0.22, y: 0.42 },
  { id: 'lost', label: 'LOST', x: 0.52, y: 0.42 },
  { id: 'fresh', label: 'FRESH RUN', x: 0.82, y: 0.42 },
];

function nodeAt(n) { return [W * n.x, H * n.y]; }

function arrow(ctx, a, b, col, lw, headSize = 18, bow = 0) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + bow;
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.quadraticCurveTo(mx, my, b[0], b[1]);
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
  const ang = Math.atan2(b[1] - my, b[0] - mx);
  ctx.save();
  ctx.translate(b[0], b[1]); ctx.rotate(ang);
  poly(ctx, [[0, 0], [-headSize, -headSize * 0.6], [-headSize, headSize * 0.6]], col);
  ctx.restore();
}

export function draw(ctx, t, cut) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  // a single faint baseline so the nodes sit on something
  ctx.fillStyle = alpha(PAPER, 0.07);
  ctx.fillRect(W * 0.12, H * 0.42, W * 0.76, 2);

  const broken = cut.broken !== false;
  for (let i = 0; i < NODES.length; i++) {
    const k = ease.out(span(t, 0.1 + i * 0.30, 0.5 + i * 0.30));
    if (k <= 0) continue;
    const [x, y] = nodeAt(NODES[i]);
    const isBad = broken && i === 2;
    ctx.save();
    ctx.globalAlpha = k;
    ctx.translate(x, y);
    ctx.scale(lerp(0.8, 1, ease.back(k)), lerp(0.8, 1, ease.back(k)));
    const w = 260, h = 108;
    fillRR(ctx, -w / 2, -h / 2, w, h, 14, isBad ? alpha(CORAL, 0.15) : INK_2);
    strokeRR(ctx, -w / 2, -h / 2, w, h, 14, isBad ? CORAL : alpha(PAPER, 0.3), 4);
    text(ctx, NODES[i].label, 0, 12, { size: 38, fill: isBad ? CORAL : PAPER, align: 'center', track: 2 });
    ctx.restore();
  }

  // forward transitions
  const a1 = ease.out(span(t, 0.75, 1.15));
  if (a1 > 0) {
    ctx.save(); ctx.globalAlpha = a1;
    const a = nodeAt(NODES[0]), b = nodeAt(NODES[1]);
    arrow(ctx, [a[0] + 136, a[1]], [b[0] - 136 * a1, b[1]], PAPER_3, 5);
    text(ctx, 'hit a truck', (a[0] + b[0]) / 2, a[1] - 34, { size: 24, fill: alpha(PAPER, 0.55), align: 'center', font: MONO, weight: 500 });
    ctx.restore();
  }
  const a2 = ease.out(span(t, 1.25, 1.7));
  if (a2 > 0) {
    ctx.save(); ctx.globalAlpha = a2;
    const a = nodeAt(NODES[1]), b = nodeAt(NODES[2]);
    arrow(ctx, [a[0] + 136, a[1]], [b[0] - 136 * a2, b[1]], PAPER_3, 5);
    text(ctx, 'press restart', (a[0] + b[0]) / 2, a[1] - 34, { size: 24, fill: alpha(PAPER, 0.55), align: 'center', font: MONO, weight: 500 });
    ctx.restore();
  }
  // the failure: the "fresh run" quietly loops straight back to LOST
  const a3 = ease.out(span(t, cut.failAt ?? 2.1, (cut.failAt ?? 2.1) + 0.6));
  if (a3 > 0 && broken) {
    ctx.save();
    ctx.globalAlpha = a3;
    const a = nodeAt(NODES[2]), b = nodeAt(NODES[1]);
    arrow(ctx, [a[0], a[1] + 60], [b[0], b[1] + 60 + 4], CORAL, 6, 20, 160 * a3);
    text(ctx, cut.failLabel ?? 'state never cleared', (a[0] + b[0]) / 2, b[1] + 168, {
      size: 30, fill: CORAL, align: 'center', font: MONO, weight: 600,
    });
    ctx.restore();
  }
  if (cut.label) {
    text(ctx, cut.label, W / 2, 130, { size: 44, fill: PAPER, align: 'center', track: 6, alpha: ease.out(span(t, 0.05, 0.5)) });
  }
}
