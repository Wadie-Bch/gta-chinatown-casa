// Fixed visual identity for the whole episode.
export const INK    = '#11151D';
export const PAPER  = '#F5F2E9';
export const LIME   = '#D6FF35';
export const BLUE   = '#497BFF';
export const CORAL  = '#FF615B';
export const TEAL   = '#1FA9A0';   // courier
export const YELLOW = '#F2C53D';   // parcels
export const WHITE  = '#FFFFFF';   // delivery van

export const INK_2  = '#1B2230';   // one step off ink, for near-black separation
export const INK_3  = '#272F3F';
export const PAPER_2 = '#E7E2D3';
export const PAPER_3 = '#D8D2BF';

/** Mix two hex colours. t=0 -> a, t=1 -> b. */
export function mix(a, b, t) {
  const pa = hex(a), pb = hex(b);
  return `rgb(${Math.round(pa[0] + (pb[0] - pa[0]) * t)},${Math.round(pa[1] + (pb[1] - pa[1]) * t)},${Math.round(pa[2] + (pb[2] - pa[2]) * t)})`;
}
export function alpha(c, a) {
  const p = hex(c);
  return `rgba(${p[0]},${p[1]},${p[2]},${a})`;
}
export function shade(c, amount) {
  return amount >= 0 ? mix(c, WHITE, amount) : mix(c, INK, -amount);
}
const _cache = new Map();
function hex(c) {
  if (_cache.has(c)) return _cache.get(c);
  let h = c.replace('#', '');
  if (h.length === 3) h = h.split('').map(x => x + x).join('');
  const v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  _cache.set(c, v);
  return v;
}
