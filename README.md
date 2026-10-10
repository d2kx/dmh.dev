# dmh.dev

Personal website, blog, and mini-apps monorepo for **Dennis Martin Herbers** ([dmh.dev](https://dmh.dev)).

## Tech Stack & Architecture

- **Framework**: [Angular 22](https://angular.dev) with Hybrid Rendering (`@angular/ssr`):
  - **Build-Time Prerendering (SSG)** (`RenderMode.Prerender`) for static content routes (`/`, `/projects`, `/blog`, `/about`, `/impressum`, `/privacy`).
  - **Server-Side Rendering (SSR)** (`RenderMode.Server`) via Express 5 & `AngularNodeAppEngine` (`src/server.ts`) for dynamic routes and server endpoints (`/healthz`, `/api/legal-info`).
- **UI & Design**: `@angular/material` & `@angular/cdk` with a custom Sakura / Cherry-Blossom Pink Light & Dark theme (`light-dark()`) and self-hosted `Google Sans Flex Variable` typography (`@fontsource-variable/google-sans-flex`, SIL Open Font License 1.1).
- **Hosting & Deployment**: [Railway](https://railway.com) (`dmh.dev` project) with Railpack build caching, Edge CDN, and Serverless (App Sleep) enabled for low-cost operation.
- **Mini-Apps (`apps/`)**: Subdirectory reserved for standalone mini-apps deployed to subdomains (`app1.dmh.dev`, `app2.dmh.dev`, etc.).

## Development

```bash
# Start local development server (http://localhost:4200)
npm run dev

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
