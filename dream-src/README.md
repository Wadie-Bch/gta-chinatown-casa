# DREAM — "A City With No Flashing Light"

A real-time 3D city in three.js. One continuous camera flight, 45 keyframes,
no cuts, no flashes, no strobe. Subtitles are the only text.

    python3 tts.py     # per-line Piper synthesis -> exact timings
    python3 sfx.py     # voice fingerprint, SFX, drone bed -> narration.mp3
    python3 mkhtml.py  # assemble the single-file episode (three.js inlined)
    python3 render_mp4.py   # offline master: frames piped into ffmpeg

- `tpl/world.js`  the city: instanced buildings, a painted road-grid texture,
                  signal heads with additive halos, cars that stop at red,
                  people at kerbs. `?render=1` drops antialiasing and enables
                  preserveDrawingBuffer for the offline master.
- `tpl/cam.js`    45 keyframes, Catmull-Rom with linear parameterisation, so
                  velocity is continuous across every keyframe. Low keyframes
                  sit in road corridors; a runtime guard lifts the camera if it
                  would ever enter a block below roof height.
- `tpl/engine.js` audio clock, act-state lerp (sky/fog/warmth/density),
                  subtitles, and `__frame(t,dt,q)` which renders AND composites
                  in one task — WebGL discards its drawing buffer after
                  compositing, so a separate grab call returns black.

Voice: Piper `en_US-norman-medium` — LibriVox, public domain, trained from scratch.
