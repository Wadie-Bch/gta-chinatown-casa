import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
const ROOT = process.cwd();
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wav': 'audio/wav', '.mp4': 'video/mp4', '.png': 'image/png' };
export function serve(port = 8123) {
  const srv = http.createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/preview.html';
      const fp = join(ROOT, normalize(p).replace(/^(\.\.[/\\])+/, ''));
      const s = await stat(fp);
      if (s.isDirectory()) throw new Error('dir');
      const body = await readFile(fp);
      res.setHeader('content-type', TYPES[extname(fp)] || 'application/octet-stream');
      res.setHeader('cache-control', 'no-store');
      res.end(body);
    } catch { res.statusCode = 404; res.end('not found'); }
  });
  return new Promise(r => srv.listen(port, () => r(srv)));
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = +(process.argv[2] || 8123);
  serve(port).then(() => console.log('http://localhost:' + port));
}
