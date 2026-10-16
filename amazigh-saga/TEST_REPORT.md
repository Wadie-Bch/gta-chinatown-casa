# Test report: Amazigh Saga, War Against the Stars

Each claim below comes from a command that was actually run. Outputs are quoted or
summarised from the real logs. Anything that was **not** tested is listed at the end.

## Environment

| Item | Value |
|---|---|
| Machine | Cloud Linux container, Ubuntu 24.04.5, 4 vCPU, 15 GB RAM, **no GPU** |
| Godot | Official **4.4.1-stable** Linux x86_64 build (`4.4.1.stable.official.49a5bc7b6`) |
| Renderer | Compatibility (OpenGL 3.3 path) on **Mesa 25.2.8 llvmpipe** (software OpenGL 4.5) |
| Display | Xvfb virtual display (`xvfb-run`) |
| Encoder | FFmpeg 6.1.1 with libx264 and the native AAC encoder |

Godot was not pre-installed. The official binary was downloaded from the Godot GitHub
release and checked against the release's `SHA512-SUMS.txt`:

```
$ sha512sum godot.zip
ef4e76880a514257175544952c61191106fdef3095b909bafed9fcbeb230c3e5533920a0f3012882dd4bbde83028a67549825794e2d2c3cf76eba7918b71370e  godot.zip
# matches: Godot_v4.4.1-stable_linux.x86_64.zip in SHA512-SUMS.txt
$ godot --version
4.4.1.stable.official.49a5bc7b6
```

## 1. Graphics capability check

```
$ xvfb-run -a -s "-screen 0 1280x1400x24" godot --path rtest --rendering-driver opengl3 \
      --resolution 720x1280 --write-movie out/frame.png --fixed-fps 30 --quit-after 5
OpenGL API 4.5 (Core Profile) Mesa 25.2.8-0ubuntu0.24.04.4 - Compatibility - Using Device: Mesa - llvmpipe (LLVM 20.1.2, 256 bits)
Movie Maker mode enabled, recording movie at 30 FPS...
$ file out/frame00000003.png
PNG image data, 720 x 1280, 8-bit/color RGBA, non-interlaced
```

Result: Godot can render real 3D frames here (software rasteriser), so graphical
execution and Movie Maker capture are available.

## 2. Project import and script validation

```
$ godot --headless --path amazigh-saga --import
reimport: Cinzel-Variable.ttf, Inter-ExtraBold.otf, Inter-SemiBold.otf, icon.svg
update_script_paths_documentation: 15 scripts
```

No import or parse errors. `--check-only --script` on each file reports only
`Identifier not found: Sfx`. That is expected: autoload singletons are not registered
in `--script` mode, and every full run of the game loads all scripts without errors.

```
$ godot --headless --path amazigh-saga --fixed-fps 60 --quit-after 600 -- --demo
Godot Engine v4.4.1.stable.official.49a5bc7b6
(no SCRIPT ERROR / ERROR lines)
```

## 3. Automated combat tests (headless, real scene)

```
$ godot --headless --path amazigh-saga --fixed-fps 60 res://tests/test_runner.tscn ; echo exit=$?
PASS  test_project_and_input_map  11 actions bound (WASD, J/LMB, K/RMB, Space, Shift, R); renderer=gl_compatibility; engine=4.4.1-stable (official)
PASS  test_scene_structure  487 meshes, 6 particle systems, 13 warrior anims, 13 creature anims
PASS  test_light_attack_hits_via_hitbox  creature hp 600 -> 582 (axe Area3D overlapped creature hurtbox)
PASS  test_attack_out_of_range_misses  swing at 6.5 m dealt no damage (no distance-only hits)
PASS  test_three_hit_combo  chain ["light1", "light2", "light3"] dealt 68
PASS  test_heavy_attack_damage_and_poise  heavy dealt 48, poise 38/100
PASS  test_poise_break_staggers  poise broke -> STAGGER; follow-up hit dealt 23.4 (x1.3)
PASS  test_creature_swipe_hits_player  blade hitbox struck the player: hp 100 -> 86
PASS  test_block_reduces_damage  blocked swipe: hp 100 -> 97.9 (15% chip)
PASS  test_parry_negates_and_recoils  parry: no damage, creature recoiled with 45 poise
PASS  test_dodge_iframes  i-frames returned 'dodged'; rolling through a slam took no damage
PASS  test_slam_is_unblockable  blocking a red-ring slam still costs full damage: hp 76
PASS  test_kill_kneel_finisher_victory  hp 0 -> KNEEL -> finisher -> creature DEAD -> VICTORY
PASS  test_player_death_defeat  lethal swipe -> player DEAD -> DEFEAT screen
PASS  test_restart_reloads_fresh  R reloaded the scene: player 100 hp, creature 600 hp
PASS  test_ai_defeats_passive_player  creature AI approached and killed an idle player with 7 attacks
PASS  test_demo_pilot_full_fight  pilot beat the full 600 HP creature in 21.4 s game time, 86 hp left
PASS  test_touch_button_triggers_attack  tapping on-screen LIGHT at (1146.56, 1140.0) dealt 18 damage
RESULT: 18/18 passed
exit=0
```

