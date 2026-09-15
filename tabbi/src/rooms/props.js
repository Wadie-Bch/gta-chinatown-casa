// Props. Every one of them is geometry, not a picture.
import { C, f } from '../core/palette.js';
import { S, rr, rrPath, circ, ell, line, poly, shadow, noShadow, text, ring } from '../core/draw.js';
import { clamp, lerp, TAU, hash, sin01, sinw, E, p01, noise1 } from '../core/util.js';
import { sliceMark } from '../chars/dash.js';

/** whole pizza, seen from above. `bite` removes wedges. Deterministic toppings. */
export function pizza(ctx, x, y, r, o = {}) {
  const { bite = 0, seed = 7, olives = true, steam = 0, t = 0 } = o;
  S(ctx, () => {
    ctx.translate(x, y);
    const a0 = -Math.PI / 2, a1 = a0 + TAU * (1 - clamp(bite));
    const wedge = (rad, fill, stroke, lw) => {
      ctx.beginPath();
      if (bite > 0.001) { ctx.moveTo(0, 0); ctx.arc(0, 0, rad, a0, a1); ctx.closePath(); }
      else ctx.arc(0, 0, rad, 0, TAU);
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
    };
    shadow(ctx, 22, 12, 'rgba(32,32,39,.22)');
    wedge(r, C.crust, C.ink, r * .055); noShadow(ctx);
    wedge(r * .86, C.sauce, null, 0);
    wedge(r * .8, C.cheese, null, 0);
    S(ctx, () => {
      ctx.beginPath();
      if (bite > 0.001) { ctx.moveTo(0, 0); ctx.arc(0, 0, r * .8, a0, a1); ctx.closePath(); } else ctx.arc(0, 0, r * .8, 0, TAU);
      ctx.clip();
      for (let i = 0; i < 16; i++) {
        const a = hash(i * 3.1 + seed) * TAU, rad = Math.sqrt(hash(i * 7.7 + seed)) * r * .7;
        const px = Math.cos(a) * rad, py = Math.sin(a) * rad;
        if (i % 3 === 0 && olives) { circ(ctx, px, py, r * .075, C.olive); circ(ctx, px, py, r * .032, C.cheese); }
        else circ(ctx, px, py, r * .085, C.sauce);
      }
      // cheese shading
      for (let i = 0; i < 7; i++) {
        const a = hash(i * 5.3 + seed + 20) * TAU, rad = Math.sqrt(hash(i * 2.2 + seed)) * r * .62;
        S(ctx, () => { ctx.globalAlpha = .28; ell(ctx, Math.cos(a) * rad, Math.sin(a) * rad, r * .17, r * .1, a, '#F7D98D'); });
      }
    });
    wedge(r, null, C.ink, r * .055);
    if (steam > 0) S(ctx, () => {
      ctx.globalAlpha = clamp(steam) * .5; ctx.strokeStyle = 'rgba(32,32,39,.45)'; ctx.lineWidth = r * .04; ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const sx = (i - 1) * r * .42, ph = t * 1.4 + i * .7;
        ctx.beginPath(); ctx.moveTo(sx, -r * .25);
        for (let k = 0; k <= 5; k++) ctx.lineTo(sx + Math.sin(ph + k * .8) * r * .11, -r * .25 - k * r * .18);
        ctx.stroke();
      }
    });
  });
}

/** a single slice, held or flying */
export function slice(ctx, s = 1, o = {}) {
  S(ctx, () => {
    ctx.scale(s, s);
    const L = 100, hw = 42;
    const path = () => {
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.lineTo(-hw, -L); ctx.quadraticCurveTo(0, -L - 22, hw, -L); ctx.closePath();
    };
    shadow(ctx, 16, 8, 'rgba(32,32,39,.2)'); path(); ctx.fillStyle = C.cheese; ctx.fill(); noShadow(ctx);
    S(ctx, () => { path(); ctx.clip(); rr(ctx, -hw - 6, -L - 26, hw * 2 + 12, 26, 10, C.crust); });
    path(); ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
    circ(ctx, -14, -48, 9, C.sauce); circ(ctx, 16, -70, 9, C.sauce); circ(ctx, 4, -28, 7, C.olive);
    if (o.cheesePull) S(ctx, () => {
      ctx.strokeStyle = '#EFC96A'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      const k = clamp(o.cheesePull);
      ctx.beginPath(); ctx.moveTo(-20, -6); ctx.quadraticCurveTo(-6, 40 * k, 12, -4); ctx.stroke();
    });
  });
}

