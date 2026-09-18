// SET A — a physical SEND key on a desk. Macro, press, support-ticket gag, and
// the closing reveal of the machinery under the cap.
import { W, H, lerp, span, ease, clamp, rng, text, poly, circle, line, fillRR, strokeRR,
         roundRect, contactShadow, DISPLAY, UI, MONO, clipRR } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, LIME, BLUE, CORAL, TEAL, YELLOW, WHITE, shade, alpha, mix } from '../palette.js';

/** A chunky mechanical keycap seen slightly from above. press: 0..1 */
export function keycap(ctx, cx, cy, w, h, depth, press, label, {
  top = LIME, side = shade(LIME, -0.35), labelCol = INK, labelSize = 0, glyph = null,
} = {}) {
  const d = depth * (1 - press);
  contactShadow(ctx, cx, cy + h / 2 + d * 0.55, w * 0.78, 22 + d * 0.3, 0.42 - press * 0.16);
  // walls
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, cx - w / 2, cy - h / 2, w, h + d, 18);
  ctx.fillStyle = side; ctx.fill();
  ctx.restore();
  // top face
  fillRR(ctx, cx - w / 2, cy - h / 2, w, h, 18, top);
  // bevel: one thin lighter edge, no gradient
  ctx.save();
  roundRect(ctx, cx - w / 2 + 5, cy - h / 2 + 5, w - 10, h - 10, 14);
  ctx.strokeStyle = alpha(WHITE, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
  if (label) {
    const s = labelSize || h * 0.42;
    text(ctx, label, cx, cy + s * 0.34, { size: s, fill: labelCol, align: 'center', track: s * 0.12 });
  }
  if (glyph) glyph(ctx, cx, cy, w, h);
  return { d };
}

function deskSurface(ctx, tone = 0) {
  ctx.fillStyle = mix(PAPER_3, INK, 0.62 + tone);
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = mix(PAPER_3, INK, 0.72 + tone);
  ctx.fillRect(0, H * 0.70, W, H * 0.30);
  // one horizon seam, the desk's back edge
  ctx.fillStyle = alpha(INK, 0.5); ctx.fillRect(0, H * 0.695, W, 4);
}

function neighbourKeys(ctx, press) {
  // cropped neighbouring keycaps, so SEND reads as part of a real keyboard
  const keys = [[-520, -230, 190, 150], [-480, 260, 250, 150], [620, -250, 210, 150], [560, 250, 230, 150]];
  for (const [dx, dy, kw, kh] of keys) {
    keycap(ctx, W / 2 + dx, H / 2 + dy, kw, kh, 26, 0, '', { top: mix(PAPER_3, INK, 0.30), side: mix(PAPER_3, INK, 0.55) });
  }
}

export function draw(ctx, t, cut) {
  const v = cut.view;
  if (v === 'macro' || v === 'press') return drawPress(ctx, t, cut);
  if (v === 'tickets') return drawTickets(ctx, t, cut);
  if (v === 'reveal') return drawReveal(ctx, t, cut);
  if (v === 'wide') return drawWide(ctx, t, cut);
  return drawPress(ctx, t, cut);
}

function drawPress(ctx, t, cut) {
  deskSurface(ctx);
  const tp = cut.pressAt ?? 0.75;
  const press = clamp(ease.out(span(t, tp, tp + 0.12)) - ease.out(span(t, tp + 0.30, tp + 0.62)), 0, 1);
  const zoom = lerp(1, cut.pushIn ?? 1, ease.inOut(span(t, 0, cut.dur)));
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H / 2);
  neighbourKeys(ctx, press);
  const finger = cut.finger !== false;
  keycap(ctx, W / 2, H / 2, 470, 330, 62, press, 'SEND', { labelSize: 120 });
  if (finger) drawFinger(ctx, W / 2 + 120, H / 2 - 60, press, t, tp);
  ctx.restore();

  if (press > 0.55 && cut.ring !== false) {
    const k = span(t, tp + 0.05, tp + 0.7);
    ctx.save(); ctx.globalAlpha = (1 - k) * 0.6;
    circle(ctx, W / 2, H / 2, 200 + k * 520, null, LIME, 6);
    ctx.restore();
  }
}

