// Render the soundtrack to a WAV using exactly the code the preview uses.
import { writeFileSync, mkdirSync } from 'node:fs';
import { buildSoundtrack, toWav } from '../src/audio/mix.js';
mkdirSync('out', { recursive: true });
const t0 = Date.now();
const st = await buildSoundtrack({ analyze: process.argv.includes('--analyze') });
writeFileSync('out/tabbi-audio.wav', Buffer.from(toWav(st)));
console.log(`wav written in ${((Date.now() - t0) / 1000).toFixed(1)}s · ${(st.n / st.sampleRate).toFixed(2)}s · pre-gain LUFS ${st.lufsBefore === null ? 'fixed' : st.lufsBefore.toFixed(2)} · gain x${st.gain.toFixed(3)}`);