/** delivery box. open: 0 shut, 1 lid fully back */
export function pizzaBox(ctx, x, y, w, o = {}) {
  const { open = 0, t = 0, glow = 0, contents = 'pizza' } = o;
  const h = w * .28, d = w * .82;
  S(ctx, () => {
    ctx.translate(x, y);
    if (glow > 0) S(ctx, () => { ctx.globalAlpha = glow * .45; ell(ctx, 0, 0, w * .8, w * .3, 0, C.mintSoft); });
    // lid, hinged at the back
    S(ctx, () => {
      ctx.translate(0, -h);
      ctx.transform(1, 0, 0, Math.cos(open * 1.55), 0, 0);
      shadow(ctx, 18, 8, 'rgba(32,32,39,.18)');
      rr(ctx, -w / 2, -d * .62, w, d * .62, 12, C.cream, C.ink, 6); noShadow(ctx);
      if (open < .4) { sliceMark(ctx, 0, -d * .32, w * .14); }
    });
    // base
    rr(ctx, -w / 2, -h, w, h * 2.1, 12, C.cream, C.ink, 6);
    if (open > .3) S(ctx, () => {
      ctx.globalAlpha = clamp((open - .3) / .5);
      S(ctx, () => { ctx.translate(0, -h * .1); ctx.scale(1, .42); if (contents === 'pizza') pizza(ctx, 0, 0, w * .42, { steam: .8, t }); });
      if (contents === 'empty') text(ctx, '', 0, 0, {});
    });
    text(ctx, 'HOT SLICE', 0, h * .62, { size: w * .1, weight: 800, color: 'rgba(32,32,39,.45)', letter: 2 });
  });
}

/** one (1) free olive */
export function olive(ctx, x, y, r, o = {}) {
  S(ctx, () => {
    ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
    shadow(ctx, 10, 5, 'rgba(32,32,39,.25)');
    ell(ctx, 0, 0, r, r * .84, 0, C.olive, C.ink, r * .16); noShadow(ctx);
    ell(ctx, 0, 0, r * .4, r * .34, 0, C.cream, C.ink, r * .12);
    S(ctx, () => { ctx.globalAlpha = .5; ell(ctx, -r * .35, -r * .38, r * .22, r * .13, -.5, '#8AA36A'); });
  });
}

export function coin(ctx, x, y, r, o = {}) {
  S(ctx, () => {
    ctx.translate(x, y);
    const sq = o.spin !== undefined ? Math.abs(Math.cos(o.spin)) : 1;
    ctx.scale(Math.max(.08, sq), 1);
    circ(ctx, 0, 0, r, C.cheese, C.ink, r * .12);
    circ(ctx, 0, 0, r * .72, null, 'rgba(32,32,39,.3)', r * .06);
    text(ctx, '€', 0, 1, { size: r * .95, weight: 800, color: C.ink });
  });
}

/** printed receipt, curling */
export function receipt(ctx, x, y, w, lines, o = {}) {
  const k = clamp(o.k ?? 1), lh = 34;
  const h = 60 + lines.length * lh + 40;
  S(ctx, () => {
    ctx.translate(x, y);
    S(ctx, () => {
      ctx.beginPath(); ctx.rect(-w / 2 - 20, 0, w + 40, h * k + 6); ctx.clip();
      shadow(ctx, 20, 10, 'rgba(32,32,39,.18)');
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0); ctx.lineTo(w / 2, h - 14);
      for (let i = 0; i <= 8; i++) ctx.lineTo(w / 2 - (w / 8) * i, h - (i % 2 ? 0 : 16));
      ctx.closePath(); ctx.fillStyle = C.cream; ctx.fill(); noShadow(ctx);
      ctx.strokeStyle = 'rgba(32,32,39,.2)'; ctx.lineWidth = 3; ctx.stroke();
      text(ctx, 'HOT SLICE', 0, 34, { size: 28, weight: 800, color: C.ink, letter: 3 });
      line(ctx, -w / 2 + 20, 56, w / 2 - 20, 56, 'rgba(32,32,39,.22)', 2);
      lines.forEach((l, i) => {
        const hi = l.hi;
        text(ctx, l.l ?? l, -w / 2 + 24, 86 + i * lh, { size: 24, weight: hi ? 800 : 700, color: hi ? C.ink : 'rgba(32,32,39,.6)', align: 'left' });
        if (l.r) text(ctx, l.r, w / 2 - 24, 86 + i * lh, { size: 24, weight: hi ? 800 : 700, color: hi ? C.ink : 'rgba(32,32,39,.6)', align: 'right' });
      });
    });
  });
}

