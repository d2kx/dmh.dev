You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Be careful with Angular template whitespace collapsing: when an inline label like `<strong>Email:</strong>` is followed by another inline element (`<a ...>`), place `&nbsp;` or keep them on the same line so a space is always rendered.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

---

# Project Context & Architecture (`dmh.dev`)

This section provides complete operational context so any fresh coding agent session can immediately understand the repository layout, architectural decisions, deployment pipeline, and rules without requiring re-explanation from the user.

## 1. Project Overview, Security & Content Rules

- **Domain**: `dmh.dev` (owned by Dennis Martin Herbers, registered with GoDaddy).
- **GitHub Repository**: [`https://github.com/d2kx/dmh.dev`](https://github.com/d2kx/dmh.dev) (**PUBLIC** repository).
- **CRITICAL PUBLIC REPO RULE**:
  - **NEVER commit secrets, API keys, tokens, database URLs, private home addresses, private phone numbers, or `.env` files to this repository.**
  - If any feature or integration could risk exposing sensitive data or credentials in the repository, **stop and warn the user immediately** before proceeding so they can decide whether to store it in Railway environment variables or make the repository private.
  - All runtime secrets, service-to-service connection strings, and personal legal address details must be configured as Railway Variables (e.g., `${{Postgres.DATABASE_URL}}`, `LEGAL_STREET`, `LEGAL_POSTAL_CITY`, `LEGAL_PHONE`).
- **Visitor Content vs. Technical Documentation Rule**:
  - Keep visitor-facing pages (`Home`, `Projects`, `Blog`, `About`) focused on content relevant to visitors. Do NOT clutter visitor-facing copy with internal infrastructure details (e.g., "Hybrid Prerender & SSR", "Hosted on Railway", or monorepo `/apps` subdomain architecture). Keep those technical details documented here in `AGENTS.md` and `README.md`.
- **Writing Style Rule (NO Em Dashes)**:
  - **NEVER use `—` (em dashes)** in any visitor-facing text, page titles, meta descriptions, blog posts, or UI copy. The user never uses em dashes in their own writing and considers them unnatural/fake-looking. Use standard commas, colons, periods, or middle dots (`·`) / pipes (`|`) instead.
- **Legal Maintenance Rule (`Impressum` & `Datenschutzerklärung`)**:
  - Whenever you introduce any new functionality that affects legal disclosures or data privacy (such as analytics, cookies, new `localStorage` / `sessionStorage` keys, authentication, contact forms, database storage of user data, external embeds, or third-party APIs), you **MUST** proactively update `/impressum` (`src/app/features/impressum/impressum.ts`) and `/privacy` (`src/app/features/privacy/privacy.ts`) in both German (`de`) and English (`en`), and warn the user beforehand if a cookie/consent banner would become legally required under German DSGVO / TDDDG.
- **Package & Tooling Version Currency Rule**:
  - When generating a project with an existing framework CLI (e.g., `@angular/cli`), it is fine to keep the package versions predefined by that framework's official scaffold.
  - However, when creating standalone/vanilla apps (such as Vite mini-apps in `apps/`) or adding new packages manually, **always check and use current latest stable releases** (e.g., via `npm create vite@latest` or `npm view <pkg> version`) rather than writing older package versions from training weights.
- **Proactive Guidance Rule**:
  - The user welcomes proactive feedback and recommendations. If a requested approach has architectural, security, legal, DNS, or cost downsides, point it out clearly and suggest a better alternative.

## 2. Repository Layout (Monorepo)

Everything for `dmh.dev`—both the main personal website/blog and future standalone mini-apps—lives in this single repository:

```text
dmh.dev/
├── src/                        # Main dmh.dev Angular 22 application source
│   ├── app/
│   │   ├── core/               # Singleton services (theme.ts, legal-info.ts, seo.ts)
│   │   ├── shared/             # Reusable UI components (social-links.ts)
│   │   ├── features/           # Lazy-loaded route feature components (home, blog, impressum, privacy)
│   │   ├── app.config.ts       # Client providers (Router + ViewTransitions, HttpClient + Fetch, Hydration + EventReplay)
│   │   ├── app.config.server.ts# Server providers (provideServerRendering with serverRoutes)
│   │   ├── app.routes.ts       # Client route definitions & route SEO/Open Graph metadata
│   │   ├── app.routes.server.ts# Hybrid rendering config (RenderMode.Prerender + RenderMode.Server)
│   │   ├── app.ts              # Root shell component (Material Toolbar, Sakura logo, nav, theme toggle, legal footer)
│   │   ├── app.html            # Accessible site shell template
│   │   └── app.css             # Shell layout styles
│   ├── server.ts               # Express 5 + AngularNodeAppEngine SSR server, /healthz & /api/legal-info endpoints
│   ├── main.ts                 # Browser bootstrap
│   ├── main.server.ts          # Server bootstrap
│   ├── theme.scss              # Angular Material 3 mat.theme() config (rose/sakura + Google Sans Flex Variable)
│   ├── styles.css              # Global CSS (Sakura light-dark() tokens, color-scheme overrides, focus styles)
│   └── index.html              # Root HTML document (color-scheme meta, FOUC script, default Open Graph tags)
├── public/                     # Static public assets (favicon.svg, favicon.ico, og-image.png, robots.txt, llms.txt)
├── apps/                       # Directory for standalone mini-apps on subdomains (<app>.dmh.dev)
│   ├── kaleidoscope/           # Interactive Sakura & Fractal WebGL Kaleidoscope (kaleidoscope.dmh.dev)
│   └── README.md               # Guide for adding and deploying new mini-apps
├── angular.json                # Angular CLI build/serve/SSR/lint configuration & SSRF allowedHosts
├── eslint.config.js            # ESLint + angular-eslint (TS, inline templates, a11y rules)
├── package.json                # Root scripts & dependencies
├── AGENTS.md                   # Primary agent instructions & project architecture (this file)
└── .gemini/GEMINI.md           # Synchronized copy of AGENTS.md for Gemini tooling
```

> **Note**: Whenever you update `AGENTS.md` with new architectural decisions, services, or mini-apps, keep `.gemini/GEMINI.md` synchronized as well.

## 3. Main `dmh.dev` Application Details

- **Framework & Official Libraries**:
  - Angular v22 (`@angular/core` ^22.2.0, `@angular/ssr` ^22.2.2, `angular-eslint` ^22.5.0, TypeScript ~6.0, Vitest ^5.0).
  - UI & Helpers: `@angular/material` ^22.2.0 and `@angular/cdk` ^22.2.0 (`MediaMatcher`, `Platform`, `LiveAnnouncer`, `Clipboard`). Prefer official Angular Material components and CDK utilities before reaching for third-party UI libraries.
- **Design System, Theme, Brand Mark & Social Links**:
  - **Theme**: Clean neutral light/dark surfaces with playful **Sakura / Cherry-Blossom Pink** accents (`--accent-light: #b81d5c`, `--accent-dark: #ff8ab5`, soft sakura containers `#fde8f0` / `#3b1225`). All color pairings exceed WCAG AA (4.5:1) contrast requirements.
  - **Brand Logo & Favicon**: Custom 5-petal notched Sakura cherry blossom SVG mark paired with `dmh.dev` in `src/app/app.html` and adaptive SVG favicon in `public/favicon.svg`.
  - **Navigation & Consolidated Home Page (`src/app/features/home/home.ts`)**: Primary navigation has two items (`Home` and `Blog`). `Home` combines the personal intro/bio, social links, and the `t3.gg/sponsors`-inspired **Projects** grid (full-card clickable project cards featuring each project's custom SVG logo with ambient radial glow, project title, domain badge, concise description, and category pills). Once real blog posts are published in the future, `Home` should also include a preview section showing the latest 3 blog posts (headline + short summary).
  - **Social & Contact Links (`src/app/shared/social-links.ts`)**: Reusable `<app-social-links />` component displayed on `Home` with official inline SVG icons and light/dark brand color schemes for:
    - GitHub: `https://github.com/d2kx`
    - LinkedIn: `https://www.linkedin.com/in/dennis-martin-herbers-085058156`
    - X (Twitter): `https://x.com/D2KX_`
    - Email: `mailto:dennis@dmh.dev`
  - **Light/Dark Mode Toggle**: Implemented via `src/app/core/theme.ts` (`ThemeService`), `<meta name="color-scheme" content="light dark">` in `src/index.html`, and `:root:has(> head > meta[name="color-scheme"])` rules in `src/styles.css` so `light-dark()` and Angular Material M3 `--mat-sys-*` tokens adapt seamlessly with zero FOUC.
  - **Self-Hosted Font (`Google Sans Flex`)**: Uses `@fontsource-variable/google-sans-flex` (SIL Open Font License 1.1) bundled locally at build time via `angular.json`. **Never load fonts from `fonts.googleapis.com` or `fonts.gstatic.com`**—dynamic requests to Google Fonts CDN without prior consent violate German GDPR/DSGVO case law (LG München I, Az. 3 O 17493/20).
- **SEO, Open Graph & Social Link Previews (`src/app/core/seo.ts`)**:
  - `SeoService` (`src/app/core/seo.ts`) listens to router `NavigationEnd` events (during build-time prerendering, SSR, and client-side navigation) and reads `data['seo']` (`RouteSeoData`) from `src/app/app.routes.ts` to update `<meta name="description">`, Open Graph (`og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`, `og:locale`, `og:image`), X/Twitter (`twitter:card`, `twitter:creator`), and `<link rel="canonical">`.
  - Default social preview card image (`1200x630` PNG) is served at `public/og-image.png` (`https://www.dmh.dev/og-image.png`).
- **German Legal Compliance (`Impressum` & `Datenschutzerklärung`)**:
  - Routes `/impressum` (`src/app/features/impressum/impressum.ts`) and `/privacy` (`src/app/features/privacy/privacy.ts`) are linked in the global footer (1 click from every page) and offer an instant **Deutsch (`de`) | English (`en`)** switcher via `LegalInfoService` (`src/app/core/legal-info.ts`).
  - `/impressum` covers **§ 5 DDG** (Digitale-Dienste-Gesetz) and **§ 18 Abs. 2 MStV** (Medienstaatsvertrag). In English mode it uses the clean heading `Legal Notice`.
  - `/privacy` covers **Art. 13 DSGVO (GDPR)** and **§ 25 Abs. 2 Nr. 2 TDDDG** (Railway server access logs, HTTPS, locally hosted `Google Sans Flex`, `localStorage` theme preference, email contact, and data subject rights).
  - **Runtime Contact Details (`/api/legal-info`)**: To avoid committing a private residential street address or phone number to the public GitHub repository, `src/server.ts` serves `/api/legal-info` from Railway environment variables (already configured in Railway `production` on service `web`):
    - `LEGAL_NAME` (defaults to `Dennis Martin Herbers`)
    - `LEGAL_STREET` (configured in Railway Variables)
    - `LEGAL_POSTAL_CITY` (configured in Railway Variables)
    - `LEGAL_COUNTRY_DE` (defaults to `Deutschland`)
    - `LEGAL_COUNTRY_EN` (defaults to `Germany`)
    - `LEGAL_EMAIL` (defaults to `dennis@dmh.dev`)
    - `LEGAL_PHONE` (optional phone number)
- **File Naming Style**: Angular `2025` ("Intent over Role") style guide — suffixless filenames (`home.ts`, `app.ts`) and class names (`Home`, `App`), with `.spec.ts` for unit tests and `.model.ts` for interfaces/models.
- **Hybrid Rendering (Prerender + SSR)**:
  - Configured via `outputMode: "server"` in `angular.json` and `serverRoutes` in `src/app/app.routes.server.ts`.
  - Static routes (`''`, `'blog'`, `'impressum'`, `'privacy'`) use `RenderMode.Prerender`: they are pre-rendered into static HTML at `ng build` time and served immediately by the server without per-request rendering overhead.
  - Dynamic / catch-all routes (`'**'`) use `RenderMode.Server`: rendered on demand by `AngularNodeAppEngine` in `src/server.ts`.
  - Parameterized static routes (e.g., future `blog/:slug` posts) should use `RenderMode.Prerender` with `getPrerenderParams()` (and `fallback: PrerenderFallback.Server` if dynamic posts are added later).
- **SSRF Host Protection (`allowedHosts`)**:
  - Angular v22 enforces host header validation in `AngularNodeAppEngine` and returns `400 Bad Request` for unrecognized hostnames.
  - Authorized hosts are configured in `angular.json` under `projects.dmh-dev.architect.build.options.security.allowedHosts`:
    `["dmh.dev", "*.dmh.dev", "*.up.railway.app", "localhost"]`.
  - Can also be overridden at runtime via the `NG_ALLOWED_HOSTS` environment variable.
- **Code Quality, Linting (`angular-eslint`), & Lighthouse Audits**:
  - Configured in `eslint.config.js` with `tseslint.configs.recommended`, `tseslint.configs.stylistic`, `angular.configs.tsRecommended`, `angular.configs.templateRecommended`, and `angular.configs.templateAccessibility`.
  - Always run `npm run lint` (or `ng lint`) alongside `npm run build` and `npm test` after making code changes to ensure zero lint or accessibility rule violations.
  - **Lighthouse Habit**: Whenever relevant content, UI, or routing changes take place on any web app in the repository, run a Lighthouse audit (e.g., via the `chrome-devtools` MCP `lighthouse_audit` tool or Lighthouse CLI) and act upon its findings before wrapping up. Keep `public/robots.txt` and `public/llms.txt` up to date so SEO and Agentic Browsing audits continue to score 100.
- **Local Development & Scripts**:
  - `npm run dev` (or `ng serve`): Starts local dev server with HMR at `http://localhost:4200`.
  - `npm run build` (or `ng build`): Builds browser and server bundles + prerenders static routes into `dist/dmh-dev/`.
  - `npm start` (or `npm run serve:ssr:dmh-dev`): Runs the compiled production Express + Angular SSR server (`node dist/dmh-dev/server/server.mjs`) on `PORT` (defaults to `4000`).
  - `npm run lint` (or `ng lint`): Lints all TypeScript and HTML templates in `src/` via `angular-eslint`.
  - `npm test` (or `ng test --watch=false`): Runs unit tests via Vitest.

## 4. Railway Infrastructure & Cost Optimization

All infrastructure is hosted on Railway using the `use-railway` skill / Railway CLI.

### Railway Resource IDs & Domains
- **Workspace**: `Dennis Martin Herbers's Projects` (`7d85a0e4-7193-4b4c-857b-d779e3a36cd6`)
- **Project**: `dmh.dev` (`4df1008f-af41-461c-8af2-313e8e1b04b0`)
  - Dashboard: `https://railway.com/project/4df1008f-af41-461c-8af2-313e8e1b04b0`
- **Environment**: `production` (`ba9dcd20-f764-4a5e-b6fe-61a18bd66ae0`)
- **Main Service**: `web` (`9c477572-b4a1-491f-bee9-6a5261f63e68`)
  - **Region**: Europe (Netherlands / Amsterdam) (`europe-west4-drams3a`).
  - **Custom Domain**: `https://www.dmh.dev` (verified with SSL certificate on Railway, target port `8080`, `CNAME` `www` -> `sbnq1uoz.up.railway.app`).
  - **Railway Service Domain**: `https://web-production-e94e.up.railway.app` (target port `8080`).
  - **DNS / Nameserver Constraint**: The domain `dmh.dev` is managed on GoDaddy's nameservers (cannot be moved to third-party nameservers). Because GoDaddy does not support `CNAME` flattening at the root (`@`), `www.dmh.dev` is the primary custom domain on Railway and `dmh.dev` uses GoDaddy Domain Forwarding (`301` redirect to `https://www.dmh.dev`). Mini-apps on subdomains (`kaleidoscope.dmh.dev`, `app2.dmh.dev`, etc.) use standard `CNAME` records in GoDaddy DNS directly.

### Cost-Control & Performance Configuration on `web`
To keep Railway costs as low as possible while supporting full SSR + Prerendering:
1. **Builder**: `RAILPACK` (automatically caches Node modules and build layers across deployments).
2. **Build & Start Commands**:
   - `build.buildCommand`: `"npm run build"`
   - `deploy.startCommand`: `"node dist/dmh-dev/server/server.mjs"`
   - `deploy.healthcheckPath`: `"/healthz"`
3. **Scoped Watch Patterns**:
   - `build.watchPatterns`: `["src/**", "public/**", "package.json", "package-lock.json", "angular.json", "tsconfig*.json"]`
   - Prevents changes inside `apps/` or markdown docs (`AGENTS.md`, `README.md`) from triggering unnecessary paid rebuilds of the main `web` service.
4. **Serverless / App Sleep (`deploy.sleepApplication: true`)**:
   - Automatically puts the container to sleep after ~5–10 minutes of inactivity so idle compute cost is $0, waking automatically on incoming requests.
5. **Single EU Replica (`deploy.multiRegionConfig: { "europe-west4-drams3a": { "numReplicas": 1 } }`)**:
   - Runs a single lightweight instance in the EU (Netherlands) region for low latency in Germany/Europe and EU data residency.
6. **Railway Edge CDN Caching (`railway cdn enable --service web`)**:
   - Caches static assets (`maxAge: 1y`) and cacheable responses at the Railway CDN edge so cache hits don't even wake or hit the Node container.

## 5. Current Apps & Services (`apps/`) & Adding Future Mini-Apps

### Current Standalone Mini-Apps
1. **`kaleidoscope` (`apps/kaleidoscope/`)**:
   - **Railway Service ID**: `74f94487-13fd-461b-8b2c-24f9c5ec02c4` (region `europe-west4-drams3a`, `sleepApplication: true`, Edge CDN enabled).
   - **Custom Domain**: `https://kaleidoscope.dmh.dev` (target port `8080`, `CNAME` `kaleidoscope` -> `oxvts028.up.railway.app`, `TXT` `_railway-verify.kaleidoscope` -> `railway-verify=b3d0173c8fab362faa67d7e4702bd979ff3235bac28889c510955107d68c613c`).
   - **Railway Service Domain**: `https://kaleidoscope-production.up.railway.app`
   - **Tech Stack**: Vite 8 (`^8.3.4`) + TypeScript 6.0 + pure WebGL2/WebGL fullscreen GLSL shader engine (`src/kaleidoscope-gl.ts`), self-hosted `@fontsource-variable/google-sans-flex` (`^5.3.2`), and a zero-dependency Node HTTP server (`server.mjs`) with gzip and `/healthz`.
   - **Features**: Hands-free continuously evolving shader blending Sakura, Prism, Lotus, and Cyber aesthetics with smooth tear-free symmetry transitions (6–12 folds) and breathing bloom, plus a single unified top-left glassmorphic pill combining the brand logo, legal links, optional inline performance HUD (`FPS` + `ms` + live SVG sparkline), and Fullscreen button.

### Adding Future Mini-Apps (`app2.dmh.dev`, etc.)
- Place each standalone mini-app in `apps/<app-name>/`.
- Create a dedicated Railway service in the `dmh.dev` project:
  ```bash
  railway add --service <app-name> --json
  ```
- Configure the service to build only from `/apps/<app-name>` in the EU (Netherlands) region (`europe-west4-drams3a`) with its own watch pattern and App Sleep enabled:
  ```bash
  railway environment edit --service-config <app-name> source.repo "d2kx/dmh.dev"
  railway environment edit --service-config <app-name> source.branch "main"
  railway environment edit --service-config <app-name> source.rootDirectory "/apps/<app-name>"
  railway environment edit --service-config <app-name> build.watchPatterns '["apps/<app-name>/**"]'
  railway environment edit --service-config <app-name> deploy.sleepApplication true
  ```
  *(Also ensure `deploy.multiRegionConfig` is set to `{"europe-west4-drams3a": {"numReplicas": 1}}` and any default US region key is set to `null`.)*
- Add the subdomain (`railway domain <app-name>.dmh.dev --service <app-name> --json`) and configure the returned `CNAME` + `_railway-verify` `TXT` records in DNS.
- Document every new mini-app in this `AGENTS.md` file under **Current Standalone Mini-Apps**.

### Databases & Storage
- When a database is needed later, provision it inside the `dmh.dev` Railway project (and ensure its region is set to `europe-west4-drams3a` so it is co-located with the app services in Amsterdam):
  ```bash
  railway add --database postgres --json
  ```
- Connect services using Railway reference variables over the private network (`${{Postgres.DATABASE_URL}}` -> `postgres.railway.internal`) so traffic stays internal and incurs zero egress fees:
  ```bash
  railway variable set DATABASE_URL='${{Postgres.DATABASE_URL}}' --service <service-name>
  ```
- Note: Keep active database connection pools minimal or close idle connections if you want services with `sleepApplication: true` to sleep during inactivity (active outbound DB heartbeats prevent App Sleep).
