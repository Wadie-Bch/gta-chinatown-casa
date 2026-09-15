// The browser is a physical place. These are its rooms, doors and furniture.
import { C, f, W, H } from './palette.js';
import { S, rr, rrPath, circ, ell, line, poly, shadow, noShadow, text, textBlock, spinner, ring } from './draw.js';
import { clamp, lerp, TAU, sin01, sinw, E, p01 } from './util.js';

/** one browser tab — a doorway with a name on it */
export function tab(ctx, x, y, w, h, label, o = {}) {
  const active = o.active ?? false;
  const flare = 16, r = 16;
  S(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(x - w / 2 - flare, y);
    ctx.quadraticCurveTo(x - w / 2 - flare + 4, y - h * .18, x - w / 2 + 2, y - h + r);
    ctx.quadraticCurveTo(x - w / 2 + 2, y - h, x - w / 2 + 2 + r, y - h);
    ctx.lineTo(x + w / 2 - 2 - r, y - h);
    ctx.quadraticCurveTo(x + w / 2 - 2, y - h, x + w / 2 - 2, y - h + r);
    ctx.quadraticCurveTo(x + w / 2 + flare - 4, y - h * .18, x + w / 2 + flare, y);
    ctx.closePath();
    ctx.fillStyle = active ? (o.bg || C.white) : (o.bg || 'rgba(220,220,226,.85)');
    ctx.fill();
    if (o.outline !== false) { ctx.strokeStyle = o.stroke || C.ink; ctx.lineWidth = o.lw ?? 4; ctx.lineJoin = 'round'; ctx.stroke(); }
    if (o.icon) { S(ctx, () => { ctx.translate(x - w / 2 + 30, y - h / 2 + 2); o.icon(ctx); }); }
    else circ(ctx, x - w / 2 + 30, y - h / 2 + 2, 9, o.dot || (active ? C.mint : 'rgba(32,32,39,.35)'));
    if (label) text(ctx, label, x - w / 2 + 50, y - h / 2 + 2, { size: o.size || 24, weight: 700, color: active ? C.ink : 'rgba(32,32,39,.62)', align: 'left' });
  });
}

/** the whole browser frame: tab strip, address bar, page well */
export function browserFrame(ctx, o = {}) {
  const { x = 0, y = 0, w = 1920, h = 1080, tabs = [], activeTab = 0, url = '', page, chromeH = 128, lw = 6 } = o;
  S(ctx, () => {
    shadow(ctx, 40, 18, 'rgba(32,32,39,.22)');
    rr(ctx, x, y, w, h, o.r ?? 26, C.gray); noShadow(ctx);
    rr(ctx, x, y, w, h, o.r ?? 26, null, C.ink, lw);
    // tab strip
    const ty = y + 64;
    tabs.forEach((tb, i) => {
      const tw = o.tabW ?? 250;
      tab(ctx, x + 150 + i * (tw + 26), ty, tw, 58, tb.label, { active: i === activeTab, dot: tb.dot, icon: tb.icon, size: o.tabSize });
    });
    // address bar
    const ay = y + chromeH - 30;
    rr(ctx, x + 40, ay - 4, w - 80, 56, 28, C.white, 'rgba(32,32,39,.25)', 3);
    circ(ctx, x + 76, ay + 24, 12, C.mint);
    if (url) text(ctx, url, x + 104, ay + 24, { size: 26, weight: 700, color: 'rgba(32,32,39,.72)', align: 'left' });
    // page well
    const py = y + chromeH + 36;
    S(ctx, () => {
      rrPath(ctx, x + 14, py, w - 28, h - (py - y) - 14, 14); ctx.clip();
      ctx.fillStyle = o.pageBg || C.white; ctx.fillRect(x + 14, py, w - 28, h);
      if (page) page(ctx, x + 14, py, w - 28, h - (py - y) - 14);
    });
    rr(ctx, x + 14, py, w - 28, h - (py - y) - 14, 14, null, 'rgba(32,32,39,.18)', 3);
  });
}

/** a primary action button — the thing Tabbi wants to press */
export function button(ctx, x, y, w, h, label, o = {}) {
  const state = o.state || 'go';         // go | dead | danger | ghost
  const bg = state === 'go' ? C.mint : state === 'danger' ? C.red : state === 'ghost' ? 'transparent' : C.gray;
  const fg = state === 'dead' ? 'rgba(32,32,39,.78)' : state === 'ghost' ? C.ink : C.white;
  const press = o.press || 0;
  S(ctx, () => {
    ctx.translate(x, y + press * 6);
    if (!press && state === 'go') shadow(ctx, 22, 10, 'rgba(24,133,103,.35)');
    rr(ctx, -w / 2, -h / 2, w, h, o.r ?? h / 2, bg, state === 'ghost' ? C.ink : null, state === 'ghost' ? 4 : 0);
    noShadow(ctx);
    if (o.glowK) S(ctx, () => { ctx.globalAlpha = o.glowK * .5; rr(ctx, -w / 2 - 10, -h / 2 - 10, w + 20, h + 20, (o.r ?? h / 2) + 10, null, bg, 5); });
    text(ctx, label, 0, 1, { size: o.size || Math.round(h * .42), weight: 800, color: fg, letter: o.letter ?? 1, maxW: w - 30 });
  });
}

