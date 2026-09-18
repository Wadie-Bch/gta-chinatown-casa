// SET A — the agent, as a physical machine. It has a glass hopper in its chest
// holding its entire net worth in coins. Every thought physically ejects one.
// This is the workhorse set: a character with a body and visible stakes,
// not a number on a black screen.
import { W, H, lerp, span, ease, clamp, rng, text, poly, circle, line, fillRR, strokeRR,
         measure, contactShadow, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, GREEN, RED, GOLD, BLUE, shade, alpha, mix } from '../palette.js';
import { cam, newScene, box, quad, flush, project } from '../g3.js';

const FLOOR = '#0A0E14';

/** A coin as a thin gold box, spun to catch the light. */
function coin(scene, p, spin, a = 1, col = GOLD) {
  box(scene, { p, s: [0.44, 0.09, 0.44], ry: spin, color: col, a });
}

/**
 * Coins falling out of the hopper. Closed-form ballistics so any seek
 * reproduces the exact same frame.
 */
function spilled(scene, t, drops, floorY = 0.06) {
  for (const d of drops) {
    const dt = t - d.t;
    if (dt < 0) continue;
    const g = 9.0;
    let y = d.y0 - 0.5 * g * dt * dt;
    let vx = d.vx ?? 0.7, vz = d.vz ?? 0;
    let x = d.x + vx * dt, z = (d.z ?? 0) + vz * dt;
    if (y < floorY) {
      // one damped bounce, then it lies flat and slides to a stop
      const tHit = Math.sqrt(Math.max(0, 2 * (d.y0 - floorY) / g));
      const after = dt - tHit;
      const vy = g * tHit * 0.42;
      y = floorY + Math.max(0, vy * after - 0.5 * g * after * after);
      const slide = Math.min(after, 0.9);
      x = d.x + vx * tHit + vx * 0.5 * slide;
      z = (d.z ?? 0) + vz * tHit + vz * 0.5 * slide;
      if (y <= floorY) y = floorY;
    }
    coin(scene, [x, y, z], dt * 9 + d.x, 1, d.col ?? GOLD);
  }
}

/** The agent: legs, body, a glass hopper full of coins, a single eye. */
function agent(scene, x, z, { coins = 100, walk = 0, a = 1, lean = 0, scale = 1, dim = 0 } = {}) {
  const s = scale;
  const swing = Math.sin(walk * 8) * 0.38;
  const bob = Math.abs(Math.sin(walk * 8)) * 0.08 * s;
  const body = mix('#1FA9A0', INK, dim * 0.45);
  const shell = mix(PAPER_2, INK, dim * 0.4);

  box(scene, { p: [x - 0.26 * s, (0.5 + bob) * s, z - swing * 0.5], s: [0.3 * s, 1.0 * s, 0.3 * s], color: INK_3, a });
  box(scene, { p: [x + 0.26 * s, (0.5 + bob) * s, z + swing * 0.5], s: [0.3 * s, 1.0 * s, 0.3 * s], color: INK_3, a });

  // torso
  box(scene, { p: [x, (1.62 + bob) * s, z + lean * 0.2], s: [1.25 * s, 1.3 * s, 0.8 * s], color: body, a });

  // the hopper: a glass box on the chest with a visible coin stack inside
  const hx = x, hy = (1.62 + bob) * s, hz = z + lean * 0.2 + 0.43 * s;
  // An open, recessed hopper: a dark well with a bright frame around it and the
  // coin stack sitting inside. Reads instantly at any size, and avoids relying
  // on translucency (face shading drops the alpha channel).
  box(scene, { p: [hx, hy, hz - 0.12 * s], s: [0.80 * s, 0.92 * s, 0.10 * s], color: '#04060A', a });
  const stack = clamp(coins / 100, 0, 1);
  const levels = Math.max(0, Math.round(stack * 7));
  for (let i = 0; i < levels; i++) {
    box(scene, { p: [hx, hy - 0.38 * s + i * 0.12 * s, hz - 0.10 * s], s: [0.62 * s, 0.085 * s, 0.20 * s],
      color: coins <= 12 ? RED : GOLD, a });
  }
  // frame: four bars, so the opening reads as a window into the machine
  const fw = 0.90 * s, fh = 1.02 * s, bar = 0.10 * s;
  box(scene, { p: [hx, hy + fh / 2, hz], s: [fw, bar, 0.16 * s], color: shell, a });
  box(scene, { p: [hx, hy - fh / 2, hz], s: [fw, bar, 0.16 * s], color: shell, a });
  box(scene, { p: [hx - fw / 2, hy, hz], s: [bar, fh, 0.16 * s], color: shell, a });
  box(scene, { p: [hx + fw / 2, hy, hz], s: [bar, fh, 0.16 * s], color: shell, a });

  // arms
  box(scene, { p: [x - 0.82 * s, (1.6 + bob) * s, z + swing * 0.4], s: [0.26 * s, 1.0 * s, 0.26 * s], color: shade(body, -0.2), a });
  box(scene, { p: [x + 0.82 * s, (1.6 + bob) * s, z - swing * 0.4], s: [0.26 * s, 1.0 * s, 0.26 * s], color: shade(body, -0.2), a });

  // head + eye
  box(scene, { p: [x, (2.6 + bob) * s, z], s: [0.9 * s, 0.72 * s, 0.8 * s], color: shell, a });
  box(scene, { p: [x, (2.62 + bob) * s, z + 0.42 * s], s: [0.34 * s, 0.26 * s, 0.06 * s],
    color: coins <= 12 ? RED : GREEN, a });
}

