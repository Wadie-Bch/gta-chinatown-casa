// High-contrast "survival terminal" identity: near-black, near-white, one hot
// green (gain), one hot red (loss), one hot gold (the dollar itself).
// Deliberately fewer, punchier colors than a warm-paper editorial look —
// this episode wants to read as a stark, iconic poster in motion.
export const INK    = '#05070A';   // near-black background
export const INK_2  = '#0D1117';
export const INK_3  = '#161B22';
export const PAPER  = '#F4F6F8';   // near-white
export const PAPER_2 = '#D8DEE6';
export const PAPER_3 = '#9AA5B1';

export const GREEN  = '#39FF6A';   // gains / survival
export const RED    = '#FF2E3C';   // losses / danger
export const GOLD   = '#FFD400';   // the dollar itself
export const BLUE   = '#3DB4FF';   // informational / neutral tool calls

export const TEAL   = GREEN;       // kept for drop-in compatibility with shared helpers
export const YELLOW = GOLD;
export const WHITE  = PAPER;
export const CORAL  = RED;
export const LIME   = GREEN;

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
  return amount >= 0 ? mix(c, PAPER, amount) : mix(c, INK, -amount);
}
const _cache = new Map();
/**
 * Parse a colour to [r,g,b]. Accepts #rgb, #rrggbb AND rgb()/rgba() strings,
 * because mix()/alpha() return rgb()/rgba() and their output routinely gets
 * fed straight back into shade() (e.g. a mixed body colour handed to box(),
 * which shades each face). Without the rgb() branch that silently produced
 * NaN components and the geometry vanished.
 */
function hex(c) {
  if (_cache.has(c)) return _cache.get(c);
  let v;
  const m = /^rgba?\(([^)]+)\)/.exec(c);
  if (m) {
    const parts = m[1].split(',').map(x => parseFloat(x.trim()));
    v = [parts[0] | 0, parts[1] | 0, parts[2] | 0];
  } else {
    let h = String(c).replace('#', '');
    if (h.length === 3) h = h.split('').map(x => x + x).join('');
    v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    if (v.some(Number.isNaN)) v = [255, 0, 255];   // loud magenta beats invisible
  }
  _cache.set(c, v);
  return v;
}
