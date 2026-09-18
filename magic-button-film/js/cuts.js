/**
 * The shot list.
 *
 * Every entry is a real change of composition — a different set, camera, or
 * physical action — not a zoom on the same card. Shots are anchored to spoken
 * words so an edit can land inside a sentence.
 *
 *   seg / word / nth / off  -> anchor on the nth occurrence of a word
 *   seg / at | frac | tail  -> anchor by seconds / fraction / after the segment
 *   fx                      -> incoming transition: cut, push, wipe, flash, freeze
 *   sfx                     -> [{ t: secondsIntoCut, n: name, g: gain }]
 */
export const CUTS = [
  // ---------------------------------------------------------------- ch1
  { abs: 0, set: 'desk', view: 'macro', pressAt: 6.2, pushIn: 1.10, fx: 'cut' },
  { seg: 's01', word: 'making', set: 'props', view: 'cardboard', swingAt: 99, fx: 'push' },
  { seg: 's01', word: 'write', set: 'composer', view: 'compose', fx: 'wipe',
    prompt: 'Build me a small courier game. Collect three parcels, dodge traffic, reach the van.',
    typeFrom: 0.1, typeTo: 2.6, sendAt: 99, sfx: [{ t: 0.15, n: 'type' }] },
  { seg: 's01', word: 'click', set: 'desk', view: 'press', pressAt: 0.22, pushIn: 1.06, fx: 'cut',
    sfx: [{ t: 0.24, n: 'keydown' }, { t: 0.54, n: 'keyup' }] },
  { seg: 's01', word: 'suddenly', set: 'city', view: 'dive', z0: 14, speed: 15, cars: 10,
    crossTraffic: true, fx: 'flash', sfx: [{ t: 0.0, n: 'whoosh', g: 0.5 }] },
  { seg: 's01', word: 'beautiful', set: 'city', view: 'chase', z0: 60, speed: 15, cars: 11, rise: 1.2, fx: 'cut' },

  { seg: 's02', at: 0.0, set: 'city', view: 'street', z0: 96, speed: 15, side: 1, cars: 12,
    carClear: 7, fx: 'cut' },
  { seg: 's02', word: 'future', set: 'city', view: 'lowfront', z0: 120, speed: 13, cars: 9, carClear: 12, fx: 'push' },
  { seg: 's02', word: 'settings', set: 'props', view: 'knob', detachAt: 0.45, label: 'IT CAME OFF',
    fx: 'cut', sfx: [{ t: 0.45, n: 'snap' }, { t: 0.95, n: 'roll' }] },
  { seg: 's02', word: 'question', set: 'props', view: 'cardboard', swingAt: 0.25, label: 'FOUR MILLIMETRES',
    fx: 'wipe', sfx: [{ t: 0.3, n: 'card' }] },
  { seg: 's02', word: 'click', set: 'desk', view: 'press', pressAt: 0.18, finger: false, ring: false,
    fx: 'freeze', sfx: [{ t: 0.2, n: 'keydown', g: 0.8 }] },
  { seg: 's02', word: 'thumbnail', set: 'props', view: 'thumb', showAt: 0.75, label: 'ONE CLICK',
    fx: 'cut', sfx: [{ t: 0.78, n: 'stamp' }] },

  // ---------------------------------------------------------------- ch2
  { seg: 's03', at: 0.0, set: 'desk', view: 'wide', label: 'ONE BUTTON', fx: 'wipe' },
  { seg: 's03', word: 'play', set: 'props', view: 'onebutton', label: 'NOT THIS', fx: 'cut',
    sfx: [{ t: 0.55, n: 'thock' }, { t: 1.35, n: 'thock' }, { t: 2.15, n: 'thock' }] },
  { seg: 's03', word: 'means', set: 'composer', view: 'compose', fx: 'push',
    prompt: 'Build me a small courier game. Collect three parcels, dodge traffic, reach the van.',
    typeFrom: -3, typeTo: -2, sendAt: 2.1, caption: 'THIS', sfx: [{ t: 2.12, n: 'click' }] },
  { seg: 's03', word: 'Send', set: 'desk', view: 'press', pressAt: 0.18, pushIn: 1.12, fx: 'cut',
    sfx: [{ t: 0.2, n: 'keydown' }, { t: 0.5, n: 'keyup' }] },
  { seg: 's03', word: "machine's", set: 'assembly', view: 'line', arms: 3, speed: 150, fx: 'wipe',
    sfx: [{ t: 0.1, n: 'motor', g: 0.35 }] },

  { seg: 's04', at: 0.0, set: 'playerdesk', failAt: 1.2, fx: 'cut' },
  { seg: 's04', word: 'jump', set: 'props', view: 'onebutton', dead: true, label: 'NOTHING', fx: 'cut',
    sfx: [{ t: 0.55, n: 'thock' }, { t: 0.62, n: 'error', g: 0.5 }, { t: 1.35, n: 'thock' }, { t: 1.42, n: 'error', g: 0.5 }] },
  { seg: 's04', word: 'dawns', set: 'desk', view: 'tickets', fx: 'push',
    sfx: [{ t: 1.05, n: 'paper' }, { t: 1.5, n: 'paper' }, { t: 1.95, n: 'paper' }, { t: 2.5, n: 'thud' }] },

  // ---------------------------------------------------------------- ch3
  { seg: 's05', at: 0.0, set: 'city', view: 'overhead', z0: 40, speed: 12, cars: 12, crossTraffic: true,
    camY: 31, descend: 9, fx: 'wipe' },
  { seg: 's05', word: 'courier', set: 'city', view: 'lowfront', z0: 70, speed: 12, cars: 8, carClear: 10,
    camDist: 8.6, fx: 'push' },
  { seg: 's05', word: 'parcels', set: 'city', view: 'chase', z0: 84, speed: 14, cars: 8, pickup: true,
    parcels: [[-2, 104], [2.5, 122], [-1, 140]], gameHud: true, hudParcels: 0, fx: 'cut',
    sfx: [{ t: 1.5, n: 'pickup' }, { t: 2.9, n: 'pickup' }] },
  { seg: 's05', word: 'traffic', set: 'city', view: 'street', z0: 150, speed: 15, side: -1,
    cars: 14, crossTraffic: true, carClear: 7, fx: 'push', sfx: [{ t: 0.4, n: 'pass' }, { t: 1.7, n: 'pass' }] },
  { seg: 's05', word: 'van', set: 'city', view: 'vanwide', z0: 178, speed: 7, cars: 5, carClear: 17, lockX: -2.4, fx: 'cut' },
  { seg: 's05', word: 'document', set: 'props', view: 'card', fx: 'wipe',
    rows: ['Collect three parcels', 'Dodge the traffic', 'Reach the delivery van'],
    sfx: [{ t: 0.1, n: 'card' }] },

  { seg: 's06', at: 0.0, set: 'composer', view: 'stream', fx: 'cut',
    lines: [['tool', 'create_project(courier)'], ['tool', 'write_file(main.js)'],
            ['fail', 'x  collision: undefined'], ['say', 'Fixing the collision box…']] },
  { seg: 's06', word: 'preview', set: 'props', view: 'stamp', stampAt: 0.45, stamp: 'SIMULATED',
    stampSub: 'PREVIEW OF A PROPOSED TEST', fx: 'flash', sfx: [{ t: 0.47, n: 'stamp' }] },
  { seg: 's06', word: 'not', nth: 1, set: 'props', view: 'notest', label: 'NO MODEL HAS BEEN TESTED HERE', fx: 'wipe' },
  { seg: 's06', word: 'Nobody', set: 'bench', view: 'ten', from: 999, emptyLabel: 'NOTHING ON THE BENCH YET',
    counter: false, fx: 'push' },

  // ---------------------------------------------------------------- ch4
  { seg: 's07', at: 0.0, set: 'city', view: 'chase', z0: 30, speed: 17, cars: 12, clipTimer: true,
    crossTraffic: true, fx: 'cut' },
  { seg: 's07', word: 'prototype', set: 'city', view: 'overhead', z0: 72, speed: 17, cars: 11, camY: 30,
    descend: 8, clipTimer: true, clipRate: 4.4, fx: 'cut' },
  { seg: 's07', word: 'clip', set: 'city', view: 'lowfront', z0: 100, speed: 17, cars: 9, carClear: 12,
    camDist: 8.6, clipTimer: true, clipRate: 6.5, fx: 'push' },
  { seg: 's07', word: 'complete', set: 'workshop', view: 'workshop', label: 'THE PART NOBODY FILMS', fx: 'wipe',
    sfx: [{ t: 0.9, n: 'spark' }, { t: 1.7, n: 'spark' }, { t: 2.6, n: 'spark' }] },
  { seg: 's07', word: 'restart', set: 'diagram', failAt: 2.1, label: 'RESTART', failLabel: 'state never cleared',
    fx: 'cut', sfx: [{ t: 0.2, n: 'tick' }, { t: 1.3, n: 'tick' }, { t: 2.15, n: 'error' }] },
  { seg: 's07', word: 'settings', set: 'bench', view: 'checks', from: 0.05, step: 1,
    items: [{ g: 'pad', t: 'settings', sub: 'survive a refresh?', ok: false }], fx: 'wipe' },
  { seg: 's07', word: 'frozen', set: 'city', view: 'street', z0: 150, frozen: true, freezeX: 1.2, camZ: 151,
    side: 1, cars: 10, carClear: 7, gameOver: true, overAt: 0.35, overLabel: 'FROZEN COURIER', fx: 'freeze',
    sfx: [{ t: 0.36, n: 'error' }] },

  { seg: 's08', at: 0.0, set: 'exportdesk', view: 'boxes', swapAt: 99, fx: 'wipe' },
  { seg: 's08', word: 'browser', nth: 2, set: 'city', view: 'chase', z0: 120, speed: 16, cars: 10,
    gameHud: true, hudParcels: 3, hudBest: '0:41', fx: 'push' },
  { seg: 's08', word: 'executable', set: 'exportdesk', view: 'open', openAt: 0.35, title: 'courier.exe',
    fx: 'cut', sfx: [{ t: 0.36, n: 'window' }] },
  { seg: 's08', word: 'wrapper', set: 'exportdesk', view: 'boxes', swapAt: 0.25, openAt: 1.5,
    label: 'SAME CONTENTS', fx: 'cut', sfx: [{ t: 0.3, n: 'whoosh', g: 0.3 }, { t: 1.55, n: 'lid' }] },
  { seg: 's08', word: 'platform', set: 'props', view: 'stamp', over: 'ink', stampAt: 0.35,
    stamp: 'NOT THE TEST', stampCol: '#497BFF', fx: 'freeze', sfx: [{ t: 0.37, n: 'stamp' }] },

  // ---------------------------------------------------------------- ch5
  { seg: 's09', at: 0.0, set: 'bench', view: 'ten', range: [0, 5], cols: 5, scale: 0.95, fx: 'wipe',
    syncWords: ['start', 'movement', 'pickups', 'win', 'loss'],
    sfx: [{ t: 0.0, n: 'thud', g: 0.0 }] },
  { seg: 's09', word: 'restart', set: 'bench', view: 'ten', range: [5, 10], cols: 5, scale: 0.95, fx: 'cut',
    syncWords: ['restart', 'pause', 'volume', 'best', 'export'] },
  { seg: 's09', word: 'Ten', set: 'bench', view: 'ten', range: [0, 10], cols: 5, scale: 0.72, from: -1,
    step: 0.001, label: 'TEN THINGS', labelAt: 0.3, fx: 'push', sfx: [{ t: 0.05, n: 'thud' }] },

  { seg: 's10', at: 0.0, set: 'desk', view: 'press', pressAt: 0.9, pushIn: 1.04, fx: 'cut',
    sfx: [{ t: 0.92, n: 'keydown' }, { t: 1.2, n: 'keyup' }] },
  { seg: 's10', word: 'fan', set: 'assembly', view: 'line', arms: 3, speed: 210, fx: 'flash',
    sfx: [{ t: 0.05, n: 'motor', g: 0.4 }] },
  { seg: 's10', word: 'hundreds', set: 'assembly', view: 'line', arms: 3, speed: 260, fx: 'cut',
    counters: [
      { to: 340, label: 'TOOL CALLS', col: '#D6FF35' },
      { to: 62, label: 'MINUTES', col: '#497BFF', suffix: '' },
      { to: 0, label: 'CREDITS', col: '#FF615B', suffix: '?' },
    ] },

  // ---------------------------------------------------------------- ch6
  { seg: 's11', at: 0.0, set: 'props', view: 'lanes', label: 'SAME START', fx: 'wipe' },
  { seg: 's11', word: 'list', set: 'bench', view: 'ten', range: [0, 10], cols: 5, scale: 0.68, from: -1,
    step: 0.001, counter: false, fx: 'cut', sfx: [{ t: 0.04, n: 'thud', g: 0.6 }] },
  { seg: 's11', word: 'tools', set: 'props', view: 'lanes', tools: true, label: 'DISCLOSED', fx: 'push' },
  { seg: 's11', word: 'human', set: 'workshop', view: 'cloth', pullAt: 0.35, label: 'THERE IS ALWAYS A HAND',
    fx: 'cut', sfx: [{ t: 0.4, n: 'cloth' }] },
  { seg: 's11', word: 'rescue', set: 'props', view: 'stamp', over: 'ink', stampAt: 0.3, stamp: 'RESCUE PHASE',
    stampCol: '#FF615B', stampSub: 'COUNTED SEPARATELY', fx: 'cut', sfx: [{ t: 0.32, n: 'stamp' }] },

  // ---------------------------------------------------------------- ch7
  { seg: 's12', at: 0.0, set: 'city', view: 'chase', z0: 120, speed: 17, cars: 11, fx: 'wipe' },
  { seg: 's12', word: 'traffic', set: 'city', view: 'street', z0: 150, speed: 17, side: -1,
    cars: 13, carClear: 7, fx: 'cut', sfx: [{ t: 0.3, n: 'pass' }, { t: 1.1, n: 'pass' }] },
  { seg: 's12', word: 'van', set: 'city', view: 'vanwide', z0: 178, speed: 8, cars: 5, carClear: 17, lockX: -2.4, fx: 'cut' },
  { seg: 's12', word: 'stops', set: 'city', view: 'vanwide', z0: 181, speed: 8, cars: 4, carClear: 17, lockX: -1.6,
    stopAt: 186.6, invisibleWall: true, wallShowAt: 0.9, fx: 'push', sfx: [{ t: 0.8, n: 'bonk' }] },
  { seg: 's12', word: 'collision', set: 'city', view: 'lowfront', z0: 186.6, speed: 0, stopAt: 186.6,
    invisibleWall: true, wallShowAt: 0.1, cars: 3, carClear: 12, camDist: 9.4, camY: 2.6,
    fx: 'cut', sfx: [{ t: 0.6, n: 'bonk', g: 0.6 }] },
  { seg: 's12', word: 'dispute', set: 'city', view: 'overhead', z0: 186.6, speed: 0, stopAt: 186.6,
    invisibleWall: true, wallShowAt: 0.05, cars: 4, camY: 26, descend: 8, fx: 'cut' },

  // ---------------------------------------------------------------- ch8
  { seg: 's13', at: 0.0, set: 'playerdesk', failAt: 0.9, fx: 'wipe', sfx: [{ t: 0.92, n: 'error' }] },
  { seg: 's13', word: 'restart', set: 'playerdesk', close: true, failAt: -1, retryAt: 0.9, refailAt: 2.9,
    fx: 'cut', sfx: [{ t: 0.85, n: 'click' }, { t: 2.92, n: 'error' }] },
  { seg: 's13', word: 'Pause', set: 'city', view: 'street', z0: 150, frozen: true, freezeX: -1.5,
    trafficTime: 40, camZ: 151, side: 1, cars: 13, carClear: 7, pausePanel: true, pauseAt: 0.7, fx: 'cut',
    sfx: [{ t: 0.72, n: 'uiopen' }] },
  { seg: 's13', word: 'Mute', set: 'bench', view: 'checks', fx: 'wipe',
    syncWords: ['Mute', 'reopen', 'best'],
    items: [
      { g: 'wave', t: 'mute', sub: 'stays muted?', ok: true },
      { g: 'loop', t: 'reopen', sub: 'comes back?', ok: true },
      { g: 'disk', t: 'best score', sub: 'remembers you?', ok: false },
    ] },

  { seg: 's14', at: 0.0, set: 'city', view: 'overhead', z0: 150, frozen: true, freezeX: -1.5,
    trafficTime: 40, cars: 14, pausePanel: true, pauseAt: 0.2, camY: 26, descend: 7, fx: 'cut' },
  { seg: 's14', word: 'trucks', set: 'city', view: 'street', z0: 150, frozen: true, freezeX: -1.5,
    trafficTime: 52, camZ: 151, side: -1, cars: 14, carClear: 7, fx: 'cut',
    sfx: [{ t: 0.2, n: 'pass' }, { t: 1.2, n: 'pass' }] },
  { seg: 's14', word: 'trap', set: 'city', view: 'lowfront', z0: 150, frozen: true, freezeX: -1.5,
    trafficTime: 46, cars: 12, carClear: 10, camDist: 8.6, pausePanel: true, pauseAt: 0.05, fx: 'freeze' },

  // ---------------------------------------------------------------- ch9
  { seg: 's15', at: 0.0, set: 'bench', view: 'ten', range: [0, 10], cols: 5, scale: 0.62, dy: -40,
    from: -1, step: 0.001, counter: false, label: 'THE LIST', labelAt: 0.3, fx: 'wipe',
    sfx: [{ t: 0.05, n: 'thud', g: 0.6 }] },
  { seg: 's15', word: 'grows', set: 'bench', view: 'ship', label: 'IT GROWS', fx: 'cut',
    syncWords: ['frame', 'license'],
    items: [
      { t: 'FRAME RATE', sub: 'on a laptop nobody is proud of' },
      { t: 'LICENSES', sub: 'every asset, pointable' },
    ], sfx: [{ t: 0.4, n: 'stamp', g: 0.5 }] },
  { seg: 's15', word: 'laptop', set: 'playerdesk', close: true, fx: 'cut' },
  { seg: 's15', word: 'controls', set: 'bench', view: 'ship', fx: 'wipe',
    syncWords: ['controls', 'package'],
    items: [
      { t: 'CONTROLS', sub: 'readable and remappable' },
      { t: 'PACKAGING', sub: 'a stranger can open it' },
    ], sfx: [{ t: 0.05, n: 'stamp', g: 0.5 }] },
  { seg: 's15', word: 'stranger', set: 'exportdesk', view: 'open', openAt: 0.3, title: 'courier — build',
    label: 'IT OPENS', fx: 'push', sfx: [{ t: 0.32, n: 'window' }] },
  { seg: 's15', word: 'afternoon', nth: 1, set: 'workshop', view: 'workshop', label: 'ONE AFTERNOON', fx: 'push',
    sfx: [{ t: 0.7, n: 'spark' }, { t: 1.9, n: 'spark' }] },

  // ---------------------------------------------------------------- ch10
  { seg: 's16', at: 0.0, set: 'composer', view: 'receipt', fx: 'wipe', caption: 'THE PART NOBODY POSTS',
    rows: [
      ['prompts', '?'], ['retries', '?'], ['failed builds', '?'], ['wall clock', '?'],
      ['tools allowed', '?'], ['manual edits', '?'], ['lines rewritten', '?'], ['human minutes', '?'],
      ['credits', '?'], ['---------------', ''], ['STORY TOLD', 'one click', '#FF615B'],
    ], sfx: [{ t: 0.2, n: 'printer', g: 0.4 }, { t: 2.4, n: 'printer', g: 0.35 }, { t: 4.6, n: 'printer', g: 0.3 }] },
  { seg: 's16', word: 'tools', set: 'composer', view: 'receipt', zoom: 1.7, fx: 'cut',
    rows: [
      ['prompts', '?'], ['retries', '?'], ['failed builds', '?'], ['wall clock', '?'],
      ['tools allowed', '?'], ['manual edits', '?'], ['lines rewritten', '?'], ['human minutes', '?'],
      ['credits', '?'], ['---------------', ''], ['STORY TOLD', 'one click', '#FF615B'],
    ], sfx: [{ t: 0.1, n: 'printer', g: 0.3 }] },
  { seg: 's16', word: 'lines', set: 'workshop', view: 'workshop', fx: 'wipe',
    sfx: [{ t: 0.5, n: 'spark' }, { t: 1.6, n: 'spark' }] },
  { seg: 's16', word: 'prompt', nth: 1, set: 'desk', view: 'press', pressAt: 0.35, pushIn: 1.03, finger: false,
    fx: 'cut', sfx: [{ t: 0.37, n: 'keydown' }] },
  { seg: 's16', word: 'carried', set: 'props', view: 'lanes', push: true, pushAt: 0.3,
    label: 'DIFFERENT STORY', fx: 'cut', sfx: [{ t: 0.4, n: 'drag', g: 0.4 }] },
  { seg: 's16', word: 'stories', set: 'playerdesk', emptyAt: 0.55, label: 'NOBODY BACK HERE', fx: 'push' },

  // ---------------------------------------------------------------- ch11
  { seg: 's17', at: 0.0, set: 'bench', view: 'ten', from: 999, emptyLabel: 'NO WINNER DECLARED HERE',
    counter: false, fx: 'wipe' },
  { seg: 's17', word: 'run', set: 'props', view: 'lanes', empty: true, label: 'NOT RUN', fx: 'cut' },
  { seg: 's17', word: 'course', set: 'props', view: 'stamp', over: 'ink', stampAt: 0.3, stamp: 'NO RESULTS',
    stampCol: '#FF615B', stampSub: 'NOTHING HAS BEEN BENCHMARKED', fx: 'cut', sfx: [{ t: 0.32, n: 'stamp' }] },
  { seg: 's17', word: 'delete', set: 'assembly', view: 'line', arms: 3, speed: 300,
    parts: ['boilerplate', 'scaffolding', 'glue code', 'input handling', 'asset loading'],
    fx: 'flash', sfx: [{ t: 0.05, n: 'motor', g: 0.45 }] },
  { seg: 's17', word: 'amount', set: 'assembly', view: 'line', arms: 3, speed: 300, vanish: true,
    parts: ['boilerplate', 'scaffolding', 'glue code', 'input handling', 'asset loading'],
    label: 'REAL WORK, REMOVED', fx: 'cut' },
  { seg: 's17', word: 'verbs', set: 'city', view: 'chase', z0: 150, speed: 18, cars: 10, fx: 'cut' },
  { seg: 's17', word: 'magic', set: 'desk', view: 'reveal', liftAt: 0.7, fx: 'wipe',
    sfx: [{ t: 0.72, n: 'lid' }, { t: 1.4, n: 'motor', g: 0.3 }] },
  { seg: 's17', word: 'finishes', set: 'city', view: 'vanwide', z0: 183, speed: 3.6, cars: 4, carClear: 17, lockX: -1.2,
    vanOpen: true, gameHud: true, hudParcels: 3, fx: 'cut', sfx: [{ t: 1.2, n: 'win' }] },
  { seg: 's17', tail: 0.35, set: 'props', view: 'endcard', fx: 'freeze',
    lines: ['THE MAGIC BUTTON STARTS THE WORK', 'whether it finishes the work is the test',
            'simulated preview — no model was benchmarked'] },
];
