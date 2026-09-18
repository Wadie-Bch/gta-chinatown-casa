/**
 * Shot list — "I Gave AI $1 And Told It To Survive".
 *
 * Rule for this episode: every shot is a physical object doing something.
 * The agent is a machine with a coin hopper; "balance" is a real pair of
 * scales; thinking posts a coin into a slot; the receipt is a paper tape
 * coming out of a printer. Text appears only ON objects (plates, signage,
 * printed lines) — never as the subject of the frame.
 */
export const CUTS = [
  // ---------------------------------------------------------------- ch1
  { abs: 0, set: 'robot', view: 'hopper', coins: 100, plate: false, fx: 'cut' },
  { seg: 's01', word: 'dollar', nth: 1, set: 'robot', view: 'wide', coins: 100, fx: 'push',
    sfx: [{ t: 0.1, n: 'thud' }] },
  { seg: 's01', word: 'told', set: 'robot', view: 'low', coins: 100, fx: 'cut',
    sfx: [{ t: 0.25, n: 'uiopen' }] },
  { seg: 's01', word: 'survive', set: 'robot', view: 'side', coins: 100, walking: true, fx: 'cut' },
  { seg: 's01', word: 'safety', set: 'wallet', view: 'twenty', label: 'NO TOP-UPS', fx: 'wipe',
    sfx: [{ t: 0.8, n: 'snap' }] },

  { seg: 's02', at: 0.0, set: 'cards', view: 'stamp', text: 'THOUGHT EXPERIMENT', stampAt: 0.3,
    sub: 'NOT A BENCHMARK', fx: 'cut', sfx: [{ t: 0.32, n: 'stamp' }] },
  { seg: 's02', word: 'numbers', set: 'scales', leftCoins: 0, rightCoins: 0, tiltFrom: 0.04, tiltTo: -0.03,
    tipFrom: 0.2, tipTo: 2.2, leftLabel: 'COSTS', rightLabel: 'EARNED', plate: 'NOTHING WEIGHED YET', fx: 'wipe' },
  { seg: 's02', word: 'through', set: 'scales', leftCoins: 0, rightCoins: 0, tiltFrom: -0.03, tiltTo: 0.02,
    tipFrom: 0.1, tipTo: 2.0, leftLabel: 'COSTS', rightLabel: 'EARNED', fx: 'push' },

  // ---------------------------------------------------------------- ch2
  { seg: 's03', at: 0.0, set: 'robot', view: 'side', coins: 100, fx: 'wipe' },
  { seg: 's03', word: 'hungry', set: 'robot', view: 'hopper', coins: 100, plate: false, fx: 'cut' },
  { seg: 's03', word: 'definition', set: 'scales', leftCoins: 8, rightCoins: 8, tiltFrom: -0.12, tiltTo: 0,
    tipFrom: 0.15, tipTo: 1.6, leftLabel: 'COSTS', rightLabel: 'EARNED', plate: 'STAY ABOVE ZERO', fx: 'push',
    sfx: [{ t: 1.5, n: 'tick' }] },

  { seg: 's04', at: 0.0, set: 'slot', coins: [{ t: 0.35, x: -8 }], counterBase: 0, slotLabel: 'ONE THOUGHT',
    fx: 'cut', sfx: [{ t: 0.78, n: 'thock' }] },
  { seg: 's04', word: 'plan', set: 'slot', coins: [{ t: 0.1, x: 10 }, { t: 0.85, x: -14 }, { t: 1.6, x: 4 }],
    counterBase: 1, slotLabel: 'EVERY MESSAGE', fx: 'cut',
    sfx: [{ t: 0.52, n: 'thock' }, { t: 1.27, n: 'thock' }, { t: 2.02, n: 'thock' }] },

  // ---------------------------------------------------------------- ch3
  { seg: 's05', at: 0.0, set: 'robot', view: 'hopper', coinsFrom: 100, coinsTo: 92,
    drops: [{ t: 0.5, x: 0.1, y0: 1.5, vx: 0.7, z: 0.3 }, { t: 1.2, x: 0.2, y0: 1.5, vx: 1.0, z: 0.1 },
            { t: 1.9, x: 0.0, y0: 1.5, vx: 0.5, z: 0.4 }],
    fx: 'wipe', sfx: [{ t: 0.95, n: 'tick' }, { t: 1.65, n: 'tick' }, { t: 2.35, n: 'tick' }] },
  { seg: 's05', word: 'nine', nth: 1, set: 'slot',
    coins: [{ t: 0.05, x: 0 }, { t: 0.5, x: -12 }, { t: 0.95, x: 9 }, { t: 1.4, x: -5 }],
    counterBase: 4, slotLabel: 'DECIDING TO DECIDE', fx: 'cut',
    sfx: [{ t: 0.47, n: 'thock' }, { t: 0.92, n: 'thock' }, { t: 1.37, n: 'thock' }, { t: 1.82, n: 'thock' }] },

  { seg: 's06', at: 0.0, set: 'robot', view: 'wide', coins: 92, pile: 8,
    drops: [{ t: 0.4, x: 0.15, y0: 1.5, vx: 0.8, z: 0.2 }, { t: 1.5, x: 0.05, y0: 1.5, vx: 0.6, z: 0.35 }],
    fx: 'cut' },
  { seg: 's06', word: 'meter', set: 'power', twoRacks: false, kwhFrom: 4, kwhTo: 38, spin: 4,
    hand: false, plate: 'ALREADY RUNNING', fx: 'push', sfx: [{ t: 0.1, n: 'motor', g: 0.25 }] },

  // ---------------------------------------------------------------- ch4
  { seg: 's07', at: 0.0, set: 'market', camX: 3.6, camZ: 7.2, sign: '$0.04', plate: 'IT TRIES SOMETHING', fx: 'wipe' },
  { seg: 's07', word: 'undercuts', set: 'market', camX: -3.2, camY: 1.5, camZ: 5.4, lookY: 2.6, sign: '$0.04', fx: 'cut' },
  { seg: 's07', word: 'stranger', set: 'market', camX: 5.2, camY: 2.6, camZ: 6.4, customer: true,
    walkFrom: 0.05, walkTo: 0.9, coin: true, sign: '$0.04', flashPaid: true, flashAt: 1.35,
    fx: 'cut', sfx: [{ t: 1.0, n: 'pickup' }] },
  { seg: 's07', word: 'profitable', set: 'robot', view: 'hopper', coinsFrom: 92, coinsTo: 96,
    intake: [{ t: 0.15, fromX: 2.6, fromZ: 1.6 }], fx: 'flash', sfx: [{ t: 0.85, n: 'win' }] },

  { seg: 's08', at: 0.0, set: 'robot', view: 'wide', coinsFrom: 96, coinsTo: 85, pile: 10,
    drops: [{ t: 0.15, x: 0.2, y0: 1.5, vx: 1.3, z: 0.1 }, { t: 0.45, x: 0.1, y0: 1.5, vx: -1.1, z: 0.3 },
            { t: 0.75, x: 0.25, y0: 1.5, vx: 0.9, z: -0.2 }, { t: 1.05, x: 0.0, y0: 1.5, vx: -0.7, z: 0.45 }],
    fx: 'cut', sfx: [{ t: 0.55, n: 'error' }] },
  { seg: 's08', word: 'broke', set: 'scales', leftCoins: 16, rightCoins: 3, tiltFrom: 0.1, tiltTo: -0.32,
    tipFrom: 0.05, tipTo: 0.9, leftLabel: 'COSTS', rightLabel: 'EARNED', fx: 'cut', sfx: [{ t: 0.85, n: 'thud' }] },

  // ---------------------------------------------------------------- ch5
  { seg: 's09', at: 0.0, set: 'scales', leftCoins: 16, rightCoins: 3, tiltFrom: -0.32, tiltTo: -0.34,
    tipFrom: 0.1, tipTo: 2.5, leftLabel: 'COSTS', rightLabel: 'EARNED', plate: 'WATCH THIS', fx: 'push' },
  { seg: 's09', word: "doesn't", set: 'scales', leftCoins: 18, rightCoins: 3, tiltFrom: -0.34, tiltTo: -0.42,
    tipFrom: 0.05, tipTo: 1.4, leftLabel: 'COSTS', rightLabel: 'EARNED', fx: 'cut', sfx: [{ t: 0.3, n: 'tick' }] },

  { seg: 's10', at: 0.0, set: 'robot', view: 'over', coins: 30, pile: 22, fx: 'wipe' },
  { seg: 's10', word: 'six', nth: 1, set: 'robot', view: 'hopper', coinsFrom: 30, coinsTo: 6,
    drops: [{ t: 0.2, x: 0.1, y0: 1.5, vx: 0.9, z: 0.2 }, { t: 0.6, x: 0.2, y0: 1.5, vx: -0.8, z: 0.1 },
            { t: 1.0, x: 0.05, y0: 1.5, vx: 0.6, z: 0.4 }],
    fx: 'cut', sfx: [{ t: 0.6, n: 'tick' }, { t: 1.5, n: 'error' }] },
  { seg: 's10', word: 'never', set: 'robot', view: 'over', coins: 6, pile: 30, dim: 0.35, fx: 'cut' },

  // ---------------------------------------------------------------- ch6
  { seg: 's11', at: 0.0, set: 'robot', view: 'low', coins: 6, walking: true, walkRate: 0.4, dim: 0.3, fx: 'wipe' },
  { seg: 's11', word: 'cheaper', set: 'robot', view: 'wide', coins: 6, scale: 0.62, walking: true,
    walkRate: 1.8, pile: 30, fx: 'cut', sfx: [{ t: 0.2, n: 'click' }] },
  { seg: 's11', word: 'worth', set: 'scales', leftCoins: 24, rightCoins: 1, tiltFrom: -0.42, tiltTo: -0.5,
    tipFrom: 0.05, tipTo: 1.2, leftLabel: 'THE GOOD ANSWER', rightLabel: 'AFFORDABLE',
    plate: "CAN'T AFFORD IT", fx: 'cut' },

  { seg: 's12', at: 0.0, set: 'robot', view: 'side', coins: 6, scale: 0.62, walking: true, walkRate: 2.0,
    pile: 30, fx: 'push' },
  { seg: 's12', word: 'recognizes', set: 'deskwatch', screen: 'receipt',
    screenItems: [['cancel job', '-$0.01'], ['cheaper model', '-$0.00'], ['shorter answer', '-$0.00']],
    nodAt: 0.25, nodLabel: 'yeah, that tracks', fx: 'cut' },

  // ---------------------------------------------------------------- ch7
  { seg: 's13', at: 0.0, set: 'power', kwhFrom: 38, kwhTo: 90, spin: 3, plate: 'THE OTHER LEDGER', fx: 'wipe' },
  { seg: 's13', word: 'billed', set: 'power', kwhFrom: 90, kwhTo: 210, spin: 6, fx: 'cut',
    sfx: [{ t: 0.15, n: 'motor', g: 0.3 }] },
  { seg: 's13', word: 'me', set: 'power', kwhFrom: 210, kwhTo: 340, spin: 7, billedTo: 'BILLED TO YOU',
    billAt: 0.3, hand: true, handAt: 0.7, fx: 'cut', sfx: [{ t: 0.9, n: 'paper' }] },

  { seg: 's14', at: 0.0, set: 'robot', view: 'wide', coins: 0, pile: 40, dim: 0.6, fx: 'wipe',
    sfx: [{ t: 0.15, n: 'error' }] },
  { seg: 's14', word: 'lights', nth: 1, set: 'power', kwhFrom: 340, kwhTo: 420, spin: 7, twoRacks: true,
    plate: 'STILL HUMMING', fx: 'cut' },

  // ---------------------------------------------------------------- ch8
  { seg: 's15', at: 0.0, set: 'scales', leftCoins: 2, rightCoins: 26, tiltFrom: 0, tiltTo: 0.34,
    tipFrom: 0.1, tipTo: 1.1, leftLabel: 'COSTS', rightLabel: 'THE FANTASY', fx: 'wipe' },
  { seg: 's15', word: 'tomorrow', set: 'robot', view: 'wide', coins: 3, pile: 40, fx: 'cut',
    sfx: [{ t: 0.3, n: 'uiopen' }] },
  { seg: 's15', word: 'positive', nth: 1, set: 'robot', view: 'hopper', coins: 3, fx: 'push' },

  { seg: 's16', at: 0.0, set: 'scales', leftCoins: 9, rightCoins: 10, tiltFrom: -0.06, tiltTo: 0.05,
    tipFrom: 0.2, tipTo: 2.0, leftLabel: 'COSTS', rightLabel: 'EARNED', plate: 'BY A HAIR', fx: 'wipe',
    sfx: [{ t: 1.9, n: 'tick' }] },
  { seg: 's16', word: 'smaller', set: 'robot', view: 'wide', coins: 3, pile: 40, scale: 0.62, fx: 'push' },

  // ---------------------------------------------------------------- ch9
  { seg: 's17', at: 0.0, set: 'cards', view: 'stamp', text: 'NOT ACTUALLY RUN', stampAt: 0.2,
    sub: 'A MADE-UP ENDING IS NOT DATA', fx: 'cut', sfx: [{ t: 0.22, n: 'stamp' }] },
  { seg: 's17', word: 'receipt', set: 'printer', feedFrom: 0.1, feedTo: 5.0, plate: 'EVERY CENT',
    rows: [
      ['read instructions', '-$0.08'], ['make a plan', '-$0.03'], ['call a tool', '-$0.04'],
      ['first sale', '+$0.04'], ['celebrating', '-$0.11'], ['cancelled job', '-$0.01'],
      ['cheaper model', '-$0.00'], ['day two open', '+$0.00'],
    ], fx: 'wipe', sfx: [{ t: 0.2, n: 'printer', g: 0.4 }, { t: 2.6, n: 'printer', g: 0.35 }] },
  { seg: 's17', word: 'truth', set: 'scales', leftCoins: 9, rightCoins: 10, tiltFrom: 0.05, tiltTo: 0.06,
    tipFrom: 0.1, tipTo: 2.0, leftLabel: 'COSTS', rightLabel: 'EARNED', fx: 'cut' },
  { seg: 's17', tail: 0.2, set: 'cards', view: 'endcard', fx: 'freeze',
    lines: ['$0.03', 'STILL RUNNING.', 'a narrative thought experiment — no agent was actually run'] },
];
