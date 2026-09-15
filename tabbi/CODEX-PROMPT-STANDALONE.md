# Standalone build prompt — no repo, no dependencies on this project

Paste everything inside the fence into Codex (or any coding agent). It assumes
nothing exists. Everything the agent needs to build a five-minute code-drawn
animated episode from scratch is stated in it, including the traps that cost
time on the first build of this project.

```
Build a complete five-minute animated comedy episode. Everything visible must be
drawn by code and everything audible must be synthesised by code. No images, no
stock audio, no video assets, no image generators, no TTS services, ever.

TARGET
Exactly 300.000 seconds. 1920x1080. 30 fps. Deliver:
  - a browser preview that plays like a film (playback, pause, replay, sound only)
  - a rendered MP4 with synchronised audio
  - the editable source

STACK — do not deviate
Node 20+, plain ES modules, no framework, no build step for the source.
Canvas 2D for all drawing. Playwright + headless Chromium to capture frames.
ffmpeg (npm: ffmpeg-static) to encode. Everything else you write yourself.
npm install playwright ffmpeg-static

THE ONE RULE THAT DECIDES EVERYTHING
Animation is a pure function of episode time. render(ctx, t) draws frame t and
nothing else. No accumulated frame counters, no requestAnimationFrame deltas
feeding state, no Math.random at draw time — seed all noise from a hash(n)
function. Seeking to the same timestamp must produce a byte-identical frame.
This is what lets the exporter drive the same page the preview uses, so the MP4
and the preview cannot drift apart.

ARCHITECTURE
  src/core/palette.js   colours, font helper, W=1920, H=1080
  src/core/util.js      clamp lerp p01 easing(E) ramp pulse sinw sin01
                        hash(n) noise1(t,seed) shake track TAU D2R
  src/core/draw.js      S(ctx,fn) rr rrPath circ ell line poly text wrap
                        textBlock shadow groundShadow bubble sysPlate cursor
                        spinner ring lightPool vignette grain
  src/core/camera.js    camAt(keys,t) applyCam(ctx,cam)
  src/core/stage.js     buildTimeline shotAt renderEpisode + transitions
  src/core/chrome.js    the browser window layer
  src/core/ui.js        button checkbox notification chatPanel field chip
  src/chars/*.js        one file per character
  src/rooms/*.js        one file per environment + props
  src/episode/kit.js    the shot DSL
  src/episode/a0..a7.js the acts
  src/episode/episode.js  timeline + music cues — the single source of truth
  src/audio/dsp.js      sample-level synthesis into Float32Array buffers
  src/audio/sfx.js      named effects
  src/audio/voices.js   per-character vocal identities
  src/audio/music.js    music beds, one per tension level
  src/audio/mix.js      buses, ducking, loudness, WAV writer
  src/audio/worker.js   builds the soundtrack off the main thread
  tools/serve.mjs tools/render.mjs tools/audio.mjs tools/snap.mjs
  tools/sheet.mjs tools/errsweep.mjs tools/thumb.mjs
  preview.html  src/main.js

THE SHOT DSL — build this first, then never fight it
A shot declares its duration, its camera keyframes, its dialogue, its sound
events and its transition as DATA. The picture and the soundtrack are both
generated from that same list. One shot looks exactly like this:

  shot('a0-wide', 3.2, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0,   x: 40, y: -600, z: .95 },
                  { t: 3.2, x: 60, y: -640, z: .97, e: E.linear }], lt, () => {
      shopRoom(ctx, { t: lt });
      drawTabbi(ctx, { ...pose('stare', 0), x: -620, y: 0, s: 1.45, flip: 1 });
    });
    say(ctx, sh, lt, 0, W * .3, H * .22, { size: 46, tail: [-.2, 1] });
    finish(ctx);
  }, {
    tr:  { type: 'dissolve', d: .35 },
    say: [{ t: .4, d: 1.6, who: 'tabbi', text: 'Nine ninety-nine?' }],
    sfx: [{ t: .1, n: 'uiPop' }, { t: 1.2, n: 'boing' }],
  });

lt = shot-local time, gt = episode time, sh = the shot object.
buildTimeline() assigns t0/t1 by summing durations. Assert the total is
exactly 300.000 or the build fails.

TRANSITIONS — implement all of these in stage.js, composited by re-painting the
previous shot underneath: cut, dissolve, wipeL, wipeR, iris (from a point),
push, pushUp, whip (horizontal smear), flash, shutter (horizontal slats),
matchScale (previous scales out of a point while the new scales in).

WORLD COORDINATES
Floor is y=0, up is negative, characters stand at y=0 at scale ~1.45.
Cameras are keyframed {t,x,y,z,e}: the world point (x,y) is held at the centre
of frame at zoom z. Visible height is 1080/z, so a camera at y=-400 z=1.0 shows
world y from -940 to 140. Check this arithmetic for every shot — the single
biggest time sink in this project is cameras that crop characters' heads.

THE BROWSER WINDOW
The episode plays inside a real browser window, not an abstract space. Draw a
96px chrome layer in SCREEN space over every shot: tab strip with six named
tabs, traffic-light buttons, back/forward/reload, a padlock, and an address bar
whose URL changes with the story. The active tab highlight slides and a loading
bar runs whenever the story moves to a different tab.

Do this with ONE global crop, never by re-composing shots: clip the page to
y=[96,1080], translate shot content down by 20, and the page keeps its floor
while giving up 76px at the top where sets are mostly empty. Which tab a shot
belongs to is a lookup table keyed by shot id, so shot code never changes.

VISUAL IDENTITY
  warm white #F5F5F7   ink #202027   grey #DCDCE2
  mint #188567 (go / verified / desire)   red #D55B56 (refusal / error)
Rounded geometry, restrained shadows, strong contrast, bold system sans
("Liberation Sans", Arial, Helvetica). Colour must communicate something.
Dark scenes only when motivated — and when you go dark, lift the dark
characters' values or they vanish into the wall.
Never white text on a white surface. Route every caption through a bubble or
plate helper that measures the text and draws an opaque backing.

THE PROTAGONIST — TABBI
Draw him entirely in code as an original vector character:
a rounded browser-tab body, a small raised tab silhouette OFF-CENTRE on his
head (centred reads as a handbag handle — I made that mistake), two large
expressive eyes, tiny flexible arms and legs, mostly warm white with dark ink
outlines and exactly one mint accent (his favicon dot). He must read at
thumbnail size.
Personality: overconfident, impatient, hungry, convinced every shortcut is
brilliant. Catchphrase "I got this." said immediately before making things
worse — use it at most twice in the episode.
Implement reusable poses: idle walking running smug suspicious typing hopeful
shocked defeated celebrating holding toViewer angry sad point sitting stare.
Poses are parameter sets (arm angles, leg angles, eye shape, brow angle, mouth
shape, lean, squash) blended by named cycles. Reactions must respond to story
events — no ambient idle fidgeting.
Brow convention: pick one and write it down. Inner-end-down = angry,
inner-end-up = worried. Getting this backwards makes every expression wrong.

SUPPORTING CAST — silhouettes must be distinguishable in black at 100px
  GATE   — a deadpan CAPTCHA guard. A TALL DARK SLAB with a peaked cap and a
           visor that changes colour instead of a face. Takes every instruction
           literally. Speaks in short flat sentences.
  HELPER — a polite robot assistant. A FLOATING CAPSULE with a wide screen face
           and no legs. Every single thing he does is correct and ruinous.
  RETAIN — a retention specialist. WIDE, SOFT AND LOW, pastel, a headset, arms
           that keep opening into a hug, a smile that never moves. Sincerely
           delighted that you want to leave, because now he can help. Never
           menacing — the comedy is that he means it.
Introduce every character through action. No explanatory cards.

EDITING — this is a film, not a slideshow
Materially different environments, angles and compositions. Extreme close-ups,
reaction shots, cursor-following pans, tracking shots through tabs, wide shots
that reveal consequences, brief split screens, object-motivated transitions,
hard cuts on the punchlines. Every camera move needs a subject and a purpose.
Do not make every transition a zoom. Do not shake the camera continuously.
Do not use a fixed text-left / illustration-right layout.

PACING
Important visual or narrative change usually every 2-5 seconds, with occasional
shorter cuts and deliberate 4-7 second holds where anticipation is doing the
work. Fast bursts for escalating failure, readable exchanges for dialogue,
silence around the strongest reactions. Do not enforce a cut quota. Reading
time matters more than constant motion. Do not type every message one
character at a time.

DIALOGUE
2-9 words per line. No paragraphs. Comfortably readable on a phone: body text
at least 3.5% of frame height. Dialogue lives in the shot's `say` array so the
soundtrack can read it.

=== THE EPISODE ===
TITLE: "He Tried to Cancel. They Tried to Be Nice."
A small creature lives inside a browser. He has been paying EUR 9.99 a month for
a streaming service, STREEM+, for eleven months. He has watched one episode of
one show, once. He decides to cancel. The site decides otherwise.
Invent the fictional brands. Never use a real company's name or logo.

0:00-0:20  THE CHARGE. Open inside the problem, no logo. 9.99 leaves his
           balance. Again. His viewing activity: one episode, eleven months
           ago. 109.89 paid, for that. He finds a nine-pixel "Cancel
           subscription" link at the bottom of the footer.
0:20-1:00  THE LINK THAT MOVES. He clicks it and it relocates - to the top of
           the page, then into Settings, then behind a "Manage preferences"
           accordion which contains another accordion which contains a third
           whose only content reads "See footer." Three escalating variations,
           never the same gag repeated. Back at the footer he finally gets a
           dialog: a huge mint STAY button and a tiny grey "cancel anyway".
1:00-1:40  RETAIN. He unfolds into frame: "Before you go..." The first offer is
           genuinely reasonable - 50% off - and Tabbi hesitates. He declines.
           RETAIN is delighted. A second offer arrives. Then a third slides in
           from off-screen, and a fourth behind it.
1:40-2:20  THE ABSURD OFFERS. A second account for a friend - cut wide to an
           empty room, because there is nobody. Then a free PET, a small mint
           creature blinking in a box. Hold on Tabbi and the pet looking at
           each other. He says no. The pet is retracted on a rail. The final
           offer is 9.99 - the price he already pays. He says CANCEL, firmly,
           and RETAIN says cancellation is available by phone only.
2:20-3:00  THE HOLD ROOM. A beige waiting room, rows of empty chairs, and hold
           music that is deliberately, specifically terrible. He takes ticket
           #4,312. The NOW SERVING board reads 12, then 11 - it counts DOWN.
           His ticket reads 4,313 - it counts UP. Gate appears behind glass as
           the hold operator and only ever states the queue position. Time
           passes: he falls asleep, a plant grows. DING.
3:00-3:45  THE CONFIRMATION. At the window: RETAIN, of course. "Cancelled!"
           Genuine celebration - then, "I've sent a confirmation email." The
           link requires signing in. The password is wrong. The reset email is
           in the same inbox. He gets in. Signing in counts as activity.
           Activity renews the subscription. The counter resets to twelve.
3:45-4:30  THE SYSTEM WINS, THEN LOSES. Long hold on his face. Then he
           speedruns the entire maze in a fast montage. RETAIN starts
           "Before you go-" and Tabbi says NO. RETAIN, sincerely: "I respect
           that." Green tick. CANCELLATION CONFIRMED. Real joy, confetti,
           music lifts. A receipt prints and the camera follows it down.
4:30-4:52  The line at the bottom of the receipt: "EFFECTIVE IN 11 MONTHS."
           Hold on it. He reads it again. He looks at the viewer. He sits down.
4:52-5:00  CALLBACK. Ping. 9.99 leaves the balance. Then the pet arrives in a
           box anyway - wearing a tag that reads 9.99/MONTH. One flat look at
           the viewer. Cut to a small channel mark. No long subscribe animation.

Improve individual jokes freely. Preserve cause and effect, and preserve the
payoff structure: the early setups (the footer link, the pet, the eleven
months) must all pay off later.

=== AUDIO - half the episode ===
Synthesise the entire soundtrack as ONE stereo Float32Array pair, sample by
sample, with your own DSP. Do NOT build a Web Audio node graph: a rendered
buffer is the only way the preview and the MP4 can be identical.

dsp.js primitives: tone({t,d,f0,f1,type,g,shape,pan,vib,glide}) with waveforms
sine/tri/saw/square/pulse/soft; filtered noise(); click(); bell(); envelopes
perc/blip/pad/gate/swell/rise; mixInto(); fadeRange().

VOICES - there is no TTS. Give each character a synthesised vocal identity:
one short burst per syllable, contoured so statements fall and questions rise,
over readable on-screen dialogue. Estimate syllables from vowel groups.
  Tabbi  bright clipped square, fast, slightly too confident
  Gate   a low flat monotone with a sub. He does not inflect.
  Helper a polite sine with a bell partial that always glides upward
  RETAIN warm, slightly too smooth, always ending on a rising note
Keep non-verbal reactions as separate cues - gasp, sigh, stomach growl,
swallow, silent scream. TTS could never do those and they carry the comedy.

FUNNY SFX - synthesise all of these by name:
boing, slideWhistleUp, slideWhistleDown, sadTrombone, cashRegister,
recordScratch, cartoonRun, partyHorn, squeakyToy, popCork, rubberStretch,
bigGulp, wetSplat, tinyApplause, elevatorDing, snore, clockTick, plantGrow,
toggleFlip, plus the ordinary world: typing, clicks, notifications, footsteps,
impacts, loading, doors, paper, coins.
Give the same event different variants - never play one notification sound for
every line.

MUSIC - original lightweight beds, one per tension level, switched by cue in
episode.js. At minimum: lowEbb, tension, chase, victory, dread, irony,
ceremony, outro, plus 'beige' (the hold music: a cheap four-bar loop with one
note permanently wrong) and 'smarm' (RETAIN's theme: warm, smooth, about ten
percent too pleased with itself). Silence is a cue too - score several beats
as nothing.

MIX: music and effects on separate buses. Speech ducks the music bus by ~8 dB
with a smoothed release. Normalise with a CALIBRATED CONSTANT, not a runtime
loudness analysis, so the browser does not have to analyse 14 million samples
before it can play. Target about -16 LUFS integrated, true peak <= -1 dBTP.

TWO AUDIO TRAPS THAT WILL COST YOU AN HOUR EACH
1. AAC encoding overshoots the source true peak by roughly a decibel. Apply a
   static -0.9 dB trim before the AAC encode and verify the ENCODED file with
   `ffmpeg -af ebur128`, not the WAV.
2. ffmpeg's `loudnorm` dynamic mode lifts material into the ceiling and makes
   the overshoot worse, not better. Use a static trim plus your own limiter.
Building the soundtrack takes ~10 s. Do it in a Web Worker and show a
"preparing sound" state, or the title card freezes.

=== PREVIEW ===
preview.html + src/main.js. Canvas object-fit contain on black. It must feel
like a film: no scrub bar, no timeline, no editor chrome. Allow only:
  click or Space -> play / pause / resume      R -> replay
  M or a sound button -> mute / unmute         F -> fullscreen
The transport fades out during playback and returns on mouse move. A title card
and an end card with "Watch again".
Start the picture automatically where the browser allows it. Where sound needs
a gesture, show a clearly visible "PLAY WITH SOUND" control that starts picture
and sound together from 0:00. Never claim audible autoplay works if it was
blocked - implement both paths and test both.
The audio clock is the master while it runs; the picture follows it.
Expose window.__tabbi = { ready, duration, fps, seek(t), renderFrame(n) } for
the exporter. Hide all UI when the URL has ?render=1.

=== EXPORT ===
tools/render.mjs drives the SAME page the preview uses:
for each frame n, call window.__tabbi.renderFrame(n) then read
canvas.toDataURL('image/png') and pipe the bytes straight into ffmpeg's
image2pipe. No intermediate files, no wall clock, no drift.
Measured cost: PNG via toDataURL is ~58 ms/frame - about 30 minutes for 9000
frames, and lossless. Screenshot APIs are 3x slower for the same result.
  ffmpeg -f image2pipe -framerate 30 -i pipe:0 -i audio.wav
         -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p
         -af volume=-0.9dB -c:a aac -b:a 256k -ar 48000 -ac 2
         -shortest -movflags +faststart out.mp4
Support --from= and --to= so a 60-second preview can be cut in 4 minutes
before committing to the full pass. Render the preview FIRST, every time.

=== INSPECTION - do not skip this ===
Build two tools before you build the episode:
  tools/snap.mjs   seek to a list of timestamps and save PNGs
  tools/sheet.mjs  tile those PNGs into ONE contact sheet via ffmpeg
Then LOOK at a contact sheet after every act. Inspecting frames one at a time
is how this goes slowly. Expect to fix framing on your first pass of every
single act - cropped heads, text off-screen, characters behind furniture,
props floating in mid-air because you positioned them by eye.
Also build tools/errsweep.mjs: seek through the whole timeline and report any
shot that throws. Wrap each shot's draw in try/catch so one bad shot paints a
visible error card instead of killing the render.

=== ACCEPTANCE - verify, do not assume ===
1. Timeline sums to exactly 300.000 s. Assert it in code.
2. Error sweep over the whole timeline reports zero shot errors.
3. You have LOOKED at contact sheets from every act and fixed the framing.
4. You have stepped through consecutive frames across a fast transition and a
   long hold to confirm they actually animate.
5. Preview tested at 390x844 and at desktop width: play, pause holds the time,
   resume, mute, unmute, end card, replay, no horizontal overflow.
6. Both autoplay paths exercised.
7. MP4 verified with ffmpeg: 5:00.00, 1920x1080, 30 fps, audio stream present.
8. Loudness measured on the ENCODED file: about -16 LUFS, true peak <= -1 dBTP.
9. No placeholders, no TODOs, no external assets anywhere.
Also produce a 1280x720 thumbnail drawn with the same character code, and a
post package: title, description with chapter timestamps, and tags.

Report honestly. If you cannot verify something - for example you have no
audio output and cannot judge whether a joke lands on the beat - say exactly
that. Never claim a render, a mix or a visual check passed unless you actually
performed it.
```
