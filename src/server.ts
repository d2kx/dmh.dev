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
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

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

  // 1. Check local sibling repo if available during local development
  const localFile = path.join(localVoynichRepo, folder, filename);
  if (fs.existsSync(localFile)) {
    const buf = fs.readFileSync(localFile);
    res
      .status(200)
      .set({
        'Content-Type': contentType,
        'Cache-Control': cacheHeader,
        'X-Content-Type-Options': 'nosniff',
      })
      .send(buf);
    return;
  }

  // 2. Check container disk cache
  try {
    const folderCacheDir = path.join(voynichCacheDir, folder);
    fs.mkdirSync(folderCacheDir, { recursive: true });
    const cachedPath = path.join(folderCacheDir, `${VOYNICH_VERSION.shortSha}_${filename}`);
    if (fs.existsSync(cachedPath)) {
      const buf = fs.readFileSync(cachedPath);
      res
        .status(200)
        .set({
          'Content-Type': contentType,
          'Cache-Control': cacheHeader,
          'X-Content-Type-Options': 'nosniff',
        })
        .send(buf);
      return;
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
      res.status(upstreamRes.status).type('text/plain').send('Asset not found');
      return;
    }

    const arrayBuf = await upstreamRes.arrayBuffer();
    const buf = Buffer.from(arrayBuf);
    try {
      fs.writeFileSync(cachedPath, buf);
    } catch {
      // Ignore cache write errors if tmp directory is full
    }

    res
      .status(200)
      .set({
        'Content-Type': contentType,
        'Cache-Control': cacheHeader,
        'X-Content-Type-Options': 'nosniff',
      })
      .send(buf);
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
    maxAge: '1y',
    index: false,
    redirect: false,
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
