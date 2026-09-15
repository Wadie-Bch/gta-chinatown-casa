// TABBI — the projector. Picks the active shot for an episode time, renders it,
// and composites the incoming transition. Pure function of time: seeking to the
// same timestamp always produces the same frame.
import { W, H, C } from './palette.js';
import { clamp, p01, E, lerp, TAU } from './util.js';
import { S, rrPath } from './draw.js';
import { drawChrome, tabOf, NO_CHROME, CHROME_H } from './chrome.js';

export function buildTimeline(shots) {
  let t = 0; const out = [];
  for (const s of shots) {
    const shot = { ...s, t0: t, t1: t + s.dur };
    out.push(shot); t += s.dur;
  }
  return { shots: out, duration: t };
}

export function shotAt(tl, t) {
  const a = tl.shots;
  let lo = 0, hi = a.length - 1;
  if (t >= tl.duration) return a[a.length - 1];
  while (lo < hi) { const m = (lo + hi) >> 1; if (t < a[m].t1) hi = m; else lo = m + 1; }
  return a[lo];
}

function paint(ctx, shot, t) {
  const lt = clamp(t - shot.t0, 0, shot.dur);
  ctx.save();
  try { shot.draw(ctx, lt, t, shot); } catch (e) { drawError(ctx, shot, e); }
  ctx.restore();
}

let errorSeen = new Set();
function drawError(ctx, shot, e) {
  ctx.restore(); ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = C.red; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff'; ctx.font = '700 40px ' + '"Liberation Sans",Arial';
  ctx.fillText('SHOT ERROR: ' + shot.id, 60, 100);
  ctx.font = '400 28px "Liberation Sans",Arial';
  ctx.fillText(String(e && e.message).slice(0, 120), 60, 160);
  const key = shot.id + String(e && e.message);
  if (!errorSeen.has(key)) { errorSeen.add(key); if (typeof console !== 'undefined') console.error('[shot ' + shot.id + ']', e); }
  if (typeof globalThis !== 'undefined') (globalThis.__tabbiErrors ||= []).push({ shot: shot.id, msg: String(e && e.message), stack: String(e && e.stack) });
}

/**
 * Transitions. Each shot declares how it ARRIVES:
 *   cut | dissolve | wipeL | wipeR | wipeUp | iris | push | flash | whip | shutter
 */
