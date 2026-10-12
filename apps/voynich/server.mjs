import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');
const CACHE_DIR = path.join('/tmp', 'voynich-edge-cache');
const LOCAL_VOYNICH_REPO = path.resolve(__dirname, '..', '..', '..', 'voynich');
const PORT = Number(process.env.PORT) || 8080;

const versionMeta = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'src', 'voynich-version.json'), 'utf-8'),
);
const PINNED_COMMIT = versionMeta.commitSha;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
};

const COMPRESSIBLE = new Set([
  '.html',
  '.js',
  '.css',
  '.json',
  '.svg',
  '.txt',
]);

function sendBuffer(req, res, statusCode, contentType, cacheControl, buf, ext) {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const shouldGzip = COMPRESSIBLE.has(ext) && buf.length > 512 && acceptEncoding.includes('gzip');

  const headers = {
    'Content-Type': contentType,
    'Cache-Control': cacheControl,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };

  if (shouldGzip) {
    const zipped = zlib.gzipSync(buf);
    headers['Content-Encoding'] = 'gzip';
    headers['Vary'] = 'Accept-Encoding';
    headers['Content-Length'] = String(zipped.length);
    res.writeHead(statusCode, headers);
    res.end(zipped);
  } else {
    headers['Content-Length'] = String(buf.length);
    res.writeHead(statusCode, headers);
    res.end(buf);
  }
}

async function handleRepoAssetProxy(req, res, folder, rawFilename) {
  const filename = path.basename(decodeURIComponent(rawFilename));
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Invalid asset filename');
    return;
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const cacheHeader = 'public, max-age=31536000, immutable';

  // 1. Check local sibling repo if available (instant local dev)
  const localFile = path.join(LOCAL_VOYNICH_REPO, folder, filename);
  if (fs.existsSync(localFile)) {
    const buf = fs.readFileSync(localFile);
    sendBuffer(req, res, 200, contentType, cacheHeader, buf, ext);
    return;
  }

  // 2. Check container disk cache
  try {
    fs.mkdirSync( path.join(CACHE_DIR, folder), { recursive: true });
    const cachedPath = path.join(CACHE_DIR, folder, `${PINNED_COMMIT.slice(0, 7)}_${filename}`);
    if (fs.existsSync(cachedPath)) {
      const buf = fs.readFileSync(cachedPath);
      sendBuffer(req, res, 200, contentType, cacheHeader, buf, ext);
      return;
    }

    // 3. Fetch server-to-server from pinned commit on GitHub
    const upstreamUrl = `https://raw.githubusercontent.com/d2kx/voynich-research/${PINNED_COMMIT}/${folder}/${encodeURIComponent(filename)}`;
    const upstreamRes = await fetch(upstreamUrl);
    if (!upstreamRes.ok) {
      res.writeHead(upstreamRes.status, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Asset not found');
      return;
    }
    const arrayBuf = await upstreamRes.arrayBuffer();
    const buf = Buffer.from(arrayBuf);
    try {
      fs.writeFileSync(cachedPath, buf);
    } catch {
      // Ignore cache write errors if /tmp is full
    }
    sendBuffer(req, res, 200, contentType, cacheHeader, buf, ext);
  } catch {
    res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Upstream fetch error');
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (pathname === '/healthz') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'voynich',
        pinnedCommit: versionMeta.shortSha,
        pinnedDate: versionMeta.commitDate,
      }),
    );
    return;
  }

  if (pathname.startsWith('/pages/')) {
    void handleRepoAssetProxy(req, res, 'pages', pathname.slice('/pages/'.length));
    return;
  }

  if (pathname.startsWith('/data/')) {
    void handleRepoAssetProxy(req, res, 'data', pathname.slice('/data/'.length));
    return;
  }

  let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const isImmutable = pathname.startsWith('/assets/') || pathname.startsWith('/content/');
  const cacheControl = isImmutable
    ? 'public, max-age=31536000, immutable'
    : 'public, max-age=300';

  const buf = fs.readFileSync(filePath);
  sendBuffer(req, res, 200, contentType, cacheControl, buf, ext);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(
    `voynich.dmh.dev server listening on http://0.0.0.0:${PORT} (pinned to voynich-research@${versionMeta.shortSha})`,
  );
});
