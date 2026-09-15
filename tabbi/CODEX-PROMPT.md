# One-shot prompt for another coding agent (Codex / Cursor / a fresh Claude Code)

Paste everything inside the fence. It is self-contained: the agent clones the
public repo and builds Episode 2 on top of the existing engine.

```
Build Episode 2 of TABBI, an original code-drawn animated comedy series.

SETUP
git clone https://github.com/Wadie-Bch/gta-chinatown-casa
cd gta-chinatown-casa && git checkout claude/tabbi-episode-pizza-order-7ayg3d && cd tabbi
npm install
Read tabbi/README.md first. Episode 1 is complete and working — study
src/episode/act0.js and act1.js to learn the conventions, then follow them
exactly. Do NOT rebuild the engine, the characters, the rooms, the audio
system or the export pipeline. They work. You are writing a new episode with
the existing tools plus a few new assets.

WHAT THE ENGINE GIVES YOU
Everything visible is Canvas 2D drawn in code. No images, no stock audio, no
external assets, ever. 1920x1080, 30fps. Animation is a pure function of
episode time — no accumulated state, all randomness seeded via hash()/noise1()
— so seeking to a timestamp always produces the same frame.

Modules (import paths relative to src/episode/):
  ../core/palette.js   C (colours), f(weight,size), W=1920, H=1080
  ../core/util.js      clamp lerp p01 E(easing) ramp pulse sinw sin01 hash
                       noise1 shake track TAU D2R
  ../core/draw.js      S rr rrPath circ ell line poly text textBlock wrap
                       shadow noShadow groundShadow bubble sysPlate cursor
                       spinner ring lightPool vignette grain
  ../core/ui.js        button checkbox notification chatPanel field chip tab
  ../core/chrome.js    CHROME_H TABS tabOf NO_CHROME — the browser window
  ../chars/tabbi.js    drawTabbi(ctx,opts) pose(name,phase,extra) blinkAt
                       tabbiMark. Poses: idle walking running smug suspicious
                       typing hopeful shocked defeated celebrating holding
                       toViewer angry sad point sitting stare
  ../chars/gate.js     drawGate       ../chars/helper.js drawHelper
  ../chars/dash.js     drawDash sliceMark
  ../rooms/rooms.js    interior shopRoom checkpoint counterRoom mapWorld
                       robotRoom tabHall doorRoom trackScreen miniMap
  ../rooms/props.js    pizza pizzaBox olive coin receipt badge codeChip
                       linkCard dome pizzaAd
  ./kit.js             shot say sys talk withCam finish split hit pointer
                       speedLines caption
  ../audio/sfx.js      sfx(buffer, name, t, opts)
  ../audio/music.js    BEDS — one named bed per tension level

THE SHOT DSL — one shot looks exactly like this:
  shot('b0-wake', 3.2, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 0, y: -400, z: .95 },
                  { t: 3.2, x: 40, y: -404, z: .98, e: E.linear }], lt, () => {
      shopRoom(ctx, { t: lt });
      drawTabbi(ctx, { ...pose('idle', lt), x: -560, y: 0, s: 1.45, flip: 1 });
    });
    say(ctx, sh, lt, 0, W * .3, H * .22, { size: 46, tail: [-.2, 1] });
    finish(ctx);
  }, {
    tr: { type: 'dissolve', d: .35 },
    say: [{ t: .4, d: 1.6, who: 'tabbi', text: 'Nine ninety-nine?' }],
    sfx: [{ t: .1, n: 'uiPop' }, { t: 1.2, n: 'boing' }],
  });
Transitions: cut dissolve wipeL wipeR iris push pushUp whip flash shutter
matchScale. Speakers: tabbi gate helper dash sysv (add 'retain').
World coords: floor is y=0, up is negative, characters stand at y=0 and scale
~1.45. Cameras are keyframed; every move must have a subject and a purpose.

EPISODE 2 — "He Tried to Cancel. They Tried to Be Nice."
Exactly 300.000 seconds. New website, new antagonist, same universe.
Episode 1 was about not being let IN. Episode 2 is about not being let OUT.

New site: STREEM+ (a streaming service). New tabs: streem.plus/account,
help.streem.plus, hold.line. Add them to TABS in src/core/chrome.js and map
the new shot ids in TAB_OF.

New character: RETAIN — a retention specialist who is relentlessly, sincerely
delighted to help you not leave. Silhouette must be distinct from Gate (tall
dark slab), Helper (floating capsule) and Dash (thin figure + big cube): make
RETAIN wide, soft and low, pastel, with arms that keep opening into a hug and
a permanent warm smile. Never menacing. The comedy is that he means it.
Write src/chars/retain.js in the same style as helper.js.

BEATS (hit these timings; improve individual jokes, keep cause and effect)
0:00-0:20  Tabbi sees 9.99 leave his balance. Again. He has watched one show,
           once, eleven months ago. He finds the Cancel link.
0:20-1:00  Cancel moves. Every click relocates it — footer, then settings,
           then behind a "Manage preferences" accordion, then back to the
           footer. Three escalating variations, not the same gag repeated.
1:00-1:40  RETAIN appears: "Before you go..." The first offer is reasonable.
1:40-2:20  The offers escalate absurdly: 50% off, then a free month, then a
           second account for a friend he does not have, then a pet.
           Tabbi says "I got this." He accepts nothing. He is proud.
2:20-3:00  "Cancellation is available by phone only." The hold room: a beige
           waiting space, terrible hold music, a ticket number that goes UP.
           Gate cameo as the hold operator who only says the queue position.
3:00-3:45  He gets through. RETAIN: "I've sent a confirmation email."
3:45-4:30  The confirmation link requires signing in. Signing in counts as
           activity. Activity renews the subscription. Tabbi watches the
           counter reset to twelve months. Payoff of the 1:00 identity beat.
4:30-4:52  He finally cancels. The receipt reads: "Effective in 11 months."
4:52-5:00  Callback to the opening: 9.99 leaves the balance again. One last
           short joke, then the small TABBI mark. No long subscribe animation.

PACING Important changes every 2-5 seconds, with deliberate 4-7 second holds
before or after the strong jokes. Vary it: fast bursts for the escalations,
readable exchanges for dialogue, silence around the best reactions. Do not
enforce a cut quota and do not make every transition a zoom. Use extreme
close-ups, reaction shots, cursor-following pans, tracking shots through tabs,
wide shots that reveal consequences and brief split screens.

DIALOGUE 2-9 words per line. Never paragraphs. Never white text on white —
use the bubble/sysPlate helpers, which handle backing and contrast for you.

FUNNY SFX — add these named cues to src/audio/sfx.js, synthesised only:
boing, slideWhistleUp, slideWhistleDown, sadTrombone, cashRegister, recordScratch,
cartoonRun, partyHorn, squeakyToy, popCork, rubberStretch, bigGulp, wetSplat,
tinyApplause, elevatorDing, holdMusicLoop (deliberately terrible, 4 bars, looped).
Add music beds 'beige' (hold room) and 'smarm' (RETAIN's theme) to music.js.

AUDIO There is no local TTS. Characters do not speak English aloud: each has a
synthesised vocal identity in src/audio/voices.js (pitch, timbre, syllable
rate, contour) over readable on-screen dialogue. Give RETAIN a new entry —
warm, slightly too smooth, always ending on a rising note. Speech ducks the
music bus automatically. Target about -16 LUFS integrated, true peak under
-1 dBTP; the export already applies a -0.9 dB trim for AAC overshoot.

BUILD IT
Create src/episode/b0.js … b7.js exporting default functions that call shot(),
then switch src/episode/episode.js to import them and set MUSIC cues.
Keep Episode 1 intact in act0..act7 — make the episode selectable.

COMMANDS
  npm run check                                  # sweep whole timeline for errors
  node tools/snap.mjs "/preview.html?render=1" out/b0 "3,12,25,40"
  node tools/sheet.mjs out/b0 out/b0-sheet.png 4 540   # contact sheet to inspect
  npm run audio                                  # soundtrack -> out/tabbi-audio.wav
  node tools/render.mjs out/ep2-preview.mp4 --to=1800   # 60s preview first
  npm run render                                 # full 5:00 MP4
  npm run thumb                                  # 1280x720 thumbnail

MUST PASS BEFORE YOU CALL IT DONE
1. Timeline sums to exactly 300.000s. Assert it.
2. `npm run check` reports NO SHOT ERRORS.
3. You have LOOKED at contact sheets from every act and fixed framing —
   nothing important cropped, no character cut off, no text over text.
4. Preview works at 390px phone width and at desktop width.
5. MP4 verified with ffmpeg: 5:00.00, 1920x1080, 30fps, audio stream present.
6. No placeholders, no TODOs, no external assets.
State plainly anything you could not verify. Do not claim a render, a mix or a
visual check passed unless you actually performed it.
```
