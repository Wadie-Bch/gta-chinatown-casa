# DREAM — "A Pocket With No Thief"

Build pipeline for the episode. `dream-a-pocket-with-no-thief.html` is the finished
self-contained artifact (audio + fonts embedded; runs offline from the one file).

    python3 tts.py     # per-line Piper synthesis -> exact timings
    python3 sfx.py     # voice fingerprint, SFX, drone bed, mix -> narration.mp3
    python3 mkhtml.py  # assemble the single-file episode

Voice: Piper `en_US-norman-medium` — LibriVox corpus, public domain, trained from
scratch. Verified commercially clean; the popular `ryan` and `hfc_male` voices are
CC BY-NC-SA and were rejected.
