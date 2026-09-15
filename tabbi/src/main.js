// Preview player. It behaves like a film: play, pause, replay, sound. Nothing else.
import { W, H, C } from './core/palette.js';
import { renderEpisode } from './core/stage.js';
import { TIMELINE, DURATION, FPS } from './episode/episode.js';
import { buildSoundtrack, SR } from './audio/mix.js';
import { tabbiMark } from './chars/tabbi.js';

const params = new URLSearchParams(location.search);
const RENDER_MODE = params.has('render');
const cv = document.getElementById('stage');
cv.width = W; cv.height = H;
const ctx = cv.getContext('2d', { alpha: false });
ctx.textBaseline = 'middle';

let t = 0, playing = false, clockBase = 0, audioBase = 0;
let ac = null, buf = null, src = null, gainNode = null, muted = false, volume = 0.9;
let soundtrack = null;

function draw(time) { renderEpisode(ctx, TIMELINE, Math.max(0, Math.min(DURATION - 1e-4, time))); }

// ---------------------------------------------------------------- audio ----
function ensureCtx() {
  if (ac) return ac;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ac = new AC({ sampleRate: SR });
  gainNode = ac.createGain(); gainNode.gain.value = muted ? 0 : volume; gainNode.connect(ac.destination);
  return ac;
}
function makeBuffer() {
  if (buf || !ac || !soundtrack) return;
  buf = ac.createBuffer(2, soundtrack.L.length, SR);
  buf.copyToChannel(soundtrack.L, 0); buf.copyToChannel(soundtrack.R, 1);
}
function startAudio(at) {
  if (!ac || !buf) return;
  stopAudio();
  src = ac.createBufferSource(); src.buffer = buf; src.connect(gainNode);
  src.start(0, Math.max(0, Math.min(at, DURATION - .02)));
  audioBase = ac.currentTime - at;
}
function stopAudio() { if (src) { try { src.stop(); } catch (e) { } src.disconnect(); src = null; } }

// ------------------------------------------------------------ transport ----
function play() {
  if (t >= DURATION - .02) t = 0;
  playing = true;
  const a = ensureCtx();
  if (a) { if (a.state === 'suspended') a.resume(); makeBuffer(); startAudio(t); }
  clockBase = performance.now() / 1000 - t;
  ui();
}
function pause() { playing = false; stopAudio(); ui(); }
function replay() { t = 0; play(); }
function toggle() { playing ? pause() : play(); }

function frame() {
  requestAnimationFrame(frame);
  if (playing) {
    const wall = performance.now() / 1000 - clockBase;
    // the audio clock is the master when it is running: picture follows sound
    t = (ac && src && ac.state === 'running') ? (ac.currentTime - audioBase) : wall;
    if (t >= DURATION) { t = DURATION; playing = false; stopAudio(); ui(); }
  }
  draw(t);
  hud();
}

// ------------------------------------------------------------------ chrome --
const shell = document.getElementById('shell');
const startBtn = document.getElementById('startBtn');
const startWrap = document.getElementById('start');
const bar = document.getElementById('bar');
const soundBtn = document.getElementById('sound');
const replayWrap = document.getElementById('endcard');
let idleAt = 0;
function ui() {
  startWrap.hidden = playing || t > 0.01;
  replayWrap.hidden = !(t >= DURATION - .05);
  shell.classList.toggle('playing', playing);
  soundBtn.textContent = muted ? '🔇' : '🔊';
  soundBtn.setAttribute('aria-label', muted ? 'Sound off' : 'Sound on');
}
function hud() {
  bar.style.transform = `scaleX(${t / DURATION})`;
  const showChrome = !playing || (performance.now() / 1000 - idleAt) < 2.2;
  shell.classList.toggle('chrome', showChrome);
}
function nudge() { idleAt = performance.now() / 1000; }

if (!RENDER_MODE) {
  startBtn.addEventListener('click', () => { t = 0; play(); });
  document.getElementById('replayBtn').addEventListener('click', replay);
  soundBtn.addEventListener('click', e => {
    e.stopPropagation(); muted = !muted;
    if (gainNode) gainNode.gain.value = muted ? 0 : volume;
    if (!muted && ac && ac.state === 'suspended') ac.resume();
    ui(); nudge();
  });
  cv.addEventListener('click', () => { if (t > 0.01 && t < DURATION - .05) toggle(); nudge(); });
  addEventListener('keydown', e => {
    if (e.code === 'Space') { e.preventDefault(); t <= .01 ? play() : toggle(); }
    if (e.key === 'r' || e.key === 'R') replay();
    if (e.key === 'm' || e.key === 'M') soundBtn.click();
    if (e.key === 'f' || e.key === 'F') { const el = document.documentElement; document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen?.(); }
    nudge();
  });
  addEventListener('mousemove', nudge);
  addEventListener('touchstart', nudge, { passive: true });
}

// ------------------------------------------------------------------ boot ----
draw(0);
requestAnimationFrame(frame);

async function loadSoundtrack() {
  // Off the main thread where possible, so the title card never freezes.
  try {
    const w = new Worker(new URL('./audio/worker.js', import.meta.url), { type: 'module' });
    return await new Promise((res, rej) => {
      w.onmessage = e => { w.terminate(); e.data.ok ? res({ L: e.data.L, R: e.data.R, n: e.data.n }) : rej(new Error(e.data.error)); };
      w.onerror = err => { w.terminate(); rej(err); };
      w.postMessage('go');
    });
  } catch (e) {
    return await buildSoundtrack({ yield: () => new Promise(r => setTimeout(r, 0)) });
  }
}

(async () => {
  try { soundtrack = await loadSoundtrack(); }
  catch (e) { soundtrack = await buildSoundtrack({ yield: () => new Promise(r => setTimeout(r, 0)) }); }
  startBtn.textContent = '\u25B6  PLAY WITH SOUND'; startBtn.disabled = false;
  const a = ensureCtx(); if (a) makeBuffer();
  window.__tabbi.audioReady = true;
  if (!RENDER_MODE) {
    // Start the picture automatically where the browser allows it. If sound is
    // blocked, the episode waits behind a visible "Play with sound" control.
    const ctxState = (ac && !params.has('gate')) ? ac.state : 'suspended';
    if (ctxState === 'running') { play(); startWrap.hidden = true; }
    else { if (ac) ac.suspend(); startWrap.hidden = false; }
    ui();
  }
})();

window.__tabbiState = () => ({
  t, playing, muted, duration: DURATION,
  audio: ac ? ac.state : 'none', gain: gainNode ? gainNode.gain.value : null,
  endcard: !document.getElementById('endcard').hidden,
});

window.__tabbi = {
  ready: true, duration: DURATION, fps: FPS,
  seekPlay(time) { t = Math.max(0, Math.min(DURATION - 1e-4, time)); play(); },
  seek(time) { t = Math.max(0, Math.min(DURATION - 1e-4, time)); draw(t); },
  renderFrame(n) { t = Math.min(DURATION - 1e-4, n / FPS); draw(t); },
  shotAt(time) { return renderEpisode(ctx, TIMELINE, time).id; },
  shots: TIMELINE.shots.map(s => ({ id: s.id, t0: s.t0, dur: s.dur })),
  play, pause, replay,
};
if (RENDER_MODE) { document.body.classList.add('render'); playing = false; }
