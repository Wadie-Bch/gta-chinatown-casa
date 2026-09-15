// TABBI — camera. Movement must have a subject and a purpose, so a camera is
// declared as keyframes over shot-local time, never as ambient drift.
import { lerp, inv, clamp, E, noise1 } from './util.js';
import { W, H } from './palette.js';

/**
 * A camera maps a world point to screen centre.
 *  x,y  world point held at centre of frame
 *  z    zoom (1 = world units are screen pixels)
 *  rot  radians
 */
export function camAt(keys, t) {
  if (!keys || !keys.length) return { x: W / 2, y: H / 2, z: 1, rot: 0 };
  const val = (field, def) => {
    const ks = keys.filter(k => k[field] !== undefined);
    if (!ks.length) return def;
    if (t <= ks[0].t) return ks[0][field];
    if (t >= ks[ks.length - 1].t) return ks[ks.length - 1][field];
    for (let i = 0; i < ks.length - 1; i++) {
      const a = ks[i], b = ks[i + 1];
      if (t >= a.t && t < b.t) return lerp(a[field], b[field], (b.e || E.io3)(inv(a.t, b.t, t)));
    }
    return ks[ks.length - 1][field];
  };
  return { x: val('x', W / 2), y: val('y', H / 2), z: val('z', 1), rot: val('rot', 0) };
}

export function applyCam(ctx, cam) {
  ctx.translate(W / 2, H / 2);
  ctx.scale(cam.z, cam.z);
  if (cam.rot) ctx.rotate(cam.rot);
  ctx.translate(-cam.x, -cam.y);
}

/** handheld: tiny, low-frequency, only where a scene wants nerves */
export function handheld(t, amp = 3, seed = 3) {
  return { x: noise1(t * 0.9, seed) * amp, y: noise1(t * 1.1 + 11, seed + 2) * amp * .7, rot: noise1(t * .7 + 5, seed + 4) * amp * .00035 };
}

/** visible frame rectangle in world units for a given camera */
export function camRect(cam) {
  const w = W / cam.z, h = H / cam.z;
  return { x: cam.x - w / 2, y: cam.y - h / 2, w, h };
}
