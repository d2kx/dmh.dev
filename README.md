# dmh.dev

Personal website, interactive projects, and blog for **Dennis Martin Herbers** ([dmh.dev](https://www.dmh.dev)).

## Tech Stack & Architecture

- **Framework**: [Angular 22](https://angular.dev) with Hybrid Rendering (`@angular/ssr`):
  - **Build-Time Prerendering (SSG)** (`RenderMode.Prerender`) for static content and project routes (`/`, `/voynich`, `/voynich/:section`, `/kaleidoscope`, `/blog`, `/impressum`, `/privacy`).
  - **Server-Side Rendering (SSR)** (`RenderMode.Server`) via Express 5 & `AngularNodeAppEngine` (`src/server.ts`) for dynamic routes and server endpoints (`/healthz`, `/api/legal-info`, `/pages/:filename`, `/data/:filename`).
- **Context-Aware App Shell**:
  - Top toolbar dynamically adapts between the main `dmh.dev` header (with a Prisma-inspired `Projects` flyout menu), **Voynich** (`/voynich`), and the full-bleed **Kaleidoscope** WebGL shader (`/kaleidoscope`).
- **UI & Design**: `@angular/material` & `@angular/cdk` with a custom Sakura / Cherry-Blossom Pink Light & Dark theme (`light-dark()`) and self-hosted `Google Sans Flex Variable` typography (`@fontsource-variable/google-sans-flex`, SIL Open Font License 1.1).
- **Hosting & Deployment**: [Railway](https://railway.com) (`dmh.dev` project, single `web` service) with Railpack build caching, Edge CDN, and Serverless (App Sleep) enabled for low-cost operation.

## Voynich Manuscript Digital Surrogates & Licensing

The high-resolution manuscript scans (`/pages/*`) and full PDF editions linked in **Voynich** (`/voynich/library?subtab=scans`) are **Public Domain** digital surrogates of the 15th-century Voynich Manuscript (**Beinecke MS 408**):

1. **Yale Beinecke High-Resolution Export (`voynich-yale-beinecke-2026-highres-214p.pdf`, 214 pages, 138.4 MB)**:
   - **Source**: Yale University Library, Beinecke Rare Book and Manuscript Library Digital Collections · [Voynich Manuscript, MS 408](https://collections.library.yale.edu/catalog/2002046).
   - **License**: Public Domain (`CC0 1.0` / No Copyright · United States), designated by Yale University Library for free use and redistribution without restriction.
2. **Bookmarked TCPDF Edition (`voynich-tcpdf-2014-bookmarked-210p.pdf`, 210 pages, 75.2 MB)**:
   - **Source**: Internet Archive · [The Voynich Manuscript](https://archive.org/details/TheVoynichManuscript) (compiled from the Yale Beinecke MS 408 digital surrogates with a 210-entry clickable folio bookmark tree).
   - **License**: Public Domain (underlying 15th-century manuscript MS 408 and Yale Beinecke digital surrogates).

## Development

```bash
# Start local development server (http://localhost:4200)
npm run dev

# Sync Voynich Manuscript research corpus & guides from ../voynich
npm run sync:voynich

# Build production browser + SSR bundles and prerender static routes
npm run build

# Run the compiled production SSR server locally (http://localhost:4000)
npm start

# Lint TypeScript and HTML templates (angular-eslint)
npm run lint

# Run unit tests (Vitest)
npm test
```

For full architectural details, deployment configuration, and AI agent guidelines, see [`AGENTS.md`](./AGENTS.md).
