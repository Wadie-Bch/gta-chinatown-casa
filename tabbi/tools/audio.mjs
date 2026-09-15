// Render the soundtrack to a WAV using exactly the code the preview uses.
import { writeFileSync, mkdirSync } from 'node:fs';
const epArg = process.argv.find(v => v.startsWith('--ep='));
if (epArg) process.env.TABBI_EP = epArg.split('=')[1];
const OUTWAV = process.env.TABBI_EP === '2' ? 'out/tabbi-ep2-audio.wav' : 'out/tabbi-audio.wav';
import { buildSoundtrack, toWav } from '../src/audio/mix.js';
mkdirSync('out', { recursive: true });
const t0 = Date.now();
const st = await buildSoundtrack({ analyze: process.argv.includes('--analyze') });
writeFileSync(OUTWAV, Buffer.from(toWav(st)));
console.log(`${OUTWAV} written in ${((Date.now() - t0) / 1000).toFixed(1)}s · ${(st.n / st.sampleRate).toFixed(2)}s · pre-gain LUFS ${st.lufsBefore === null ? 'fixed' : st.lufsBefore.toFixed(2)} · gain x${st.gain.toFixed(3)}`);
