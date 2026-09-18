// SET B — the courier city. Real 3D cameras: dive, chase, street, overhead.
import { W, H, lerp, span, ease, clamp, rng, text, poly, circle, line, fillRR, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, LIME, BLUE, CORAL, TEAL, YELLOW, WHITE, shade, alpha, mix } from '../palette.js';
import { cam, newScene, box, quad, flush, billboard, windowGrid, project } from '../g3.js';

const ROAD = 7.5;        // half width of the carriageway
const WALK = 10.5;       // kerb line
const PAVE = 14.6;       // building frontage
const VAN_Z = 196;       // where the delivery van waits

// ---------------------------------------------------------------- world
let world = null;
function buildWorld() {
  if (world) return world;
  const r = rng(20261118);
  const blocks = [];
  for (let z = -40; z < 320; z += 22) {
    if (((z + 400) % 88) < 22) continue;              // cross street gap
    for (const side of [-1, 1]) {
      const depth = 14 + r() * 10;
      const h = 9 + Math.pow(r(), 1.9) * 31;
      const w = 16 + r() * 5;
      const tone = ['#1B2230', '#272F3F', '#2E3648', '#3B4354', '#4A4436'][(r() * 5) | 0];
      blocks.push({
        p: [side * (WALK + depth / 2 + 4.2), h / 2, z + 11],
        s: [depth, h, w], color: tone, side,
        cols: 3 + ((r() * 3) | 0), rows: Math.max(3, Math.round(h / 5.5)),
        lit: 0.18 + r() * 0.3, seed: (r() * 1e6) | 0,
        roof: r() < 0.5 ? { h: 1 + r() * 3, w: 3 + r() * 4, off: (r() - 0.5) * 6 } : null,
        accent: r() < 0.22 ? (r() < 0.5 ? LIME : BLUE) : null,
      });
    }
  }
  const lamps = [];
  for (let z = -20; z < 320; z += 26) for (const side of [-1, 1]) lamps.push({ z, side });
  world = { blocks, lamps };
  return world;
}

// ---------------------------------------------------------------- actors
/** Courier path. Deterministic: position is a pure function of time. */
export function courierAt(t, cut) {
  const speed = cut.speed ?? 15;
  let z = (cut.z0 ?? 0) + t * speed;
  let x = Math.sin(t * 0.85 + (cut.phase ?? 0)) * (cut.weave ?? 2.4);
  if (cut.stopAt != null && z > cut.stopAt) z = cut.stopAt;      // invisible wall
  if (cut.frozen) { z = cut.z0 ?? 0; x = cut.freezeX ?? 0; }
  if (cut.lockX != null) x = cut.lockX;
  return { x, z, run: cut.frozen ? 0 : t };
}

function drawCourier(scene, p, runT, { a = 1, teal = TEAL, carrying = 0 } = {}) {
  const swing = Math.sin(runT * 11) * 0.55;
  const bob = Math.abs(Math.sin(runT * 11)) * 0.16;
  const y = p.y ?? 0;
  const lean = 0.12;
  // legs
  box(scene, { p: [p.x - 0.28, y + 0.75 + bob, p.z - swing * 0.7], s: [0.42, 1.5, 0.42], color: INK_2, a });
  box(scene, { p: [p.x + 0.28, y + 0.75 + bob, p.z + swing * 0.7], s: [0.42, 1.5, 0.42], color: INK_2, a });
  // torso
  box(scene, { p: [p.x, y + 2.25 + bob, p.z + lean], s: [1.15, 1.45, 0.78], color: teal, a });
  // arms
  box(scene, { p: [p.x - 0.78, y + 2.35 + bob, p.z + swing * 0.5], s: [0.34, 1.15, 0.34], color: shade(teal, -0.18), a });
  box(scene, { p: [p.x + 0.78, y + 2.35 + bob, p.z - swing * 0.5], s: [0.34, 1.15, 0.34], color: shade(teal, -0.18), a });
  // backpack + head + cap
  box(scene, { p: [p.x, y + 2.45 + bob, p.z - 0.62], s: [0.95, 1.2, 0.55], color: YELLOW, a });
  box(scene, { p: [p.x, y + 3.35 + bob, p.z], s: [0.78, 0.78, 0.78], color: PAPER_2, a });
  box(scene, { p: [p.x, y + 3.75 + bob, p.z + 0.08], s: [0.86, 0.22, 0.9], color: teal, a });
  for (let i = 0; i < carrying; i++) {
    box(scene, { p: [p.x, y + 3.05 + bob + i * 0.5, p.z - 0.62], s: [0.6, 0.45, 0.4], color: YELLOW, a });
  }
}

