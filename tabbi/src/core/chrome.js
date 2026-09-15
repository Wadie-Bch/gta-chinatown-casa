// The browser window itself. The episode plays inside a real page viewport with
// a live tab strip and address bar, so "tabs are rooms" is literal, not implied.
import { C, W, H, f } from './palette.js';
import { S, rr, rrPath, circ, line, text, shadow, noShadow } from './draw.js';
import { clamp, lerp, p01, E, sin01 } from './util.js';

export const CHROME_H = 96;
const TAB_H = 54, BAR_H = CHROME_H - TAB_H;

export const TABS = [
  { label: 'hotslice.example', url: 'hotslice.example/order', dot: C.mint },
  { label: 'gate.check', url: 'gate.check/verify', dot: C.red },
  { label: 'helper', url: 'helper.local/assist', dot: C.mintMid },
  { label: 'yap.chat', url: 'yap.chat/dash', dot: C.ink },
  { label: 'inbox', url: 'inbox.mail/one-time-code', dot: C.cheese },
  { label: 'slice.track', url: 'slice.track/order/4712', dot: C.mint },
];

/** which tab each shot lives in — keyed by shot id, so no shot had to change */
const TAB_OF = {
  'a1-push': 0, 'a2-idea': 1, 'a2-run': 2, 'a2-arrive': 2, 'a2-helper': 2, 'a2-igot': 2, 'a2-drag': 2,
  'a4-chat': 3, 'a4-photo': 3,
  'a5-race': 4, 'a5-banner': 4, 'a5-inbox': 4, 'a5-shout': 4, 'a5-scream': 4, 'a5-newcode': 4,
  'a5-helper': 2, 'a5-revoked': 2,
};
const ACT_TAB = { a0: 0, a1: 1, a2: 1, a3: 0, a4: 5, a5: 5, a6: 5, a7: 5 };
export function tabOf(id) {
  if (id in TAB_OF) return TAB_OF[id];
  return ACT_TAB[id.slice(0, 2)] ?? 0;
}
/** shots that own the whole frame */
export const NO_CHROME = new Set(['a7-mark']);

function tabPath(ctx, x, y, w, h) {
  const r = 14, flare = 13;
  ctx.beginPath();
  ctx.moveTo(x - flare, y + h);
  ctx.quadraticCurveTo(x - flare + 3, y + h - 6, x + 1, y + r);
  ctx.quadraticCurveTo(x + 1, y, x + 1 + r, y);
  ctx.lineTo(x + w - 1 - r, y);
  ctx.quadraticCurveTo(x + w - 1, y, x + w - 1, y + r);
  ctx.quadraticCurveTo(x + w + flare - 3, y + h - 6, x + w + flare, y + h);
  ctx.closePath();
}

/**
 * Draw the chrome in screen space.
 * `active` may be fractional while a tab switch is in flight.
 */
export function drawChrome(ctx, active, o = {}) {
  const k = clamp(o.k ?? 1); if (k <= .002) return;
  const t = o.t || 0, load = o.load ?? 0;
  const i = Math.round(active);
  const tab = TABS[Math.max(0, Math.min(TABS.length - 1, i))];
  S(ctx, () => {
    ctx.globalAlpha = k;
    ctx.translate(0, (1 - E.out3(k)) * -CHROME_H);
    // window frame
    ctx.fillStyle = '#C9C9D2'; ctx.fillRect(0, 0, W, CHROME_H);
    ctx.fillStyle = C.white; ctx.fillRect(0, TAB_H, W, BAR_H);
    line(ctx, 0, CHROME_H - 1, W, CHROME_H - 1, 'rgba(32,32,39,.20)', 2);

    // traffic-light buttons
    [C.red, C.cheese, C.mint].forEach((col, n) => circ(ctx, 26 + n * 26, TAB_H / 2, 8, col));

    // tabs
    const x0 = 118, tw = 286, gap = 4;
    TABS.forEach((tb, n) => {
      const x = x0 + n * (tw + gap), on = Math.abs(active - n) < .5;
      S(ctx, () => {
        tabPath(ctx, x, 8, tw, TAB_H - 8);
        ctx.fillStyle = on ? C.white : 'rgba(245,245,247,.42)'; ctx.fill();
        circ(ctx, x + 26, TAB_H / 2 + 4, 8, on ? tb.dot : 'rgba(32,32,39,.3)');
        text(ctx, tb.label, x + 46, TAB_H / 2 + 4, {
          size: 21, weight: on ? 800 : 700, align: 'left',
          color: on ? C.ink : 'rgba(32,32,39,.55)', maxW: tw - 90,
        });
        if (on) text(ctx, '×', x + tw - 22, TAB_H / 2 + 3, { size: 24, weight: 700, color: 'rgba(32,32,39,.45)' });
      });
    });
    // the moving highlight — this is the tab switch you can see
    S(ctx, () => {
      const hx = x0 + active * (tw + gap);
      ctx.globalAlpha = k * .9;
      rr(ctx, hx + 2, 8, tw - 4, 4, 2, tab.dot);
    });

    // toolbar
    const by = TAB_H + BAR_H / 2;
    S(ctx, () => {
      ctx.strokeStyle = 'rgba(32,32,39,.45)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(38, by - 7); ctx.lineTo(29, by); ctx.lineTo(38, by + 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(66, by - 7); ctx.lineTo(75, by); ctx.lineTo(66, by + 7); ctx.stroke();
      ctx.beginPath(); ctx.arc(108, by, 9, .6, 5.4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(114, by - 12); ctx.lineTo(117, by - 2); ctx.lineTo(107, by - 5); ctx.closePath();
      ctx.fillStyle = 'rgba(32,32,39,.45)'; ctx.fill();
    });
    rr(ctx, 142, TAB_H + 7, W - 300, BAR_H - 14, (BAR_H - 14) / 2, '#ECECF1');
    // padlock
    S(ctx, () => {
      ctx.translate(174, by);
      rr(ctx, -7, -3, 14, 12, 3, 'rgba(32,32,39,.5)');
      ctx.beginPath(); ctx.arc(0, -3, 5, Math.PI, 0); ctx.strokeStyle = 'rgba(32,32,39,.5)'; ctx.lineWidth = 3; ctx.stroke();
    });
    text(ctx, tab.url, 196, by, { size: 21, weight: 700, color: 'rgba(32,32,39,.72)', align: 'left' });
    text(ctx, '⋮', W - 40, by, { size: 26, weight: 800, color: 'rgba(32,32,39,.5)' });
    // the loading bar that runs whenever a room changes
    if (load > 0 && load < 1) {
      rr(ctx, 0, CHROME_H - 5, W * E.out3(load), 5, 0, tab.dot);
    }
  });
}
