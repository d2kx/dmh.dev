import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { Request, Response } from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path, { join } from 'node:path';
import sharp from 'sharp';
import { VOYNICH_VERSION } from './app/features/voynich/voynich-version';

const browserDistFolder = join(import.meta.dirname, '../browser');
const voynichCacheDir = join(os.tmpdir(), 'voynich-edge-cache');
const localVoynichRepo = path.resolve(process.cwd(), '..', 'voynich');

const app = express();
const angularApp = new AngularNodeAppEngine();

const ASSET_MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const ALLOWED_WIDTH_BUCKETS = [240, 320, 384, 480, 640, 750, 828, 960, 1080, 1200, 1600] as const;

function resolveWidthBucket(rawWidth: number): number {
  if (!Number.isFinite(rawWidth) || rawWidth <= 0) return 0;
  for (const b of ALLOWED_WIDTH_BUCKETS) {
    if (rawWidth <= b) return b;
  }
  return ALLOWED_WIDTH_BUCKETS[ALLOWED_WIDTH_BUCKETS.length - 1];
}

async function getRawVoynichAssetBuffer(
  folder: 'pages' | 'data',
  filename: string,
): Promise<{ buf: Buffer | null; status: number }> {
  // 1. Check local sibling repo if available during local development
  const localFile = path.join(localVoynichRepo, folder, filename);
  if (fs.existsSync(localFile)) {
    return { buf: fs.readFileSync(localFile), status: 200 };
  }

  // 2. Check container disk cache
  const folderCacheDir = path.join(voynichCacheDir, folder);
  fs.mkdirSync(folderCacheDir, { recursive: true });
  const cachedPath = path.join(folderCacheDir, `${VOYNICH_VERSION.shortSha}_${filename}`);
  if (fs.existsSync(cachedPath)) {
    return { buf: fs.readFileSync(cachedPath), status: 200 };
  }

  // 3. Fetch server-to-server from pinned commit on GitHub
  const encoded = encodeURIComponent(filename);
  const primaryUrl = `https://raw.githubusercontent.com/d2kx/voynich-research/${VOYNICH_VERSION.commitSha}/${folder}/${encoded}`;
  let upstreamRes = await fetch(primaryUrl);
  if (!upstreamRes.ok) {
    const fallbackUrl = `https://raw.githubusercontent.com/d2kx/voynich-research/main/${folder}/${encoded}`;
    upstreamRes = await fetch(fallbackUrl);
  }
  if (!upstreamRes.ok) {
    return { buf: null, status: upstreamRes.status };
  }

  const arrayBuf = await upstreamRes.arrayBuffer();
  const buf = Buffer.from(arrayBuf);
  try {
    fs.writeFileSync(cachedPath, buf);
  } catch {
    // Ignore cache write errors if tmp directory is full
  }
  return { buf, status: 200 };
}

async function handleVoynichAssetProxy(
  req: Request,
  res: Response,
  folder: 'pages' | 'data',
  rawFilename: string,
): Promise<void> {
  const filename = path.basename(decodeURIComponent(rawFilename));
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    res.status(400).type('text/plain').send('Invalid asset filename');
    return;
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = ASSET_MIME_TYPES[ext] || 'application/octet-stream';
  const cacheHeader = 'public, max-age=31536000, immutable';

  try {
    const { buf: rawBuf, status } = await getRawVoynichAssetBuffer(folder, filename);
    if (!rawBuf) {
      res.status(status).type('text/plain').send('Asset not found');
      return;
    }

    const isRawRequested = req.query['raw'] === '1' || req.query['format'] === 'png';
    if (folder === 'pages' && ext === '.png' && !isRawRequested) {
      const reqFormat = String(req.query['format'] || '').toLowerCase();
      const accept = String(req.headers['accept'] || '');
      const widthBucket = resolveWidthBucket(Number(req.query['w'] || req.query['width'] || 0));

      let targetFormat: 'avif' | 'webp' | 'png' = 'png';
      if (reqFormat === 'avif') {
        targetFormat = 'avif';
      } else if (
        reqFormat === 'webp' ||
        widthBucket > 0 ||
        accept.includes('image/webp') ||
        accept.includes('image/avif')
      ) {
        targetFormat = 'webp';
      }

      if (targetFormat !== 'png') {
        const optCacheDir = path.join(voynichCacheDir, 'pages-opt');
        fs.mkdirSync(optCacheDir, { recursive: true });
        const baseName = filename.replace(/\.png$/i, '');
        const optKey = `${VOYNICH_VERSION.shortSha}_w${widthBucket || 'full'}_${targetFormat}_${baseName}.${targetFormat}`;
        const optPath = path.join(optCacheDir, optKey);

        let optBuf: Buffer;
        if (fs.existsSync(optPath)) {
          optBuf = fs.readFileSync(optPath);
        } else {
          let pipeline = sharp(rawBuf);
          if (widthBucket > 0) {
            pipeline = pipeline.resize({ width: widthBucket, withoutEnlargement: true });
          }
          optBuf =
            targetFormat === 'avif'
              ? await pipeline.avif({ quality: 68, effort: 3 }).toBuffer()
              : await pipeline.webp({ quality: 82, effort: 4 }).toBuffer();
          try {
            fs.writeFileSync(optPath, optBuf);
          } catch {
            // Ignore disk cache write errors
          }
        }

        res
          .status(200)
          .set({
            'Content-Type': targetFormat === 'avif' ? 'image/avif' : 'image/webp',
            'Cache-Control': cacheHeader,
            'X-Content-Type-Options': 'nosniff',
          })
          .send(optBuf);
        return;
      }
    }

    res
      .status(200)
      .set({
        'Content-Type': contentType,
        'Cache-Control': cacheHeader,
        'X-Content-Type-Options': 'nosniff',
      })
      .send(rawBuf);
  } catch {
    res.status(502).type('text/plain').send('Upstream fetch error');
  }
}

/**
 * Lightweight health check endpoint for Railway deployments.
 */
app.get('/healthz', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    voynichCommit: VOYNICH_VERSION.shortSha,
  });
});

/**
 * Runtime legal contact details endpoint so personal address and phone number
 * can be configured via Railway environment variables without committing them
 * to the public GitHub repository.
 */
app.get('/api/legal-info', (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.status(200).json({
    name: process.env['LEGAL_NAME'] || 'Dennis Martin Herbers',
    street: process.env['LEGAL_STREET'] || '',
    postalCity: process.env['LEGAL_POSTAL_CITY'] || '',
    countryDe: process.env['LEGAL_COUNTRY_DE'] || 'Deutschland',
    countryEn: process.env['LEGAL_COUNTRY_EN'] || 'Germany',
    email: process.env['LEGAL_EMAIL'] || 'dennis@dmh.dev',
    phone: process.env['LEGAL_PHONE'] || '',
  });
});

/**
 * First-party GDPR-safe proxy endpoints for Voynich manuscript folio scans (/pages/*)
 * and raw research datasets (/data/*) pinned to VOYNICH_VERSION.commitSha.
 */
app.get('/pages/:filename', (req, res) => {
  void handleVoynichAssetProxy(req, res, 'pages', req.params['filename'] || '');
});

app.get('/data/:filename', (req, res) => {
  void handleVoynichAssetProxy(req, res, 'data', req.params['filename'] || '');
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    index: false,
    redirect: false,
    setHeaders: (res, filePath) => {
      if (/[.-][0-9A-Za-z_-]{8}\.(js|css|woff2)$/i.test(path.basename(filePath))) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=300');
      }
    },
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