function drawVan(scene, z, { a = 1, doorOpen = 0 } = {}) {
  box(scene, { p: [0, 1.85, z], s: [3.1, 2.7, 6.4], color: WHITE, a,
    deco: (ctx, q, key) => {
      if (key !== 'left' && key !== 'right') return;
      poly(ctx, [q[0], q[1], q[2], q[3]], null);
      const m = (u, v) => [q[0][0] + (q[1][0] - q[0][0]) * u + (q[3][0] - q[0][0]) * v,
                           q[0][1] + (q[1][1] - q[0][1]) * u + (q[3][1] - q[0][1]) * v];
      const a1 = m(0.18, 0.34), b1 = m(0.82, 0.34), c1 = m(0.82, 0.60), d1 = m(0.18, 0.60);
      poly(ctx, [a1, b1, c1, d1], alpha(TEAL, 0.9));
    } });
  box(scene, { p: [0, 1.25, z + 3.9], s: [3.0, 1.9, 1.6], color: shade(WHITE, -0.1), a });
  box(scene, { p: [0, 1.95, z + 4.5], s: [2.6, 0.9, 0.4], color: INK_2, a });
  for (const dx of [-1.45, 1.45]) for (const dz of [-2.1, 3.2]) {
    box(scene, { p: [dx, 0.5, z + dz], s: [0.4, 1.0, 1.0], color: INK, a });
  }
  if (doorOpen > 0) {
    // the back of the van standing open: a dark opening with a lit rim
    box(scene, { p: [0, 1.6, z - 3.28], s: [2.5, 2.0, 0.12], color: '#0E1219', a: a * doorOpen });
    box(scene, { p: [0, 2.62, z - 3.26], s: [2.6, 0.16, 0.14], color: LIME, a: a * doorOpen });
    box(scene, { p: [-1.28, 1.6, z - 3.26], s: [0.16, 2.0, 0.14], color: LIME, a: a * doorOpen });
    box(scene, { p: [1.28, 1.6, z - 3.26], s: [0.16, 2.0, 0.14], color: LIME, a: a * doorOpen });
  }
}

function drawCar(scene, c, a = 1) {
  const col = c.col;
  box(scene, { p: [c.x, 0.85, c.z], s: [2.3, 1.1, 4.6], color: col, ry: c.ry || 0, a });
  box(scene, { p: [c.x, 1.65, c.z - (c.dir > 0 ? 0.3 : -0.3)], s: [2.0, 0.85, 2.3], color: shade(col, -0.22), ry: c.ry || 0, a });
  for (const dx of [-1.05, 1.05]) for (const dz of [-1.5, 1.5]) {
    box(scene, { p: [c.x + dx * Math.cos(c.ry || 0), 0.38, c.z + dz * Math.cos(c.ry || 0)], s: [0.32, 0.72, 0.72], color: INK, a });
  }
}

/**
 * Traffic is a closed-form function of time, so seeking is exact.
 * Cars are placed in a window that travels with the courier, which keeps the
 * street populated whatever stretch of road a shot happens to be looking at.
 */
