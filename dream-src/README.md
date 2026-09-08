# DREAM — "A Bin With No Away"

Flat-vector motion graphics, fixed 1920x1080 frame, cut like a dream.
`dream-a-bin-with-no-away.html` is the finished self-contained artifact.

    python3 tts.py     # per-line Piper synthesis -> exact timings
    python3 sfx.py     # voice fingerprint, SFX, drone bed -> narration.mp3
    python3 mkhtml.py  # assemble the single-file episode

- `tpl/kg.js`     drawing + animation core. Limbs are capsules rotated about
                  real joints. Entrances animate a WRAPPER group (a CSS
                  transform silently overrides the SVG transform attribute)
                  and run on SECONDS, not normalised scene progress.
- `tpl/scenes.js` 48 wordless scene compositions.
- `tpl/engine.js` the edit: 311 hard cuts, content-aware punch-ins, grain,
                  chromatic split, scanlines, exposure flicker, ghost trails,
                  and the subtitle track. No titles anywhere in the picture.
- `grain.b64`     a 320px film-grain tile, generated in numpy, embedded.

Voice: Piper `en_US-norman-medium` — LibriVox, public domain, trained from scratch.
