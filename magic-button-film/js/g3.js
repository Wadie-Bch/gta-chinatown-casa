// Tiny painter's-algorithm 3D pipeline on Canvas2D.
// Chosen over Three.js on purpose: flat-shaded boxes are exactly the look the
// episode wants, it stays deterministic under renderAt(t), and it costs one
// canvas and zero WebGL contexts on integrated Radeon graphics.
import { W, H, poly } from './g2.js';
import { shade, alpha } from './palette.js';

const NEAR = 0.35;

export function cam({ pos, look, fov = 52, roll = 0 }) {
  const f = norm(sub(look, pos));
  let r = norm(cross(f, [0, 1, 0]));
  if (!isFinite(r[0])) r = [1, 0, 0];
  let u = cross(r, f);
  if (roll) {
    const c = Math.cos(roll), s = Math.sin(roll);
    const r2 = [r[0] * c + u[0] * s, r[1] * c + u[1] * s, r[2] * c + u[2] * s];
    const u2 = [u[0] * c - r[0] * s, u[1] * c - r[1] * s, u[2] * c - r[2] * s];
    r = r2; u = u2;
  }
  return { pos, f, r, u, k: 1 / Math.tan(fov * Math.PI / 360) };
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
function norm(a) { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }

/** World point -> camera space [right, up, forward]. */
export function toCam(c, p) {
  const d = sub(p, c.pos);
  return [dot(d, c.r), dot(d, c.u), dot(d, c.f)];
}
export function project(c, p) {
  const v = toCam(c, p);
  if (v[2] <= NEAR) return null;
  return camToScreen(c, v);
}
function camToScreen(c, v) {
  return [W / 2 + (v[0] / v[2]) * c.k * (H / 2), H / 2 - (v[1] / v[2]) * c.k * (H / 2)];
}

/** Clip a camera-space polygon against the near plane, then project. */
function clipProject(c, cs) {
  const out = [];
  for (let i = 0; i < cs.length; i++) {
    const a = cs[i], b = cs[(i + 1) % cs.length];
    const ain = a[2] > NEAR, bin = b[2] > NEAR;
    if (ain) out.push(a);
    if (ain !== bin) {
      const t = (NEAR - a[2]) / (b[2] - a[2]);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR]);
    }
  }
  if (out.length < 3) return null;
  return out.map(v => camToScreen(c, v));
}

// Unit cube corners and faces (+Y up, +Z forward/away).
const CORNERS = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
];
const FACES = [
  { idx: [3, 2, 6, 7], n: [0, 1, 0], key: 'top' },
  { idx: [0, 4, 5, 1], n: [0, -1, 0], key: 'bottom' },
  { idx: [0, 1, 2, 3], n: [0, 0, -1], key: 'front' },
  { idx: [5, 4, 7, 6], n: [0, 0, 1], key: 'back' },
  { idx: [4, 0, 3, 7], n: [-1, 0, 0], key: 'left' },
  { idx: [1, 5, 6, 2], n: [1, 0, 0], key: 'right' },
];
// Face brightness — a single fixed key light, no gradients.
const LIGHT = { top: 0.20, bottom: -0.40, front: 0.0, back: -0.26, left: -0.20, right: 0.09 };

/**
 * Queue a rotated box. `deco(ctx, quad, key)` may paint onto a face using its
 * projected quad (bilinear mapping), e.g. windows or a logo.
 */
export function box(scene, { p, s, ry = 0, color, outline = null, deco = null, faceColor = null, a = 1, tag = '' }) {
  const c = scene.cam;
  const cs = Math.cos(ry), sn = Math.sin(ry);
  const world = CORNERS.map(([x, y, z]) => {
    const lx = x * s[0] / 2, ly = y * s[1] / 2, lz = z * s[2] / 2;
    return [p[0] + lx * cs + lz * sn, p[1] + ly, p[2] + -lx * sn + lz * cs];
  });
  const camPts = world.map(v => toCam(c, v));
  for (const f of FACES) {
    const nx = f.n[0] * cs + f.n[2] * sn, nz = -f.n[0] * sn + f.n[2] * cs;
    const nWorld = [nx, f.n[1], nz];
    const mid = f.idx.reduce((acc, i) => [acc[0] + world[i][0] / 4, acc[1] + world[i][1] / 4, acc[2] + world[i][2] / 4], [0, 0, 0]);
    // backface cull
    if (dot(nWorld, sub(mid, c.pos)) >= 0) continue;
    const quadCam = f.idx.map(i => camPts[i]);
    const depth = quadCam.reduce((m, v) => m + v[2], 0) / 4;
    if (depth <= 0) continue;
    const pts = clipProject(c, quadCam);
    if (!pts) continue;
    const col = (faceColor && faceColor[f.key]) || shade(color, LIGHT[f.key]);
    scene.items.push({ depth, pts, col, outline, deco, key: f.key, a, tag, g: 1, seq: scene.items.length });
  }
}

