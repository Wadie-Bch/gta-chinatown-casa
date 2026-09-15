// The episode. One list of shots; one list of music cues. Everything else reads
// from here — the preview, the frame exporter and the soundtrack.
import { buildTimeline } from '../core/stage.js';
import { shots, clearShots } from './kit.js';
import act0 from './act0.js';
import act1 from './act1.js';
import act2 from './act2.js';
import act3 from './act3.js';
import act4 from './act4.js';
import act5 from './act5.js';
import act6 from './act6.js';
import act7 from './act7.js';

clearShots();
[act0, act1, act2, act3, act4, act5, act6, act7].forEach(a => a());

export const TIMELINE = buildTimeline(shots);
export const DURATION = TIMELINE.duration;
export const FPS = 30;

/** music cues, in episode seconds. name → a bed in audio/music.js */
export const MUSIC = [
  { t: 0.0, name: 'hungerPad', gain: .85 },
  { t: 13.0, name: 'silence', gain: 0 },
  { t: 15.4, name: 'denial', gain: .9 },
  { t: 20.0, name: 'checkpoint', gain: .95 },
  { t: 52.0, name: 'lowEbb', gain: .8 },
  { t: 60.0, name: 'idea', gain: 1 },
  { t: 78.0, name: 'checkpoint', gain: .8 },
  { t: 86.0, name: 'lowEbb', gain: .75 },
  { t: 100.0, name: 'shopping', gain: .95 },
  { t: 126.5, name: 'victory', gain: 1 },
  { t: 136.5, name: 'irony', gain: .8 },
  { t: 140.0, name: 'delivery', gain: .9 },
  { t: 158.0, name: 'chase', gain: 1 },
  { t: 176.0, name: 'silence', gain: 0 },
  { t: 180.0, name: 'tension', gain: .85 },
  { t: 191.0, name: 'chase', gain: 1 },
  { t: 206.0, name: 'tension', gain: .9 },
  { t: 214.0, name: 'dread', gain: .9 },
  { t: 225.0, name: 'ceremony', gain: .95 },
  { t: 250.0, name: 'lowEbb', gain: .8 },
  { t: 258.0, name: 'silence', gain: 0 },
  { t: 270.0, name: 'lowEbb', gain: .7 },
  { t: 277.0, name: 'helperTheme', gain: .9 },
  { t: 288.0, name: 'silence', gain: 0 },
  { t: 292.5, name: 'outro', gain: 1 },
];

/** flatten every sound event to absolute episode time */
export function soundEvents() {
  const out = [];
  for (const s of TIMELINE.shots) {
    for (const e of (s.sfx || [])) out.push({ t: s.t0 + e.t, ...e });
    for (const l of (s.say || [])) out.push({ t: s.t0 + l.t, n: 'voice', who: l.who, text: l.text, d: l.d, pitch: l.pitch, vo: l.vo });
  }
  out.sort((a, b) => a.t - b.t);
  return out;
}
