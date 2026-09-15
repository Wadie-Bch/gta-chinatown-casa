// STREEM+ — the second site. Dark, expensive-looking, and impossible to leave.
import { C, f } from '../core/palette.js';
import { S, rr, rrPath, circ, ell, line, poly, text, shadow, noShadow, lightPool, ring, spinner } from '../core/draw.js';
import { clamp, lerp, TAU, hash, sin01, sinw, E, p01, noise1 } from '../core/util.js';
import { interior } from './rooms.js';

export const NIGHT = '#14141B', PANEL = '#22222C', PANEL2 = '#2C2C38';

/** a show poster, drawn from code — abstract art, never a real title */
export function showTile(ctx, x, y, w, h, title, seed = 0, o = {}) {
  S(ctx, () => {
    ctx.translate(x, y);
    rrPath(ctx, -w / 2, -h / 2, w, h, 16); ctx.save(); ctx.clip();
    const hue = [['#2A4C6B', '#12202E'], ['#5B2A3C', '#24121B'], ['#2A5B47', '#12241D'],
                 ['#5B4A2A', '#241E12'], ['#3E2A5B', '#1A1224'], ['#5B2A2A', '#241212']][seed % 6];
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, hue[0]); g.addColorStop(1, hue[1]);
    ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
    // a shape that suggests a genre without being anything
    S(ctx, () => {
      ctx.globalAlpha = .5;
      if (seed % 3 === 0) { circ(ctx, 0, -h * .08, w * .24, 'rgba(245,245,247,.5)'); }
      else if (seed % 3 === 1) { poly(ctx, [[0, -h * .3], [w * .26, h * .12], [-w * .26, h * .12]], 'rgba(245,245,247,.45)'); }
      else { rr(ctx, -w * .22, -h * .26, w * .44, h * .44, 10, 'rgba(245,245,247,.42)'); }
    });
    ctx.restore();
    rr(ctx, -w / 2, -h / 2, w, h, 16, null, 'rgba(245,245,247,.16)', 3);
    if (title) text(ctx, title, 0, h / 2 + 30, { size: Math.max(16, w * .12), weight: 800, color: 'rgba(245,245,247,.62)', letter: 1, maxW: w * 1.4 });
    if (o.badge) {
      rr(ctx, -w / 2 + 10, -h / 2 + 10, 92, 30, 8, C.mint);
      text(ctx, o.badge, -w / 2 + 56, -h / 2 + 25, { size: 16, weight: 800, color: C.white, letter: 1 });
    }
  });
}