How the tests work: each test instantiates `scenes/main.tscn`. It drives the warrior
by injecting `InputEventAction` events (the same path as keyboard, mouse, gamepad and
touch) and drives the creature through its normal attack entry point. Damage only
happens when an attack's `Area3D` hit box overlaps the target's hurt box during its
active frames. The out-of-range test shows that hits are not distance checks.

## 4. Deterministic gameplay log used for the video

```
# printed by the final Movie Maker render (tools/render_video.sh passes --log)
[t=  2.08s frame=  62] FIGHT begins
[t=  2.68s frame=  80] creature attack slam (unblockable) dist=3.86
[t=  3.67s frame= 110] player defended: dodge
[t=  4.75s frame= 142] player hit -> hit dmg=18 creature hp=252/270 poise=9
[t=  4.97s frame= 150] player hit -> hit dmg=20 creature hp=232/270 poise=18
[t=  5.09s frame= 154] creature attack swipe_r (parryable) dist=2.02
[t=  5.32s frame= 161] player hit -> hit dmg=30 creature hp=202/270 poise=34
[t=  5.82s frame= 179] player defended: parry
[t=  6.34s frame= 198] creature STAGGERED
[t=  6.34s frame= 198] player hit -> stagger dmg=48 creature hp=154/270 poise=100
[t=  7.20s frame= 226] player hit -> hit dmg=18 creature hp=131/270 poise=100
[t=  7.42s frame= 234] player hit -> hit dmg=20 creature hp=105/270 poise=100
[t=  7.77s frame= 245] player hit -> hit dmg=30 creature hp=66/270 poise=100
[t=  8.49s frame= 270] creature attack swipe_r (parryable) dist=2.03
[t=  8.74s frame= 277] player hit -> hit dmg=48 creature hp=18/270 poise=38
[t=  9.23s frame= 295] player hp 86.0/100
[t=  9.91s frame= 317] creature BROKEN (kneeling, finisher available)
[t=  9.91s frame= 317] player hit -> kill dmg=18 creature hp=0/270 poise=38
[t=  9.97s frame= 322] finisher requested
[t= 11.77s frame= 405] VICTORY
[t= 11.77s frame= 405] creature died
```

`t=` is in-game time, which hit-stop and slow motion stretch; `frame=` is the video frame
at 30 FPS, so video time = frame / 30 (VICTORY at frame 405 = 13.5 s). The same seed gives
the same fight at 30 and 60 FPS. The seed was picked by a sweep
over 80 seed/HP combinations, keeping runs that showed a dodge, a parry, a hit taken
and a stagger within about 15 s. The video uses 45% creature HP (270 instead of 600) so
the whole encounter fits in 15 s. Test 17 above shows the pilot also beats the full
600 HP creature.

## 5. Portrait video render

```
$ tools/render_video.sh /path/to/godot
== Rendering gameplay with Movie Maker (720x1280 @ 30 FPS)
OpenGL API 4.5 (Core Profile) Mesa 25.2.8 - Compatibility - Using Device: Mesa - llvmpipe
Movie Maker mode enabled, recording movie at 30 FPS...
442 frames at 30 FPS (movie length: 00.0:00.0:14.0), recorded in 00.0:04.0:16.0 (5% of real-time speed).
== Encoding 442 frames to H.264
```

`ffprobe` on `output/amazigh_saga_combat_720x1280.mp4`:

```
$ ffprobe -count_frames ... output/amazigh_saga_combat_720x1280.mp4
codec_name=h264 (H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10)   profile=High
width=720   height=1280   sample_aspect_ratio=N/A (square pixels)   pix_fmt=yuv420p
r_frame_rate=30/1   avg_frame_rate=30/1   nb_read_frames=442
audio: codec_name=aac   sample_rate=48000   channels=2   duration=14.733
container: mov,mp4   duration=14.733333 s   size=12,302,401 bytes   bit_rate≈6.7 Mb/s

$ ffmpeg -i ... -af volumedetect -f null -
mean_volume: -15.7 dB    max_volume: -4.7 dB      (no clipping)

$ ffmpeg -v error -i ... -f null -        # full decode
(no errors, exit 0)
```

| Requirement | Required | Measured |
|---|---|---|
| Container | MP4 | mov/mp4 (`+faststart`) |
| Video codec | H.264/AVC | H.264 High profile, yuv420p |
| Resolution | exactly 720 × 1280 | 720 × 1280, square pixels |
| Aspect | 9:16 portrait | 720/1280 = 9:16 |
| Frame rate | 30 FPS | 30/1 (constant) |
| Duration | ~10–15 s | 14.73 s (442 frames) |
| Audio | optional | AAC stereo 48 kHz, the game's own mix |