/** The grate the spent coins fall through — money physically leaving the frame. */
function grate(scene, z0 = 0) {
  quad(scene, [[-1.6, 0.02, z0 - 1.3], [1.6, 0.02, z0 - 1.3], [1.6, 0.02, z0 + 1.3], [-1.6, 0.02, z0 + 1.3]], '#05070A');
  for (let i = -3; i <= 3; i++) {
    quad(scene, [[i * 0.42 - 0.06, 0.03, z0 - 1.3], [i * 0.42 + 0.06, 0.03, z0 - 1.3],
                 [i * 0.42 + 0.06, 0.03, z0 + 1.3], [i * 0.42 - 0.06, 0.03, z0 + 1.3]], INK_3);
  }
}

function room(scene, cut) {
  quad(scene, [[-30, 0, -30], [30, 0, -30], [30, 0, 30], [-30, 0, 30]], FLOOR);
  // floor grid, faint, gives the space depth without becoming wallpaper
  for (let i = -12; i <= 12; i += 3) {
    quad(scene, [[i - 0.02, 0.005, -30], [i + 0.02, 0.005, -30], [i + 0.02, 0.005, 30], [i - 0.02, 0.005, 30]], alpha(PAPER, 0.035));
    quad(scene, [[-30, 0.005, i - 0.02], [30, 0.005, i - 0.02], [30, 0.005, i + 0.02], [-30, 0.005, i + 0.02]], alpha(PAPER, 0.035));
  }
}

function makeCam(cut, t, ax) {
  const k = span(t, 0, cut.dur);
  switch (cut.view) {
    case 'hopper':   // tight on the chest: coins visibly leaving the machine
      return cam({ pos: [ax + 0.42, 1.80, 3.2 - k * 0.28], look: [ax, 1.58, 0], fov: 38 });
    case 'low':      // heroic low angle
      return cam({ pos: [ax + 1.5, 0.55, 4.2], look: [ax, 1.7, 0], fov: 48 });
    case 'side':     // three-quarter: the hopper stays readable from the side
      return cam({ pos: [ax + 4.4, 1.9, 3.9], look: [ax, 1.45, 0.1], fov: 42 });
    case 'over':     // looking down at the grate and the pile of spent coins
      return cam({ pos: [ax + 0.4, 4.2, 2.5], look: [ax, 0.2, 0.5], fov: 48 });
    case 'wide':
    default:
      return cam({ pos: [ax + 2.1 + k * 0.25, 2.25, 5.0], look: [ax, 1.45, 0], fov: 46 });
  }
}

export function draw(ctx, t, cut) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  const ax = cut.ax ?? 0;
  const c = makeCam(cut, t, ax);
  const sc = newScene(c);
  room(sc, cut);
  if (cut.grate !== false) grate(sc, 0.9);

  // coins already on the floor from earlier in the story
  if (cut.pile) {
    const r = rng(4242);
    for (let i = 0; i < cut.pile; i++) {
      const a = r() * Math.PI * 2, d = 0.5 + r() * 1.7;
      coin(sc, [ax + Math.cos(a) * d, 0.06 + (i % 3) * 0.02, 0.9 + Math.sin(a) * d * 0.7], r() * 6);
    }
  }

  spilled(sc, t, cut.drops ?? []);

  // coins arriving: money physically travelling up into the hopper
  for (const c of cut.intake ?? []) {
    const dt = t - c.t;
    if (dt < 0 || dt > 1.1) continue;
    const k = clamp(dt / 0.75, 0, 1);
    const x = lerp(ax + (c.fromX ?? 2.4), ax, ease.out(k));
    const y = lerp(0.1, 1.62, ease.out(k)) + Math.sin(k * Math.PI) * 0.6;
    const z = lerp(c.fromZ ?? 1.4, 0.4, ease.out(k));
    coin(sc, [x, y, z], dt * 10, 1 - Math.max(0, (dt - 0.75) / 0.35));
  }

  const coins = typeof cut.coinsAt === 'function' ? cut.coinsAt(t)
    : cut.coinsFrom != null ? lerp(cut.coinsFrom, cut.coinsTo, ease.out(span(t, cut.coinsFrom === cut.coinsTo ? 99 : 0.1, cut.dur * 0.8)))
    : (cut.coins ?? 100);
  agent(sc, ax, 0, {
    coins,
    walk: cut.walking ? t * (cut.walkRate ?? 1) : 0,
    lean: cut.lean ?? 0,
    scale: cut.scale ?? 1,
    dim: cut.dim ?? 0,
  });

  flush(ctx, sc);

  // Tally plate. Anchored in screen space inside the safe area: projecting it
  // from a world point put it off-frame entirely in the tight macro views.
  if (cut.plate !== false) {
    const shown = Math.max(0, Math.round(coins));
    const label = shown + '\u00A2';
    const wdt = Math.max(150, measure(ctx, label, 46, MONO, 700) + 76), hgt = 76;
    const px = W - wdt - 54, py = H - hgt - 150;
    ctx.save();
    fillRR(ctx, px, py, wdt, hgt, 8, INK_2);
    strokeRR(ctx, px, py, wdt, hgt, 8, alpha(PAPER, 0.22), 2);
    text(ctx, label, px + wdt / 2, py + 54, { size: 46, fill: shown <= 12 ? RED : GOLD, align: 'center', font: MONO, weight: 700 });
    ctx.restore();
  }
}