/** the account page: a dark room whose wall is the interface */
export function streemPage(ctx, o = {}) {
  const t = o.t || 0;
  ctx.fillStyle = NIGHT; ctx.fillRect(-5000, -2200, 14000, 5200);
  ctx.fillStyle = '#0E0E14'; ctx.fillRect(-5000, 0, 14000, 3000);
  line(ctx, -5000, 0, 9000, 0, 'rgba(245,245,247,.10)', 5);
  // brand
  text(ctx, 'STREEM', -1560, -1420, { size: 92, weight: 800, color: C.white, letter: -1, align: 'left' });
  text(ctx, '+', -1218, -1448, { size: 92, weight: 800, color: C.mint, align: 'left' });
  // a shelf of things he does not watch
  for (let i = 0; i < 6; i++) showTile(ctx, -1400 + i * 430, -1060, 330, 460, ['MONSTER BARN', 'DEEP WATER', 'THE LONG ROAD', 'NINE LIVES', 'GLASS CITY', 'SALT'][i], i, { badge: i === 0 ? 'WATCHED' : null });
  // the account panel
  if (o.account !== false) S(ctx, () => {
    const ax = o.accountX ?? 1620, ay = -760;
    rr(ctx, ax - 330, ay - 240, 660, 480, 26, PANEL, 'rgba(245,245,247,.14)', 4);
    text(ctx, 'YOUR PLAN', ax, ay - 184, { size: 24, weight: 800, color: 'rgba(245,245,247,.5)', letter: 4 });
    text(ctx, 'STREEM+ PREMIUM', ax, ay - 118, { size: 40, weight: 800, color: C.white });
    S(ctx, () => { rr(ctx, ax - 130, ay - 72, 260, 76, 38, C.mint); text(ctx, o.price || '€9.99 / MONTH', ax, ay - 33, { size: 26, weight: 800, color: C.white, letter: 1 }); });
    line(ctx, ax - 270, ay + 30, ax + 270, ay + 30, 'rgba(245,245,247,.14)', 3);
    text(ctx, 'NEXT PAYMENT', ax, ay + 72, { size: 22, weight: 800, color: 'rgba(245,245,247,.45)', letter: 3 });
    text(ctx, o.next || 'IN 4 DAYS', ax, ay + 124, { size: 34, weight: 800, color: C.cheese });
    text(ctx, o.months || 'MEMBER FOR 11 MONTHS', ax, ay + 190, { size: 22, weight: 700, color: 'rgba(245,245,247,.4)', letter: 1 });
  });
  // the footer, where the important link lives at nine pixels tall
  if (o.footer !== false) S(ctx, () => {
    const fy = o.footerY ?? -150;
    line(ctx, -1700, fy - 60, 2200, fy - 60, 'rgba(245,245,247,.1)', 3);
    const links = ['About', 'Careers', 'Press', 'Legal', 'Cookies', 'Devices', 'Gift cards', 'Cancel subscription'];
    let lx = -1640;
    links.forEach((l, i) => {
      const last = i === links.length - 1;
      text(ctx, l, lx, fy, { size: 22, weight: 700, color: last ? 'rgba(245,245,247,.34)' : 'rgba(245,245,247,.42)', align: 'left' });
      ctx.font = f(700, 22); lx += ctx.measureText(l).width + 54;
    });
    if (o.hotFooter) S(ctx, () => {
      ctx.globalAlpha = .5 + sin01(t * 1.6) * .5;
      rr(ctx, lx - 268, fy - 24, 246, 46, 10, null, C.mint, 4);
    });
  });
  lightPool(ctx, o.poolX ?? 0, 40, 1500, 300, 'rgba(24,133,103,.10)', .8);
}

/** settings: a wall of switches, none of which is the one you want */
export function settingsRoom(ctx, o = {}) {
  const t = o.t || 0;
  ctx.fillStyle = NIGHT; ctx.fillRect(-5000, -2200, 14000, 5200);
  ctx.fillStyle = '#0E0E14'; ctx.fillRect(-5000, 0, 14000, 3000);
  line(ctx, -5000, 0, 9000, 0, 'rgba(245,245,247,.10)', 5);
  text(ctx, 'SETTINGS', -1500, -1320, { size: 60, weight: 800, color: C.white, letter: 8, align: 'left' });
  const labels = ['Autoplay next episode', 'Autoplay previews', 'Data saver', 'Subtitles',
    'Audio description', 'Email me offers', 'Email me more offers', 'Notifications',
    'Downloads over cellular', 'Mature content', 'Profile lock', 'Viewing activity'];
  labels.forEach((l, i) => {
    const col = Math.floor(i / 6), row = i % 6;
    const x = -1500 + col * 1560, y = -1160 + row * 176;
    S(ctx, () => {
      rr(ctx, x, y, 1400, 132, 18, PANEL, 'rgba(245,245,247,.1)', 3);
      text(ctx, l, x + 44, y + 66, { size: 34, weight: 700, color: 'rgba(245,245,247,.82)', align: 'left' });
      const on = hash(i * 3.3) > .4;
      rr(ctx, x + 1250, y + 44, 100, 48, 24, on ? C.mint : '#3A3A46');
      circ(ctx, x + (on ? 1326 : 1274), y + 68, 18, C.white);
    });
  });
  lightPool(ctx, 0, 40, 1400, 280, 'rgba(24,133,103,.08)', .8);
}