function traffic(t, cut) {
  const cars = [];
  const r = rng(4242);
  const n = cut.cars ?? 12;
  const base = cut.z0 ?? 0;
  const period = cut.period ?? 200;
  const wrap = v => ((v % period) + period) % period;
  for (let i = 0; i < n; i++) {
    const dir = r() < 0.5 ? 1 : -1;
    const lane = dir > 0 ? (r() < 0.5 ? 2.6 : 5.2) : (r() < 0.5 ? -2.6 : -5.2);
    const sp = (11 + r() * 9) * dir * (cut.trafficSpeed ?? 1);
    const z0 = r() * period;
    const z = base - 74 + wrap(z0 + t * sp);
    cars.push({ x: lane, z, dir, ry: dir > 0 ? 0 : Math.PI, col: [BLUE, CORAL, PAPER_3, '#6D7B94'][(r() * 4) | 0] });
  }
  if (cut.parked !== false) {
    const pr = rng(9911);
    for (let i = 0; i < 22; i++) {
      const side = pr() < 0.5 ? -1 : 1;
      const z = base - 80 + i * 17 + pr() * 7;
      cars.push({ x: side * (ROAD + 1.6), z, dir: side > 0 ? 1 : -1, parked: true,
                  ry: side > 0 ? 0 : Math.PI, col: ['#6D7B94', PAPER_3, '#4E5A70'][(pr() * 3) | 0] });
    }
  }
  if (cut.crossTraffic) {
    for (let i = 0; i < 3; i++) {
      const z = 88 * (i + 1) - 6;
      const sp = 16 + i * 4;
      let x = (((-30 + t * sp) % 90) + 90) % 90 - 45;
      cars.push({ x, z, dir: 1, ry: Math.PI / 2, col: i % 2 ? LIME : PAPER_2 });
    }
  }
  return cars;
}

function parcelsFor(cut) {
  return (cut.parcels ?? []).map((p, i) => ({ x: p[0], z: p[1], i }));
}

// ---------------------------------------------------------------- cameras
function makeCamera(cut, t, cr) {
  const v = cut.view;
  const kx = cut.camX ?? 0;
  if (v === 'dive') {
    const k = ease.inOut(span(t, 0, cut.dur));
    const y = lerp(150, 7.5, k);
    const zBack = lerp(-120, -13, k);
    return cam({ pos: [lerp(22, 0, k), y, cr.z + zBack], look: [cr.x, lerp(0, 2.4, k), cr.z + lerp(30, 8, k)], fov: lerp(38, 58, k) });
  }
  if (v === 'chase') {
    const k = span(t, 0, cut.dur);
    return cam({ pos: [cr.x * 0.45 + kx, 4.4 + (cut.rise ?? 0) * k, cr.z - 10.5 - (cut.pull ?? 0) * k],
                 look: [cr.x * 0.6, 2.2, cr.z + 9], fov: cut.fov ?? 52 });
  }
  if (v === 'street') {
    // from the far pavement, looking across the carriageway as the courier passes.
    // The camera parks itself where the courier will be mid-shot, so the pass is centred.
    const side = cut.side === -1 ? -1 : 1;
    const mid = cut.frozen ? (cut.z0 ?? 0) - 0.5
                           : (cut.z0 ?? 0) + (cut.speed ?? 15) * (cut.dur ?? 2) * 0.5;
    return cam({ pos: [side * (cut.camDist ?? 13.5), cut.camY ?? 4.6, cut.camZ ?? mid],
                 look: [cr.x, cut.lookY ?? 1.5, cr.z], fov: cut.fov ?? 38 });
  }
  if (v === 'overhead') {
    const k = span(t, 0, cut.dur);
    const y = (cut.camY ?? 32) - (cut.descend ?? 0) * k;
    return cam({ pos: [cr.x * 0.3, y, cr.z - 9], look: [cr.x * 0.3, 0, cr.z + 5], fov: cut.fov ?? 44, roll: (cut.roll ?? 0) * k });
  }
  if (v === 'lowfront') {                                 // low angle just ahead of the courier
    return cam({ pos: [cr.x + (kx || 1.1), cut.camY ?? 2.9, cr.z + (cut.camDist ?? 9.6)],
                 look: [cr.x, 2.1, cr.z], fov: cut.fov ?? 40 });
  }
  if (v === 'vanwide') {
    const k = span(t, 0, cut.dur);
    const vz = cut.vanZ ?? VAN_Z;
    return cam({ pos: [4.9 - k * 0.7, 3.0, vz - 19], look: [0, 1.95, vz - 4.5], fov: cut.fov ?? 40 });
  }
  return cam({ pos: [0, 6, cr.z - 14], look: [0, 2, cr.z + 6], fov: 52 });
}

