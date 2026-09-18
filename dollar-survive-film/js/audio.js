// The master clock.
//
// During prerecorded playback the AudioContext clock is the master: every
// narration segment is scheduled at an absolute context time, so the picture is
// locked to the voice and seeking is sample-accurate. If the recorded narration
// cannot be used we fall back to SpeechSynthesis, which is explicitly
// approximate, and then to silent playback.
import { playSfx, playMusic, musicEvents } from './sfx.js';

export const MODE = { AUDIO: 'audio', SPEECH: 'speech', SILENT: 'silent' };

export class AudioEngine {
  constructor(manifest, base = 'audio/narration/') {
    this.manifest = manifest;
    this.base = base;
    this.mode = MODE.SILENT;
    this.ctx = null;
    this.buffers = new Map();
    this.sources = [];
    this.playing = false;
    this.origin = 0;          // timeline time at ctxT0
    this.ctxT0 = 0;
    this.pausedAt = 0;
    this.total = 0;
    this.segs = [];
    this.events = [];         // sfx, sorted by t
    this.music = [];
    this.evCursor = 0;
    this.muCursor = 0;
    this.scheduledTo = 0;
    this.muted = false;
    this.musicOn = true;
    this.notice = '';
    this._perf0 = 0;
    this._utter = null;
    this._speakIdx = -1;
  }

