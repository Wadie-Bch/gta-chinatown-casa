// The browser as architecture. Tabs are rooms; windows are walls; the page is a floor.
import { C, f } from '../core/palette.js';
import { S, rr, rrPath, circ, ell, line, poly, shadow, noShadow, text, lightPool, spinner, ring, vignette } from '../core/draw.js';
import { clamp, lerp, TAU, hash, sin01, sinw, E, p01, noise1 } from '../core/util.js';
import { pizzaAd, pizza } from './props.js';
import { sliceMark } from '../chars/dash.js';

/** generic interior: back wall + floor meeting at y=0 */
export function interior(ctx, o = {}) {
  const { x0 = -4000, x1 = 8000, wall = C.white, floor = '#EAEAEE', top = -1600, depth = 2600, seam = 'rgba(32,32,39,.06)', seamEvery = 420 } = o;
  ctx.fillStyle = wall; ctx.fillRect(x0, top, x1 - x0, -top);
  ctx.fillStyle = floor; ctx.fillRect(x0, 0, x1 - x0, depth);
  if (seam) for (let x = Math.ceil(x0 / seamEvery) * seamEvery; x < x1; x += seamEvery) line(ctx, x, top, x, 0, seam, 4);
  // where wall meets floor: one soft contact shadow, nothing more
  S(ctx, () => {
    const g = ctx.createLinearGradient(0, -110, 0, 30);
    g.addColorStop(0, 'rgba(32,32,39,0)'); g.addColorStop(1, 'rgba(32,32,39,.10)');
    ctx.fillStyle = g; ctx.fillRect(x0, -110, x1 - x0, 140);
  });
  line(ctx, x0, 0, x1, 0, 'rgba(32,32,39,.16)', 5);
}

/** HOT SLICE storefront page — where the hunger happens */
export function shopRoom(ctx, o = {}) {
  const t = o.t || 0;
  interior(ctx, { wall: C.white, floor: '#ECECF1' });
  // wall type
  text(ctx, 'HOT SLICE', -1420, -1380, { size: 96, weight: 800, color: 'rgba(32,32,39,.08)', letter: 8, align: 'left' });
  pizzaAd(ctx, 250, -900, 1500, 620, { t });
  // a menu shelf of smaller product cards
  for (let i = 0; i < 3; i++) {
    const cx = 1500 + i * 420;
    S(ctx, () => {
      rr(ctx, cx - 170, -820, 340, 400, 24, C.cream, 'rgba(32,32,39,.14)', 4);
      S(ctx, () => { ctx.translate(cx, -670); ctx.scale(.9, .9); pizza(ctx, 0, 0, 110, { seed: i * 9 + 2 }); });
      rr(ctx, cx - 110, -520, 220, 56, 28, C.gray);
      text(ctx, ['MARGHERITA', 'DOUBLE', 'SPICY'][i], cx, -492, { size: 24, weight: 800, color: 'rgba(32,32,39,.6)', letter: 1 });
    });
  }
  // balance widget on the wall
  if (o.balance !== false) S(ctx, () => {
    const bx = -1080, by = -560;
    shadow(ctx, 24, 10, 'rgba(32,32,39,.14)');
    rr(ctx, bx - 190, by - 90, 380, 180, 26, C.cream, C.ink, 5); noShadow(ctx);
    text(ctx, 'BALANCE', bx, by - 42, { size: 26, weight: 800, color: 'rgba(32,32,39,.5)', letter: 3 });
    text(ctx, o.balanceText || '€7.40', bx, by + 26, { size: 76, weight: 800, color: C.ink });
  });
  lightPool(ctx, 250, 40, 1300, 300, 'rgba(24,133,103,.10)', .8);
}

