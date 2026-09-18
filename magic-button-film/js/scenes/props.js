// SET I + opening gags: the settings knob that detaches, and the "beautiful
// game" that turns out to be a thin cardboard panel seen from the side.
import { W, H, lerp, span, ease, clamp, rng, text, poly, circle, line, fillRR, strokeRR,
         contactShadow, measure, clipRR, DISPLAY, UI, MONO } from '../g2.js';
import { INK, INK_2, INK_3, PAPER, PAPER_2, PAPER_3, LIME, BLUE, CORAL, TEAL, YELLOW, WHITE, shade, alpha, mix } from '../palette.js';

export function draw(ctx, t, cut) {
  switch (cut.view) {
    case 'cardboard': return drawCardboard(ctx, t, cut);
    case 'thumb':     return drawThumb(ctx, t, cut);
    case 'endcard':   return drawEndCard(ctx, t, cut);
    case 'onebutton': return drawOneButton(ctx, t, cut);
    case 'card':      return drawCard(ctx, t, cut);
    case 'stamp':     return drawStamp(ctx, t, cut);
    case 'notest':    return drawNoTest(ctx, t, cut);
    case 'lanes':     return drawLanes(ctx, t, cut);
    default:          return drawKnob(ctx, t, cut);
  }
}

/** A settings knob on a panel, which detaches and rolls out of frame. */
function drawKnob(ctx, t, cut) {
  ctx.fillStyle = INK_2; ctx.fillRect(0, 0, W, H);
  // a slab of settings panel, cropped hard
  ctx.fillStyle = INK_3; ctx.fillRect(0, H * 0.22, W, H * 0.62);
  ctx.fillStyle = alpha(INK, 0.6); ctx.fillRect(0, H * 0.22, W, 5);
  ctx.fillStyle = alpha(INK, 0.6); ctx.fillRect(0, H * 0.84 - 5, W, 5);

  // sibling controls (a slider and a toggle) so the knob reads as part of a UI
  fillRR(ctx, 150, H / 2 - 14, 300, 28, 14, alpha(PAPER, 0.14));
  circle(ctx, 150 + 210, H / 2, 26, PAPER_2);
  fillRR(ctx, W - 430, H / 2 - 30, 116, 60, 30, alpha(LIME, 0.9));
  circle(ctx, W - 430 + 86, H / 2, 22, INK);

  const fall = span(t, cut.detachAt ?? 0.55, cut.dur);
  const cx0 = W / 2, cy0 = H / 2;
  // mounting hole stays behind
  circle(ctx, cx0, cy0, 62, INK, alpha(INK, 0.9), 4);
  circle(ctx, cx0, cy0, 10, alpha(PAPER, 0.25));

  // knob body: detaches, drops, rolls right, leaves frame
  const drop = ease.in(clamp(fall * 2.1, 0, 1)) * 250;
  const rollX = fall > 0.42 ? ease.out((fall - 0.42) / 0.58) * (W * 0.85) : 0;
  const x = cx0 + rollX;
  const y = fall > 0 ? Math.min(cy0 + drop, H - 150) : cy0;
  const rot = rollX / 110;
  if (fall > 0) contactShadow(ctx, x, H - 96, 110, 20, 0.45 * clamp(fall * 3, 0, 1));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  circle(ctx, 0, 0, 110, PAPER_2, INK, 5);
  circle(ctx, 0, 0, 84, PAPER_3);
  ctx.fillStyle = INK;
  ctx.fillRect(-9, -104, 18, 54);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    line(ctx, Math.cos(a) * 96, Math.sin(a) * 96, Math.cos(a) * 108, Math.sin(a) * 108, alpha(INK, 0.5), 5);
  }
  ctx.restore();
  if (cut.label && fall > 0.5) {
    text(ctx, cut.label, W / 2, H - 168, { size: 44, fill: CORAL, align: 'center', track: 6,
      alpha: ease.out(span(t, (cut.detachAt ?? 0.55) + 0.5, (cut.detachAt ?? 0.55) + 0.9)) });
  }
}