/** the famous checkbox — later, a door */
export function checkbox(ctx, x, y, s, o = {}) {
  const { checked = 0, label = "I'm not a robot", hover = 0, glowK = 0 } = o;
  S(ctx, () => {
    ctx.translate(x, y);
    shadow(ctx, 18, 8, 'rgba(32,32,39,.14)');
    rr(ctx, -s * 2.9, -s * .95, s * 5.8, s * 1.9, s * .22, C.white, 'rgba(32,32,39,.20)', 3);
    noShadow(ctx);
    const bx = -s * 2.55, by = -s * .58;
    rr(ctx, bx, by, s * 1.16, s * 1.16, s * .16, hover ? C.mintSoft : C.white, C.ink, s * .09);
    if (glowK > 0) S(ctx, () => { ctx.globalAlpha = glowK; rr(ctx, bx - 6, by - 6, s * 1.16 + 12, s * 1.16 + 12, s * .2, null, C.mint, 5); });
    if (checked > 0) S(ctx, () => {
      ctx.strokeStyle = C.mint; ctx.lineWidth = s * .16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const k = clamp(checked);
      ctx.beginPath(); ctx.moveTo(bx + s * .24, by + s * .6);
      const mx = bx + s * .46, my = by + s * .86;
      ctx.lineTo(lerp(bx + s * .24, mx, Math.min(1, k * 2.2)), lerp(by + s * .6, my, Math.min(1, k * 2.2)));
      if (k > .45) ctx.lineTo(lerp(mx, bx + s * .9, (k - .45) / .55), lerp(my, by + s * .3, (k - .45) / .55));
      ctx.stroke();
    });
    text(ctx, label, bx + s * 1.6, 0, { size: s * .42, weight: 700, color: C.ink, align: 'left' });
    // the vendor mark, bottom-right, exactly where you never read it
    text(ctx, 'GATE', s * 2.35, s * .42, { size: s * .2, weight: 800, color: 'rgba(32,32,39,.45)', letter: 1.4 });
  });
}

/** notifications interrupt conversations — physically */
export function notification(ctx, x, y, o = {}) {
  const { w = 620, title = '', body = '', kind = 'neutral', k = 1, icon } = o;
  const h = body ? 148 : 104;
  const accent = kind === 'good' ? C.mint : kind === 'bad' ? C.red : C.ink;
  S(ctx, () => {
    ctx.translate(x, y); ctx.globalAlpha = clamp(k * 1.3);
    shadow(ctx, 34, 16, 'rgba(32,32,39,.26)');
    rr(ctx, -w / 2, -h / 2, w, h, 26, C.cream); noShadow(ctx);
    rr(ctx, -w / 2, -h / 2, w, h, 26, null, 'rgba(32,32,39,.14)', 3);
    rr(ctx, -w / 2, -h / 2, 12, h, [26, 0, 0, 26], accent);
    const ix = -w / 2 + 62;
    if (icon) S(ctx, () => { ctx.translate(ix, 0); icon(ctx); });
    else { circ(ctx, ix, 0, 26, accent); text(ctx, '!', ix, 1, { size: 32, weight: 800, color: C.white }); }
    const tx = ix + 48;
    text(ctx, title, tx, body ? -22 : 0, { size: 30, weight: 800, color: C.ink, align: 'left' });
    if (body) text(ctx, body, tx, 24, { size: 27, weight: 700, color: 'rgba(32,32,39,.65)', align: 'left' });
  });
}