/** GATE's checkpoint — the only place this world turns dark, and it is motivated */
export function checkpoint(ctx, o = {}) {
  const t = o.t || 0, alarm = o.alarm || 0;
  ctx.fillStyle = C.night; ctx.fillRect(-4000, -1800, 12000, 4600);
  ctx.fillStyle = '#131319'; ctx.fillRect(-4000, 0, 12000, 2800);
  // wall panels
  for (let x = -2600; x < 5200; x += 380) {
    rr(ctx, x + 14, -1500, 352, 1480, 10, '#22222C');
    line(ctx, x + 14, -1500, x + 14, 0, 'rgba(245,245,247,.07)', 3);
    rr(ctx, x + 40, -1440, 300, 6, 3, 'rgba(245,245,247,.05)');
  }
  // a cold rim down the far side so dark shapes still separate
  S(ctx, () => {
    const g = ctx.createLinearGradient(1500, 0, 3400, 0);
    g.addColorStop(0, 'rgba(24,133,103,0)'); g.addColorStop(1, 'rgba(24,133,103,.26)');
    ctx.fillStyle = g; ctx.fillRect(1500, -1500, 1900, 1500);
  });
  // floor reflection of the arch
  S(ctx, () => {
    ctx.globalAlpha = .16; ctx.fillStyle = alarm > 0 ? C.red : C.mint;
    ctx.fillRect((o.archX ?? 720) - 300, 0, 600, 420);
  });
  line(ctx, -4000, 0, 8000, 0, 'rgba(245,245,247,.13)', 5);
  // ceiling: downlights and a hanging regulation nobody reads
  for (let x = -2200; x < 5000; x += 760) {
    rr(ctx, x - 90, -1560, 180, 26, 8, '#2E2E3A');
    S(ctx, () => { ctx.globalAlpha = .5; lightPool(ctx, x, -1480, 230, 150, 'rgba(245,245,247,.5)', 1); });
  }
  S(ctx, () => {
    rr(ctx, -1500, -1500, 720, 120, 10, '#2A2A34', 'rgba(245,245,247,.12)', 4);
    line(ctx, -1340, -1500, -1340, -1560, 'rgba(245,245,247,.2)', 4);
    line(ctx, -940, -1500, -940, -1560, 'rgba(245,245,247,.2)', 4);
    text(ctx, 'NO EXIT', -1140, -1440, { size: 44, weight: 800, color: 'rgba(245,245,247,.42)', letter: 7 });
  });
  // floor guide stripe
  rr(ctx, -2400, 300, 7600, 26, 13, alarm > 0 ? C.red : C.mintDeep);
  // the arch
  S(ctx, () => {
    const ax = o.archX ?? 720;
    shadow(ctx, 40, 0, 'rgba(0,0,0,.5)');
    rr(ctx, ax - 330, -1180, 80, 1180, 12, '#262630', C.ink, 5);
    rr(ctx, ax + 250, -1180, 80, 1180, 12, '#262630', C.ink, 5);
    rr(ctx, ax - 340, -1260, 680, 100, 14, '#2E2E3A', C.ink, 5); noShadow(ctx);
    const c = alarm > 0 ? C.red : C.mint;
    rr(ctx, ax - 300, -1180, 600, 14, 7, c);
    S(ctx, () => {
      ctx.globalAlpha = .28 + sin01(t * .8) * .12 + alarm * .3;
      const g = ctx.createLinearGradient(0, -1180, 0, 0);
      g.addColorStop(0, alarm > 0 ? 'rgba(213,91,86,.55)' : 'rgba(24,133,103,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(ax - 300, -1180, 600, 1180);
    });
    text(ctx, 'HUMAN VERIFICATION', ax, -1205, { size: 42, weight: 800, color: alarm > 0 ? C.red : C.mintSoft, letter: 6 });
  });
  // queue rail — nobody else is ever in it
  S(ctx, () => {
    for (let i = 0; i < 3; i++) {
      const px = -1760 + i * 470;
      rr(ctx, px - 14, -360, 28, 360, 14, '#33333F', C.ink, 4);
      circ(ctx, px, -372, 22, '#43434F', C.ink, 4);
      if (i < 2) line(ctx, px, -330, px + 470, -300, 'rgba(24,133,103,.75)', 9);
    }
  });
  lightPool(ctx, o.archX ?? 720, 60, 900, 260, 'rgba(24,133,103,.30)', .9);
  if (alarm > 0) S(ctx, () => { ctx.globalAlpha = alarm * .16; ctx.fillStyle = C.red; ctx.fillRect(-4000, -1800, 12000, 4600); });
}

/** the checkout counter: the order form, but as a place with a countertop */
export function counterRoom(ctx, o = {}) {
  const t = o.t || 0;
  interior(ctx, { wall: '#F7F7F9', floor: '#E7E7ED' });
  // menu board
  S(ctx, () => {
    rr(ctx, -560, -1240, 1240, 300, 22, C.ink);
    text(ctx, 'CHECKOUT', 90, -1135, { size: 64, weight: 800, color: C.white, letter: 8 });
    text(ctx, 'ONE (1) PIZZA  ·  €7.40', 90, -1040, { size: 40, weight: 700, color: 'rgba(245,245,247,.6)', letter: 2 });
    sliceMark(ctx, -400, -1090, 70, true);
  });
  // counter slab
  S(ctx, () => {
    shadow(ctx, 40, 18, 'rgba(32,32,39,.2)');
    rr(ctx, -1800, -230, 4800, 168, 24, C.cream, C.ink, 6); noShadow(ctx);
    rr(ctx, -1760, -62, 4720, 78, [0, 0, 18, 18], C.gray, C.ink, 5);
    rr(ctx, -1800, -230, 4800, 28, [24, 24, 0, 0], 'rgba(32,32,39,.06)');
  });
  // card terminal
  S(ctx, () => {
    ctx.translate(o.termX ?? 1320, -230);
    ctx.rotate(-.06);
    shadow(ctx, 20, 10, 'rgba(32,32,39,.25)');
    rr(ctx, -95, -230, 190, 236, 20, C.gray, C.ink, 5); noShadow(ctx);
    rr(ctx, -72, -206, 144, 96, 10, C.ink);
    text(ctx, o.termText || '€7.40', 0, -158, { size: 40, weight: 800, color: o.termColor || C.mint });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) rr(ctx, -58 + c * 42, -92 + r * 34, 32, 26, 7, C.white, 'rgba(32,32,39,.25)', 2);
    rr(ctx, -30, -10, 60, 10, 5, C.mint);
  });
  // service bell
  S(ctx, () => {
    ctx.translate(-1320, -230);
    circ(ctx, 0, -6, 52, C.gray, C.ink, 5);
    ctx.beginPath(); ctx.arc(0, -6, 46, Math.PI, 0); ctx.fillStyle = C.cream; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
    circ(ctx, 0, -56, 12, C.mint, C.ink, 4);
  });
  // order-number board, so the wall has a job
  S(ctx, () => {
    for (let i = 0; i < 5; i++) {
      const bx = 900 + i * 190;
      rr(ctx, bx, -980, 150, 150, 20, i === 2 ? C.mint : C.gray, 'rgba(32,32,39,.16)', 4);
      text(ctx, String(41 + i), bx + 75, -905, { size: 58, weight: 800, color: i === 2 ? C.white : 'rgba(32,32,39,.3)' });
    }
    text(ctx, 'NOW SERVING', 1375, -1040, { size: 26, weight: 800, color: 'rgba(32,32,39,.4)', letter: 5 });
  });
  // a napkin dispenser and a stack of boxes, because counters have things on them
  S(ctx, () => {
    rr(ctx, -1000, -330, 150, 100, 14, C.gray, C.ink, 5);
    rr(ctx, -975, -352, 100, 26, 8, C.cream, C.ink, 4);
    for (let i = 0; i < 3; i++) rr(ctx, 380 + i * 6, -278 - i * 28, 300, 28, 8, C.cream, C.ink, 4);
  });
  // floor seam
  line(ctx, -2600, 300, 4600, 300, 'rgba(32,32,39,.07)', 5);
  lightPool(ctx, 400, -180, 1600, 440, 'rgba(24,133,103,.10)', .9);
}