// ---------------------------------------------------------------- draw
export function draw(ctx, t, cut) {
  const wd = buildWorld();
  const cr3 = courierAt(t, cut);
  const camera = makeCamera(cut, t, cr3);
  const sc = newScene(camera);

  // sky — flat warm paper, no gradient
  ctx.fillStyle = cut.night ? INK : PAPER_2;
  ctx.fillRect(0, 0, W, H);

  // ground
  const GROUND = cut.night ? '#0C0F16' : mix(PAPER_3, INK, 0.56);
  const WALKC = cut.night ? '#12161F' : mix(PAPER_3, INK, 0.38);
  quad(sc, [[-260, 0, -80], [260, 0, -80], [260, 0, 420], [-260, 0, 420]], GROUND);
  quad(sc, [[-ROAD - 3, 0.02, -80], [ROAD + 3, 0.02, -80], [ROAD + 3, 0.02, 420], [-ROAD - 3, 0.02, 420]], INK_2);
  for (const side of [-1, 1]) {
    quad(sc, [[side * (ROAD + 3), 0.16, -80], [side * PAVE, 0.16, -80], [side * PAVE, 0.16, 420], [side * (ROAD + 3), 0.16, 420]], WALKC);
    quad(sc, [[side * (ROAD + 3), 0.17, -80], [side * (ROAD + 3.35), 0.17, -80], [side * (ROAD + 3.35), 0.17, 420], [side * (ROAD + 3), 0.17, 420]], mix(PAPER_3, INK, 0.62));
  }
  // lane dashes
  for (let z = -60; z < 400; z += 12) {
    quad(sc, [[-0.22, 0.05, z], [0.22, 0.05, z], [0.22, 0.05, z + 6], [-0.22, 0.05, z + 6]], PAPER_2);
  }
  // cross streets
  for (let cz = 44; cz < 400; cz += 88) {
    quad(sc, [[-260, 0.04, cz], [260, 0.04, cz], [260, 0.04, cz + 14], [-260, 0.04, cz + 14]], INK_2);
  }

  // buildings
  for (const b of wd.blocks) {
    if (Math.abs(b.p[2] - cr3.z) > 210) continue;
    box(sc, {
      p: b.p, s: b.s, color: b.color,
      deco: (c2, q, key) => {
        if (key === 'top' || key === 'bottom') return;
        windowGrid(b.cols, b.rows, b.lit, cut.night ? YELLOW : alpha(PAPER, 0.42), b.seed)(c2, q);
      },
    });
    if (b.roof) box(sc, { p: [b.p[0] + b.roof.off, b.s[1] + b.roof.h / 2, b.p[2]], s: [b.roof.w, b.roof.h, b.roof.w], color: shade(b.color, 0.1) });
    if (b.accent) box(sc, { p: [b.p[0] - b.side * (b.s[0] / 2 + 0.3), b.s[1] * 0.72, b.p[2]], s: [0.5, 2.2, 6], color: b.accent });
  }
  // street lamps
  for (const l of wd.lamps) {
    if (Math.abs(l.z - cr3.z) > 130) continue;
    box(sc, { p: [l.side * (WALK + 1.4), 3, l.z], s: [0.3, 6, 0.3], color: INK_3 });
    box(sc, { p: [l.side * (WALK + 0.1), 5.9, l.z], s: [2.8, 0.28, 0.28], color: INK_3 });
    box(sc, { p: [l.side * (WALK - 1.1), 5.6, l.z], s: [0.9, 0.3, 0.9], color: cut.night ? YELLOW : PAPER_2 });
  }

  // parcels
  for (const p of parcelsFor(cut)) {
    const picked = cut.pickup && cr3.z > p.z;
    if (picked) continue;
    const spin = t * 1.6 + p.i;
    const hover = 0.8 + Math.sin(t * 2.2 + p.i) * 0.18;
    box(sc, { p: [p.x, hover, p.z], s: [1.1, 1.1, 1.1], color: YELLOW, ry: spin,
      deco: (c2, q) => { poly(c2, q, null, INK, 2); } });
    box(sc, { p: [p.x, hover, p.z], s: [1.18, 0.22, 0.28], color: PAPER, ry: spin });
  }

  // traffic
  const camPos = camera.pos;
  for (const c of traffic(cut.frozen ? (cut.trafficTime != null ? cut.trafficTime + t : t) : t, cut)) {
    if (Math.abs(c.z - cr3.z) > 170) continue;
    const clear = c.parked ? (cut.parkClear ?? 9) : (cut.carClear ?? 0);
    if (clear && Math.hypot(c.x - camPos[0], c.z - camPos[2]) < clear) continue;
    drawCar(sc, c);
  }

  // van
  if (cut.van !== false) drawVan(sc, cut.vanZ ?? VAN_Z, { doorOpen: cut.vanOpen ? span(t, 0.4, 1.2) : 0 });

  // courier
  drawCourier(sc, { x: cr3.x, y: 0, z: cr3.z }, cr3.run, { carrying: cut.carrying ?? 0 });

  flush(ctx, sc);

  // ---- in-world overlays that must sit on top of the 3D ----
  if (cut.invisibleWall) drawInvisibleWall(ctx, camera, cut, t, cr3);
  if (cut.gameHud) drawGameHud(ctx, t, cut);
  if (cut.clipTimer) drawClipTimer(ctx, t, cut);
  if (cut.gameOver) drawGameOver(ctx, t, cut);
  if (cut.pausePanel) drawPausePanel(ctx, t, cut);
  if (cut.vignette !== false) vignette(ctx);
}

