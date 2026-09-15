// Contact sheet: tile a set of frames into one image for visual inspection.
import { readdirSync, copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const prefix = process.argv[2];              // e.g. out/a0
const out = process.argv[3] || prefix + '-sheet.png';
const cols = +(process.argv[4] || 5), scale = +(process.argv[5] || 640);
const dir = prefix.split('/').slice(0, -1).join('/') || '.';
const base = prefix.split('/').pop();
const files = readdirSync(dir).filter(f => f.startsWith(base + '-') && f.endsWith('.png'))
  .sort((a, b) => parseFloat(a.slice(base.length + 1)) - parseFloat(b.slice(base.length + 1)));
const tmp = '/tmp/sheet'; rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
files.forEach((f, i) => copyFileSync(`${dir}/${f}`, `${tmp}/s${String(i).padStart(3, '0')}.png`));
const rows = Math.ceil(files.length / cols);
execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-framerate', '1', '-i', `${tmp}/s%03d.png`,
  '-vf', `scale=${scale}:-1,drawbox=c=0x202027@1:t=3,tile=${cols}x${rows}:padding=6:color=0x202027`, '-frames:v', '1', out]);
console.log('sheet:', out, files.length, 'frames', files.map(f => f.slice(base.length + 1, -4)).join(' '));