**Determinism:** the video was rendered twice from the same seed (before and after the
final touch-layout fixes, which do not affect the demo view). Sampled frames 0, 60, …, 441
are byte-identical between the two renders (MD5 match 9/9).

## 6. Visual verification

Rendered frames were inspected as contact sheets after each render pass:

- **Intro:** title card, descent beam, creature lands with a shockwave; HUD bars appear only after landing.
- **Fight:** EVADED on the slam roll, the yellow telegraph ring, damage numbers,
  hit counter, PARRY!, STAGGERED!, the player's HP bar dropping with a red damage vignette.
- **Finisher:** BROKEN! with the "[ K ] FINISH IT" prompt, letterboxed side camera,
  leaping axe strike in slow motion, SLAIN, disintegration.
- **Ending:** VICTORY, subtitle and restart hint.
- **Portrait framing:** warrior in the lower third, creature in the centre, bars inside
  safe margins (boss bar at y≈150–236, player bar at y≈968–1032 on a 1280-high frame),
  no stretching and no black bars outside the finisher letterbox.

Additional renders checked the other presentations (`output/preview_layouts.jpg`):

- **Portrait with touch controls** (`-- --touch --no-intro`): virtual stick and LIGHT /
  HEAVY / DODGE / BLOCK buttons along the bottom. The first check showed the controls
  covering the player's health bar; the layout was fixed (bar moves under the boss bar)
  and re-rendered to confirm.
- **Hit-box debug view** (`-- --hitboxes`): red attack boxes follow the axe and the
  creature's blades; the axe box overlaps the creature's green hurt capsule on the frame
  the log records the hit (frame 78 of that run).
- **Landscape 1280x720 desktop layout** (`-- --demo` in a 1280x720 window): over-the-shoulder
  camera, boss bar top centre, player bar bottom left, controls hint bottom right, with the
  same intro, PARRY! and damage feedback.

## 7. Problems found by testing and fixed

| Found by | Problem | Fix |
|---|---|---|
| Pose contact sheets | Headwrap hid the eyes (read as a helmet); creature too dark and blobby; stagger pose sank into the floor | Re-modelled the face band, recoloured and re-proportioned the creature, new stagger/slam poses |
| Combat log | Demo pilot idled through the creature's recovery | Pilot now punishes recovery frames |
| Combat log | An attack pressed during a combo, just as the creature broke, became a normal swing instead of the finisher | `Warrior._attacking` now checks for the finisher before chaining |
| Test suite | Pilot beat the full-HP creature without taking a hit (light hits stun-locked it) | Hyper-armour against light hits, counter-swipe under pressure, shorter stagger, less poise per hit |
| Audio analysis | Mix peaked at 0.0 dBFS (clipping) | −4 dB Master bus with an `AudioEffectHardLimiter` at −1 dB; final peak −4.7 dB |
| Frame review | Large white discs over hits, dust and the victory shot | Traced by A/B render to Godot 4.4.1 Compatibility ignoring per-particle scale for `BILLBOARD_PARTICLES` (confirmed with a minimal repro); particle size is now baked into the quad mesh; glow restricted to tight levels |
| Headless run | "Non-equal opposite anchors" HUD warnings | Removed manual size writes on anchored controls |
| Touch render | On-screen controls covered the player's health bar in portrait | Touch-mode HUD layout: player bar under the boss bar, controls at the bottom edge |
| Landscape render | Keyboard hint showed during the demo (HUD not re-laid out after flags changed) | HUD re-layout after configuration |

## Not tested / limitations

- **No physical GPU.** All rendering went through the llvmpipe software rasteriser at
  about 0.33 s per 720x1280 frame. Real-time frame rate on GPU hardware was not measured.
- **No human hands-on play session.** Without a GPU the game runs far below real time
  here, so nobody played it interactively with a keyboard, mouse or gamepad. Gameplay was
  verified through injected input actions (tests and the demo pilot). The mouse-look and
  gamepad-stick camera code paths were not exercised by any test.
- **Touch** was exercised by feeding `InputEventScreenTouch` to the on-screen controls
  (test 18) and by a rendered portrait still. It was not run on a real phone, and no
  Android or iOS export was built.
- **Audio** was verified by measurement (track present, levels, no clipping), not by listening.
- The **video fight uses 45% creature HP** so it fits in 15 s; the default game uses 100%.
- On quit, Godot prints `ObjectDB instances leaked at exit`. The leaked objects are
  `AudioStreamPlaybackWAV` instances still registered with the audio mixer when the
  process exits mid-sound. This is cosmetic, has no effect during play, and was left as is.
