// Static import check: every named import must exist in its source module.
import fs from 'node:fs';
import path from 'node:path';
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.js')) files.push(p);
  }
})('js');
const exportsOf = new Map();
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const names = new Set();
  for (const m of s.matchAll(/export\s+(?:async\s+)?(?:function|class)\s+([A-Za-z0-9_$]+)/g)) names.add(m[1]);
  for (const m of s.matchAll(/export\s+(?:const|let|var)\s+([^=;]+?)=/g)) {
    // handles `export const W = 1600, H = 900;` and destructuring-free lists
    for (const part of m[1].split(',')) {
      const n = part.trim().split(/[\s=]/)[0];
      if (/^[A-Za-z0-9_$]+$/.test(n)) names.add(n);
    }
  }
  // second and later declarators on one line
  for (const m of s.matchAll(/export\s+(?:const|let|var)\s+(.+)$/gm)) {
    for (const part of m[1].split(',')) {
      const n = part.trim().split(/[\s=]/)[0];
      if (/^[A-Za-z0-9_$]+$/.test(n)) names.add(n);
    }
  }
  for (const m of s.matchAll(/export\s*\{([^}]*)\}/g)) {
    m[1].split(',').forEach(x => { const n = x.split(/\s+as\s+/).pop().trim(); if (n) names.add(n); });
  }
  exportsOf.set(path.resolve(f), names);
}
let bad = 0;
const unused = [];
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/import\s*\{([^}]*)\}\s*from\s*'([^']+)'/g)) {
    const target = path.resolve(path.dirname(f), m[2]);
    const have = exportsOf.get(target);
    if (!have) { console.log('MISSING MODULE', f, m[2]); bad++; continue; }
    const after = s.slice(s.indexOf(m[0]) + m[0].length);
    for (const raw of m[1].split(',')) {
      const n = raw.split(/\s+as\s+/)[0].trim();
      if (!n) continue;
      if (!have.has(n)) { console.log('BAD IMPORT  ', f, '->', m[2], ':', n); bad++; continue; }
      const local = (raw.includes(' as ') ? raw.split(/\s+as\s+/)[1] : n).trim();
      if (!new RegExp('\\b' + local.replace(/\$/g, '\\$') + '\\b').test(after)) unused.push(`${f}: ${local}`);
    }
  }
}
console.log(`bad imports: ${bad} | unused imports: ${unused.length}`);
if (process.env.SHOW_UNUSED) unused.forEach(u => console.log('  unused', u));
process.exit(bad ? 1 : 0);
