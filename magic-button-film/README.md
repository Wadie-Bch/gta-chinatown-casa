# Can AI Build a REAL Game With One Click? — animated film preview

A browser-playable, landscape animated film (~5 min 10 s) about whether one prompt and
one click on Send can produce a *complete* small game, rather than a good-looking
prototype. It is a **simulated preview of a proposed test**. No model has been
benchmarked, and the film says so out loud, on screen, and in its end card.

## Run it

```bash
npm start            # serves http://127.0.0.1:8123/ on localhost only
```

Then open <http://127.0.0.1:8123/>. Entry file: `index.html`.

It must be served over `http://` (ES modules and `fetch` do not work from `file://`).
Nothing is fetched from the internet at play time — fonts, audio and every graphic are local.

## What is in here

```
index.html                 the player
css/player.css             player chrome; css/fonts.css  self-hosted faces
js/player.js               transport, seeking, chapters, rotate view, fullscreen
js/film.js                 renderAt(t) — the whole picture as a function of one number
js/timeline.js             narration manifest + shot list -> absolute times
js/cuts.js                 the shot list (87 shots), anchored to spoken words
js/audio.js                master clock, narration scheduling, fallbacks
js/sfx.js                  26 original synthesised effects + a sparse music bed
js/g2.js  js/g3.js         2D helpers; a small painter's-algorithm 3D pipeline
js/scenes/*.js             the ten sets
episode/…json              narration script + truth rules (the editorial source)
audio/narration/*.mp3      generated narration + manifest.json (durations, word timings)
tools/build_narration.py   regenerates narration with edge-tts (cached by content hash)
tools/serve.mjs            the local static server
tests/*.mjs                the verification suite
fonts/                     Barlow Condensed + IBM Plex (OFL 1.1), sources in SOURCES.json
```

## How the timing works

`tools/build_narration.py` calls **edge-tts** (`en-US-BrianNeural`, rate `-10%`) once per
script paragraph, caches on a hash of the text and voice settings, and keeps the
`WordBoundary` metadata. Durations are measured by parsing the MP3 frame headers and
cross-checked against ffmpeg. The result is `audio/narration/manifest.json`.

The shot list anchors edits to **words**, not to fractions of a file:

```js
{ seg: 's12', word: 'stops', set: 'city', view: 'vanwide', stopAt: 186.6, invisibleWall: true }
```

`buildTimeline()` resolves each anchor to the exact second that word is spoken. Nothing
is estimated by splitting the audio evenly. `syncWords` does the same for objects inside a
shot, so the ten feature parts land on the words that name them.

At play time the AudioContext clock is the master: every narration segment is scheduled at
an absolute context time, and `renderAt(t)` draws the frame for that second. There are no
CSS timelines and no `setTimeout` chains, so seeking anywhere reproduces that second exactly.

## Narration modes

1. **recorded** (default) — the generated MP3s; sample-accurate.
2. **browser speech** — if the recordings cannot load. Restarts at a sentence boundary on
   seek, and the player says on screen that the timing is approximate.
3. **silent** — if neither is available; the picture and effects still run, with a notice.

## Regenerating the narration

```bash
npm run narration     # needs `pip install edge-tts` and a network connection
```

Edit `episode/magic_button_episode.json` first. Unchanged paragraphs are not re-fetched.
On a corporate network that re-terminates TLS, set `EXTRA_CA_BUNDLE` to your CA file.

## Tests

```bash
npm test
```

Runs, in order: import check, timeline/shot statistics, 20 transport checks, 54 mobile /
rotate / fullscreen checks, a transition-motion check, a text legibility sweep over all 87
shots, 14 narration-and-fallback checks, and an offline render of every sound effect.

`npm run sheet` (env `FROM`, `TO`, `COLS`, `OUT`) writes a contact sheet for visual review;
`npm run frames` writes one PNG per shot.

## Editorial rules this film keeps

* "One button" means one prompt and one click on **Send**, not a one-button control scheme.
* Everything shown is labelled SIMULATED; no result is attributed to any model.
* No fabricated plan badges, model versions, benchmark numbers or success claims.
* A browser game can be complete; a desktop executable can be unfinished.
* No accusation that any channel fakes results.
