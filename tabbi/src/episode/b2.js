// B2 — RETAIN (1:00 – 1:40). He is not a villain. That is the problem.
import { C, W, H } from '../core/palette.js';
import { S, rr, circ, ell, line, text, shadow, noShadow, lightPool } from '../core/draw.js';
import { clamp, lerp, p01, E, sinw, sin01, hash, TAU } from '../core/util.js';
import { shot, say, sys, talk, withCam, finish, hit, pointer, split } from './kit.js';
import { drawTabbi, pose, blinkAt } from '../chars/tabbi.js';
import { drawRetain } from '../chars/retain.js';
import { offerRoom, offerCard } from '../rooms/streem.js';

export const RX = 560, BX = -580;   // RETAIN and Tabbi in the offer room

export default function b2() {
  // ---- 17. He unfolds into frame. 4.4s
  shot('b2-arrive', 4.4, (ctx, lt, gt, sh) => {
    const open = E.outBack(p01(lt, .5, 1.8));
    withCam(ctx, [{ t: 0, x: 120, y: -560, z: .78 }, { t: 1.8, x: 180, y: -520, z: .86, e: E.io3 },
                  { t: 4.4, x: 186, y: -522, z: .88, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawRetain(ctx, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: 'delighted', arms: open, talk: talk(sh, lt, 'retain'), look: -.4 });
      drawTabbi(ctx, { ...pose('shocked', 0), x: BX, y: 0, s: 1.45, flip: 1, eye: { open: 1.2, wide: 1.06, look: [.6, 0], shape: 'shock', shine: 1 } });
    });
    say(ctx, sh, lt, 0, W * .60, H * .20, { size: 48, tail: [.35, 1], maxW: 640 });
    finish(ctx, { vig: .24 });
  }, {
    tr: { type: 'iris', d: .55, x: W * .62, y: H * .58, edge: C.cheese },
    say: [{ t: 1.9, d: 1.9, who: 'retain', text: 'Before you go...' }],
    sfx: [{ t: .5, n: 'rubberStretch', d: 1.2 }, { t: 1.75, n: 'partyHorn', g: .6 }, { t: 1.85, n: 'retainWarm' }],
  });

  // ---- 18. He is genuinely pleased. 3.6s
  shot('b2-hello', 3.6, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: RX - 40, y: -280, z: 1.5 }, { t: 3.6, x: RX - 34, y: -282, z: 1.54, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawRetain(ctx, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: 'delighted', arms: .75, talk: talk(sh, lt, 'retain'), look: -.5 });
    });
    say(ctx, sh, lt, 0, W * .26, H * .22, { size: 44, tail: [.6, 1], maxW: 560 });
    finish(ctx, { vig: .24 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .25, d: 2.2, who: 'retain', text: "I'm so glad we're talking." }],
    sfx: [{ t: .2, n: 'retainWarm' }],
  });

  // ---- 19. The first offer is reasonable. That is the trap. 4.2s
  shot('b2-offer1', 4.2, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 60, y: -640, z: .92 }, { t: 4.2, x: 66, y: -644, z: .95, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawRetain(ctx, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: 'delighted', arms: .9, look: -.5 });
      offerCard(ctx, -40, -800, { k: E.outBack(p01(lt, .2, .8)), title: '50% OFF', sub: 'for three months', kicker: 'JUST FOR YOU', foot: 'No commitment. Cancel anytime.' });
      drawTabbi(ctx, {
        ...pose(lt > 2.0 ? 'suspicious' : 'stare', 0), x: BX, y: 0, s: 1.45, flip: 1,
        eye: { open: lt > 2.0 ? .5 : 1.05, wide: 1, look: [.5, -.3], shape: lt > 2.0 ? 'narrow' : 'normal', shine: 1 },
      });
    });
    finish(ctx, { vig: .24 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .22, n: 'paperSlide' }, { t: .3, n: 'chimeSoft' }, { t: 2.05, n: 'eyeNarrow' }] });

  // ---- 20. "No." 3.4s
  shot('b2-no1', 3.4, (ctx, lt, gt, sh) => {
    split(ctx,
      c => withCam(c, [{ t: 0, x: BX + 20, y: -330, z: 1.8 }], lt, () => {
        offerRoom(c, { t: lt, spotX: RX - 120 });
        drawTabbi(c, { ...pose('stare', 0), x: BX, y: 0, s: 1.45, flip: 1, mouth: { shape: 'flat', open: 0, w: 1.15, talk: talk(sh, lt, 'tabbi') }, brow: { l: 16, r: 16, y: 0, show: 1 } });
      }),
      c => withCam(c, [{ t: 0, x: RX, y: -300, z: 1.35 }], lt, () => {
        offerRoom(c, { t: lt, spotX: RX - 120 });
        drawRetain(c, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: 'delighted', arms: .9, talk: talk(sh, lt, 'retain') });
      }), p01(lt, 0, .3));
    say(ctx, sh, lt, 0, W * .24, H * .17, { size: 54 });
    say(ctx, sh, lt, 1, W * .76, H * .17, { size: 44, maxW: 560 });
    finish(ctx, { vig: .26 });
  }, {
    tr: { type: 'cut' },
    say: [
      { t: .2, d: .9, who: 'tabbi', text: 'No.' },
      { t: 1.3, d: 1.5, who: 'retain', text: 'Of course! May I ask why?' },
    ],
    sfx: [{ t: 0, n: 'splitSwish' }, { t: .18, n: 'tabbiHuff' }, { t: 1.25, n: 'retainWarm' }],
  });

  // ---- 21. The honest answer makes it worse. 4.0s
  shot('b2-why', 4.0, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 40, y: -420, z: 1.02 }, { t: 2.2, x: 200, y: -400, z: 1.1, e: E.io3 },
                  { t: 4.0, x: 204, y: -402, z: 1.12, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawRetain(ctx, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: lt > 2.0 ? 'delighted' : 'listening', arms: lt > 2.0 ? 1 : .55, talk: talk(sh, lt, 'retain'), look: -.5 });
      drawTabbi(ctx, { ...pose('point', 0), x: BX, y: 0, s: 1.45, flip: 1, mouth: { shape: 'shout', open: .6, w: 1, talk: talk(sh, lt, 'tabbi') } });
    });
    say(ctx, sh, lt, 0, W * .24, H * .19, { size: 42, tail: [.1, 1], maxW: 560 });
    say(ctx, sh, lt, 1, W * .72, H * .19, { size: 42, tail: [.2, 1], maxW: 580 });
    finish(ctx, { vig: .24 });
  }, {
    tr: { type: 'cut' },
    say: [
      { t: .2, d: 1.6, who: 'tabbi', text: 'I watched one episode.' },
      { t: 2.1, d: 1.7, who: 'retain', text: "Then you're due one more!" },
    ],
    sfx: [{ t: .18, n: 'tabbiShout' }, { t: 2.05, n: 'partyHorn', g: .5 }, { t: 2.1, n: 'retainWarm' }],
  });

  // ---- 22. Offer two, with a bow. 4.4s
  shot('b2-offer2', 4.4, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 60, y: -660, z: .9 }, { t: 4.4, x: 66, y: -664, z: .93, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawRetain(ctx, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: 'delighted', arms: 1, look: -.5 });
      S(ctx, () => { ctx.globalAlpha = .5; offerCard(ctx, -160, -760, { k: 1, title: '50% OFF', sub: 'for three months', rot: -.06 }); });
      offerCard(ctx, 20, -830, { k: E.outBack(p01(lt, .3, .9)), title: 'ONE FREE MONTH', titleSize: 52, sub: 'our gift to you', kicker: 'BECAUSE WE CARE', bow: 1, accent: C.cheese, foot: 'Renews automatically.' });
      drawTabbi(ctx, { ...pose('suspicious', 0), x: BX, y: 0, s: 1.45, flip: 1 });
    });
    finish(ctx, { vig: .24 });
  }, { tr: { type: 'cut' }, sfx: [{ t: .32, n: 'paperSlide' }, { t: .42, n: 'popCork' }, { t: .5, n: 'tinyApplause', g: .6 }] });

  // ---- 23. "I got this." 3.6s
  shot('b2-igot', 3.6, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: BX + 40, y: -300, z: 1.95 }, { t: 3.6, x: BX + 46, y: -302, z: 2.0, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawTabbi(ctx, {
        ...pose('smug', lt * .7), x: BX, y: 0, s: 1.45, flip: 1,
        armR: { a: 128, b: -30, l1: 30, l2: 25 },
        mouth: { shape: 'smirk', open: 0, w: 1, talk: talk(sh, lt, 'tabbi') },
      });
    });
    say(ctx, sh, lt, 0, W * .66, H * .24, { size: 56, tail: [-.5, 1] });
    finish(ctx, { vig: .26 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: .5, d: 1.5, who: 'tabbi', text: 'I got this.' }],
    sfx: [{ t: .45, n: 'tabbiSmug' }, { t: 1.9, n: 'squeakyToy', g: .4 }],
  });

  // ---- 24. The smile does not move. 4.0s
  shot('b2-no2', 4.0, (ctx, lt, gt, sh) => {
    withCam(ctx, [{ t: 0, x: 200, y: -520, z: 1.0 }, { t: 4.0, x: 208, y: -524, z: 1.04, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawRetain(ctx, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: 'delighted', arms: 1, talk: talk(sh, lt, 'retain'), look: -.5 });
      const flip2 = p01(lt, .6, 1.2);
      S(ctx, () => {
        ctx.translate(20, -830); ctx.transform(1, 0, 0, Math.max(.03, Math.abs(Math.cos(flip2 * Math.PI))), 0, 0); ctx.translate(-20, 830);
        offerCard(ctx, 20, -830, flip2 < .5
          ? { k: 1, title: 'ONE FREE MONTH', titleSize: 52, sub: 'our gift to you', kicker: 'BECAUSE WE CARE', bow: 1, accent: C.cheese }
          : { k: 1, title: 'DECLINED', titleSize: 52, kicker: 'THAT IS OKAY', accent: C.gray, sub: 'We have others.' });
      });
      drawTabbi(ctx, { ...pose('stare', 0), x: BX, y: 0, s: 1.45, flip: 1, brow: { l: 18, r: 18, y: 0, show: 1 }, mouth: { shape: 'flat', open: 0, w: 1.1 } });
    });
    say(ctx, sh, lt, 0, W * .56, H * .20, { size: 42, tail: [.3, 1], maxW: 560 });
    finish(ctx, { vig: .24 });
  }, {
    tr: { type: 'cut' },
    say: [{ t: 1.6, d: 1.8, who: 'retain', text: 'We have others.' }],
    sfx: [{ t: .6, n: 'flipCard' }, { t: 1.55, n: 'retainWarm' }, { t: 2.2, n: 'boing', g: .5 }],
  });

  // ---- 25. A third arrives. And a fourth behind it. 4.2s
  shot('b2-escalate', 4.2, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 100, y: -700, z: .88 }, { t: 4.2, x: 110, y: -706, z: .92, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawRetain(ctx, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: 'delighted', arms: 1, look: -.5 });
      const cards = [
        { t: 0, x: -240, y: -700, rot: -.08, title: 'FREE HD', accent: C.mint },
        { t: .9, x: 40, y: -800, rot: .04, title: 'EXTRA PROFILE', titleSize: 46, accent: C.cheese },
        { t: 1.9, x: 320, y: -700, rot: .1, title: 'ONE FREE WEEK', titleSize: 44, accent: C.mintMid },
        { t: 2.9, x: 60, y: -600, rot: -.03, title: 'A DIFFERENT PLAN', titleSize: 40, accent: C.gray },
      ];
      cards.forEach(c => offerCard(ctx, c.x, c.y, {
        k: E.outBack(p01(lt, c.t, c.t + .5)), title: c.title, titleSize: c.titleSize, rot: c.rot,
        accent: c.accent, kicker: 'JUST FOR YOU', w: 520, h: 280,
      }));
      drawTabbi(ctx, { ...pose('shocked', 0), x: BX, y: 0, s: 1.45, flip: 1 });
    });
    finish(ctx, { vig: .24 });
  }, {
    tr: { type: 'cut' },
    sfx: [0, .9, 1.9, 2.9].map(t => ({ t: t + .05, n: 'paperSlide' }))
      .concat([0, .9, 1.9, 2.9].map((t, i) => ({ t: t + .15, n: i % 2 ? 'boing' : 'squeakyToy', g: .55 }))),
  });

  // ---- 26. Wide: he is surrounded by generosity. 4.2s
  shot('b2-wall', 4.2, (ctx, lt) => {
    withCam(ctx, [{ t: 0, x: 40, y: -620, z: .62 }, { t: 4.2, x: 46, y: -626, z: .645, e: E.linear }], lt, () => {
      offerRoom(ctx, { t: lt, spotX: RX - 120 });
      drawRetain(ctx, { x: RX, y: 0, s: 1.0, flip: -1, t: lt, face: 'delighted', arms: 1, look: -.5 });
      for (let i = 0; i < 12; i++) {
        const a = hash(i * 3.7), b = hash(i * 7.1);
        offerCard(ctx, -760 + (i % 4) * 420 + a * 70, -1080 + Math.floor(i / 4) * 300 + b * 60, {
          k: clamp(p01(lt, .1 + i * .06, .5 + i * .06)), w: 380, h: 210, titleSize: 34,
          title: ['FREE HD', 'EXTRA PROFILE', 'ONE FREE WEEK', 'A DIFFERENT PLAN', '50% OFF', 'FREE MONTH',
            'PAUSE INSTEAD', 'SKIP A MONTH', 'HALF A MONTH', 'A QUIETER PLAN', 'STUDENT RATE', 'FAMILY RATE'][i],
          kicker: 'JUST FOR YOU', accent: [C.mint, C.cheese, C.mintMid, C.gray][i % 4], rot: (a - .5) * .16,
        });
      }
      drawTabbi(ctx, { ...pose('defeated', 0), x: BX, y: 0, s: 1.45, flip: 1 });
    });
    finish(ctx, { vig: .26 });
  }, {
    tr: { type: 'cut' },
    sfx: Array.from({ length: 12 }, (_, i) => ({ t: .12 + i * .06, n: 'paperSlide', g: .5 })).concat([{ t: 1.3, n: 'tinyApplause' }]),
  });
}
