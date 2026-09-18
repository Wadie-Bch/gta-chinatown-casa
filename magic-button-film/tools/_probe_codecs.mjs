import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage();
await p.goto('http://127.0.0.1:8123/', { waitUntil: 'domcontentloaded' });
const types = [
  'video/mp4;codecs=avc1.640028,mp4a.40.2',
  'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
  'video/mp4',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
];
const res = await p.evaluate((types) => {
  return types.map(t => ({ t, ok: window.MediaRecorder ? MediaRecorder.isTypeSupported(t) : 'no MediaRecorder' }));
}, types);
console.log(res);
// also check canvas.captureStream exists
console.log('captureStream:', await p.evaluate(() => typeof document.createElement('canvas').captureStream));
console.log('createMediaStreamDestination:', await p.evaluate(() => typeof (new (window.AudioContext||window.webkitAudioContext)()).createMediaStreamDestination));
await b.close();
