# Amazigh Saga: War Against the Stars

A short, cinematic third-person 3D combat encounter built in **Godot 4 with GDScript only**.
Idir, an original warrior of the Atlas, faces the Star-Eater, a creature that tears
through the dusk sky and lands in an ancient mountain arena.

Everything is procedural: the low-poly characters, arena, mountains, effects, the
animation clips (built as native `Animation` resources played by `AnimationPlayer`),
and every sound effect and drum loop (synthesised into `AudioStreamWAV` at start-up).

Rendered gameplay: [`output/amazigh_saga_combat_720x1280.mp4`](output/amazigh_saga_combat_720x1280.mp4)
(720x1280, 30 FPS, H.264, 14.7 s), with frame previews in `output/preview_*.jpg`.

## Requirements

- Godot **4.4 or newer** (developed and tested with the official 4.4.1-stable build).
- Any GPU with OpenGL 3.3 / OpenGL ES 3.0. The project uses the **Compatibility**
  renderer so it runs on desktops, laptops, phones and even software rendering.

## Run it

- **Editor:** open Godot, *Import*, pick `amazigh-saga/project.godot`, press **F5**.
- **Command line:**

  ```sh
  godot --path amazigh-saga                       # landscape 1280x720
  godot --path amazigh-saga -- --portrait         # 9:16 phone-style window
  godot --path amazigh-saga -- --demo             # watch the AI pilot fight
  ```

The first time, Godot imports the fonts and builds its class cache. When running
from the CLI without ever opening the editor, run
`godot --headless --path amazigh-saga --import` once first.

## Controls

| Action | Keyboard / mouse | Gamepad | Touch |
|---|---|---|---|
| Move | W A S D / arrows | Left stick | Left virtual stick |
| Camera | Mouse (click to capture, Esc to release) | Right stick | (auto-framing) |
| Light attack (3-hit combo) | J / Left mouse | X / Square | LIGHT |
| Heavy attack | K / Right mouse | Y / Triangle | HEAVY |
| Dodge roll | Space | A / Cross | DODGE |
| Block / parry | Shift (hold) | LB / RB | BLOCK (hold) |
| Finish the broken creature | Light or heavy attack when the prompt shows | same | LIGHT |
| Restart | R | Start | Tap the end screen |

Touch controls appear automatically on touchscreen devices (or with `-- --touch`). In a
portrait window they sit along the bottom edge and the player's health bar moves up under
the boss bar so nothing overlaps.

## How the fight works

- **Light attacks** chain into a three-hit combo (18 / 20 / 30 damage). **Heavy**
  is slower, hits for 48 and breaks the creature's poise faster, with a ground shockwave.
- Hits are real: the axe carries an `Area3D` hit box that has to overlap the creature's
  hurt box during the swing's active frames. Swing at air and nothing happens.
- The creature telegraphs every attack with a ring above its head:
  - **Yellow ring** (scythe swipes): block to take 15% chip damage, or raise the shield
    in the last ~0.24 s before impact to **PARRY**. That negates the hit and makes it recoil.
  - **Red ring** (overhead slam, leaping lunge): the slam cannot be blocked. **Dodge**:
    the roll has invulnerability frames.
- Filling the **poise bar** (under its health bar) **staggers** it: it drops to a knee and
  takes 30% extra damage. It shrugs off light hits while stalking (hyper-armour) and
  counter-swipes if you pressure it carelessly.
- At zero health it is **BROKEN** and kneels. Attack while close to trigger the
  **finishing attack**: a slow-motion leaping axe strike, then it disintegrates into starlight.
- Fall to zero health yourself and the stars win. **R** restarts instantly either way.

## Portrait (9:16) mode

The game picks its layout from the window shape. In a tall window it switches to a
dedicated portrait presentation, not a crop:

- a portrait camera (fixed horizontal FOV) placed behind the warrior so he holds the lower
  third and the creature towers in the centre of the frame;
- a 720x1280 HUD layout with the health bars inside phone safe margins (about 150 px top,
  250 px bottom), large text and readable effects.