/** The hero screenshot is a prop: the camera swings round and it is 4mm thick. */
function drawCardboard(ctx, t, cut) {
  ctx.fillStyle = mix(PAPER_3, INK, 0.7); ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = mix(PAPER_3, INK, 0.78); ctx.fillRect(0, H * 0.74, W, H * 0.26);

  // swing from face-on to edge-on
  const k = ease.inOut(span(t, cut.swingAt ?? 0.35, (cut.swingAt ?? 0.35) + 1.5));
  const ang = lerp(0, 1.30, k);                 // radians of yaw
  const cx = W / 2, cy = H / 2 - 10;
  const halfW = cut.halfW ?? 680, halfH = cut.halfH ?? 385;
  const faceW = Math.cos(ang) * halfW;
  const thick = Math.sin(ang) * 16;
  const skew = Math.sin(ang) * 46;

  contactShadow(ctx, cx, cy + halfH + 26, Math.max(60, faceW * 1.1), 26, 0.4);

  // side edge (the reveal): thin brown board
  if (thick > 0.5) {
    poly(ctx, [
      [cx + faceW, cy - halfH + skew * 0.25], [cx + faceW + thick * 6, cy - halfH + skew * 0.6],
      [cx + faceW + thick * 6, cy + halfH + skew * 0.6], [cx + faceW, cy + halfH + skew * 0.25],
    ], mix(PAPER_3, '#A8804C', 0.75), alpha(INK, 0.5), 3);
  }
  // front face with the "beautiful game" still on it
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - faceW, cy - halfH - skew * 0.25);
  ctx.lineTo(cx + faceW, cy - halfH + skew * 0.25);
  ctx.lineTo(cx + faceW, cy + halfH + skew * 0.25);
  ctx.lineTo(cx - faceW, cy + halfH - skew * 0.25);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = PAPER; ctx.fillRect(cx - faceW - 10, cy - halfH - 60, faceW * 2 + 20, halfH * 2 + 120);
  // miniature of the hero shot, squashed with the panel
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(Math.max(0.001, Math.cos(ang)), 1);
  heroStill(ctx, halfW, halfH);
  ctx.restore();
  ctx.restore();
  // outline last
  poly(ctx, [
    [cx - faceW, cy - halfH - skew * 0.25], [cx + faceW, cy - halfH + skew * 0.25],
    [cx + faceW, cy + halfH + skew * 0.25], [cx - faceW, cy + halfH - skew * 0.25],
  ], null, alpha(INK, 0.65), 4);

  // a prop stand behind it, visible once turned
  if (k > 0.55) {
    ctx.save(); ctx.globalAlpha = (k - 0.55) / 0.45;
    poly(ctx, [[cx + 30, cy + halfH], [cx + 150, cy + halfH + 40], [cx + 160, cy + halfH + 46], [cx + 36, cy + halfH + 8]], INK_3);
    ctx.restore();
  }
  if (cut.label) {
    const la = ease.out(span(t, (cut.swingAt ?? 0.35) + 1.0, (cut.swingAt ?? 0.35) + 1.5));
    if (la > 0) {
      const lw2 = measure(ctx, cut.label, 46, DISPLAY, 700) + 60;
      ctx.save(); ctx.globalAlpha = la;
      fillRR(ctx, W / 2 - lw2 / 2, H - 196, lw2, 60, 8, alpha(INK, 0.8));
      text(ctx, cut.label, W / 2, H - 154, { size: 46, fill: LIME, align: 'center', track: 6 });
      ctx.restore();
    }
  }
}

