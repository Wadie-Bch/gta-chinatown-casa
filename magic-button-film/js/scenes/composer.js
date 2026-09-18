// SET C — a tightly cropped chat composer. Original, unbranded UI.
// Everything here carries a SIMULATED badge: no real transcript is implied.
import { W, H, lerp, span, ease, clamp, rng, text, poly, circle, line, fillRR, strokeRR,
         measure, clipRR, contactShadow, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, LIME, BLUE, CORAL, TEAL, YELLOW, WHITE, shade, alpha, mix } from '../palette.js';

export function simulatedBadge(ctx, x, y, label = 'SIMULATED') {
  const w = measure(ctx, label, 20, UI, 700) + 34;
  fillRR(ctx, x, y, w, 30, 6, CORAL);
  text(ctx, label, x + w / 2, y + 21, { size: 20, fill: INK, align: 'center', font: UI, weight: 700, track: 1.6 });
  return w;
}

function caret(ctx, x, y, h, t) {
  if ((t * 2) % 1 > 0.5) return;
  ctx.fillStyle = LIME; ctx.fillRect(x, y - h, 3, h);
}

export function draw(ctx, t, cut) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  const v = cut.view;
  if (v === 'receipt') return drawReceipt(ctx, t, cut);
  if (v === 'stream') return drawStream(ctx, t, cut);
  return drawCompose(ctx, t, cut);
}

/** Cropped composer: the input box fills the frame, nothing else. */
function drawCompose(ctx, t, cut) {
  const bw = 1360, bh = 366;
  const bx = (W - bw) / 2, by = H / 2 - bh / 2 + 18;
  const pop = ease.out(span(t, 0, 0.35));
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.scale(lerp(0.97, 1, pop), lerp(0.97, 1, pop)); ctx.translate(-W / 2, -H / 2);

  fillRR(ctx, bx, by, bw, bh, 26, INK_2);
  strokeRR(ctx, bx, by, bw, bh, 26, alpha(PAPER, 0.16), 3);

  const str = cut.prompt ?? '';
  const chars = Math.floor(clamp(span(t, cut.typeFrom ?? 0.15, cut.typeTo ?? 2.2), 0, 1) * str.length);
  const shown = str.slice(0, chars);
  // wrap manually so the crop never clips a word
  ctx.save();
  ctx.font = `500 46px ${UI}`;
  const words = shown.split(' ');
  const lines = [];
  let cur = '';
  for (const wd of words) {
    const test = cur ? cur + ' ' + wd : wd;
    if (ctx.measureText(test).width > bw - 170) { lines.push(cur); cur = wd; } else cur = test;
  }
  lines.push(cur);
  ctx.restore();
  let ly = by + 88;
  let lastW = 0;
  for (const ln of lines.slice(-3)) {
    lastW = text(ctx, ln, bx + 56, ly, { size: 46, fill: PAPER, font: UI, weight: 500 });
    ly += 62;
  }
  caret(ctx, bx + 56 + lastW + 8, ly - 62 + 12, 46, t);

  // send button, pressed at sendAt
  const sa = cut.sendAt ?? 99;
  const pressed = span(t, sa, sa + 0.1) - span(t, sa + 0.22, sa + 0.4);
  const sbw = 194, sbh = 70;
  const sbx = bx + bw - sbw - 38, sby = by + bh - sbh - 30;
  fillRR(ctx, sbx, sby + 6 * (1 - pressed), sbw, sbh, 12, shade(LIME, -0.4));
  fillRR(ctx, sbx, sby + 6 * pressed, sbw, sbh, 12, LIME);
  text(ctx, 'SEND', sbx + sbw / 2, sby + 6 * pressed + 49, { size: 34, fill: INK, align: 'center', track: 3 });

  // attachment + model row, deliberately generic (no brand, no plan badge, no version)
  circle(ctx, bx + 76, sby + 35, 22, null, alpha(PAPER, 0.3), 3);
  line(ctx, bx + 66, sby + 35, bx + 86, sby + 35, alpha(PAPER, 0.5), 3);
  line(ctx, bx + 76, sby + 25, bx + 76, sby + 45, alpha(PAPER, 0.5), 3);
  text(ctx, 'assistant', bx + 120, sby + 45, { size: 26, fill: alpha(PAPER, 0.38), font: UI, weight: 500, track: 1 });
  ctx.restore();

  simulatedBadge(ctx, bx, by - 52);
  if (cut.caption) {
    text(ctx, cut.caption, W / 2, H - 156, { size: 34, fill: alpha(PAPER, 0.55), align: 'center', font: UI, weight: 600, track: 3,
      alpha: ease.out(span(t, 0.6, 1.1)) });
  }
}

