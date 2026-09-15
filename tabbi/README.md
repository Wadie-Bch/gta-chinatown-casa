# TABBI — Episode 1: "He Ordered Pizza. The Browser Said No."

A five-minute animated comedy. 1920×1080, 30 fps, exactly 300.000 s.
Every pixel is drawn by code (Canvas 2D) and every sound is synthesised by code
(no samples, no stock, no external assets).

---

## Watch it

**The finished film** — `out/tabbi-ep1.mp4` (H.264 + AAC, 1920×1080, 30 fps, 5:00).

**The live preview** — needs a local server, because the episode is ES modules:

```bash
npm install
npm run audio     # builds out/tabbi-audio.wav (~11 s)
npm start         # serves http://localhost:8123/preview.html
```

The preview plays like a film, not an editor. There is no scrub bar and no
timeline: only playback, pause, replay and sound.

| control | what it does |
|---|---|
| **click the picture** / `Space` | play · pause · resume |
| **▶ PLAY WITH SOUND** | appears when the browser blocks audible autoplay; starts picture and sound together from 0:00 |
| **↻ WATCH AGAIN** | appears on the end card |
| **🔊 button** / `M` | mute · unmute |
| `R` | replay from the start |
| `F` | fullscreen |

The transport fades out while the film plays and returns on mouse move.
Where the browser permits it, the picture starts on its own; where sound needs a
gesture, the **PLAY WITH SOUND** card waits instead of playing silently.

## Rebuild it

```bash
npm run audio     # soundtrack  -> out/tabbi-audio.wav
npm run render    # full export -> out/tabbi-ep1.mp4   (~25 min)
npm run check     # sweeps the whole timeline for runtime errors
```

`tools/render.mjs` drives the *same page the preview uses*, one frame at a time
(`window.__tabbi.renderFrame(n)`), and pipes lossless PNGs straight into ffmpeg
with the pre-rendered WAV. Nothing is timed by a wall clock, so the export and
the preview are frame-identical.

Render a slice while iterating:

```bash
FROM=3000 TO=3600 node tools/render.mjs out/slice.mp4
```

## Sound

There is no local TTS in this environment, so nobody speaks English out loud.
Instead each character has a synthesised **vocal identity** — pitch, timbre,
syllable rate and contour — over readable on-screen dialogue:

* **Tabbi** — bright clipped square, fast, always slightly too confident.
* **Gate** — a low monotone with a sub. He does not inflect.
* **Helper** — a polite sine with a bell partial that always glides upward.
* **Dash** — a tired saw with breath noise that falls at the end of every line.
* **The system** — a stepped pulse. Not a voice. A ruling.

Music is fifteen original beds, one per tension level, switched by cue in
`src/episode/episode.js`. Speech ducks the music bus by ~8 dB with a soft
release; several beats are scored as silence on purpose.

Measured on the delivered MP4 with `ffmpeg -af ebur128`:
**−16.7 LUFS integrated, −1.4 dBTP, LRA 8.8**.
The export applies a −0.9 dB trim before AAC, because the encoder overshoots the
source's true peak by roughly a decibel; the WAV itself sits at −15.7 LUFS / −1.7 dBTP.

## How it is built

One source of truth, in `src/episode/`. Each shot declares its duration, its
camera keyframes, its dialogue, its sound events and its transition as **data**;
the picture and the soundtrack are both generated from that same list.

```
src/core/     draw primitives · camera · shot compositor · browser UI kit
src/chars/    Tabbi (12 poses) · Gate · Helper · Dash
src/rooms/    shop · checkpoint · counter · map · robot dock · tab hall · door
src/episode/  act0…act7  (95 shots)  +  kit.js (shot DSL)
src/audio/    dsp · voices · sfx · music · mix (ducking + loudness)
tools/        serve · audio · render · snap · sheet · errsweep · uitest
```

Animation is a pure function of episode time — no accumulated frame state, all
randomness seeded — so seeking to a timestamp always produces the same frame.
