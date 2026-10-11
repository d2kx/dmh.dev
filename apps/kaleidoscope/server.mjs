import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const rootDir = fileURLToPath(new URL('./dist', import.meta.url));
const port = Number(process.env['PORT'] || 4100);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
};

const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.svg', '.txt', '.json']);

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/healthz') {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    const safePath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.(\/|\\|$))+/, '');
    let targetPath = join(rootDir, safePath === '/' || safePath === '\\' ? 'index.html' : safePath);

    try {
      const fileStat = await stat(targetPath);
      if (fileStat.isDirectory()) {
        targetPath = join(targetPath, 'index.html');
      }
    } catch {
      targetPath = join(rootDir, 'index.html');
    }

    const ext = extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const isHashedAsset = url.pathname.startsWith('/assets/');
    const cacheControl = isHashedAsset
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=3600';

    const rawBuffer = await readFile(targetPath);
    const acceptEncoding = String(req.headers['accept-encoding'] || '');
    const canGzip = COMPRESSIBLE.has(ext) && acceptEncoding.includes('gzip');
    const body = canGzip ? gzipSync(rawBuffer) : rawBuffer;

    const headers = {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };

    if (canGzip) {
      headers['Content-Encoding'] = 'gzip';
      headers['Vary'] = 'Accept-Encoding';
    }

    res.writeHead(200, headers);
    res.end(body);
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Kaleidoscope server listening on http://localhost:${port}`);
});
