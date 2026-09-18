// SET F — the hidden bill, physically. A cable runs out of the agent's world,
// across the floor, and plugs into a meter that somebody else pays.
import { W, H, lerp, span, ease, clamp, rng, text, poly, circle, line, fillRR, strokeRR,
         measure, contactShadow, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, GREEN, RED, GOLD, BLUE, shade, alpha, mix } from '../palette.js';

function rack(ctx, x, y, w, h, seed, t) {
  fillRR(ctx, x, y, w, h, 10, mix(PAPER_3, INK, 0.72));
  strokeRR(ctx, x, y, w, h, 10, alpha(PAPER, 0.14), 2);
  const r = rng(seed);
  for (let i = 0; i < 6; i++) {
    const ry = y + 16 + i * (h - 32) / 6;
    fillRR(ctx, x + 12, ry, w - 24, (h - 32) / 6 - 8, 3, alpha(PAPER, 0.05));
    const blink = ((t * 2 + i * 0.37) % 1) < 0.6;
    circle(ctx, x + 26, ry + 8, 4, blink ? GREEN : alpha(PAPER, 0.18));
  }
}

export function draw(ctx, t, cut) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = INK_2; ctx.fillRect(0, H * 0.74, W, H * 0.26);

  rack(ctx, 110, H * 0.24, 230, H * 0.48, 771, t);
  if (cut.twoRacks !== false) rack(ctx, 370, H * 0.24, 230, H * 0.48, 992, t);

  // the cable: a real object sagging across the floor to the meter
  const x0 = 600, y0 = H * 0.68, x1 = W - 390, y1 = H * 0.60;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo((x0 + x1) / 2, y0 + 120, x1, y1);
  ctx.strokeStyle = mix(PAPER_3, INK, 0.72); ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.stroke();
  ctx.strokeStyle = alpha(PAPER, 0.10); ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();

  // current pulsing along the cable — small, deliberate, not ambient glitter
  if (cut.flow !== false) {
    for (let i = 0; i < 3; i++) {
      const u = ((t * 0.5 + i / 3) % 1);
      const mx = lerp(lerp(x0, (x0 + x1) / 2, u), lerp((x0 + x1) / 2, x1, u), u);
      const my = lerp(lerp(y0, y0 + 120, u), lerp(y0 + 120, y1, u), u);
      circle(ctx, mx, my, 6, alpha(GOLD, 0.8));
    }
  }

  // the meter: a physical box with a spinning disc and a counter
  const mx0 = W - 360, my0 = H * 0.36;
  fillRR(ctx, mx0, my0, 300, 320, 14, mix(PAPER_3, INK, 0.5));
  strokeRR(ctx, mx0, my0, 300, 320, 14, alpha(PAPER, 0.2), 3);
  const cxm = mx0 + 150, cym = my0 + 118;
  circle(ctx, cxm, cym, 74, '#04060A');
  circle(ctx, cxm, cym, 74, null, alpha(PAPER, 0.25), 3);
  // spinning disc, speed tied to load
  const spin = t * (cut.spin ?? 3);
  line(ctx, cxm, cym, cxm + Math.cos(spin) * 56, cym + Math.sin(spin) * 56, GOLD, 5);
  circle(ctx, cxm, cym, 9, PAPER_2);
  // counter wheels
  const val = Math.floor((cut.kwhFrom ?? 0) + ((cut.kwhTo ?? 40) - (cut.kwhFrom ?? 0)) * ease.out(span(t, 0.1, cut.dur * 0.9)));
  const digits = String(val).padStart(4, '0');
  fillRR(ctx, cxm - 104, my0 + 214, 208, 62, 6, '#04060A');
  for (let i = 0; i < 4; i++) {
    text(ctx, digits[i], cxm - 78 + i * 52, my0 + 258, { size: 42, fill: PAPER, align: 'center', font: MONO, weight: 700 });
  }

  // whose bill it is — stamped on the meter housing itself
  if (cut.billedTo) {
    text(ctx, cut.billedTo, cxm, my0 - 22, { size: 30, fill: RED, align: 'center', font: DISPLAY, weight: 700, track: 4,
      alpha: ease.out(span(t, cut.billAt ?? 0.4, (cut.billAt ?? 0.4) + 0.35)) });
  }

  // a hand entering frame to pay it
  if (cut.hand) {
    const hk = ease.out(span(t, cut.handAt ?? 0.6, (cut.handAt ?? 0.6) + 0.5));
    if (hk > 0) {
      ctx.save();
      ctx.globalAlpha = hk;
      ctx.translate(cxm + 190, H + 40 - hk * 260);
      ctx.rotate(-0.12);
      fillRR(ctx, -46, 0, 92, 420, 40, mix(PAPER_2, '#C98F6A', 0.5));
      for (let i = 0; i < 3; i++) {
        ctx.save(); ctx.translate(-30 + i * 30, -14); ctx.rotate((i - 1) * 0.12);
        fillRR(ctx, -16, -70, 32, 92, 16, mix(PAPER_2, '#D6A079', 0.45));
        ctx.restore();
      }
      ctx.restore();
    }
  }
  if (cut.plate) {
    const wdt = measure(ctx, cut.plate, 24, UI, 700) + 48;
    fillRR(ctx, 60, H - 96, wdt, 46, 8, INK_3);
    text(ctx, cut.plate, 60 + wdt / 2, H - 64, { size: 24, fill: alpha(PAPER, 0.65), align: 'center', font: UI, weight: 700, track: 3 });
  }
}