/** a nesting accordion, drawn `depth` deep */
export function accordion(ctx, x, y, w, depth, o = {}) {
  const open = o.open ?? [];
  S(ctx, () => {
    ctx.translate(x, y);
    let cy = 0, cw = w;
    for (let d = 0; d < depth; d++) {
      const isOpen = open[d];
      S(ctx, () => {
        ctx.translate(d * 46, cy);
        rr(ctx, -cw / 2, 0, cw, 104, 16, d % 2 ? PANEL2 : PANEL, 'rgba(245,245,247,.12)', 3);
        text(ctx, o.labels?.[d] || 'Manage preferences', -cw / 2 + 40, 52, { size: 30, weight: 800, color: 'rgba(245,245,247,.85)', align: 'left' });
        S(ctx, () => {
          ctx.translate(cw / 2 - 48, 52); ctx.rotate(isOpen ? Math.PI / 2 : 0);
          ctx.strokeStyle = 'rgba(245,245,247,.6)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(-7, -11); ctx.lineTo(7, 0); ctx.lineTo(-7, 11); ctx.stroke();
        });
      });
      cy += 128; cw -= 92;
      if (!isOpen) break;
    }
    if (o.inner) { S(ctx, () => { ctx.translate(depth * 46, cy + 14); o.inner(ctx, cw); }); }
  });
}

/** RETAIN's room: warm, soft, low-ceilinged, and very hard to leave */
export function offerRoom(ctx, o = {}) {
  const t = o.t || 0;
  interior(ctx, { wall: '#F4EFE7', floor: '#E6DDD1', seam: 'rgba(32,32,39,.05)', seamEvery: 520 });
  S(ctx, () => {
    const g = ctx.createRadialGradient(o.spotX ?? 0, -760, 60, o.spotX ?? 0, -760, 1500);
    g.addColorStop(0, 'rgba(242,195,92,.24)'); g.addColorStop(1, 'rgba(242,195,92,0)');
    ctx.fillStyle = g; ctx.fillRect(-3000, -1700, 8000, 1740);
  });
  // a soft arch behind him, like a shop window
  S(ctx, () => {
    ctx.beginPath(); ctx.arc(o.spotX ?? 0, -430, 620, Math.PI, 0); ctx.lineTo((o.spotX ?? 0) + 620, 0);
    ctx.lineTo((o.spotX ?? 0) - 620, 0); ctx.closePath();
    ctx.fillStyle = '#FBF6EF'; ctx.fill(); ctx.strokeStyle = 'rgba(32,32,39,.14)'; ctx.lineWidth = 6; ctx.stroke();
  });
  text(ctx, 'WE VALUE YOU', o.spotX ?? 0, -980, { size: 44, weight: 800, color: 'rgba(32,32,39,.22)', letter: 10 });
  // a potted plant, the universal sign of a place that wants you comfortable
  S(ctx, () => {
    ctx.translate((o.spotX ?? 0) - 980, 0);
    rr(ctx, -70, -130, 140, 130, 18, '#D9C3A8', C.ink, 5);
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * .33;
      S(ctx, () => { ctx.translate(0, -130); ctx.rotate(a); ell(ctx, 0, -110, 34, 108, 0, i % 2 ? '#7FA579' : '#658B60', C.ink, 4); });
    }
  });
}