/** the delivery map. Later, Dash's actual environment. */
export function mapWorld(ctx, o = {}) {
  const t = o.t || 0;
  ctx.fillStyle = '#E2E2E9'; ctx.fillRect(-3000, -2400, 10000, 6000);
  // park
  rr(ctx, 1450, -1250, 900, 760, 60, '#C6E4D8', 'rgba(24,133,103,.25)', 4);
  text(ctx, 'PARK', 1900, -880, { size: 60, weight: 800, color: 'rgba(24,133,103,.4)', letter: 6 });
  // river
  S(ctx, () => {
    ctx.strokeStyle = '#B4C4D4'; ctx.lineWidth = 150; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-2400, 980); ctx.quadraticCurveTo(200, 700, 1400, 1180); ctx.quadraticCurveTo(2600, 1600, 4200, 1240); ctx.stroke();
  });
  // city blocks — deterministic
  for (let i = 0; i < 46; i++) {
    const gx = -2400 + (i % 10) * 640 + (hash(i) * 90 - 45);
    const gy = -2000 + Math.floor(i / 10) * 700 + (hash(i + 40) * 80 - 40);
    if (gx > 1350 && gx < 2400 && gy > -1300 && gy < -450) continue;
    const w = 300 + hash(i + 11) * 260, h = 230 + hash(i + 22) * 200;
    rr(ctx, gx, gy, w, h, 26, hash(i + 5) > .8 ? '#C2C2CE' : '#CFCFDA', 'rgba(32,32,39,.14)', 4);
    if (hash(i + 33) > .62) rr(ctx, gx + 16, gy + 16, w - 32, 26, 13, 'rgba(32,32,39,.13)');
  }
  // roads
  S(ctx, () => {
    ctx.strokeStyle = '#F4F4F7'; ctx.lineWidth = 86; ctx.lineCap = 'square';
    for (let i = 0; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(-2600, -2060 + i * 700); ctx.lineTo(4400, -2060 + i * 700); ctx.stroke(); }
    for (let i = 0; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(-2480 + i * 640, -2300); ctx.lineTo(-2480 + i * 640, 1900); ctx.stroke(); }
  });
  if (o.route) S(ctx, () => {
    ctx.strokeStyle = C.mint; ctx.lineWidth = 28; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.setLineDash(o.dash ? [46, 34] : []);
    ctx.beginPath(); ctx.moveTo(o.route[0][0], o.route[0][1]);
    for (let i = 1; i < o.route.length; i++) ctx.lineTo(o.route[i][0], o.route[i][1]);
    ctx.stroke(); ctx.setLineDash([]);
  });
  if (o.dest) S(ctx, () => {
    const [dx, dy] = o.dest;
    ctx.translate(dx, dy);
    const bounce = Math.sin(t * 2.4) * 8;
    shadow(ctx, 16, 8, 'rgba(32,32,39,.3)');
    ctx.translate(0, bounce);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-52, -70, -52, -110);
    ctx.arc(0, -110, 52, Math.PI, 0); ctx.quadraticCurveTo(52, -70, 0, 0); ctx.closePath();
    ctx.fillStyle = C.red; ctx.fill(); noShadow(ctx);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.stroke();
    circ(ctx, 0, -112, 22, C.cream);
    text(ctx, o.destLabel || 'TAB 3', 0, -200, { size: 40, weight: 800, color: C.ink, back: C.cream, backStroke: C.ink, backLW: 4, letter: 2 });
  });
}