/** The pretty still that sells the video — drawn, not photographed. */
function heroStill(ctx, hw, hh) {
  ctx.save();
  ctx.fillStyle = mix(BLUE, INK, 0.55); ctx.fillRect(-hw, -hh, hw * 2, hh * 2);
  ctx.fillStyle = mix(PAPER_3, INK, 0.2); ctx.fillRect(-hw, hh * 0.28, hw * 2, hh * 0.72);
  const r = rng(515);
  for (let i = 0; i < 9; i++) {
    const bw = 60 + r() * 120, bh = 90 + r() * 230;
    ctx.fillStyle = mix(INK_2, BLUE, r() * 0.35);
    ctx.fillRect(-hw + 40 + i * (hw * 2 - 80) / 9, hh * 0.28 - bh, bw, bh);
  }
  // courier + parcel silhouettes
  ctx.fillStyle = TEAL; ctx.fillRect(-60, hh * 0.28 - 120, 46, 120);
  ctx.fillStyle = PAPER_2; ctx.fillRect(-58, hh * 0.28 - 150, 42, 34);
  ctx.fillStyle = YELLOW; ctx.fillRect(120, hh * 0.28 - 56, 48, 48);
  ctx.fillStyle = WHITE; ctx.fillRect(250, hh * 0.28 - 92, 150, 92);
  ctx.restore();
}

/** The thumbnail punchline, held after a beat of silence. */
function drawThumb(ctx, t, cut) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  const k = ease.out(span(t, cut.showAt ?? 0.9, (cut.showAt ?? 0.9) + 0.3));
  if (k <= 0) return;
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(lerp(1.06, 1, k), lerp(1.06, 1, k));
  ctx.globalAlpha = k;
  const tw = 720, th = 405;
  fillRR(ctx, -tw / 2, -th / 2, tw, th, 16, INK_2);
  ctx.save();
  clipRR(ctx, -tw / 2, -th / 2, tw, th, 16, () => {
    ctx.save(); ctx.translate(0, 0); ctx.scale(tw / 1040, th / 600); heroStill(ctx, 520, 300); ctx.restore();
  });
  ctx.restore();
  // the loud overlay a thumbnail always has
  const arrow = ease.back(span(t, (cut.showAt ?? 0.9) + 0.18, (cut.showAt ?? 0.9) + 0.55));
  ctx.save();
  ctx.globalAlpha = arrow;
  ctx.translate(tw * 0.18, -th * 0.06);
  ctx.rotate(-0.12);
  poly(ctx, [[-40, -70], [60, -70], [60, -120], [150, 0], [60, 120], [60, 70], [-40, 70]], CORAL, INK, 6);
  ctx.restore();
  text(ctx, cut.label ?? 'ONE CLICK', -tw / 2 + 34, th / 2 - 36, {
    size: 76, fill: LIME, stroke: INK, lw: 12, track: 2, alpha: arrow,
  });
  ctx.restore();
}

function drawEndCard(ctx, t, cut) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  const k = ease.out(span(t, 0.1, 0.8));
  const lines = cut.lines ?? [];
  let y = H / 2 - (lines.length - 1) * 42;
  for (let i = 0; i < lines.length; i++) {
    const kk = ease.out(span(t, 0.2 + i * 0.28, 0.9 + i * 0.28));
    text(ctx, lines[i], W / 2, y, {
      size: i === 0 ? 74 : 38, fill: i === 0 ? PAPER : alpha(PAPER, 0.6),
      align: 'center', track: i === 0 ? 3 : 3, alpha: kk, font: i === 0 ? DISPLAY : UI,
      weight: i === 0 ? 700 : 600, maxWidth: W - 200,
    });
    y += i === 0 ? 100 : 58;
  }
  const bar = ease.out(span(t, 0.05, 0.7));
  ctx.fillStyle = LIME;
  ctx.fillRect(W / 2 - 220 * bar, H / 2 - 120, 440 * bar, 6);
}

// ---------------------------------------------------------------------------
// Additional physical compositions used later in the episode.
// ---------------------------------------------------------------------------

