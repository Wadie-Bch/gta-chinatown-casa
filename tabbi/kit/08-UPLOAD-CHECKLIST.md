# Per-video checklist, once you are live

## Before render
- [ ] Every frame uses the new palette and 10–12 px outlines
- [ ] Character is `paper` against a saturated ground in every shot
- [ ] No real brand name, logo, or anything that reads as one
- [ ] No currency or reference tied to one country
- [ ] Every line 2–9 words, B1 English or simpler
- [ ] Timeline asserts exactly 300.000 s (or the Short's target length)

## After render — verify, do not assume
- [ ] `ffmpeg -i out.mp4` reports the duration, 1920×1080, 30 fps, audio stream
- [ ] `ffmpeg -af ebur128` on the **encoded** file: ≈ −16 LUFS, true peak ≤ −1 dBTP
- [ ] Watched it once, end to end, with sound
- [ ] Watched the first 3 seconds five times — that is where you win or lose

## Upload
- [ ] Title: 4–8 words, conflict in the first three
- [ ] Thumbnail: 4 words max, one emotion, one saturated block
- [ ] Description from `POST-PACKAGE.md` template, chapters included
- [ ] **Made for kids: NO**
- [ ] Language: English. Category: Comedy.
- [ ] Scheduled, not published live — 17:00 UTC Tue or Thu
- [ ] Pinned first comment written before publishing
- [ ] End screen on the last 8 seconds

## Shorts cut from the same episode
- [ ] 20–40 s, vertical 1080×1920, character in the middle third
- [ ] Opens on the funniest frame, not a build-up
- [ ] Punchline lands before 80% of the runtime
- [ ] Caption burned in — most viewers are on mute
- [ ] Posted on a different day from the long-form, not the same day

## After 48 hours
- [ ] Note retention at 3 s and average view duration percentage
- [ ] Nothing else. Do not read the comments for signal; read the curve.
