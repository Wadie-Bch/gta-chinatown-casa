// Player shell: transport, seeking, chapters, rotate-view, fullscreen.
import { buildTimeline, cutAt } from './timeline.js';
import { renderAt, collectSfx } from './film.js';
import { AudioEngine, MODE } from './audio.js';

const LOGICAL_W = 1600, LOGICAL_H = 900;
const MAX_CANVAS_PX = 2.4e6;           // keeps integrated GPUs comfortable

const $ = id => document.getElementById(id);
const el = {
  app: $('app'), stage: $('stage'), canvas: $('film'), poster: $('poster'),
  posterSub: $('posterSub'), loadbar: $('loadbar').firstElementChild, bigPlay: $('bigPlay'),
  notice: $('notice'), controls: $('controls'), seek: $('seek'), ticks: $('ticks'),
  play: $('play'), replay: $('replay'), mute: $('mute'), time: $('time'),
  ccBtn: $('ccBtn'), musicBtn: $('musicBtn'), chapBtn: $('chapBtn'), chapters: $('chapters'),
  chapList: $('chapList'), rotBtn: $('rotBtn'), fsBtn: $('fsBtn'),
};
const ctx = el.canvas.getContext('2d', { alpha: false });

const state = {
  tl: null, engine: null, ready: false, rotated: false, captions: false,
  scrubbing: false, lastDrawn: -1, hideTimer: 0, dpr: 1,
};

const fmt = s => {
  s = Math.max(0, Math.floor(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// ---------------------------------------------------------------- layout
function layout() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const availW = state.rotated ? vh : vw;
  const availH = state.rotated ? vw : vh;
  let w = availW, h = w * LOGICAL_H / LOGICAL_W;
  if (h > availH) { h = availH; w = h * LOGICAL_W / LOGICAL_H; }
  w = Math.max(240, Math.floor(w)); h = Math.max(135, Math.floor(h));
  el.stage.style.width = w + 'px';
  el.stage.style.height = h + 'px';
  el.stage.style.transform = state.rotated
    ? 'translate(-50%,-50%) rotate(90deg)'
    : 'translate(-50%,-50%)';
  el.stage.classList.toggle('rot', state.rotated);
  // the control row is sized against the stage, not the window: a rotated
  // phone stage is wide even though the viewport is narrow
  el.stage.classList.toggle('narrow', w < 560);
  el.stage.classList.toggle('tiny', w < 400);

  // backing store, capped so a hidpi phone does not render 4x the pixels
  let scale = Math.min(window.devicePixelRatio || 1, 2);
  while (w * scale * h * scale > MAX_CANVAS_PX && scale > 0.5) scale -= 0.1;
  const cw = Math.max(640, Math.round(w * scale)), chh = Math.max(360, Math.round(h * scale));
  if (el.canvas.width !== cw || el.canvas.height !== chh) {
    el.canvas.width = cw; el.canvas.height = chh;
  }
  state.dpr = scale;
  state.lastDrawn = -1;
  draw(true);
}

function draw(force = false) {
  if (!state.tl) return;
  const t = state.engine ? state.engine.time : 0;
  if (!force && Math.abs(t - state.lastDrawn) < 0.0005) return;
  state.lastDrawn = t;
  ctx.setTransform(el.canvas.width / LOGICAL_W, 0, 0, el.canvas.height / LOGICAL_H, 0, 0);
  renderAt(ctx, state.tl, t, { captions: state.captions });
}

// ---------------------------------------------------------------- transport UI
function syncUI() {
  const e = state.engine;
  if (!e) return;
  const t = e.time, total = state.tl.total;
  if (!state.scrubbing) {
    const p = total ? (t / total) * 1000 : 0;
    el.seek.value = String(p);
    el.seek.style.setProperty('--p', (p / 10) + '%');
    el.seek.setAttribute('aria-valuetext', fmt(t) + ' of ' + fmt(total));
  }
  el.time.textContent = `${fmt(t)} / ${fmt(total)}`;
  el.play.setAttribute('aria-label', e.playing ? 'Pause' : 'Play');
  el.play.querySelector('.pp').setAttribute('d',
    e.playing ? 'M7 5h4v14H7zM13 5h4v14h-4z' : 'M8 5l12 7-12 7z');
  const cur = state.tl.chapters.reduce((a, c, i) => (t >= c.start ? i : a), 0);
  [...el.chapList.children].forEach((li, i) =>
    li.firstElementChild.classList.toggle('cur', i === cur));
}

function loop() {
  requestAnimationFrame(loop);
  const e = state.engine;
  if (!e) return;
  e.tick();
  // controls are never hidden while paused — there is nothing to get out of the way of
  if (!e.playing && el.stage.classList.contains('hidectl')) el.stage.classList.remove('hidectl');
  if (e.playing && e.time >= state.tl.total) {
    e.pause();
    e.pausedAt = state.tl.total;
    showControls(true);
  }
  draw();
  syncUI();
}

async function togglePlay() {
  const e = state.engine;
  if (!state.ready) return;
  if (e.playing) { e.pause(); showControls(true); }
  else {
    el.poster.classList.add('gone');
    await e.play(e.pausedAt >= state.tl.total - 0.05 ? 0 : null);
    scheduleHide();
  }
  syncUI();
}

function seekTo(t) {
  state.engine.seek(t);
  state.lastDrawn = -1;
  draw(true);
  syncUI();
}

function showControls(sticky = false) {
  el.stage.classList.remove('hidectl');
  clearTimeout(state.hideTimer);
  if (!sticky) scheduleHide();
}
function scheduleHide() {
  clearTimeout(state.hideTimer);
  state.hideTimer = setTimeout(() => {
    if (state.engine && state.engine.playing && el.chapters.hidden) {
      el.stage.classList.add('hidectl');
    }
  }, 2600);
}

// ---------------------------------------------------------------- boot
async function boot() {
  // draw something immediately so the stage is never blank
  ctx.setTransform(el.canvas.width / LOGICAL_W, 0, 0, el.canvas.height / LOGICAL_H, 0, 0);
  ctx.fillStyle = '#11151D';
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

  let manifest, cuts;
  try {
    const [m, c] = await Promise.all([
      fetch('audio/narration/manifest.json', { cache: 'no-cache' }).then(r => {
        if (!r.ok) throw new Error('manifest ' + r.status); return r.json();
      }),
      import('./cuts.js'),
    ]);
    manifest = m; cuts = c.CUTS;
  } catch (err) {
    fail('Could not load the episode data (' + err.message + '). Serve this folder over http:// rather than opening the file directly.');
    return;
  }
  manifest.chapters = manifest.chapters || (await fetch('episode/magic_button_episode.json').then(r => r.json())).chapters;

  try {
    await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]);
  } catch (e) { /* fonts optional — the stacks fall back to system faces */ }

  state.tl = buildTimeline(manifest, cuts);
  if (state.tl.warnings.length) console.warn('timeline warnings:', state.tl.warnings);

  buildChapterList();
  buildTicks();
  layout();

  const engine = new AudioEngine(manifest);
  state.engine = engine;
  await engine.init(state.tl.segs, state.tl.total, collectSfx(state.tl));
  engine.setChapters(state.tl.chapters);
  el.time.textContent = `0:00 / ${fmt(state.tl.total)}`;

  el.posterSub.textContent = 'Loading narration…';
  await engine.loadNarration(p => { el.loadbar.style.width = Math.round(p * 100) + '%'; });
  engine.setChapters(state.tl.chapters);

  state.ready = true;
  el.bigPlay.disabled = false;
  el.posterSub.textContent = engine.mode === MODE.AUDIO
    ? `${fmt(state.tl.total)} · recorded narration · ${state.tl.cuts.length} shots`
    : `${fmt(state.tl.total)} · ${engine.mode === MODE.SPEECH ? 'browser speech (approximate timing)' : 'silent playback'}`;
  if (engine.notice) showNotice(engine.notice);
  draw(true);
  requestAnimationFrame(loop);
}