/**
 * A flat quad given 4 world points.
 *
 * `ground: true` marks a plane that everything else stands on. Ground planes
 * are huge, so their centroid depth is a useless sort key — a road slab whose
 * centre happens to be nearer than the courier would paint straight over him.
 * Ground quads are therefore drawn first, in insertion order, and only the
 * objects standing on them take part in depth sorting.
 */
export function quad(scene, pts4, color, { outline = null, a = 1, deco = null, tag = '', ground = true } = {}) {
  const c = scene.cam;
  const camPts = pts4.map(v => toCam(c, v));
  const depth = camPts.reduce((m, v) => m + v[2], 0) / 4;
  const pts = clipProject(c, camPts);
  if (!pts) return;
  scene.items.push({ depth, pts, col: color, outline, deco, key: 'quad', a, tag,
                     g: ground ? 0 : 1, seq: scene.items.length });
}

/** A camera-facing sprite drawn by `draw(ctx, cx, cy, scale)`. */
export function billboard(scene, p, draw, { a = 1 } = {}) {
  const c = scene.cam;
  const v = toCam(c, p);
  if (v[2] <= NEAR) return;
  const sp = camToScreen(c, v);
  const scale = c.k * (H / 2) / v[2];
  scene.items.push({ depth: v[2], sprite: { draw, x: sp[0], y: sp[1], scale }, a });
}

export function newScene(camera) { return { cam: camera, items: [] }; }

export function flush(ctx, scene) {
  scene.items.sort((a, b) => {
    if (a.g !== b.g) return a.g - b.g;          // ground planes first
    if (a.g === 0) return a.seq - b.seq;        // ...in the order they were queued
    return b.depth - a.depth;                   // then far-to-near
  });
  for (const it of scene.items) {
    ctx.save();
    if (it.a !== 1) ctx.globalAlpha *= it.a;
    if (it.sprite) {
      it.sprite.draw(ctx, it.sprite.x, it.sprite.y, it.sprite.scale);
    } else {
      poly(ctx, it.pts, it.col, it.outline, it.outline ? 2 : 0);
      if (it.deco) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(it.pts[0][0], it.pts[0][1]);
        for (let i = 1; i < it.pts.length; i++) ctx.lineTo(it.pts[i][0], it.pts[i][1]);
        ctx.closePath(); ctx.clip();
        it.deco(ctx, it.pts, it.key);
        ctx.restore();
      }
    }
    ctx.restore();
  }
  scene.items.length = 0;
}

/** Bilinear point inside a projected quad (u,v in 0..1). */
export function onQuad(q, u, v) {
  const a = [q[0][0] + (q[1][0] - q[0][0]) * u, q[0][1] + (q[1][1] - q[0][1]) * u];
  const b = [q[3][0] + (q[2][0] - q[3][0]) * u, q[3][1] + (q[2][1] - q[3][1]) * u];
  return [a[0] + (b[0] - a[0]) * v, a[1] + (b[1] - a[1]) * v];
}

/** Window grid decal for building faces. */
export function windowGrid(cols, rows, lit, col, seed = 1) {
  return (ctx, q) => {
    let n = seed >>> 0 || 1;
    const rand = () => { n ^= n << 13; n >>>= 0; n ^= n >> 17; n ^= n << 5; n >>>= 0; return n / 4294967296; };
    for (let r = 0; r < rows; r++) {
      for (let cIdx = 0; cIdx < cols; cIdx++) {
        const u0 = (cIdx + 0.28) / cols, u1 = (cIdx + 0.78) / cols;
        const v0 = (r + 0.22) / rows, v1 = (r + 0.68) / rows;
        const p0 = onQuad(q, u0, v0), p1 = onQuad(q, u1, v0), p2 = onQuad(q, u1, v1), p3 = onQuad(q, u0, v1);
        const on = rand() < lit;
        poly(ctx, [p0, p1, p2, p3], on ? col : alpha('#11151D', 0.55));
      }
    }
  };
}
