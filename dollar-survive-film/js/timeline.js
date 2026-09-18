// Turns the narration manifest + the shot list into absolute times.
// Shots are anchored to real spoken words, so an edit lands inside a sentence
// exactly where it was written to land — never on an even split of the audio.

const normal = s => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');

export function buildTimeline(manifest, cuts) {
  const segs = [];
  let t = manifest.leadIn || 0;
  for (const s of manifest.segments) {
    segs.push({ ...s, start: t, end: t + s.dur });
    t += s.dur + (s.pauseAfter || 0);
  }
  const total = t + (manifest.tailOut || 0);
  const byId = new Map(segs.map(s => [s.id, s]));

  // resolve every cut to an absolute start time
  const used = new Map();           // segId -> last matched word index
  const resolved = [];
  const warnings = [];
  for (const c of cuts) {
    let at;
    if (c.abs != null) {
      at = c.abs;
    } else {
      const seg = byId.get(c.seg);
      if (!seg) { warnings.push(`unknown segment ${c.seg}`); continue; }
      if (c.word) {
        const from = used.get(c.seg) ?? -1;
        const target = normal(c.word);
        const nth = c.nth ?? 1;
        let hits = 0, idx = -1;
        for (let i = from + 1; i < seg.words.length; i++) {
          if (normal(seg.words[i].w) === target && ++hits === nth) { idx = i; break; }
        }
        if (idx < 0) {                       // fall back to a proportional position
          warnings.push(`word "${c.word}" not found in ${c.seg}`);
          at = seg.start + (c.at ?? 0);
        } else {
          used.set(c.seg, idx);
          at = seg.start + seg.words[idx].t + (c.off ?? 0);
        }
      } else if (c.frac != null) {
        at = seg.start + seg.dur * c.frac;
      } else if (c.tail != null) {
        at = seg.end + c.tail;
      } else {
        at = seg.start + (c.at ?? 0);
      }
    }
    const out = { ...c, start: at };
    // syncWords: make objects land on the exact word that names them
    if (c.syncWords) {
      const seg = byId.get(c.syncSeg || c.seg);
      if (seg) {
        let from = -1;
        out.times = c.syncWords.map(w => {
          if (!w) return null;
          const target = normal(w);
          for (let i = from + 1; i < seg.words.length; i++) {
            if (normal(seg.words[i].w) === target) { from = i; return seg.start + seg.words[i].t - at; }
          }
          warnings.push(`syncWord "${w}" not found in ${seg.id}`);
          return null;
        });
      }
    }
    resolved.push(out);
  }
  resolved.sort((a, b) => a.start - b.start);
  for (let i = 0; i < resolved.length; i++) {
    resolved[i].dur = (i + 1 < resolved.length ? resolved[i + 1].start : total) - resolved[i].start;
    resolved[i].index = i;
  }
  const bad = resolved.filter(c => c.dur <= 0.05);
  if (bad.length) warnings.push(`${bad.length} cut(s) shorter than 50ms`);

  // chapters get their start from the first cut that lands in them
  const chapters = manifest.chapters.map(ch => {
    const first = segs.find(s => s.chapter === ch.id);
    return { ...ch, start: first ? first.start : 0 };
  });
  chapters[0].start = 0;

  return { segs, cuts: resolved, total, chapters, warnings };
}

/** The cut covering time t (binary search — called every frame). */
export function cutAt(tl, t) {
  const a = tl.cuts;
  let lo = 0, hi = a.length - 1, best = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid].start <= t) { best = mid; lo = mid + 1; } else hi = mid - 1;
  }
  return a[best];
}

/** Segment being spoken at t (or the one just finished), for captions. */
export function segAt(tl, t) {
  for (let i = tl.segs.length - 1; i >= 0; i--) if (tl.segs[i].start <= t) return tl.segs[i];
  return null;
}
