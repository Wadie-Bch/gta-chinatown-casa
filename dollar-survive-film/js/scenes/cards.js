// SET I — disclosure, headline, and the closing card. Kept deliberately flat
// and typographic: the honesty beats don't need extra motion to land.
import { W, H, lerp, span, ease, clamp, text, poly, circle, line, fillRR, strokeRR,
         measure, clipRR, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, GREEN, RED, GOLD, BLUE, shade, alpha, mix } from '../palette.js';

export function draw(ctx, t, cut) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  switch (cut.view) {
    case 'stamp':    return drawStamp(ctx, t, cut);
    case 'notrun':   return drawNotRun(ctx, t, cut);
    case 'headline': return drawHeadline(ctx, t, cut);
    case 'deflate':  return drawDeflate(ctx, t, cut);
    case 'endcard':  return drawEndcard(ctx, t, cut);
    default:         return drawStamp(ctx, t, cut);
  }
}

function drawStamp(ctx, t, cut) {
  const k = ease.out(span(t, cut.stampAt ?? 0.3, (cut.stampAt ?? 0.3) + 0.22));
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(lerp(-0.2, -0.07, k));
  ctx.scale(lerp(1.6, 1, k), lerp(1.6, 1, k));
  ctx.globalAlpha = Math.min(1, k * 1.5);
  const label = cut.text ?? 'THOUGHT EXPERIMENT';
  const w = measure(ctx, label, 78, DISPLAY, 700) + 100;
  strokeRR(ctx, -w / 2, -74, w, 148, 12, RED, 8);
  text(ctx, label, 0, 12, { size: 78, fill: RED, align: 'center', track: 4 });
  ctx.restore();
  if (cut.sub) {
    const sk = ease.out(span(t, (cut.stampAt ?? 0.3) + 0.35, (cut.stampAt ?? 0.3) + 0.7));
    if (sk > 0) text(ctx, cut.sub, W / 2, H / 2 + 130, { size: 26, fill: alpha(RED, 0.85), align: 'center', font: UI, weight: 700, track: 3, alpha: sk });
  }
}

function drawNotRun(ctx, t, cut) {
  for (let i = 0; i < 3; i++) {
    const k = ease.out(span(t, 0.1 + i * 0.18, 0.45 + i * 0.18));
    if (k <= 0) continue;
    const x = W * (0.22 + i * 0.28), y = H * 0.48;
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 1.4);
    ctx.translate(x, y + (1 - k) * 24);
    fillRR(ctx, -160, -190, 320, 380, 16, INK_2);
    strokeRR(ctx, -160, -190, 320, 380, 16, alpha(PAPER, 0.14), 2);
    circle(ctx, 0, -100, 50, alpha(PAPER, 0.14));
    fillRR(ctx, -100, -10, 200, 14, 6, alpha(PAPER, 0.14));
    fillRR(ctx, -74, 24, 148, 14, 6, alpha(PAPER, 0.10));
    const sk = ease.out(span(t, 0.8 + i * 0.18, 1.1 + i * 0.18));
    if (sk > 0) {
      ctx.save(); ctx.globalAlpha = sk; ctx.rotate(-0.1);
      strokeRR(ctx, -130, 60, 260, 84, 10, RED, 6);
      text(ctx, 'NOT RUN', 0, 116, { size: 40, fill: RED, align: 'center', track: 3 });
      ctx.restore();
    }
    ctx.restore();
  }
  if (cut.label) text(ctx, cut.label, W / 2, H - 90, { size: 26, fill: alpha(PAPER, 0.5), align: 'center', font: UI, weight: 600, track: 3,
    alpha: ease.out(span(t, 1.3, 1.7)) });
}

/** A sensational fake headline, struck through, replaced by the blunt real one. */
function drawHeadline(ctx, t, cut) {
  const k1 = ease.out(span(t, 0.1, 0.45));
  ctx.save(); ctx.globalAlpha = k1;
  text(ctx, cut.fake ?? 'AI ESCAPES POVERTY', W / 2, H / 2 - 70, { size: 58, fill: alpha(PAPER, 0.55), align: 'center', track: 1, maxWidth: W - 200 });
  ctx.restore();
  const xk = ease.out(span(t, 0.5, 0.75));
  if (xk > 0) {
    ctx.save(); ctx.globalAlpha = xk;
    const w = measure(ctx, cut.fake ?? 'AI ESCAPES POVERTY', 58, undefined, 700);
    line(ctx, W / 2 - w / 2, H / 2 - 88, W / 2 + w / 2, H / 2 - 88, RED, 6);
    ctx.restore();
  }
  const k2 = ease.out(span(t, 0.85, 1.3));
  if (k2 > 0) {
    ctx.save(); ctx.globalAlpha = k2;
    ctx.translate(0, (1 - k2) * 20);
    text(ctx, cut.real ?? 'DID NOT DIVIDE BY ZERO TODAY', W / 2, H / 2 + 60, { size: 64, fill: GREEN, align: 'center', track: 1, maxWidth: W - 160 });
    ctx.restore();
  }
}

/** The show's own title, deflating next to the tiny real balance. Meta joke. */
function drawDeflate(ctx, t, cut) {
  const k = ease.out(span(t, 0.1, 0.5));
  ctx.save();
  ctx.globalAlpha = k;
  ctx.translate(W / 2, H * 0.36);
  ctx.scale(lerp(1.25, 1, k), lerp(1.25, 1, k));
  text(ctx, 'I GAVE AI $1 AND TOLD IT TO SURVIVE', 0, 0, { size: 46, fill: PAPER, align: 'center', track: 1, maxWidth: W - 160 });
  ctx.restore();
  const shrinkK = ease.inOut(span(t, 0.55, 1.1));
  ctx.save();
  ctx.translate(W / 2, H * 0.62);
  ctx.scale(lerp(1, 0.4, shrinkK), lerp(1, 0.4, shrinkK));
  ctx.globalAlpha = lerp(1, 0.55, shrinkK);
  text(ctx, cut.real ?? '$0.03', 0, 40, { size: 130, fill: GREEN, align: 'center', font: MONO, weight: 700 });
  ctx.restore();
  if (cut.label) text(ctx, cut.label, W / 2, H - 100, { size: 24, fill: alpha(PAPER, 0.45), align: 'center', font: UI, weight: 600, track: 3,
    alpha: ease.out(span(t, 1.2, 1.5)) });
}

function drawEndcard(ctx, t, cut) {
  const lines = cut.lines ?? [];
  let y = H / 2 - (lines.length - 1) * 44;
  for (let i = 0; i < lines.length; i++) {
    const k = ease.out(span(t, 0.15 + i * 0.3, 0.6 + i * 0.3));
    text(ctx, lines[i], W / 2, y, {
      size: i === 0 ? 80 : 30, fill: i === 0 ? PAPER : alpha(PAPER, 0.55),
      align: 'center', track: i === 0 ? 2 : 3, alpha: k, font: i === 0 ? MONO : UI, weight: i === 0 ? 700 : 600,
      maxWidth: W - 160,
    });
    y += i === 0 ? 100 : 56;
  }
  const bar = ease.out(span(t, 0.05, 0.6));
  ctx.fillStyle = GREEN;
  ctx.fillRect(W / 2 - 200 * bar, H / 2 - 130, 400 * bar, 6);
}