function drawFinger(ctx, x, y, press, t, tp) {
  const dy = press * 46 + Math.max(0, 1 - span(t, 0, tp)) * -160;
  ctx.save();
  ctx.translate(x, y + dy);
  ctx.rotate(-0.22);
  // a simple, substantial silhouette — no rendering fuss
  const p = [[0, -430], [118, -430], [118, -120], [96, -40], [58, 6], [-6, 6], [-42, -46], [-42, -300]];
  poly(ctx, p, mix(PAPER_2, '#C98F6A', 0.55), alpha(INK, 0.55), 4);
  poly(ctx, [[-6, 6], [58, 6], [50, -34], [2, -38]], mix(PAPER_2, '#B97E5C', 0.7));
  ctx.restore();
}

function drawWide(ctx, t, cut) {
  deskSurface(ctx, -0.06);
  const k = ease.out(span(t, 0, 1.1));
  ctx.save();
  ctx.translate(W / 2, H * 0.58);
  ctx.scale(lerp(0.86, 0.92, k), lerp(0.86, 0.92, k));
  // keyboard slab
  fillRR(ctx, -740, -250, 1480, 500, 30, mix(PAPER_3, INK, 0.42));
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 13; col++) {
      if (row === 2 && col >= 9 && col <= 11) continue;
      keycap(ctx, -668 + col * 111 + row * 14, -176 + row * 112, 97, 93, 16, 0,
        '', { top: mix(PAPER_3, INK, 0.24), side: mix(PAPER_3, INK, 0.48) });
    }
  }
  keycap(ctx, -668 + 10 * 111 + 2 * 14, -176 + 2 * 112, 314, 93, 18, 0, 'SEND', { labelSize: 48 });
  ctx.save();
  ctx.globalAlpha = 0.5 + Math.sin(t * 3) * 0.12;
  strokeRR(ctx, -668 + 10 * 111 + 2 * 14 - 175, -176 + 2 * 112 - 64, 350, 128, 20, LIME, 5);
  ctx.restore();
  ctx.restore();
  if (cut.label) {
    text(ctx, cut.label, W / 2, H - 158, { size: 40, fill: PAPER, align: 'center', track: 6, alpha: ease.out(span(t, 0.5, 1.1)) });
  }
}

/** Gag: a support headset drops onto SEND and repair tickets spill out. */
function drawTickets(ctx, t, cut) {
  deskSurface(ctx, -0.02);
  neighbourKeys(ctx, 0);
  const drop = ease.bounce(span(t, 0.25, 1.05));
  const press = clamp(span(t, 0.42, 0.65) * 0.8, 0, 1);
  keycap(ctx, W / 2, H / 2, 470, 330, 62, press, 'SEND', { labelSize: 120 });

  // tickets sliding out from under the cap, like a printer feeding
  const n = 14;
  for (let i = 0; i < n; i++) {
    const k = ease.out(span(t, 0.7 + i * 0.13, 1.5 + i * 0.13));
    if (k <= 0) continue;
    const dir = i % 2 ? 1 : -1;
    const x = W / 2 + dir * lerp(120, 360 + i * 42, k);
    const y = H / 2 + 60 + ((i * 53) % 260) - 60 + k * 90;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((dir * 0.12 + (i - n / 2) * 0.05) * k);
    ctx.globalAlpha = Math.min(1, k * 1.6);
    fillRR(ctx, -132, -76, 264, 152, 10, PAPER);
    ctx.fillStyle = alpha(INK, 0.16);
    for (let l = 0; l < 4; l++) ctx.fillRect(-100, -38 + l * 26, l === 3 ? 112 : 200, 9);
    fillRR(ctx, -100, -62, 76, 20, 5, CORAL);
    ctx.restore();
  }

  // headset falls last, landing across the cap
  const hk = ease.bounce(span(t, 1.5, 2.35));
  if (hk > 0) {
    ctx.save();
    ctx.translate(W / 2 + 30, lerp(-360, H / 2 - 40, hk));
    ctx.rotate(lerp(-0.7, -0.18, hk));
    drawHeadset(ctx);
    ctx.restore();
  }
  if (drop > 0.2) contactShadow(ctx, W / 2, H / 2 + 200, 360, 40, 0.3);
}