/** HELPER's dock: soft, mint, tidy, and completely calm */
export function robotRoom(ctx, o = {}) {
  const t = o.t || 0;
  interior(ctx, { wall: '#E8F0EC', floor: '#D3DFDA' });
  S(ctx, () => {
    const g = ctx.createRadialGradient(300, -700, 60, 300, -700, 1500);
    g.addColorStop(0, 'rgba(24,133,103,.16)'); g.addColorStop(1, 'rgba(24,133,103,0)');
    ctx.fillStyle = g; ctx.fillRect(-2400, -1700, 6000, 1760);
  });
  // dock alcove
  S(ctx, () => {
    rr(ctx, -60, -1180, 720, 1180, [90, 90, 0, 0], '#F3F8F6', 'rgba(24,133,103,.5)', 7);
    rr(ctx, 40, -160, 520, 160, 20, C.mintSoft, 'rgba(24,133,103,.4)', 5);
    for (let i = 0; i < 3; i++) {
      S(ctx, () => { ctx.globalAlpha = .5 + sin01(t * .9 + i * .33) * .5; rr(ctx, 210 + i * 60, -110, 30, 30, 8, C.mint); });
    }
    text(ctx, 'HELPER', 300, -1080, { size: 46, weight: 800, color: 'rgba(24,133,103,.75)', letter: 10 });
  });
  // cable loops
  S(ctx, () => {
    ctx.strokeStyle = 'rgba(32,32,39,.2)'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(680, -900 + i * 60); ctx.quadraticCurveTo(900, -700 + i * 110, 760, -300 + i * 90); ctx.stroke(); }
  });
  // shelf of politely labelled boxes
  S(ctx, () => {
    rr(ctx, -1500, -640, 900, 26, 8, C.gray, 'rgba(32,32,39,.2)', 4);
    for (let i = 0; i < 4; i++) rr(ctx, -1460 + i * 220, -800, 170, 160, 16, i === 1 ? C.mintSoft : C.cream, 'rgba(32,32,39,.18)', 4);
    text(ctx, 'THINGS TO DO', -1050, -860, { size: 28, weight: 800, color: 'rgba(32,32,39,.35)', letter: 3 });
  });
}

