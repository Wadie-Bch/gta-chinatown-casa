import { chromium } from 'playwright';
import { serve } from './tools/serve.mjs';
const srv = await serve(8210);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--hide-scrollbars','--force-device-scale-factor=1'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
await p.goto('http://localhost:8210/thumb.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(400);
await p.screenshot({ path: 'out/thumbnail-1280x720.png' });
await b.close(); srv.close(); console.log('thumbnail written');