/** chat app — YAP. Short exchanges, strong reactions. */
export function chatPanel(ctx, x, y, w, h, msgs, o = {}) {
  S(ctx, () => {
    ctx.translate(x, y);
    shadow(ctx, 34, 16, 'rgba(32,32,39,.20)');
    rr(ctx, -w / 2, -h / 2, w, h, 30, C.cream); noShadow(ctx);
    rr(ctx, -w / 2, -h / 2, w, h, 30, null, C.ink, 5);
    // header
    S(ctx, () => {
      rrPath(ctx, -w / 2, -h / 2, w, 92, [30, 30, 0, 0]); ctx.clip();
      ctx.fillStyle = C.ink; ctx.fillRect(-w / 2, -h / 2, w, 92);
    });
    circ(ctx, -w / 2 + 52, -h / 2 + 46, 24, C.mint);
    text(ctx, o.title || 'DASH', -w / 2 + 88, -h / 2 + 38, { size: 27, weight: 800, color: C.white, align: 'left' });
    text(ctx, o.sub || 'courier · online', -w / 2 + 88, -h / 2 + 68, { size: 20, weight: 700, color: 'rgba(245,245,247,.55)', align: 'left' });
    text(ctx, 'YAP', w / 2 - 34, -h / 2 + 46, { size: 21, weight: 800, color: 'rgba(245,245,247,.5)', letter: 2, align: 'right' });
    // composer bar — a chat app has one, and it fills the floor of the panel
    S(ctx, () => {
      rr(ctx, -w / 2 + 24, h / 2 - 96, w - 48, 72, 36, C.gray);
      text(ctx, 'Message', -w / 2 + 64, h / 2 - 60, { size: 26, weight: 700, color: 'rgba(32,32,39,.35)', align: 'left' });
      circ(ctx, w / 2 - 64, h / 2 - 60, 26, C.mint);
      S(ctx, () => { ctx.strokeStyle = C.white; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(w / 2 - 74, h / 2 - 60); ctx.lineTo(w / 2 - 54, h / 2 - 60); ctx.lineTo(w / 2 - 62, h / 2 - 70); ctx.stroke(); });
    });
    // messages, stacked from the bottom
    let by = h / 2 - 124;
    const maxW = w * .62;
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if ((m.k ?? 1) <= 0) continue;
      const size = m.size || 30;
      ctx.font = f(700, size);
      const lines = m.text.split('\n');
      let tw = 0; for (const l of lines) tw = Math.max(tw, ctx.measureText(l).width);
      tw = Math.min(tw, maxW);
      const bw = tw + 46, bh = lines.length * size * 1.22 + 34;
      by -= bh;
      const mine = m.who === 'me';
      const bx = mine ? w / 2 - 30 - bw : -w / 2 + 30;
      const k = clamp(m.k ?? 1);
      S(ctx, () => {
        ctx.globalAlpha = k;
        ctx.translate(0, (1 - E.out3(k)) * 18);
        rr(ctx, bx, by, bw, bh, [22, 22, mine ? 6 : 22, mine ? 22 : 6], mine ? C.ink : C.gray);
        lines.forEach((l, j) => text(ctx, l, bx + bw / 2, by + 17 + size * .61 + j * size * 1.22, { size, weight: 700, color: mine ? C.white : C.ink, maxW }));
      });
      by -= 16;
      if (by < -h / 2 + 110) break;
    }
    if (o.typing) {
      S(ctx, () => {
        const bw = 118, bh = 62, bx = -w / 2 + 30, ty = h / 2 - 124 - bh;
        rr(ctx, bx, ty, bw, bh, [22, 22, 22, 6], C.gray);
        for (let i = 0; i < 3; i++) circ(ctx, bx + 34 + i * 25, ty + bh / 2 + Math.sin(o.t * 6 + i * .8) * 5, 7, 'rgba(32,32,39,.5)');
      });
    }
  });
}

/** the form fields behave like unreasonable people */
export function field(ctx, x, y, w, h, o = {}) {
  const { label = '', value = '', state = 'idle', placeholder = '', caret = 0, size = 30 } = o;
  const col = state === 'bad' ? C.red : state === 'good' ? C.mint : 'rgba(32,32,39,.22)';
  S(ctx, () => {
    ctx.translate(x, y);
    if (label) text(ctx, label, -w / 2, -h / 2 - 26, { size: size * .72, weight: 800, color: state === 'bad' ? C.red : 'rgba(32,32,39,.55)', align: 'left', letter: 1.2 });
    rr(ctx, -w / 2, -h / 2, w, h, 14, state === 'bad' ? C.redSoft : C.white, col, state === 'idle' ? 3 : 4.5);
    const txt = value || placeholder;
    if (txt) text(ctx, txt, -w / 2 + 22, 1, { size, weight: 700, color: value ? C.ink : 'rgba(32,32,39,.32)', align: 'left', maxW: w - 44 });
    if (caret > .5) {
      const tw = value ? (ctx.font = f(700, size), ctx.measureText(value).width) : 0;
      line(ctx, -w / 2 + 26 + tw, -h / 2 + 12, -w / 2 + 26 + tw, h / 2 - 12, C.ink, 3);
    }
  });
}

/** a small stat/price chip */
export function chip(ctx, x, y, label, o = {}) {
  const size = o.size || 28, pad = o.pad ?? 22;
  ctx.font = f(800, size);
  const w = ctx.measureText(label).width + pad * 2, h = size * 1.9;
  S(ctx, () => {
    ctx.translate(x, y);
    rr(ctx, -w / 2, -h / 2, w, h, h / 2, o.bg || C.gray, o.border, o.border ? 3 : 0);
    text(ctx, label, 0, 1, { size, weight: 800, color: o.color || C.ink, letter: o.letter ?? 1 });
  });
  return w;
}
