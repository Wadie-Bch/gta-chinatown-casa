// SET F — an inspection bench, shot from overhead. Game components laid out as
// physical parts and checked one at a time.
import { W, H, lerp, span, ease, clamp, rng, text, poly, circle, line, fillRR, strokeRR,
         contactShadow, measure, clipRR, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, LIME, BLUE, CORAL, TEAL, YELLOW, WHITE, shade, alpha, mix } from '../palette.js';

const PARTS = [
  { n: 'start',   glyph: 'play' },
  { n: 'move',    glyph: 'pad' },
  { n: 'pickups', glyph: 'parcel' },
  { n: 'win',     glyph: 'flag' },
  { n: 'lose',    glyph: 'skull' },
  { n: 'restart', glyph: 'loop' },
  { n: 'pause',   glyph: 'pause' },
  { n: 'volume',  glyph: 'wave' },
  { n: 'best',    glyph: 'disk' },
  { n: 'export',  glyph: 'box' },
];

function benchSurface(ctx) {
  ctx.fillStyle = mix(PAPER_2, '#8C6838', 0.22); ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = alpha(INK, 0.06); ctx.lineWidth = 2;
  for (let y = 60; y < H; y += 120) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // a steel rule along the top edge — an object, not decoration
  ctx.fillStyle = mix(PAPER_3, INK, 0.3); ctx.fillRect(0, 0, W, 44);
  for (let x = 20; x < W; x += 40) {
    const big = x % 200 === 20;
    ctx.fillStyle = alpha(INK, big ? 0.6 : 0.3);
    ctx.fillRect(x, 44 - (big ? 22 : 12), 3, big ? 22 : 12);
  }
}

function glyph(ctx, kind, x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  switch (kind) {
    case 'play': poly(ctx, [[-26, -34], [38, 0], [-26, 34]], col); break;
    case 'pad': fillRR(ctx, -40, -14, 28, 28, 6, col); fillRR(ctx, 12, -14, 28, 28, 6, col);
      fillRR(ctx, -14, -40, 28, 28, 6, col); fillRR(ctx, -14, 12, 28, 28, 6, col); break;
    case 'parcel': fillRR(ctx, -34, -34, 68, 68, 8, col); ctx.fillStyle = PAPER_2; ctx.fillRect(-34, -8, 68, 16); break;
    case 'flag': ctx.beginPath(); ctx.moveTo(-26, 40); ctx.lineTo(-26, -40); ctx.stroke();
      poly(ctx, [[-26, -40], [36, -22], [-26, -4]], col); break;
    case 'skull': circle(ctx, 0, -6, 34, col); ctx.fillStyle = PAPER_2;
      circle(ctx, -13, -10, 9, PAPER_2); circle(ctx, 13, -10, 9, PAPER_2); ctx.fillRect(-14, 28, 28, 12);
      ctx.fillStyle = col; ctx.fillRect(-20, 22, 40, 14); break;
    case 'loop': ctx.beginPath(); ctx.arc(0, 0, 32, 0.5, Math.PI * 1.75); ctx.stroke();
      poly(ctx, [[28, -26], [40, 8], [6, -2]], col); break;
    case 'pause': fillRR(ctx, -28, -34, 20, 68, 5, col); fillRR(ctx, 8, -34, 20, 68, 5, col); break;
    case 'wave': ctx.beginPath(); ctx.moveTo(-36, -18); ctx.lineTo(-36, 18); ctx.lineTo(-12, 18);
      ctx.lineTo(10, 40); ctx.lineTo(10, -40); ctx.lineTo(-12, -18); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(22, 0, 18, -0.9, 0.9); ctx.stroke(); break;
    case 'disk': fillRR(ctx, -34, -34, 68, 68, 6, col); ctx.fillStyle = PAPER_2;
      ctx.fillRect(-18, -34, 36, 26); ctx.fillRect(-24, 4, 48, 30); break;
    case 'box': poly(ctx, [[-34, -14], [0, -34], [34, -14], [0, 6]], col);
      poly(ctx, [[-34, -14], [0, 6], [0, 40], [-34, 20]], shade(col, -0.2));
      poly(ctx, [[34, -14], [0, 6], [0, 40], [34, 20]], shade(col, -0.35)); break;
  }
  ctx.restore();
}

