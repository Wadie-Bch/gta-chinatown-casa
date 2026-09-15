// Shot-writing kit. Dialogue, sound and camera are declared as data on the shot
// so the picture and the soundtrack are generated from the same source.
import { C, W, H, f } from '../core/palette.js';
import { S, bubble, sysPlate, text, rr, circ, cursor, shadow, noShadow, vignette, grain } from '../core/draw.js';
import { camAt, applyCam } from '../core/camera.js';
import { clamp, lerp, p01, E, ramp, pulse, sinw, sin01 } from '../core/util.js';

export const shots = [];
/** declare a shot. dur in seconds. draw(ctx, lt, gt, shot) */
export function shot(id, dur, draw, o = {}) {
  const s = { id, dur, draw, say: [], sfx: [], ...o };
  shots.push(s);
  return s;
}
export function clearShots() { shots.length = 0; }

// ------------------------------------------------------------ dialogue ----
/** visibility curve of line i: pops in, holds, falls away */
export function lineK(shot, lt, i) {
  const l = shot.say[i]; if (!l) return 0;
  const inD = l.in ?? .18, outD = l.out ?? .2;
  if (lt < l.t) return 0;
  if (lt > l.t + l.d) return 0;
  const a = p01(lt, l.t, l.t + inD);
  const b = 1 - p01(lt, l.t + l.d - outD, l.t + l.d);
  return Math.min(a, b);
}
/** draw a line of dialogue as an in-world bubble */
export function say(ctx, shot, lt, i, x, y, o = {}) {
  const l = shot.say[i]; if (!l) return;
  const k = lineK(shot, lt, i); if (k <= .002) return;
  const style = VOICE_STYLE[l.who] || {};
  bubble(ctx, l.text, x, y, { grow: k, size: o.size ?? 44, maxW: o.maxW ?? 640, tail: o.tail, dark: style.dark, bg: style.bg, color: style.color, border: style.border, ...o });
}
/** system / interface voice */
export function sys(ctx, shot, lt, i, x, y, o = {}) {
  const l = shot.say[i]; if (!l) return;
  const k = lineK(shot, lt, i); if (k <= .002) return;
  sysPlate(ctx, l.text, x, y, { grow: k, size: o.size ?? 44, ...o });
}
/** how much a given character's mouth should be moving right now */
export function talk(shot, lt, who) {
  for (let i = 0; i < shot.say.length; i++) {
    const l = shot.say[i];
    if (l.who !== who) continue;
    if (lt >= l.t && lt <= l.t + l.d * .86) return lt * 6.5;
  }
  return 0;
}
export const VOICE_STYLE = {
  tabbi: {},
  helper: { bg: '#E9F3EF', border: C.mintDeep, color: C.mintDeep },
  dash: { bg: C.gray, border: C.ink, color: C.ink },
  gate: { bg: '#2C2C38', color: C.white, border: C.mintMid },
  sysv: { dark: true },
};

// -------------------------------------------------------------- staging ----
/** run fn inside a camera transform */
export function withCam(ctx, keys, lt, fn, extra) {
  S(ctx, () => {
    const cam = camAt(keys, lt);
    if (extra) { cam.x += extra.x || 0; cam.y += extra.y || 0; cam.z *= (extra.zMul || 1); cam.rot += extra.rot || 0; }
    applyCam(ctx, cam);
    fn(cam);
  });
}
/** full-frame flat colour wash (used for beats and punch-ins) */
export function wash(ctx, col, a = 1) { S(ctx, () => { ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); }); }

/** the finishing pass every shot gets: grain + a restrained vignette */
export function finish(ctx, o = {}) {
  if (o.vig !== false) vignette(ctx, W, H, o.vig ?? .18);
  grain(ctx, W, H, o.grain ?? .03);
}

/** a caption that never sits over the action: bottom safe area, opaque plate */
export function caption(ctx, str, k = 1, o = {}) {
  if (k <= .002) return;
  S(ctx, () => {
    ctx.globalAlpha = clamp(k * 1.3);
    text(ctx, str, W / 2, H - 96, {
      size: o.size || 46, weight: 800, color: o.color || C.white,
      back: o.bg || 'rgba(32,32,39,.92)', backPadX: 34, backPadY: 20, backR: 18, letter: 1,
    });
  });
}

/** screen-space pointer; `hold` shows the mint grab ring */
export function pointer(ctx, x, y, o = {}) { cursor(ctx, x, y, o.s ?? 1.9, o.rot ?? 0, o); }

/** split screen: two panels with an ink divider */
export function split(ctx, left, right, k = 1, o = {}) {
  const gap = o.gap ?? 14, m = W / 2;
  const slideL = (1 - E.io3(clamp(k))) * -W * .12, slideR = (1 - E.io3(clamp(k))) * W * .12;
  S(ctx, () => { ctx.beginPath(); ctx.rect(0, 0, m - gap / 2, H); ctx.clip(); ctx.translate(slideL - W / 4, 0); left(ctx); });
  S(ctx, () => { ctx.beginPath(); ctx.rect(m + gap / 2, 0, m - gap / 2, H); ctx.clip(); ctx.translate(slideR + W / 4, 0); right(ctx); });
  S(ctx, () => { ctx.fillStyle = C.ink; ctx.fillRect(m - gap / 2, 0, gap, H); });
}

/** an impact flash: one or two frames of bright, no shake */
export function hit(ctx, lt, at, col = C.white, d = .1) {
  const k = 1 - p01(lt, at, at + d);
  if (lt >= at && k > 0) wash(ctx, col, k * .75);
}

/** small motion streaks behind something fast */
export function speedLines(ctx, x, y, n = 5, len = 160, a = .3, seed = 0, dir = -1) {
  S(ctx, () => {
    ctx.globalAlpha = a; ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const yy = y + (i - n / 2) * 34, l = len * (.5 + ((i * 37 + seed * 13) % 10) / 10);
      ctx.lineWidth = 7 - (i % 3); ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + dir * l, yy); ctx.stroke();
    }
  });
}