/** A single big arcade button wired to a tiny screen: a one-button control scheme. */
export function drawOneButton(ctx, t, cut) {
  ctx.fillStyle = mix(PAPER_3, INK, 0.58); ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = mix(PAPER_3, INK, 0.68); ctx.fillRect(0, H * 0.72, W, H * 0.28);

  // the little screen on the left
  const sx = W * 0.30, sy = H * 0.44;
  fillRR(ctx, sx - 250, sy - 160, 500, 320, 16, INK_3);
  fillRR(ctx, sx - 228, sy - 138, 456, 276, 8, INK);
  const beat = (t * 1.25) % 1;
  const pressed = beat > 0.72;
  const dead = !!cut.dead;
  ctx.save();
  clipRR(ctx, sx - 228, sy - 138, 456, 276, 8, () => {
    ctx.fillStyle = mix(BLUE, INK, 0.72); ctx.fillRect(sx - 228, sy - 138, 456, 276);
    ctx.fillStyle = PAPER_3; ctx.fillRect(sx - 228, sy + 70, 456, 68);
    const jump = (!dead && pressed) ? Math.sin((beat - 0.72) / 0.28 * Math.PI) * 90 : 0;
    ctx.fillStyle = TEAL; ctx.fillRect(sx - 40, sy + 70 - 56 - jump, 28, 56);
    ctx.fillStyle = PAPER_2; ctx.fillRect(sx - 38, sy + 70 - 84 - jump, 24, 26);
    if (dead && pressed) {
      ctx.fillStyle = alpha(CORAL, 0.3); ctx.fillRect(sx - 228, sy - 138, 456, 276);
    }
  });
  ctx.restore();

  // the button itself on the right, on its own panel
  const bx = W * 0.72, by = H * 0.48;
  contactShadow(ctx, bx, by + 130, 150, 24, 0.4);
  circle(ctx, bx, by, 150, INK_3);
  const down = pressed ? 16 : 0;
  circle(ctx, bx, by + down - 16, 126, dead ? mix(CORAL, INK, 0.25) : CORAL);
  circle(ctx, bx, by + down - 16, 126, null, alpha(INK, 0.45), 5);
  circle(ctx, bx - 28, by + down - 48, 34, alpha(WHITE, 0.22));
  // cable between them
  ctx.beginPath();
  ctx.moveTo(sx + 250, sy + 120);
  ctx.quadraticCurveTo(W * 0.52, H * 0.86, bx - 140, by + 60);
  ctx.strokeStyle = INK_3; ctx.lineWidth = 12; ctx.stroke();

  if (cut.label) {
    text(ctx, cut.label, W / 2, H - 150, { size: 44, fill: dead ? CORAL : PAPER, align: 'center', track: 6,
      alpha: ease.out(span(t, 0.4, 0.9)) });
  }
}

/** The entire design document, on one index card. */
export function drawCard(ctx, t, cut) {
  ctx.fillStyle = mix(PAPER_3, INK, 0.60); ctx.fillRect(0, 0, W, H);
  const k = ease.out(span(t, 0.05, 0.4));
  ctx.save();
  ctx.translate(W / 2, H / 2 + (1 - k) * 40);
  ctx.rotate(lerp(-0.07, -0.025, k));
  ctx.globalAlpha = k;
  contactShadow(ctx, 0, 250, 380, 30, 0.42);
  fillRR(ctx, -460, -250, 920, 500, 10, PAPER);
  ctx.fillStyle = alpha(CORAL, 0.55); ctx.fillRect(-460, -168, 920, 3);
  const rows = cut.rows ?? [];
  for (let i = 0; i < rows.length; i++) {
    const kk = ease.out(span(t, 0.35 + i * 0.45, 0.75 + i * 0.45));
    if (kk <= 0) continue;
    ctx.save(); ctx.globalAlpha = kk;
    ctx.fillStyle = INK;
    circle(ctx, -378, -70 + i * 110 - 10, 9, INK);
    text(ctx, rows[i], -340, -70 + i * 110, { size: 52, fill: INK, font: UI, weight: 600 });
    ctx.restore();
  }
  ctx.restore();
}

