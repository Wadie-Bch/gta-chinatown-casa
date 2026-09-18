// SET B — a lit market stall. The one place the agent can actually earn.
// Built so the goods, the price board and the customer all read at a glance.
import { W, H, lerp, span, ease, clamp, rng, text, poly, circle, line, fillRR,
         measure, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, GREEN, RED, GOLD, BLUE, shade, alpha, mix } from '../palette.js';
import { cam, newScene, box, quad, flush, project } from '../g3.js';

function figure(scene, x, z, { col = BLUE, walk = 0, a = 1 } = {}) {
  const swing = Math.sin(walk * 9) * 0.34;
  box(scene, { p: [x - 0.2, 0.55, z - swing * 0.4], s: [0.28, 1.1, 0.28], color: shade(col, -0.35), a });
  box(scene, { p: [x + 0.2, 0.55, z + swing * 0.4], s: [0.28, 1.1, 0.28], color: shade(col, -0.35), a });
  box(scene, { p: [x, 1.6, z], s: [0.92, 1.1, 0.56], color: col, a });
  box(scene, { p: [x, 2.45, z], s: [0.58, 0.58, 0.58], color: shade(col, 0.22), a });
}

/** A lit stall: counter, goods on top, an illuminated price board above. */
function stall(scene, price, t) {
  // counter body — mid-tone so it reads against the black, with a gold lip
  box(scene, { p: [0, 0.55, 0], s: [3.0, 1.1, 1.5], color: '#2A3240' });
  box(scene, { p: [0, 1.16, 0], s: [3.3, 0.14, 1.75], color: GOLD });
  // goods laid out on the counter
  for (let i = -1; i <= 1; i++) {
    box(scene, { p: [i * 0.75, 1.35, 0.1], s: [0.5, 0.28, 0.5], color: i === 0 ? PAPER_2 : '#3C4757' });
  }
  // posts + illuminated price board
  box(scene, { p: [-1.45, 2.1, -0.5], s: [0.12, 2.0, 0.12], color: '#39424F' });
  box(scene, { p: [1.45, 2.1, -0.5], s: [0.12, 2.0, 0.12], color: '#39424F' });
  box(scene, { p: [0, 3.0, -0.5], s: [3.2, 0.9, 0.12], color: '#0C1119',
    deco: (c2, q) => {
      const cx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4;
      const cy = (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4;
      const h = Math.abs(q[2][1] - q[0][1]);
      text(c2, price, cx, cy + h * 0.16, { size: Math.max(12, h * 0.46), fill: GOLD, align: 'center', font: MONO, weight: 700 });
    } });
  // board frame
  box(scene, { p: [0, 3.47, -0.48], s: [3.3, 0.1, 0.16], color: GOLD });
  box(scene, { p: [0, 2.53, -0.48], s: [3.3, 0.1, 0.16], color: GOLD });
}

export function draw(ctx, t, cut) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  const c = cam({
    pos: [cut.camX ?? 3.6, cut.camY ?? 2.3, cut.camZ ?? 7.0],
    look: [cut.lookX ?? 0, cut.lookY ?? 1.7, 0], fov: cut.fov ?? 44,
  });
  const sc = newScene(c);
  quad(sc, [[-14, 0, -14], [14, 0, -14], [14, 0, 14], [-14, 0, 14]], '#0A0E14');
  for (let i = -8; i <= 8; i += 2) {
    quad(sc, [[i - 0.02, 0.005, -14], [i + 0.02, 0.005, -14], [i + 0.02, 0.005, 14], [i - 0.02, 0.005, 14]], alpha(PAPER, 0.035));
  }

  stall(sc, cut.sign ?? '$0.04', t);

  // the agent behind the counter
  if (cut.agent !== false) {
    box(sc, { p: [-0.1, 0.6, -1.5], s: [0.3, 1.2, 0.3], color: INK_3 });
    box(sc, { p: [0.4, 0.6, -1.5], s: [0.3, 1.2, 0.3], color: INK_3 });
    box(sc, { p: [0.15, 1.75, -1.5], s: [1.15, 1.2, 0.7], color: '#1FA9A0' });
    box(sc, { p: [0.15, 1.75, -1.18], s: [0.6, 0.7, 0.1], color: GOLD });
    box(sc, { p: [0.15, 2.65, -1.5], s: [0.8, 0.65, 0.7], color: PAPER_2 });
    box(sc, { p: [0.15, 2.66, -1.18], s: [0.3, 0.22, 0.06], color: GREEN });
  }

  // the customer approaches the front of the counter (never into the lens)
  if (cut.customer) {
    const walkK = ease.out(span(t, cut.walkFrom ?? 0.1, cut.walkTo ?? 1.0));
    const cz = lerp(5.6, 1.6, walkK);
    figure(sc, cut.custX ?? -1.6, cz, { col: BLUE, walk: t });
    if (cut.coin && t > (cut.walkTo ?? 1.0)) {
      const ck = clamp((t - (cut.walkTo ?? 1.0)) / 0.5, 0, 1);
      const cx2 = lerp(cut.custX ?? -1.6, 0, ck);
      const cy2 = 1.4 + Math.sin(ck * Math.PI) * 0.7;
      box(sc, { p: [cx2, cy2, lerp(1.6, 0.2, ck)], s: [0.3, 0.07, 0.3], color: GOLD, ry: t * 9 });
    }
  }
  flush(ctx, sc);

  if (cut.flashPaid) {
    const fk = span(t, cut.flashAt ?? 1.3, (cut.flashAt ?? 1.3) + 0.25);
    if (fk > 0 && fk < 1) {
      ctx.save(); ctx.globalAlpha = (1 - fk) * 0.45;
      ctx.fillStyle = GREEN; ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }
  if (cut.plate) {
    const wdt = measure(ctx, cut.plate, 24, UI, 700) + 48;
    fillRR(ctx, 60, H - 96, wdt, 46, 8, INK_3);
    text(ctx, cut.plate, 60 + wdt / 2, H - 64, { size: 24, fill: alpha(PAPER, 0.65), align: 'center', font: UI, weight: 700, track: 3 });
  }
}