/** an offer, as a physical card that will not go away */
export function offerCard(ctx, x, y, o = {}) {
  const k = clamp(o.k ?? 1); if (k <= .002) return;
  const w = o.w || 620, h = o.h || 330;
  S(ctx, () => {
    ctx.translate(x, y); ctx.globalAlpha = clamp(k * 1.35);
    ctx.rotate((o.rot || 0) + (1 - E.outBack(k)) * .1);
    const sc = lerp(.86, 1, E.outBack(k)); ctx.scale(sc, sc);
    shadow(ctx, 34, 16, 'rgba(32,32,39,.22)');
    rr(ctx, -w / 2, -h / 2, w, h, 26, C.cream, C.ink, 6); noShadow(ctx);
    rr(ctx, -w / 2, -h / 2, w, 72, [26, 26, 0, 0], o.accent || C.mint);
    text(ctx, o.kicker || 'JUST FOR YOU', 0, -h / 2 + 36, { size: 24, weight: 800, color: C.white, letter: 4 });
    text(ctx, o.title || '50% OFF', 0, -h / 2 + 136, { size: o.titleSize || 62, weight: 800, color: C.ink, maxW: w - 60 });
    if (o.sub) text(ctx, o.sub, 0, -h / 2 + 200, { size: 28, weight: 700, color: 'rgba(32,32,39,.6)', maxW: w - 70 });
    if (o.foot) text(ctx, o.foot, 0, h / 2 - 40, { size: 22, weight: 700, color: 'rgba(32,32,39,.42)', maxW: w - 60 });
    if (o.bow) S(ctx, () => {
      ctx.translate(w / 2 - 54, -h / 2 - 6);
      circ(ctx, -26, 0, 24, C.mint, C.ink, 5); circ(ctx, 26, 0, 24, C.mint, C.ink, 5);
      circ(ctx, 0, 0, 15, C.mintDeep, C.ink, 5);
    });
  });
}

/** the hold room. Beige is a design decision here. */
export function holdRoom(ctx, o = {}) {
  const t = o.t || 0;
  interior(ctx, { wall: '#EFE9DE', floor: '#DBD2C4', seam: 'rgba(32,32,39,.06)', seamEvery: 460 });
  // strip light
  rr(ctx, -1400, -1460, 2800, 34, 8, '#FBF7EF', 'rgba(32,32,39,.12)', 3);
  S(ctx, () => { ctx.globalAlpha = .3; lightPool(ctx, 0, -1200, 1500, 700, 'rgba(255,250,235,.9)', 1); });
  // rows of chairs nobody is in
  for (let i = 0; i < 7; i++) {
    const cx = -1450 + i * 430;
    S(ctx, () => {
      ctx.translate(cx, 0);
      rr(ctx, -84, -190, 168, 40, 12, '#B9AE9B', C.ink, 5);
      rr(ctx, -84, -156, 168, 26, 8, '#C8BDA9', C.ink, 5);
      rr(ctx, -74, -130, 20, 130, 8, C.ink); rr(ctx, 54, -130, 20, 130, 8, C.ink);
    });
  }
  // the speaker that will not stop
  S(ctx, () => {
    ctx.translate(o.spkX ?? 1180, -1180);
    rr(ctx, -70, -70, 140, 140, 18, '#C6BCA9', C.ink, 5);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) circ(ctx, -38 + c * 38, -38 + r * 38, 11, 'rgba(32,32,39,.35)');
    if (o.playing) S(ctx, () => {
      ctx.globalAlpha = .35 + sin01(t * 2.2) * .35;
      for (let i = 0; i < 3; i++) { ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(70, 0, 46 + i * 34, -.7, .7); ctx.stroke(); }
    });
  });
  lightPool(ctx, 0, 40, 1500, 300, 'rgba(32,32,39,.05)', .8);
}

/** NOW SERVING, counting in a direction of its own choosing */
export function nowServing(ctx, x, y, num, o = {}) {
  S(ctx, () => {
    ctx.translate(x, y);
    shadow(ctx, 30, 14, 'rgba(32,32,39,.2)');
    rr(ctx, -420, -170, 840, 340, 24, C.ink); noShadow(ctx);
    rr(ctx, -420, -170, 840, 64, [24, 24, 0, 0], PANEL2);
    text(ctx, 'NOW SERVING', 0, -138, { size: 28, weight: 800, color: 'rgba(245,245,247,.62)', letter: 8 });
    S(ctx, () => {
      rr(ctx, -330, -68, 660, 194, 16, '#0B0B10');
      text(ctx, String(num), 0, 30, { size: 132, weight: 800, color: o.col || C.cheese, letter: 8 });
    });
  });
}