/** A rubber stamp coming down on the frame. Used for disclosure labels. */
export function drawStamp(ctx, t, cut) {
  if (cut.over === 'ink') { ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H); }
  else { ctx.fillStyle = mix(PAPER_3, INK, 0.55); ctx.fillRect(0, 0, W, H); }
  // a strip of film frames as the thing being stamped
  const fy = H / 2;
  ctx.fillStyle = INK_2; ctx.fillRect(0, fy - 190, W, 380);
  ctx.fillStyle = alpha(PAPER, 0.10);
  for (let x = 20; x < W; x += 56) { ctx.fillRect(x, fy - 176, 30, 26); ctx.fillRect(x, fy + 150, 30, 26); }
  for (let i = 0; i < 4; i++) {
    const fx = 90 + i * 360;
    fillRR(ctx, fx, fy - 130, 320, 260, 6, INK_3);
    ctx.save();
    clipRR(ctx, fx, fy - 130, 320, 260, 6, () => {
      ctx.fillStyle = mix(BLUE, INK, 0.62); ctx.fillRect(fx, fy - 130, 320, 260);
      ctx.fillStyle = PAPER_3; ctx.fillRect(fx, fy + 60, 320, 70);
      ctx.fillStyle = TEAL; ctx.fillRect(fx + 100 + i * 18, fy + 16, 22, 44);
      ctx.fillStyle = YELLOW; ctx.fillRect(fx + 210, fy + 34, 22, 22);
    });
    ctx.restore();
  }
  const at = cut.stampAt ?? 0.5;
  const k = ease.out(span(t, at, at + 0.22));
  if (k > 0) {
    ctx.save();
    ctx.translate(W / 2, fy);
    ctx.rotate(lerp(-0.22, -0.075, k));
    ctx.scale(lerp(1.7, 1, k), lerp(1.7, 1, k));
    ctx.globalAlpha = Math.min(1, k * 1.5);
    const label = cut.stamp ?? 'SIMULATED';
    const col = cut.stampCol ?? CORAL;
    const w = measure(ctx, label, 92, DISPLAY, 700) + 120;
    ctx.lineWidth = 9; ctx.strokeStyle = col;
    strokeRR(ctx, -w / 2, -86, w, 172, 12, col, 9);
    strokeRR(ctx, -w / 2 + 16, -70, w - 32, 140, 6, alpha(col, 0.55), 4);
    text(ctx, label, 0, 10, { size: 92, fill: col, align: 'center', track: 5 });
    if (cut.stampSub) {
      const sw = measure(ctx, cut.stampSub, 26, UI, 700) + 48;
      fillRR(ctx, -sw / 2, 100, sw, 46, 7, alpha(INK, 0.86));
      text(ctx, cut.stampSub, 0, 132, { size: 26, fill: col, align: 'center', font: UI, weight: 700, track: 3, maxWidth: sw - 20 });
    }
    ctx.restore();
  }
}

/** Three identical assistant cards — nothing has been run on any of them. */
export function drawNoTest(ctx, t, cut) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 3; i++) {
    const k = ease.out(span(t, 0.1 + i * 0.22, 0.5 + i * 0.22));
    if (k <= 0) continue;
    const x = W * (0.22 + i * 0.28), y = H * 0.50;
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 1.4);
    ctx.translate(x, y + (1 - k) * 30);
    fillRR(ctx, -170, -210, 340, 420, 18, '#2A3242');
    strokeRR(ctx, -170, -210, 340, 420, 18, alpha(PAPER, 0.32), 3);
    // a deliberately blank avatar: no brand, no model name, no plan badge
    circle(ctx, 0, -110, 56, alpha(PAPER, 0.30));
    fillRR(ctx, -104, -22, 208, 16, 8, alpha(PAPER, 0.28));
    fillRR(ctx, -74, 16, 148, 16, 8, alpha(PAPER, 0.20));
    const sk = ease.out(span(t, 0.9 + i * 0.22, 1.25 + i * 0.22));
    if (sk > 0) {
      ctx.save();
      ctx.globalAlpha = sk; ctx.rotate(-0.12);
      strokeRR(ctx, -140, 66, 280, 92, 10, CORAL, 7);
      text(ctx, 'NOT RUN', 0, 130, { size: 50, fill: CORAL, align: 'center', track: 3 });
      ctx.restore();
    }
    ctx.restore();
  }
  if (cut.label) text(ctx, cut.label, W / 2, H - 156, { size: 40, fill: alpha(PAPER, 0.6), align: 'center', font: UI, weight: 600, track: 3, alpha: ease.out(span(t, 1.4, 1.9)) });
}

