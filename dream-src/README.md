# DREAM — "A Bin With No Away"

Flat-vector motion graphics, fixed 1920x1080 frame. `dream-a-bin-with-no-away.html`
is the finished self-contained artifact (audio + fonts embedded, runs offline).

    python3 tts.py     # per-line Piper synthesis -> exact timings
    python3 sfx.py     # voice fingerprint, SFX, drone bed, mix -> narration.mp3
    python3 mkhtml.py  # assemble the single-file episode

- `tpl/kg.js`     drawing + animation core. Limbs are capsules rotated about real
                  joints; every entrance animates a WRAPPER group, because a CSS
                  transform silently overrides the SVG transform attribute.
- `tpl/scenes.js` 48 scene compositions.
- `tpl/engine.js` scene stack: scenes cross-dissolve in place, the camera never moves.

Voice: Piper `en_US-norman-medium` — LibriVox, public domain, trained from scratch.