## Command-line options

Pass after `--`:

| Option | Effect |
|---|---|
| `--demo` | An AI pilot plays by pressing the same input actions a player would |
| `--portrait` / `--landscape` | Force a layout (default: from window shape) |
| `--touch` / `--no-touch` | Force on-screen controls |
| `--seed=N` | Seed for the creature's decisions |
| `--hp-scale=F` | Scale the creature's 600 HP (the video uses 0.45 to fit 15 s) |
| `--no-intro` | Skip the descent intro |
| `--hitboxes` | Draw hit boxes (red) and hurt boxes (green) |
| `--log` | Print a timestamped combat log |
| `--quit-after-end=S` | Quit S seconds after victory/defeat (used for recording) |

## Rendering the portrait video

```sh
amazigh-saga/tools/render_video.sh /path/to/godot
```

The script runs the real game in Godot's **Movie Maker** mode at a fixed 30 FPS in a
720x1280 window, with the demo pilot playing seed 33. It writes PNG frames plus the game's
own audio mix as WAV, then encodes `output/amazigh_saga_combat_720x1280.mp4`
(H.264 High, yuv420p, AAC). It uses `xvfb-run` automatically when there is no display.

## Tests

```sh
godot --headless --path amazigh-saga --fixed-fps 60 res://tests/test_runner.tscn
```

18 automated tests spawn the real scene and drive it through input actions: hit-box
damage, out-of-range misses, combo chaining, heavy/poise, stagger, creature hits, block,
parry, dodge i-frames, unblockable slam, kill → kneel → finisher → victory,
death → defeat, R-restart, the AI beating a passive player, the pilot beating the full-HP
creature, and the touch buttons. See `TEST_REPORT.md` for the recorded results.

## Project layout

```
project.godot            Godot 4 project (Compatibility renderer, input map, autoload)
scenes/main.tscn         Arena, fighters, camera rig, FX layer, HUD
scenes/warrior.tscn      Player CharacterBody3D, collision, hurt box, AnimationPlayer
scenes/star_eater.tscn   Creature CharacterBody3D, collision, hurt box, AnimationPlayer
scripts/main.gd          Game flow: intro, fight, finisher, victory/defeat, restart, layout
scripts/warrior.gd       Player model, poses, animations, movement, combat
scripts/star_eater.gd    Creature model, poses, animations, AI, telegraphs, death
scripts/arena.gd         Procedural arena, lighting, sky, fog, mountains, ruins
scripts/camera_rig.gd    Boss camera, portrait framing, shake, cinematic shots
scripts/fx.gd            Particles, shockwaves, damage numbers, hit-stop, slow motion
scripts/hud.gd           Landscape and portrait HUD layouts
scripts/sfx.gd           Procedural audio synthesis (autoload)
scripts/demo_pilot.gd    Input-driven AI pilot used for the recording
scripts/touch_controls.gd On-screen stick and buttons
shaders/                 Sky, arena floor, rammed-earth walls, banners, shield, rift
tests/test_runner.*      Headless combat test suite
tests/pose_viewer.*      Development tool that renders animation contact sheets
tools/render_video.sh    Movie Maker render + FFmpeg encode
output/                  The rendered MP4
```

## Art direction and cultural note

The palette follows the Atlas at dusk: terracotta, ochre stone, bronze and deep indigo
against a cold star-filled sky. The warrior's indigo headwrap, the zigzag and lozenge
patterns on the floor, banners and shield, and the rammed-earth kasbah towers are
**fictional, Amazigh-inspired design elements** made for this prototype. The characters,
the creature and the story are original fiction. Nothing here claims to depict actual
Amazigh mythology, history or symbolism.

## Credits

- Engine: [Godot Engine](https://godotengine.org) 4.4.1 (MIT).
- Fonts: Cinzel (SIL Open Font License, `assets/fonts/Cinzel-OFL.txt`) and Inter
  (SIL Open Font License, `assets/fonts/Inter-LICENSE.txt`).
- All models, animations, textures (shaders), effects, music and sound: procedurally
  generated by this project's code.