/** the tab strip as a corridor of doors — used for tracking shots through tabs */
export const HALL_TABS = [
  { x: -1500, label: 'hotslice', dot: C.mint },
  { x: -300, label: 'gate.check', dot: C.red },
  { x: 900, label: 'helper', dot: C.mintMid },
  { x: 2100, label: 'yap.chat', dot: C.ink },
  { x: 3300, label: 'inbox', dot: C.cheese },
  { x: 4500, label: 'slice.track', dot: C.mint },
];
export function tabHall(ctx, o = {}) {
  const t = o.t || 0, active = o.active ?? -1;
  interior(ctx, { wall: '#F2F2F6', floor: '#E4E4EA', seamEvery: 1200, seam: 'rgba(32,32,39,.05)' });
  // ceiling rail = the tab strip
  rr(ctx, -3000, -1560, 11000, 120, 0, C.gray);
  line(ctx, -3000, -1440, 8000, -1440, 'rgba(32,32,39,.14)', 5);
  HALL_TABS.forEach((d, i) => {
    const on = i === active;
    S(ctx, () => {
      ctx.translate(d.x, 0);
      // doorway
      shadow(ctx, 30, 0, 'rgba(32,32,39,.10)');
      rr(ctx, -290, -1120, 580, 1120, [70, 70, 0, 0], on ? C.white : '#EDEDF2', C.ink, 7); noShadow(ctx);
      rr(ctx, -246, -1060, 492, 1060, [50, 50, 0, 0], on ? C.mintSoft : '#E3E3EA');
      S(ctx, () => { const g = ctx.createLinearGradient(0, -1060, 0, -300); g.addColorStop(0, 'rgba(32,32,39,.20)'); g.addColorStop(1, 'rgba(32,32,39,0)'); ctx.fillStyle = g; rr(ctx, -246, -1060, 492, 760, [50, 50, 0, 0], g); });
      // the tab plate above the door
      rr(ctx, -250, -1230, 500, 120, [26, 26, 0, 0], on ? C.white : C.gray, C.ink, 6);
      circ(ctx, -180, -1170, 20, d.dot);
      text(ctx, d.label, -140, -1168, { size: 40, weight: 700, color: on ? C.ink : 'rgba(32,32,39,.6)', align: 'left' });
      if (on) S(ctx, () => { ctx.globalAlpha = .5; rr(ctx, -246, -1060, 492, 1060, [50, 50, 0, 0], 'rgba(24,133,103,.14)'); });
      // floor mat
      rr(ctx, -200, 40, 400, 70, 20, on ? C.mintSoft : 'rgba(32,32,39,.05)');
    });
  });
  if (o.pool !== false) lightPool(ctx, o.poolX ?? 0, 90, 1100, 240, 'rgba(24,133,103,.10)', .8);
}

/** Tabbi's own door — Tab 3 */
export function doorRoom(ctx, o = {}) {
  const t = o.t || 0;
  interior(ctx, { wall: '#F4F4F7', floor: '#E6E6EC' });
  S(ctx, () => {
    ctx.translate(o.doorX ?? 0, 0);
    shadow(ctx, 36, 0, 'rgba(32,32,39,.12)');
    rr(ctx, -330, -1180, 660, 1180, [80, 80, 0, 0], C.white, C.ink, 8); noShadow(ctx);
    rr(ctx, -278, -1120, 556, 1120, [56, 56, 0, 0], C.cream, 'rgba(32,32,39,.14)', 4);
    rr(ctx, -110, -960, 220, 120, 16, C.gray, C.ink, 5);
    text(ctx, 'TAB 3', 0, -898, { size: 54, weight: 800, color: C.ink, letter: 3 });
    circ(ctx, 214, -560, 26, C.gray, C.ink, 5);
    // doorbell — with a sticker
    S(ctx, () => {
      ctx.translate(400, -700);
      circ(ctx, 0, 0, 40, C.cream, C.ink, 5); circ(ctx, 0, 0, 20, o.bell ? C.mint : C.gray, C.ink, 4);
      if (o.note) {
        S(ctx, () => {
          ctx.rotate(-.06); rr(ctx, -120, 58, 240, 96, 10, C.cheese, C.ink, 4);
          text(ctx, 'DO NOT', 0, 88, { size: 26, weight: 800, color: C.ink, letter: 1 });
          text(ctx, 'RING · RING TWICE', 0, 124, { size: 21, weight: 800, color: C.ink });
        });
      }
    });
    rr(ctx, -240, 30, 480, 90, 24, C.gray, 'rgba(32,32,39,.2)', 4);
    text(ctx, 'WELCOME?', 0, 76, { size: 34, weight: 800, color: 'rgba(32,32,39,.45)', letter: 4 });
  });
}

