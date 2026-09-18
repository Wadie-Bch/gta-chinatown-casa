# STATUS — magic-button-film

**State: complete and verified.** The film plays end to end with recorded narration.

| | |
|---|---|
| Entry file | `magic-button-film/index.html` |
| Preview URL | `http://127.0.0.1:8123/` (`npm start`, localhost only — not published) |
| Timeline / audio duration | **309.56 s (5 min 09.6 s)** — 1.1 s lead-in + 288.3 s speech + 15.7 s pauses + 4.5 s tail |
| Narration mode | **recorded** — edge-tts `en-US-BrianNeural`, rate −10 %, 17 MP3 segments, **157.6 wpm** |
| Script | 757 words, `episode/magic_button_episode.json` |
| Shots | 87, average 3.56 s, shortest 0.86 s, longest 9.43 s |
| Sets | 10 distinct environments (desk, city, composer, assembly, export desk, bench, workshop, player desk, props, diagram) |
| Transitions | 41 hard cuts, 21 wipes, 15 push-ins, 5 freezes, 4 flashes — never 3 of the same family in a row |
| Sound | 26 original synthesised effects + a sparse music bed at 13 % of narration RMS |

## Verified (all green)

`npm test` — 8 suites:

* imports: 0 broken module imports.
* timeline: 87 shots, **0 unresolved word anchors**, 0 console errors.
* transport (20): first frame before playback, play/pause, deterministic `renderAt`,
  seek, chapter selection (11 chapters), mute, replay, no duplicated sound cues,
  captions off by default, keyboard, clean stop at the end, restart after the end.
* mobile (54): 360 / 390 / 430 px portrait and 844 / 932 px landscape — 16:9 held to
  ±0.02, no horizontal scroll, every visible control ≥ 40 px, rotate view applies a real
  90° transform, keeps 16:9, enlarges the picture ~1.8×, keeps all controls on screen and
  keeps seeking working; fullscreen via the API and via the inline fallback when the API
  refuses (the iPhone path).
* transitions: wipe / push / flash / freeze all measurably animate across their duration.
* legibility: 435 frames sampled across every shot — 0 text overflows, 0 editorial text in
  the control strip. Render cost 1.03 ms/frame headless.
* narration (14): 17/17 segments decode, **0.000 s drift** between decoded audio and the
  manifest the timeline was built from; seeking schedules only the remaining segments;
  speech and silent fallbacks both verified with a visible notice.
* sound: all 26 effects render non-silent and non-clipping offline.

## Not verified

* **Nobody listened to it.** The audio was checked numerically (decode durations, cue
  scheduling, offline peak/RMS), not by ear.
* Tested in headless Chromium only. Not run on a real iPhone or on Windows/Edge.
* The frame-rate figure is a headless render-cost measurement, not a on-device frame rate.

## Next action if this is picked up again

Nothing is outstanding. Optional follow-ups, in order of value:

1. Play it on the target laptop in Edge/Chrome and on the iPhone 13 (portrait, rotate
   button, landscape) and note anything that reads differently from the screenshots.
2. If a real test is ever run, replace the simulated sequences: keep actual transcripts
   verbatim, relabel recreated interfaces `RECREATED UI`, and drop the `SIMULATED` stamps
   only for material that is genuinely real.
3. MP4 export was explicitly out of scope and is not built.