/** The fifteen-second clip that sells a prototype, counting itself down. */
function drawClipTimer(ctx, t, cut) {
  const left = Math.max(0, 15 - t * (cut.clipRate ?? 3.4));
  ctx.save();
  fillRR(ctx, W - 214, H - 186, 168, 58, 8, alpha(INK, 0.8));
  circle(ctx, W - 186, H - 157, 9, CORAL);
  text(ctx, '0:' + String(Math.ceil(left)).padStart(2, '0'), W - 164, H - 138, {
    size: 32, fill: PAPER, font: MONO, weight: 600 });
  ctx.restore();
}

/** A cropped loss bar — only the part that matters, never a full screen of text. */
function drawGameOver(ctx, t, cut) {
  const k = ease.out(span(t, cut.overAt ?? 0.5, (cut.overAt ?? 0.5) + 0.25));
  if (k <= 0) return;
  ctx.save();
  ctx.globalAlpha = k;
  ctx.fillStyle = alpha(INK, 0.55); ctx.fillRect(0, 0, W, H);
  const bh = 150;
  ctx.fillStyle = CORAL; ctx.fillRect(0, H / 2 - bh / 2, W, bh);
  text(ctx, cut.overLabel ?? 'RUN OVER', W / 2, H / 2 + 22, { size: 74, fill: INK, align: 'center', track: 8 });
  ctx.restore();
}

function vignette(ctx) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.92);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(17,21,29,0.34)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