/** the tracking screen — a device inside the world, with a bezel */
export function trackScreen(ctx, x, y, w, h, o = {}) {
  const t = o.t || 0;
  S(ctx, () => {
    ctx.translate(x, y);
    shadow(ctx, 40, 18, 'rgba(32,32,39,.28)');
    rr(ctx, -w / 2 - 26, -h / 2 - 26, w + 52, h + 92, 34, C.gray, C.ink, 6); noShadow(ctx);
    S(ctx, () => {
      rrPath(ctx, -w / 2, -h / 2, w, h, 16); ctx.clip();
      ctx.fillStyle = '#EDEDF2'; ctx.fillRect(-w / 2, -h / 2, w, h);
      S(ctx, () => { ctx.translate(-w / 2, -h / 2); ctx.scale(w / 1600, w / 1600); if (o.inner) o.inner(ctx, 1600, (h / w) * 1600); });
    });
    rr(ctx, -w / 2, -h / 2, w, h, 16, null, 'rgba(32,32,39,.25)', 4);
    text(ctx, o.caption || 'SLICE TRACK', 0, h / 2 + 36, { size: 26, weight: 800, color: 'rgba(32,32,39,.45)', letter: 4 });
  });
}

/** the tracking app's own little map — drawn for a 1600-wide device screen */
export function miniMap(ctx, w, h, o = {}) {
  const t = o.t || 0;
  ctx.fillStyle = '#E2E2E9'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) {
    const gx = 40 + (i % 7) * 230 + hash(i) * 40, gy = 40 + Math.floor(i / 7) * 230 + hash(i + 9) * 30;
    rr(ctx, gx, gy, 130 + hash(i + 3) * 60, 110 + hash(i + 5) * 50, 14, hash(i + 7) > .75 ? '#C2C2CE' : '#CFCFDA', 'rgba(32,32,39,.14)', 3);
  }
  S(ctx, () => {
    ctx.strokeStyle = '#F4F4F7'; ctx.lineWidth = 42;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, 130 + i * 230); ctx.lineTo(w, 130 + i * 230); ctx.stroke(); }
    for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(130 + i * 230, 0); ctx.lineTo(130 + i * 230, h); ctx.stroke(); }
  });
  const rt = o.route || [[120, 720], [560, 720], [560, 360], [1180, 360], [1180, 200]];
  S(ctx, () => {
    ctx.strokeStyle = C.mint; ctx.lineWidth = 20; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(rt[0][0], rt[0][1]);
    for (let i = 1; i < rt.length; i++) ctx.lineTo(rt[i][0], rt[i][1]);
    ctx.stroke();
  });
  const d = o.dot || rt[rt.length - 2];
  S(ctx, () => { ctx.globalAlpha = .3; circ(ctx, d[0], d[1], 44 + sin01(t * 1.6) * 20, C.mint); });
  circ(ctx, d[0], d[1], 24, C.mint, C.white, 7);
  const e = rt[rt.length - 1];
  S(ctx, () => {
    ctx.translate(e[0], e[1]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-30, -44, -30, -68);
    ctx.arc(0, -68, 30, Math.PI, 0); ctx.quadraticCurveTo(30, -44, 0, 0); ctx.closePath();
    ctx.fillStyle = C.red; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke();
    circ(ctx, 0, -69, 12, C.cream);
  });
  if (o.eta) {
    rr(ctx, w - 420, 30, 390, 110, 20, C.cream, C.ink, 4);
    text(ctx, 'ARRIVING IN', w - 225, 66, { size: 22, weight: 800, color: 'rgba(32,32,39,.5)', letter: 3 });
    text(ctx, o.eta, w - 225, 108, { size: 44, weight: 800, color: o.bad ? C.red : C.mint });
  }
}