/** VERIFIED HUMAN / ASSISTANT badge */
export function badge(ctx, x, y, label, o = {}) {
  const good = o.kind !== 'gray';
  const size = o.size || 30;
  ctx.font = f(800, size);
  const w = ctx.measureText(label).width + 112, h = size * 2.1;
  S(ctx, () => {
    ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
    if (o.glow) S(ctx, () => { ctx.globalAlpha = o.glow * .5; rr(ctx, -w / 2 - 12, -h / 2 - 12, w + 24, h + 24, h, null, C.mint, 6); });
    shadow(ctx, 18, 8, 'rgba(32,32,39,.2)');
    rr(ctx, -w / 2, -h / 2, w, h, h / 2, good ? C.mint : C.gray, C.ink, 4); noShadow(ctx);
    // tick / dash
    S(ctx, () => {
      ctx.strokeStyle = good ? C.white : 'rgba(32,32,39,.5)'; ctx.lineWidth = size * .2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const cx = -w / 2 + 40;
      if (good) { ctx.beginPath(); ctx.moveTo(cx - 12, 1); ctx.lineTo(cx - 3, 11); ctx.lineTo(cx + 13, -11); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(cx - 12, 0); ctx.lineTo(cx + 12, 0); ctx.stroke(); }
    });
    text(ctx, label, 22, 1, { size, weight: 800, color: good ? C.white : 'rgba(32,32,39,.65)', letter: 1.5 });
  });
}

/** one-time code, as a physical object with a shelf life */
export function codeChip(ctx, x, y, digits, o = {}) {
  const s = o.s || 1, dead = o.dead, k = clamp(o.k ?? 1);
  S(ctx, () => {
    ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = k;
    const w = 86, gap = 18, n = digits.length;
    const total = n * w + (n - 1) * gap;
    if (o.glow) S(ctx, () => { ctx.globalAlpha = o.glow * .4 * k; rr(ctx, -total / 2 - 18, -74, total + 36, 148, 28, null, dead ? C.red : C.mint, 7); });
    for (let i = 0; i < n; i++) {
      const bx = -total / 2 + i * (w + gap);
      shadow(ctx, 14, 7, 'rgba(32,32,39,.2)');
      rr(ctx, bx, -60, w, 120, 18, dead ? C.redSoft : C.white, dead ? C.red : C.ink, 5); noShadow(ctx);
      text(ctx, digits[i], bx + w / 2, 2, { size: 72, weight: 800, color: dead ? C.redDeep : C.ink });
    }
    if (o.timer !== undefined) {
      ring(ctx, total / 2 + 72, 0, 40, o.timer, o.timer < .3 ? C.red : C.mint, 10);
      text(ctx, String(Math.ceil(o.timer * 30)), total / 2 + 72, 2, { size: 30, weight: 800, color: C.ink });
    }
  });
}

/** a share link card — the punchline object */
export function linkCard(ctx, x, y, o = {}) {
  const w = o.w || 620, h = 128, k = clamp(o.k ?? 1);
  S(ctx, () => {
    ctx.translate(x, y); ctx.globalAlpha = k;
    ctx.scale(lerp(.85, 1, E.outBack(k)), lerp(.85, 1, E.outBack(k)));
    shadow(ctx, 30, 14, 'rgba(32,32,39,.25)');
    rr(ctx, -w / 2, -h / 2, w, h, 24, C.cream, C.ink, 5); noShadow(ctx);
    rr(ctx, -w / 2 + 18, -h / 2 + 18, 92, h - 36, 18, C.mintSoft);
    S(ctx, () => { // chain-link glyph
      ctx.translate(-w / 2 + 64, 0); ctx.strokeStyle = C.mint; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(-11, 0, 15, Math.PI * .4, Math.PI * 1.6); ctx.stroke();
      ctx.beginPath(); ctx.arc(11, 0, 15, Math.PI * 1.4, Math.PI * 2.6); ctx.stroke();
      line(ctx, -8, 0, 8, 0, C.mint, 8);
    });
    text(ctx, o.title || 'Pizza (1)', -w / 2 + 130, -18, { size: 30, weight: 800, color: C.ink, align: 'left' });
    text(ctx, o.url || 'hotslice.example/p/4712', -w / 2 + 130, 22, { size: 24, weight: 700, color: 'rgba(32,32,39,.55)', align: 'left' });
    if (o.copied) text(ctx, 'LINK COPIED', w / 2 - 28, 0, { size: 20, weight: 800, color: C.mint, align: 'right', letter: 1.5 });
  });
}