function drawInvisibleWall(ctx, camera, cut, t, cr) {
  const k = span(t, cut.wallShowAt ?? 1.6, (cut.wallShowAt ?? 1.6) + 0.45);
  if (k <= 0) return;
  const z = cut.stopAt + 1.15;
  const corners = [[-ROAD, 0, z], [ROAD, 0, z], [ROAD, 9, z], [-ROAD, 9, z]].map(p => project(camera, p));
  if (corners.some(c => !c)) return;
  ctx.save();
  ctx.globalAlpha = k * 0.85;
  poly(ctx, corners, alpha(CORAL, 0.1));
  ctx.setLineDash([16, 12]);
  ctx.lineDashOffset = -t * 40;
  poly(ctx, corners, null, CORAL, 4);
  ctx.setLineDash([]);
  // hatching
  for (let i = 1; i < 9; i++) {
    const a = [lerp(corners[0][0], corners[1][0], i / 9), lerp(corners[0][1], corners[1][1], i / 9)];
    const b = [lerp(corners[3][0], corners[2][0], i / 9), lerp(corners[3][1], corners[2][1], i / 9)];
    line(ctx, a[0], a[1], b[0], b[1], alpha(CORAL, 0.28), 2);
  }
  ctx.restore();
  // the courier bumping: small recoil marks
  const cp = project(camera, [cr.x, 2.3, cr.z + 0.9]);
  if (cp && t > (cut.wallShowAt ?? 1.6)) {
    const p = (t * 3) % 1;
    circle(ctx, cp[0], cp[1], 14 + p * 40, null, alpha(CORAL, (1 - p) * 0.55 * k), 3);
  }
}

// Cropped game UI — only what matters, never a full frame of text.
function drawGameHud(ctx, t, cut) {
  const got = cut.hudParcels ?? 0;
  const x = 46, y = 42;
  ctx.save();
  fillRR(ctx, x, y, 210, 64, 10, alpha(INK, 0.82));
  for (let i = 0; i < 3; i++) {
    const on = i < got;
    fillRR(ctx, x + 18 + i * 46, y + 18, 30, 28, 5, on ? YELLOW : alpha(PAPER, 0.16));
    if (on) line(ctx, x + 18 + i * 46, y + 30, x + 48 + i * 46, y + 30, alpha(INK, 0.5), 3);
  }
  text(ctx, '3', x + 168, y + 44, { size: 30, fill: PAPER, font: MONO, weight: 600 });
  if (cut.hudBest != null) {
    fillRR(ctx, W - 250, y, 204, 64, 10, alpha(INK, 0.82));
    text(ctx, 'BEST', W - 232, y + 26, { size: 17, fill: alpha(PAPER, 0.55), font: UI, weight: 600, track: 2 });
    text(ctx, cut.hudBest, W - 232, y + 54, { size: 30, fill: LIME, font: MONO, weight: 700 });
  }
  ctx.restore();
}

function drawPausePanel(ctx, t, cut) {
  const k = ease.out(span(t, cut.pauseAt ?? 0.8, (cut.pauseAt ?? 0.8) + 0.3));
  if (k <= 0) return;
  ctx.save();
  ctx.globalAlpha = k;
  ctx.fillStyle = alpha(INK, 0.42); ctx.fillRect(0, 0, W, H);
  const pw = 580, ph = 330, px = W / 2 - pw / 2, py = H / 2 - ph / 2 - 20 + (1 - k) * 34;
  fillRR(ctx, px, py, pw, ph, 18, PAPER);
  text(ctx, 'PAUSED', px + pw / 2, py + 94, { size: 74, fill: INK, align: 'center', track: 5 });
  for (let i = 0; i < 2; i++) {
    const by = py + 142 + i * 78;
    fillRR(ctx, px + 56, by, pw - 112, 62, 11, i === 0 ? LIME : alpha(INK, 0.08));
    text(ctx, i === 0 ? 'RESUME' : 'QUIT', px + pw / 2, by + 43, { size: 34, fill: INK, align: 'center', font: UI, weight: 700, track: 2 });
  }
  ctx.restore();
}