/** A reply streaming in — cropped to a few lines, never a wall of text. */
function drawStream(ctx, t, cut) {
  const bw = 1280, bx = (W - bw) / 2, by = 176;
  fillRR(ctx, bx, by, bw, 520, 24, INK_2);
  const lines = cut.lines ?? [];
  let y = by + 96;
  for (let i = 0; i < lines.length; i++) {
    const k = clamp(span(t, 0.25 + i * 0.4, 0.95 + i * 0.4), 0, 1);
    if (k <= 0) break;
    const [kind, str] = lines[i];
    if (kind === 'tool') {
      fillRR(ctx, bx + 52, y - 40, 34 + measure(ctx, str, 36, MONO, 500) + 48, 60, 10, alpha(BLUE, 0.18 + 0.1 * k));
      circle(ctx, bx + 82, y - 11, 9, BLUE);
      text(ctx, str.slice(0, Math.floor(str.length * k)), bx + 110, y, { size: 36, fill: BLUE, font: MONO, weight: 500 });
    } else if (kind === 'fail') {
      text(ctx, str.slice(0, Math.floor(str.length * k)), bx + 52, y, { size: 40, fill: CORAL, font: MONO, weight: 500 });
    } else {
      text(ctx, str.slice(0, Math.floor(str.length * k)), bx + 52, y, { size: 40, fill: PAPER, font: UI, weight: 500 });
    }
    y += 74;
  }
  simulatedBadge(ctx, bx, by - 52);
}

/** Gag: the repair conversation unrolls like a till receipt off the desk. */
function drawReceipt(ctx, t, cut) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  if (cut.zoom) {
    ctx.save();
    ctx.translate(W / 2, H * 0.50);
    ctx.scale(cut.zoom, cut.zoom);
    ctx.translate(-W / 2, -H * 0.62);
  }
  const rows = cut.rows ?? [];
  const rollout = ease.out(span(t, 0.1, cut.dur * 0.82));
  const rowH = 86;
  const totalH = rows.length * rowH;
  const visible = rollout * totalH;
  const x = W / 2 - 380;

  // printer slot at the top
  fillRR(ctx, x - 70, 30, 900, 62, 10, INK_3);
  fillRR(ctx, x - 24, 72, 808, 14, 4, INK);

  ctx.save();
  ctx.beginPath(); ctx.rect(0, 94, W, H - 94); ctx.clip();
  const topY = 96 + Math.min(0, H - 150 - visible);
  ctx.save();
  ctx.translate(x, topY);
  // paper strip
  const stripH = Math.min(visible, totalH);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, 760, stripH);
  // torn bottom edge
  ctx.beginPath();
  ctx.moveTo(0, stripH);
  for (let i = 0; i <= 20; i++) ctx.lineTo(i * 30, stripH + (i % 2 ? 12 : 0));
  ctx.lineTo(600, stripH); ctx.closePath();
  ctx.fillStyle = PAPER; ctx.fill();

  for (let i = 0; i < rows.length; i++) {
    const y = i * rowH;
    if (y > stripH) break;
    ctx.globalAlpha = clamp((stripH - y) / 40, 0, 1);
    text(ctx, rows[i][0], 42, y + 46, { size: 34, fill: INK, font: MONO, weight: 600 });
    text(ctx, rows[i][1], 718, y + 46, { size: 32, fill: rows[i][2] || alpha(INK, 0.5), font: MONO, weight: 600, align: 'right' });
    ctx.fillStyle = alpha(INK, 0.12);
    ctx.fillRect(42, y + 68, 676, 2);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  ctx.restore();
  if (cut.zoom) ctx.restore();
  simulatedBadge(ctx, 60, 40);
  if (cut.caption) {
    text(ctx, cut.caption, W - 70, H - 152, { size: 36, fill: alpha(PAPER, 0.6), align: 'right', font: UI, weight: 600, track: 2,
      alpha: ease.out(span(t, 1.4, 2.0)) });
  }
}
