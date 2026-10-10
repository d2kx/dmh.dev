import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Lightweight health check endpoint for Railway deployments.
 */
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
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