  async init(segs, total, events) {
    this.segs = segs; this.total = total;
    this.events = [...events].sort((a, b) => a.t - b.t);
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { this.mode = MODE.SILENT; this.notice = 'No Web Audio in this browser — playing silently.'; return this.mode; }
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.narr = this.ctx.createGain();
      this.sfx = this.ctx.createGain();
      this.mus = this.ctx.createGain();
      this.narr.gain.value = 1.0;
      this.sfx.gain.value = 0.85;
      this.mus.gain.value = 0.34;                 // music stays under the voice
      this.narr.connect(this.master); this.sfx.connect(this.master); this.mus.connect(this.master);
      this.master.connect(this.ctx.destination);
    } catch (e) {
      this.mode = MODE.SILENT; this.notice = 'Audio could not start — playing silently.'; return this.mode;
    }
    return this.mode;
  }

  /** Fetch + decode the narration. Returns true if the recorded voice is usable. */
  async loadNarration(onProgress) {
    if (!this.ctx) return false;
    let ok = 0;
    for (let i = 0; i < this.manifest.segments.length; i++) {
      const s = this.manifest.segments[i];
      try {
        const r = await fetch(this.base + s.file, { cache: 'force-cache' });
        if (!r.ok) throw new Error(r.status);
        const ab = await r.arrayBuffer();
        const buf = await this.ctx.decodeAudioData(ab);
        this.buffers.set(s.id, buf);
        ok++;
      } catch (e) {
        console.warn('narration segment failed:', s.id, e.message);
      }
      onProgress && onProgress((i + 1) / this.manifest.segments.length);
    }
    if (ok === this.manifest.segments.length) {
      this.mode = MODE.AUDIO;
      this.notice = '';
    } else if ('speechSynthesis' in window) {
      this.mode = MODE.SPEECH;
      this.notice = `Recorded narration unavailable (${ok}/${this.manifest.segments.length} loaded) — using browser speech. Timing is approximate.`;
    } else {
      this.mode = MODE.SILENT;
      this.notice = 'Narration unavailable — playing silently with sound effects.';
    }
    this.music = musicEvents(this._chapters || [{ start: 0 }], this.total);
    return this.mode === MODE.AUDIO;
  }

  setChapters(ch) { this._chapters = ch; this.music = musicEvents(ch, this.total); }

  // ------------------------------------------------------------- clock
  get time() {
    if (!this.playing) return this.pausedAt;
    if (this.ctx && this.mode === MODE.AUDIO) return this.origin + (this.ctx.currentTime - this.ctxT0);
    return this.origin + (performance.now() - this._perf0) / 1000;
  }

  ctxTimeFor(t) { return this.ctxT0 + (t - this.origin); }

  // ------------------------------------------------------------- transport
  async play(from = null) {
    const t = from == null ? this.pausedAt : from;
    if (this.ctx && this.ctx.state === 'suspended') { try { await this.ctx.resume(); } catch (e) { /* user gesture needed */ } }
    this.stopSources();
    this.origin = t >= this.total - 0.02 ? 0 : t;
    this.ctxT0 = this.ctx ? this.ctx.currentTime + 0.06 : 0;
    this._perf0 = performance.now() + 60;
    this.playing = true;
    this.resetCursors(this.origin);
    if (this.mode === MODE.AUDIO) this.scheduleNarration(this.origin);
    else if (this.mode === MODE.SPEECH) this.speakFrom(this.origin);
    return this.origin;
  }

  pause() {
    if (!this.playing) return;
    this.pausedAt = Math.min(this.time, this.total);
    this.playing = false;
    this.stopSources();
  }

  seek(t) {
    const target = Math.max(0, Math.min(t, this.total));
    if (this.playing) { this.play(target); } else { this.pausedAt = target; this.resetCursors(target); }
  }

  stopSources() {
    for (const s of this.sources) { try { s.stop(); } catch (e) { /* already ended */ } try { s.disconnect(); } catch (e) {} }
    this.sources.length = 0;
    if (this.mode === MODE.SPEECH && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
      this._speakIdx = -1;
    }
  }

  resetCursors(t) {
    this.scheduledTo = t;
    this.evCursor = this.events.findIndex(e => e.t >= t);
    if (this.evCursor < 0) this.evCursor = this.events.length;
    this.muCursor = this.music.findIndex(e => e.t >= t);
    if (this.muCursor < 0) this.muCursor = this.music.length;
  }

  scheduleNarration(from) {
    for (const s of this.segs) {
      if (s.end <= from + 0.01) continue;
      const buf = this.buffers.get(s.id);
      if (!buf) continue;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.narr);
      if (s.start >= from) src.start(this.ctxTimeFor(s.start));
      else src.start(this.ctxTimeFor(from), from - s.start);
      this.sources.push(src);
    }
  }

  /** Called once per animation frame. Schedules the next slice of sound only. */
  tick() {
    if (!this.playing || !this.ctx) return;
    const now = this.time;
    const horizon = now + 0.30;
    while (this.evCursor < this.events.length && this.events[this.evCursor].t < horizon) {
      const ev = this.events[this.evCursor++];
      if (ev.t < now - 0.25) continue;                 // never fire a sound we seeked past
      playSfx(this.ctx, this.sfx, ev.n, this.ctxTimeFor(ev.t), ev.g ?? 1);
    }
    if (this.musicOn) {
      while (this.muCursor < this.music.length && this.music[this.muCursor].t < horizon) {
        const ev = this.music[this.muCursor++];
        if (ev.t < now - 0.25) continue;
        playMusic(this.ctx, this.mus, ev, this.ctxTimeFor(ev.t));
      }
    } else {
      while (this.muCursor < this.music.length && this.music[this.muCursor].t < horizon) this.muCursor++;
    }
    if (this.mode === MODE.SPEECH) this.speakTick(now);
  }

  // ------------------------------------------------------------- speech fallback
  pickVoice() {
    if (this._voice !== undefined) return this._voice;
    const vs = window.speechSynthesis.getVoices() || [];
    const en = vs.filter(v => /^en(-|_)/i.test(v.lang));
    this._voice = en.find(v => /male|daniel|alex|david|george|fred|guy|brian|andrew/i.test(v.name))
               || en.find(v => /^en-US/i.test(v.lang)) || en[0] || null;
    return this._voice;
  }

  speakFrom(t) {
    // exact mid-sentence resume is not possible, so start at a segment boundary
    this._speakIdx = -1;
    this.speakTick(t);
  }

  speakTick(now) {
    const idx = this.segs.findIndex(s => now >= s.start - 0.05 && now < s.end);
    if (idx < 0 || idx === this._speakIdx) return;
    this._speakIdx = idx;
    const s = this.segs[idx];
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(s.text);
      const v = this.pickVoice();
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
      u.rate = 0.95; u.pitch = 0.95; u.volume = this.muted ? 0 : 1;
      window.speechSynthesis.speak(u);
      this._utter = u;
    } catch (e) { /* speech refused; visuals continue */ }
  }

  // ------------------------------------------------------------- mix
  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 1;
    if (this.mode === MODE.SPEECH && !m === false) { try { window.speechSynthesis.cancel(); } catch (e) {} }
    if (this._utter) this._utter.volume = m ? 0 : 1;
  }
  setMusic(on) {
    this.musicOn = on;
    if (this.mus) this.mus.gain.value = on ? 0.34 : 0;
  }
}