/** your ticket, which also moves */
export function ticketStub(ctx, x, y, num, o = {}) {
  S(ctx, () => {
    ctx.translate(x, y); ctx.rotate(o.rot || 0); const s = o.s || 1; ctx.scale(s, s);
    shadow(ctx, 18, 9, 'rgba(32,32,39,.22)');
    rr(ctx, -150, -100, 300, 200, 16, C.cream, C.ink, 6); noShadow(ctx);
    line(ctx, -150, -34, 150, -34, 'rgba(32,32,39,.25)', 3);
    text(ctx, 'YOUR NUMBER', 0, -64, { size: 20, weight: 800, color: 'rgba(32,32,39,.5)', letter: 3 });
    text(ctx, String(num), 0, 30, { size: 72, weight: 800, color: C.ink });
    for (let i = 0; i < 9; i++) rr(ctx, -120 + i * 30, 74, 8, 18, 2, 'rgba(32,32,39,.45)');
  });
}

/** the service window, with the glass you have to talk through */
export function serviceWindow(ctx, o = {}) {
  const t = o.t || 0;
  interior(ctx, { wall: '#EFE9DE', floor: '#DBD2C4', seam: 'rgba(32,32,39,.06)', seamEvery: 460 });
  S(ctx, () => {
    const wx = o.wx ?? 0;
    rr(ctx, wx - 700, -1180, 1400, 1180, [30, 30, 0, 0], '#DCD3C4', C.ink, 7);
    rr(ctx, wx - 600, -1040, 1200, 700, 18, o.dark ? '#171720' : '#F6F2EA', C.ink, 6);
    // the gap you speak through
    rr(ctx, wx - 220, -330, 440, 26, 13, C.ink);
    rr(ctx, wx - 620, -320, 1240, 46, 10, '#C9BFAE', C.ink, 5);
    if (o.sign) {
      rr(ctx, wx - 260, -1300, 520, 92, 14, C.ink);
      text(ctx, o.sign, wx, -1254, { size: 34, weight: 800, color: C.white, letter: 4 });
    }
  });
}

/** ONE (1) FREE PET */
export function pet(ctx, x, y, s = 1, o = {}) {
  const t = o.t || 0;
  S(ctx, () => {
    ctx.translate(x, y); ctx.scale(s, s);
    const bl = Math.abs(((t * .31) % 1)) < .05 ? .12 : 1;
    S(ctx, () => { ctx.globalAlpha = .2; ell(ctx, 0, 4, 52, 13, 0, C.ink); });
    ctx.translate(0, Math.sin(t * 2.1) * 4);
    // a soft blob with one ear
    ctx.beginPath();
    ctx.moveTo(-48, 0); ctx.quadraticCurveTo(-52, -78, 0, -80);
    ctx.quadraticCurveTo(52, -78, 48, 0); ctx.closePath();
    ctx.fillStyle = C.mintSoft; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5.5; ctx.stroke();
    S(ctx, () => { ctx.translate(26, -70); ctx.rotate(.4); ell(ctx, 0, -18, 13, 26, 0, C.mintSoft, C.ink, 5); });
    ell(ctx, -16, -44, 7, 9 * bl, 0, C.ink); ell(ctx, 16, -44, 7, 9 * bl, 0, C.ink);
    if (bl > .5) { circ(ctx, -18, -47, 2.4, C.white); circ(ctx, 14, -47, 2.4, C.white); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -28, 9, Math.PI * .2, Math.PI * .8); ctx.stroke();
    if (o.tag) {
      S(ctx, () => {
        ctx.translate(0, -8); ctx.rotate(-.06);
        rr(ctx, -62, 0, 124, 40, 8, C.cheese, C.ink, 4);
        text(ctx, o.tag, 0, 20, { size: 20, weight: 800, color: C.ink });
      });
    }
  });
}