export function draw(ctx, t, cut) {
  benchSurface(ctx);
  if (cut.view === 'checks') return drawChecks(ctx, t, cut);
  if (cut.view === 'ship') return drawShip(ctx, t, cut);
  return drawTen(ctx, t, cut);
}

/** Ten parts placed on the bench, one by one, with a real thud each time.
 *  `times` (seconds into the cut) lets each part land on the word that names it. */
function drawTen(ctx, t, cut) {
  const [lo, hi] = cut.range ?? [0, PARTS.length];
  const list = PARTS.slice(lo, hi);
  const cols = cut.cols ?? (list.length > 5 ? 5 : list.length);
  const scale = cut.scale ?? (list.length > 5 ? 0.78 : 1.12);
  const rows = Math.ceil(list.length / cols);
  const cw = 292 * scale, ch = 300 * scale;
  const ox = W / 2 - (cols * cw) / 2 + cw / 2;
  const oy = H / 2 - ((rows - 1) * ch) / 2 + (cut.dy ?? 0);
  let landed = 0;
  for (let i = 0; i < list.length; i++) {
    const at = cut.times ? cut.times[i] : (cut.from ?? 0.15) + i * (cut.step ?? 0.34);
    if (at == null) continue;
    const k = ease.out(span(t, at, at + 0.26));
    if (k <= 0) continue;
    landed++;
    const x = ox + (i % cols) * cw, y = oy + Math.floor(i / cols) * ch;
    const drop = (1 - k) * 90;
    contactShadow(ctx, x, y + 96 * scale, 92 * scale * k, 16 * k, 0.35 * k);
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 1.4);
    ctx.translate(x, y - drop);
    ctx.scale(scale, scale);
    const missing = (cut.missing ?? []).includes(lo + i);
    fillRR(ctx, -104, -100, 208, 190, 14, missing ? alpha(CORAL, 0.16) : PAPER);
    strokeRR(ctx, -104, -100, 208, 190, 14, missing ? CORAL : alpha(INK, 0.35), missing ? 4 : 3);
    glyph(ctx, list[i].glyph, 0, -16, 104, missing ? CORAL : INK);
    text(ctx, list[i].n, 0, 66, { size: 30, fill: missing ? CORAL : INK, align: 'center', font: UI, weight: 700, track: 1 });
    ctx.restore();
  }
  if (cut.counter !== false) {
    text(ctx, String(lo + landed).padStart(2, '0'), 86, 168, { size: 112, fill: alpha(INK, 0.2), font: MONO, weight: 700 });
  }
  if (cut.emptyLabel && landed === 0) {
    // a bench with nothing on it reads as "nothing has been tested"
    ctx.save();
    ctx.setLineDash([16, 12]);
    for (let i = 0; i < 3; i++) strokeRR(ctx, W / 2 - 500 + i * 340, H / 2 - 110, 300, 220, 14, alpha(INK, 0.22), 4);
    ctx.setLineDash([]);
    ctx.restore();
    text(ctx, cut.emptyLabel, W / 2, H / 2 + 220, { size: 48, fill: alpha(INK, 0.62), align: 'center', track: 6,
      alpha: ease.out(span(t, 0.3, 0.9)) });
  }
  if (cut.label) {
    text(ctx, cut.label, W - 86, 168, { size: 50, fill: INK, align: 'right', track: 5,
      alpha: ease.out(span(t, cut.labelAt ?? 0.4, (cut.labelAt ?? 0.4) + 0.5)) });
  }
}