function composite(ctx, tl, shot, t) {
  const tr = shot.tr;
  const idx = tl.shots.indexOf(shot);
  const prev = idx > 0 ? tl.shots[idx - 1] : null;
  const k = tr && prev ? p01(t - shot.t0, 0, tr.d) : 1;
  if (!tr || !prev || k >= 1 || tr.type === 'cut') { paint(ctx, shot, t); return; }

  const prevT = Math.min(prev.t1 - 1e-4, shot.t0 + (t - shot.t0)); // prev keeps living under the transition
  switch (tr.type) {
    case 'dissolve': {
      paint(ctx, prev, prevT);
      S(ctx, () => { ctx.globalAlpha = E.io2(k); paint(ctx, shot, t); });
      break;
    }
    case 'flash': {
      // hard cut hidden inside a one-frame bloom — for punchlines
      paint(ctx, k < .5 ? prev : shot, k < .5 ? prevT : t);
      S(ctx, () => { ctx.globalAlpha = 1 - Math.abs(k - .5) * 2; ctx.fillStyle = tr.color || C.white; ctx.fillRect(0, 0, W, H); });
      break;
    }
    case 'whip': {
      // horizontal smear — motivated by the cursor or a character bolting
      const e = E.io3(k), dir = tr.dir ?? 1;
      paint(ctx, prev, prevT);
      S(ctx, () => { ctx.globalAlpha = 1; ctx.translate(dir * W * (1 - e) * 1.0, 0); paint(ctx, shot, t); });
      S(ctx, () => {
        ctx.globalAlpha = Math.sin(k * Math.PI) * .5;
        const g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, 'rgba(245,245,247,0)'); g.addColorStop(.5, 'rgba(245,245,247,.9)'); g.addColorStop(1, 'rgba(245,245,247,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      });
      break;
    }
    case 'push': {
      const e = E.io4(k), dir = tr.dir ?? 1; // 1 = new slides in from right
      S(ctx, () => { ctx.translate(-dir * W * e, 0); paint(ctx, prev, prevT); });
      S(ctx, () => { ctx.translate(dir * W * (1 - e), 0); paint(ctx, shot, t); });
      break;
    }
    case 'pushUp': {
      const e = E.io4(k);
      S(ctx, () => { ctx.translate(0, -H * e); paint(ctx, prev, prevT); });
      S(ctx, () => { ctx.translate(0, H * (1 - e)); paint(ctx, shot, t); });
      break;
    }
    case 'wipeR': case 'wipeL': {
      const e = E.io3(k), l = tr.type === 'wipeR';
      paint(ctx, prev, prevT);
      S(ctx, () => {
        ctx.beginPath();
        if (l) ctx.rect(0, 0, W * e, H); else ctx.rect(W * (1 - e), 0, W * e, H);
        ctx.clip(); paint(ctx, shot, t);
      });
      // leading edge
      S(ctx, () => { ctx.globalAlpha = 1 - k; const x = l ? W * e : W * (1 - e); ctx.fillStyle = tr.edge || C.mint; ctx.fillRect(x - 5, 0, 10, H); });
      break;
    }
    case 'iris': {
      // object-motivated: a checkbox, a dot, a mouth opening up into the next room
      const e = E.io3(k);
      paint(ctx, prev, prevT);
      const cx = (tr.x ?? W / 2), cy = (tr.y ?? H / 2);
      const rMax = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * 1.02;
      S(ctx, () => {
        ctx.beginPath(); ctx.arc(cx, cy, Math.max(0.5, rMax * e), 0, TAU); ctx.clip();
        paint(ctx, shot, t);
      });
      S(ctx, () => { ctx.globalAlpha = (1 - k) * .9; ctx.strokeStyle = tr.edge || C.mint; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, Math.max(0.5, rMax * e), 0, TAU); ctx.stroke(); });
      break;
    }
    case 'shutter': {
      // browser-native feel: horizontal slats close over prev, open on new
      const e = E.io2(k), n = tr.n || 9, sh = H / n;
      paint(ctx, shot, t);
      S(ctx, () => {
        ctx.beginPath();
        for (let i = 0; i < n; i++) ctx.rect(0, i * sh, W, sh * (1 - e));
        ctx.clip(); paint(ctx, prev, prevT);
      });
      break;
    }
    case 'matchScale': {
      // match-cut: prev scales out of a point while new scales in from it
      const e = E.io3(k);
      S(ctx, () => {
        ctx.translate(tr.x ?? W / 2, tr.y ?? H / 2); ctx.scale(lerp(1, tr.outZ ?? 3.2, e), lerp(1, tr.outZ ?? 3.2, e));
        ctx.translate(-(tr.x ?? W / 2), -(tr.y ?? H / 2)); ctx.globalAlpha = 1 - E.in2(k); paint(ctx, prev, prevT);
      });
      S(ctx, () => { ctx.globalAlpha = E.out2(k); paint(ctx, shot, t); });
      break;
    }
    default: paint(ctx, shot, t);
  }
}

/** the page viewport: full width, the shot's 1080 centre-cropped to fit under the chrome */
const CROP = 20;   // the page keeps its floor: almost all of the crop comes off the top

export function renderEpisode(ctx, tl, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  const shot = shotAt(tl, t);
  const idx = tl.shots.indexOf(shot);
  const prev = idx > 0 ? tl.shots[idx - 1] : null;
  const bare = NO_CHROME.has(shot.id);

  ctx.save();
  if (!bare) { ctx.beginPath(); ctx.rect(0, CHROME_H, W, H - CHROME_H); ctx.clip(); ctx.translate(0, CROP); }
  composite(ctx, tl, shot, t);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (!bare) {
    // the active tab slides when the story moves rooms, and the page reloads
    const to = tabOf(shot.id), from = prev ? tabOf(prev.id) : to;
    const sw = to === from ? 1 : E.io3(p01(t - shot.t0, 0, .42));
    drawChrome(ctx, lerp(from, to, sw), {
      t, k: p01(t, 0, 1.1),
      load: to === from ? 0 : p01(t - shot.t0, .05, .85),
    });
  }
  return shot;
}