/** permission dome: you can see it, you cannot have it */
export function dome(ctx, x, y, r, o = {}) {
  const k = clamp(o.k ?? 1);
  S(ctx, () => {
    ctx.translate(x, y); ctx.globalAlpha = k;
    const g = ctx.createLinearGradient(0, -r, 0, 0);
    g.addColorStop(0, 'rgba(24,133,103,.16)'); g.addColorStop(1, 'rgba(24,133,103,.05)');
    ctx.beginPath(); ctx.arc(0, 0, r, Math.PI, TAU); ctx.closePath();
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(24,133,103,.6)'; ctx.lineWidth = 5; ctx.stroke();
    S(ctx, () => { // specular
      ctx.globalAlpha = .5; ctx.strokeStyle = C.white; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, r * .8, Math.PI * 1.15, Math.PI * 1.42); ctx.stroke();
    });
    line(ctx, -r, 0, r, 0, 'rgba(24,133,103,.6)', 5);
    if (o.lock) S(ctx, () => {
      ctx.translate(0, -r * .62);
      circ(ctx, 0, 0, 40, C.mint, C.ink, 5);
      rr(ctx, -15, -4, 30, 26, 6, C.white);
      ctx.beginPath(); ctx.arc(0, -4, 12, Math.PI, 0); ctx.strokeStyle = C.white; ctx.lineWidth = 7; ctx.stroke();
    });
  });
}

/** an advertisement. It is the first thing we see and the last thing we blame. */
export function pizzaAd(ctx, x, y, w, h, o = {}) {
  const t = o.t || 0, k = clamp(o.k ?? 1);
  S(ctx, () => {
    ctx.translate(x, y);
    rrPath(ctx, -w / 2, -h / 2, w, h, 28); ctx.save(); ctx.clip();
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, '#1F6E57'); g.addColorStop(1, '#0C4635');
    ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
    // radial glow behind the product
    S(ctx, () => {
      const rg = ctx.createRadialGradient(w * .18, -h * .06, 0, w * .18, -h * .06, h * .7);
      rg.addColorStop(0, 'rgba(242,195,92,.45)'); rg.addColorStop(1, 'rgba(242,195,92,0)');
      ctx.fillStyle = rg; ctx.fillRect(-w / 2, -h / 2, w, h);
    });
    S(ctx, () => {
      ctx.translate(w * .2, -h * .02 + Math.sin(t * .9) * h * .012);
      ctx.rotate(Math.sin(t * .6) * .03);
      pizza(ctx, 0, 0, h * .34, { steam: .9, t, seed: 3 });
    });
    text(ctx, 'HOT SLICE', -w / 2 + 56, -h * .22, { size: h * .17, weight: 800, color: C.white, align: 'left', letter: -1 });
    text(ctx, 'IN 20 MINUTES', -w / 2 + 58, -h * .06, { size: h * .085, weight: 800, color: C.mintSoft, align: 'left', letter: 3 });
    S(ctx, () => {
      const pw = h * .42;
      rr(ctx, -w / 2 + 56, h * .04, pw, h * .2, h * .1, C.cheese);
      text(ctx, '€7.40', -w / 2 + 56 + pw / 2, h * .14, { size: h * .12, weight: 800, color: C.ink });
    });
    // the fine print nobody reads. It pays off in the last ten seconds.
    text(ctx, 'INCLUDES ONE (1) FREE OLIVE', -w / 2 + 56, h * .38, { size: h * .055, weight: 700, color: 'rgba(245,245,247,.62)', align: 'left', letter: 1 });
    ctx.restore();
    rr(ctx, -w / 2, -h / 2, w, h, 28, null, C.ink, 6);
  });
}