/** The boring checks: each one is a physical test, pass or fail. */
function drawChecks(ctx, t, cut) {
  const items = cut.items ?? [];
  const n = items.length;
  const cw = Math.min(440, (W - 120) / n);
  const ox = W / 2 - (n * cw) / 2 + cw / 2;
  for (let i = 0; i < n; i++) {
    const at = cut.times ? cut.times[i] : (cut.from ?? 0.2) + i * (cut.step ?? 1.15);
    if (at == null) continue;
    const k = ease.out(span(t, at, at + 0.28));
    if (k <= 0) continue;
    const verdictK = span(t, at + 0.5, at + 0.78);
    const x = ox + i * cw, y = H / 2 - 20;
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 1.5);
    ctx.translate(x, y);
    ctx.scale(lerp(0.9, 1, k), lerp(0.9, 1, k));
    fillRR(ctx, -cw / 2 + 16, -215, cw - 32, 400, 18, PAPER);
    strokeRR(ctx, -cw / 2 + 16, -215, cw - 32, 400, 18, alpha(INK, 0.3), 3);
    glyph(ctx, items[i].g, 0, -95, 150, INK);
    text(ctx, items[i].t, 0, 44, { size: 40, fill: INK, align: 'center', font: UI, weight: 700, maxWidth: cw - 70 });
    if (items[i].sub) text(ctx, items[i].sub, 0, 84, { size: 26, fill: alpha(INK, 0.5), align: 'center', font: UI, weight: 500, maxWidth: cw - 70 });
    if (verdictK > 0) {
      ctx.save();
      ctx.globalAlpha = verdictK;
      ctx.translate(0, 138);
      const ok = items[i].ok;
      circle(ctx, 0, 0, 38 * ease.back(verdictK), ok ? LIME : CORAL);
      if (ok) {
        ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(-16, 1); ctx.lineTo(-4, 13); ctx.lineTo(17, -13); ctx.stroke();
      } else {
        ctx.strokeStyle = PAPER; ctx.lineWidth = 9; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-13, -13); ctx.lineTo(13, 13); ctx.moveTo(13, -13); ctx.lineTo(-13, 13); ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }
  if (cut.label) text(ctx, cut.label, W / 2, 132, { size: 46, fill: INK, align: 'center', track: 6, alpha: ease.out(span(t, 0.1, 0.6)) });
}

/** Commercial readiness — kept proportionate: four stamps, not a lecture. */
function drawShip(ctx, t, cut) {
  const items = cut.items ?? [];
  const cols = 2;
  const cw = 560, ch = 250;
  const ox = W / 2 - cw, oy = 250;
  for (let i = 0; i < items.length; i++) {
    const at = cut.times ? cut.times[i] : (cut.from ?? 0.3) + i * (cut.step ?? 1.0);
    if (at == null) continue;
    const k = ease.out(span(t, at, at + 0.26));
    if (k <= 0) continue;
    const x = ox + (i % cols) * cw + cw / 2, y = oy + Math.floor(i / cols) * ch;
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 1.4);
    ctx.translate(x, y);
    ctx.rotate(lerp(-0.06, (i % 2 ? 0.018 : -0.02), k));
    ctx.scale(lerp(1.25, 1, ease.out(k)), lerp(1.25, 1, ease.out(k)));
    const bw = cw - 80, bh = ch - 70;
    fillRR(ctx, -bw / 2, -bh / 2, bw, bh, 12, PAPER);
    strokeRR(ctx, -bw / 2, -bh / 2, bw, bh, 12, alpha(INK, 0.35), 3);
    strokeRR(ctx, -bw / 2 + 12, -bh / 2 + 12, bw - 24, bh - 24, 8, alpha(INK, 0.18), 2);
    text(ctx, items[i].t, 0, 4, { size: 44, fill: INK, align: 'center', track: 3 });
    text(ctx, items[i].sub, 0, 46, { size: 22, fill: alpha(INK, 0.55), align: 'center', font: UI, weight: 500 });
    ctx.restore();
  }
  if (cut.label) text(ctx, cut.label, W / 2, 140, { size: 46, fill: INK, align: 'center', track: 6, alpha: ease.out(span(t, 0.05, 0.5)) });
}
