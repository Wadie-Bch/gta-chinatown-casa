# CASA WARS

A top-down 2.5D action game in the spirit of *GTA: Chinatown Wars*, set in a
fictional Casablanca. One HTML file, canvas 2D, no runtime dependencies, no
build step needed to play.

**The city is calm until you pull the trigger.** Walk the medina, jack a petit
taxi, watch the traffic. The session only starts when you fire the first shot —
then every civilian screams and every cop in the wilaya comes for you. Drop
**45 targets** before they drop you.

## Play

Open `index.html` in any browser, or serve it:

```
npm run start        # http://localhost:8080
```

## Controls

The game detects the device and swaps the control scheme at runtime, including
on orientation change.

**Desktop** — `WASD`/arrows move · mouse aims · click or `Space` fires ·
`Shift` sprints · `E` jacks or exits a vehicle · `1`–`4` / `Q` / scroll switch
weapon · `M` or `Tab` opens the city map · `Esc` pauses.

**Touch** — twin sticks: left moves, right aims and fires. A dedicated `FIRE`
button fires with auto-aim assist so one-thumb play works. `CAR` jacks and
exits, `GUN` cycles weapons, `MAP` and pause sit at the top, out of thumb
range. The HUD restacks between portrait and landscape.

## The map

The world is a fictional Casablanca that follows the real city's geography:
the Atlantic on the north-west, the port and Ancienne Médina behind it,
boulevards radiating from the centre, Maârif and Anfa to the south-west, the
Corniche running down to Aïn Diab and Dar Bouazza, the industrial east through
Roches Noires, Aïn Sebaâ and Sidi Bernoussi, and the rocade sweeping around the
southern periphery to Bouskoura and Nouaceur.

Thirty-eight districts are generated with their own urban fabric — packed
medina lots, Maârif's grid, Anfa's villas and gardens, industrial sheds in Aïn
Sebaâ, dense derb blocks — plus hand-placed landmarks (Hassan II, Twin Center,
Casa Port, Casa Voyageurs, Stade Mohammed V, Morocco Mall, Phare El Hank).
Everything is generated from a fixed seed, so the city is identical for every
player.

## How it's built

- `src/app.html` — the whole game: styles, markup, and engine.
- `build.mjs` — wraps that into a standalone `index.html`.
- `tests/` — Playwright checks: smoke test across three viewports, HUD overlap
  and layout checks, driving, and the win/restart path.

```
npm run build
npm test             # set CHROME_PATH to reuse an installed browser
```

The renderer is a fake-3D extrusion: building walls are projected away from the
screen centre so the city leans outward at the edges, with a fixed sun casting
shadows. It is path-count bound rather than fill bound, so quality adapts at
runtime — the game sheds geometric detail first, then backing-store resolution,
to hold frame rate on weaker hardware.

## Deployment

Pushing publishes `index.html` to GitHub Pages via
`.github/workflows/pages.yml`.

**One-time setup:** open
<https://github.com/Wadie-Bch/gta-chinatown-casa/settings/pages> and set
**Build and deployment → Source** to **GitHub Actions**. Until that is set the
build job passes and the deploy job fails with `404 Not Found`, because the
Pages site does not exist yet. Re-run the workflow after enabling it and the
game goes live at
`https://wadie-bch.github.io/gta-chinatown-casa/`.

## Note

Casablanca here is a parody. No real people, businesses, plates or addresses
are depicted, and the layout is deliberately approximate.
