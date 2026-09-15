// TABBI visual identity. Colour must communicate something.
export const C = {
  white: '#F5F5F7',        // warm white — the browser world's daylight
  ink:   '#202027',        // outlines, type, Gate
  gray:  '#DCDCE2',        // neutral surfaces, disabled states
  mint:  '#188567',        // go / verified / desire
  red:   '#D55B56',        // refusal / error / the system saying no

  // derived, still inside the family
  ink80: 'rgba(32,32,39,.80)',
  ink60: 'rgba(32,32,39,.60)',
  ink35: 'rgba(32,32,39,.35)',
  ink18: 'rgba(32,32,39,.18)',
  ink10: 'rgba(32,32,39,.10)',
  ink06: 'rgba(32,32,39,.06)',
  white70: 'rgba(245,245,247,.70)',
  white35: 'rgba(245,245,247,.35)',
  mintSoft: '#D9EFE7',
  mintMid:  '#4FAE8E',
  mintDeep: '#0E5B46',
  redSoft:  '#F7DEDD',
  redDeep:  '#9C3B37',
  night:    '#181820',      // motivated dark: the checkpoint
  nightUp:  '#2B2B36',
  cream:    '#FFFDF8',
  crust:    '#E0A854',
  crustDeep:'#C07C32',
  cheese:   '#F2C35C',
  sauce:    '#C9483F',
  olive:    '#4A5B33',
  oliveLit: '#6C8248',
};

export const FONT = '"Liberation Sans", Arial, Helvetica, system-ui, sans-serif';
export const f = (weight, size) => `${weight} ${size}px ${FONT}`;

export const W = 1920, H = 1080;