/** Three identical starting lanes — the shape of a fair comparison. */
export function drawLanes(ctx, t, cut) {
  ctx.fillStyle = mix(PAPER_3, INK, 0.64); ctx.fillRect(0, 0, W, H);
  const laneH = 200, top = H * 0.24;
  for (let i = 0; i < 3; i++) {
    const y = top + i * laneH;
    ctx.fillStyle = i % 2 ? mix(PAPER_3, INK, 0.50) : mix(PAPER_3, INK, 0.58);
    ctx.fillRect(0, y, W, laneH - 10);
    ctx.fillStyle = alpha(INK, 0.35); ctx.fillRect(0, y + laneH - 12, W, 3);
    // lane number and start line
    text(ctx, String(i + 1), W * 0.09, y + laneH / 2 + 22, { size: 74, fill: alpha(INK, 0.30), align: 'center' });
    ctx.fillStyle = PAPER_2; ctx.fillRect(W * 0.20, y + 10, 8, laneH - 30);
    // finish line, chequered
    for (let c = 0; c < 8; c++) {
      ctx.fillStyle = c % 2 ? PAPER_2 : INK_2;
      ctx.fillRect(W * 0.86, y + 10 + c * ((laneH - 30) / 8), 26, (laneH - 30) / 8);
    }
    // the identical starting project
    if (cut.empty) {
      ctx.save();
      ctx.setLineDash([14, 11]);
      strokeRR(ctx, W * 0.24, y + laneH / 2 - 78, 150, 130, 10, alpha(INK, 0.28), 4);
      ctx.setLineDash([]);
      ctx.restore();
      continue;
    }
    const k = ease.out(span(t, 0.1 + i * 0.16, 0.45 + i * 0.16));
    if (k <= 0) continue;
    const push = cut.push && i === 1 ? ease.inOut(span(t, (cut.pushAt ?? 1.0), (cut.pushAt ?? 1.0) + 1.4)) : 0;
    const bx = W * 0.24 + push * (W * 0.60);
    const by = y + laneH / 2 - 10;
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 1.5);
    contactShadow(ctx, bx + 46, by + 58, 66, 12, 0.35);
    const S = 1.45;
    poly(ctx, [[bx, by - 26 * S], [bx + 46 * S, by - 50 * S], [bx + 92 * S, by - 26 * S], [bx + 46 * S, by - 2 * S]], mix(PAPER_2, '#C09A62', 0.5), alpha(INK, 0.5), 3);
    poly(ctx, [[bx, by - 26 * S], [bx + 46 * S, by - 2 * S], [bx + 46 * S, by + 54 * S], [bx, by + 30 * S]], mix(PAPER_2, '#A8804C', 0.6), alpha(INK, 0.5), 3);
    poly(ctx, [[bx + 92 * S, by - 26 * S], [bx + 46 * S, by - 2 * S], [bx + 46 * S, by + 54 * S], [bx + 92 * S, by + 30 * S]], mix(PAPER_2, '#8C6838', 0.65), alpha(INK, 0.5), 3);
    ctx.restore();
    // a hand shoving lane 2 over the line
    if (push > 0.05) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.translate(bx - 40, by + 14);
      fillRR(ctx, -150, -34, 170, 68, 30, mix(PAPER_2, '#C98F6A', 0.5));
      circle(ctx, 16, 0, 36, mix(PAPER_2, '#C98F6A', 0.5));
      ctx.restore();
    }
    // the disclosed toolbox for each lane
    if (cut.tools) {
      const tk = ease.out(span(t, 0.2 + i * 0.2, 0.6 + i * 0.2));
      if (tk > 0) {
        ctx.save(); ctx.globalAlpha = tk;
        const tx = W * 0.50;
        fillRR(ctx, tx, by - 44, 250, 92, 10, INK_2);
        text(ctx, ['tools: A B C', 'tools: A B C', 'tools: A B C'][i], tx + 125, by + 12, {
          size: 26, fill: LIME, align: 'center', font: MONO, weight: 600 });
        ctx.restore();
      }
    }
  }
  if (cut.label) text(ctx, cut.label, W / 2, H - 150, { size: 44, fill: PAPER, align: 'center', track: 6, alpha: ease.out(span(t, 0.7, 1.2)) });
}