function drawHeadset(ctx) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, 150, Math.PI * 1.06, Math.PI * 1.94);
  ctx.strokeStyle = INK_3; ctx.lineWidth = 30; ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 150, Math.PI * 1.06, Math.PI * 1.94);
  ctx.strokeStyle = alpha(PAPER, 0.18); ctx.lineWidth = 8; ctx.stroke();
  for (const s of [-1, 1]) {
    fillRR(ctx, s * 150 - 42, -46, 84, 104, 26, INK_2);
    fillRR(ctx, s * 150 - 30, -34, 60, 80, 20, shade(INK_2, 0.18));
  }
  // boom mic
  ctx.beginPath();
  ctx.moveTo(-150, 50); ctx.quadraticCurveTo(-120, 168, -6, 160);
  ctx.strokeStyle = INK_3; ctx.lineWidth = 16; ctx.stroke();
  circle(ctx, -2, 160, 20, CORAL);
  ctx.restore();
}

/** Closing callback: the cap lifts and the machinery underneath is visible. */
function drawReveal(ctx, t, cut) {
  deskSurface(ctx);
  neighbourKeys(ctx, 0);
  const lift = ease.out(span(t, cut.liftAt ?? 0.6, (cut.liftAt ?? 0.6) + 1.5));
  const cx = W / 2, cy = H / 2;

  // the well under the cap
  ctx.save();
  clipRR(ctx, cx - 235, cy - 165, 470, 330, 18, () => {
    ctx.fillStyle = INK; ctx.fillRect(cx - 235, cy - 165, 470, 330);
    // gears + linkage, turning only once the cap is off the way
    const turn = t * (0.7 + lift * 1.9);
    gear(ctx, cx - 130, cy + 20, 92, 12, turn, LIME);
    gear(ctx, cx + 8, cy - 46, 66, 9, -turn * 1.4 + 0.3, BLUE);
    gear(ctx, cx + 120, cy + 44, 78, 10, turn * 1.1, PAPER_2);
    // belts
    line(ctx, cx - 130, cy + 20, cx + 8, cy - 46, alpha(PAPER, 0.25), 5);
    line(ctx, cx + 8, cy - 46, cx + 120, cy + 44, alpha(PAPER, 0.25), 5);
    // a tiny hand still turning one of them
    const hk = span(t, (cut.liftAt ?? 0.6) + 1.0, (cut.liftAt ?? 0.6) + 1.8);
    if (hk > 0 && cut.hand !== false) {
      ctx.save(); ctx.globalAlpha = hk;
      ctx.translate(cx + 120, cy + 44);
      ctx.rotate(Math.sin(turn) * 0.25);
      fillRR(ctx, -26, -150, 52, 150, 22, mix(PAPER_2, '#C98F6A', 0.55));
      circle(ctx, 0, -8, 30, mix(PAPER_2, '#C98F6A', 0.55));
      ctx.restore();
    }
  });
  ctx.restore();
  strokeRR(ctx, cx - 235, cy - 165, 470, 330, 18, alpha(INK, 0.8), 6);

  // the cap itself, lifted and tilted
  ctx.save();
  ctx.translate(cx, cy - lift * 300);
  ctx.rotate(-lift * 0.24);
  ctx.scale(1 - lift * 0.08, 1 - lift * 0.08);
  ctx.globalAlpha = 1;
  keycap(ctx, 0, 0, 470, 330, 62, 0, 'SEND', { labelSize: 120 });
  ctx.restore();
}

function gear(ctx, x, y, r, teeth, rot, col) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2, a1 = ((i + 0.5) / teeth) * Math.PI * 2, a2 = ((i + 1) / teeth) * Math.PI * 2;
    ctx.lineTo(Math.cos(a0) * r, Math.sin(a0) * r);
    ctx.lineTo(Math.cos(a0 + 0.06) * (r * 1.19), Math.sin(a0 + 0.06) * (r * 1.19));
    ctx.lineTo(Math.cos(a1 - 0.06) * (r * 1.19), Math.sin(a1 - 0.06) * (r * 1.19));
    ctx.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
    ctx.lineTo(Math.cos(a2) * r, Math.sin(a2) * r);
  }
  ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  circle(ctx, 0, 0, r * 0.32, INK);
  ctx.restore();
}