function fail(msg) {
  el.posterSub.textContent = msg;
  el.bigPlay.disabled = true;
  showNotice(msg);
}
function showNotice(msg) {
  el.notice.textContent = msg;
  el.notice.hidden = false;
  setTimeout(() => { el.notice.hidden = true; }, 9000);
}

function buildChapterList() {
  el.chapList.innerHTML = '';
  state.tl.chapters.forEach((c, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<span class="n">${fmt(c.start)}</span><span>${c.label}</span>`;
    b.addEventListener('click', () => {
      seekTo(c.start);
      el.poster.classList.add('gone');
      closeChapters();
      if (!state.engine.playing) state.engine.play(c.start).then(syncUI);
    });
    li.appendChild(b);
    el.chapList.appendChild(li);
  });
}

function buildTicks() {
  el.ticks.innerHTML = '';
  for (const c of state.tl.chapters) {
    if (c.start <= 0) continue;
    const i = document.createElement('i');
    i.style.left = (c.start / state.tl.total * 100) + '%';
    el.ticks.appendChild(i);
  }
}

function closeChapters() {
  el.chapters.hidden = true;
  el.chapBtn.setAttribute('aria-expanded', 'false');
}

// ---------------------------------------------------------------- events
el.bigPlay.addEventListener('click', togglePlay);
el.play.addEventListener('click', togglePlay);
el.replay.addEventListener('click', async () => {
  el.poster.classList.add('gone');
  await state.engine.play(0);
  showControls();
  syncUI();
});
el.mute.addEventListener('click', () => {
  const m = !state.engine.muted;
  state.engine.setMuted(m);
  el.mute.classList.toggle('off', m);
  el.mute.setAttribute('aria-label', m ? 'Unmute' : 'Mute');
});
el.ccBtn.addEventListener('click', () => {
  state.captions = !state.captions;
  el.ccBtn.setAttribute('aria-pressed', String(state.captions));
  el.ccBtn.setAttribute('aria-label', state.captions ? 'Captions on' : 'Captions off');
  draw(true);
});
el.musicBtn.addEventListener('click', () => {
  const on = state.engine.musicOn;
  state.engine.setMusic(!on);
  el.musicBtn.setAttribute('aria-pressed', String(!on));
  el.musicBtn.setAttribute('aria-label', !on ? 'Music on' : 'Music off');
});
el.chapBtn.addEventListener('click', () => {
  const open = el.chapters.hidden;
  el.chapters.hidden = !open;
  el.chapBtn.setAttribute('aria-expanded', String(open));
  if (open) showControls(true);
});

el.seek.addEventListener('input', () => {
  state.scrubbing = true;
  const t = (Number(el.seek.value) / 1000) * state.tl.total;
  el.seek.style.setProperty('--p', (Number(el.seek.value) / 10) + '%');
  el.time.textContent = `${fmt(t)} / ${fmt(state.tl.total)}`;
  state.lastDrawn = -1;
  ctx.setTransform(el.canvas.width / LOGICAL_W, 0, 0, el.canvas.height / LOGICAL_H, 0, 0);
  renderAt(ctx, state.tl, t, { captions: state.captions });
});
el.seek.addEventListener('change', () => {
  const t = (Number(el.seek.value) / 1000) * state.tl.total;
  state.scrubbing = false;
  seekTo(t);
});

el.rotBtn.addEventListener('click', () => {
  state.rotated = !state.rotated;
  el.rotBtn.classList.toggle('on', state.rotated);
  el.rotBtn.setAttribute('aria-label', state.rotated ? 'Restore view' : 'Rotate view');
  layout();
  showControls(true);
});

const fsSupported = !!(el.app.requestFullscreen || el.app.webkitRequestFullscreen);
el.fsBtn.addEventListener('click', async () => {
  const active = document.fullscreenElement || document.webkitFullscreenElement;
  try {
    if (active) {
      await (document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen());
    } else if (fsSupported) {
      await (el.app.requestFullscreen ? el.app.requestFullscreen({ navigationUI: 'hide' })
                                      : el.app.webkitRequestFullscreen());
    } else {
      throw new Error('unsupported');
    }
  } catch (e) {
    // inline fallback — fills the viewport without the Fullscreen API (iPhone)
    el.app.classList.toggle('inline-fs');
    el.fsBtn.classList.toggle('on', el.app.classList.contains('inline-fs'));
  }
  setTimeout(layout, 60);
});
for (const ev of ['fullscreenchange', 'webkitfullscreenchange']) {
  document.addEventListener(ev, () => {
    el.fsBtn.classList.toggle('on', !!(document.fullscreenElement || document.webkitFullscreenElement));
    setTimeout(layout, 60);
  });
}

window.addEventListener('resize', layout);
window.addEventListener('orientationchange', () => setTimeout(layout, 120));

el.stage.addEventListener('pointermove', () => showControls());
el.stage.addEventListener('pointerdown', e => {
  if (!el.chapters.hidden && !el.chapters.contains(e.target) && e.target !== el.chapBtn) closeChapters();
  showControls();
});
el.canvas.addEventListener('click', () => { if (state.ready) togglePlay(); });

document.addEventListener('keydown', e => {
  if (!state.ready) return;
  const k = e.key.toLowerCase();
  if (e.target.tagName === 'INPUT' && k !== ' ') return;
  if (k === ' ' || k === 'k') { e.preventDefault(); togglePlay(); }
  else if (k === 'arrowright') { e.preventDefault(); seekTo(state.engine.time + 5); }
  else if (k === 'arrowleft') { e.preventDefault(); seekTo(Math.max(0, state.engine.time - 5)); }
  else if (k === 'm') el.mute.click();
  else if (k === 'f') el.fsBtn.click();
  else if (k === 'c') el.ccBtn.click();
  else if (k === 'b') el.musicBtn.click();
  else if (k === 'r') el.replay.click();
  else if (k === 'escape') closeChapters();
  showControls();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.engine && state.engine.playing) { state.engine.pause(); syncUI(); }
});

// expose a tiny hook so the automated checks can drive the film deterministically
window.__film = {
  seek: t => seekTo(t),
  renderAt: t => {
    ctx.setTransform(el.canvas.width / LOGICAL_W, 0, 0, el.canvas.height / LOGICAL_H, 0, 0);
    return renderAt(ctx, state.tl, t, { captions: state.captions });
  },
  get state() { return state; },
  get tl() { return state.tl; },
};

boot();
