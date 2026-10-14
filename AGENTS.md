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
  - Keep visitor-facing pages (`Home`, `Blog`, `Voynich`, `Kaleidoscope`) focused on content relevant to visitors. Do NOT clutter visitor-facing copy with internal infrastructure details (e.g., "Hybrid Prerender & SSR" or "Hosted on Railway"). Keep those technical details documented here in `AGENTS.md` and `README.md`.
- **Writing Style Rule (NO Em Dashes)**:
  - **NEVER use `—` (em dashes)** in any visitor-facing text, page titles, meta descriptions, blog posts, or UI copy. The user never uses em dashes in their own writing and considers them unnatural/fake-looking. Use standard commas, colons, periods, or middle dots (`·`) / pipes (`|`) instead.
- **Legal Maintenance Rule (`Impressum` & `Datenschutzerklärung`)**:
  - Whenever you introduce any new functionality that affects legal disclosures or data privacy (such as analytics, cookies, new `localStorage` / `sessionStorage` keys, authentication, contact forms, database storage of user data, external embeds, or third-party APIs), you **MUST** proactively update `/impressum` (`src/app/features/impressum/impressum.ts`) and `/privacy` (`src/app/features/privacy/privacy.ts`) in both German (`de`) and English (`en`), and warn the user beforehand if a cookie/consent banner would become legally required under German DSGVO / TDDDG.
- **Package & Tooling Version Currency Rule**:
  - When generating a project with an existing framework CLI (e.g., `@angular/cli`), it is fine to keep the package versions predefined by that framework's official scaffold.
  - However, when adding new packages manually, **always check and use current latest stable releases** (e.g., via `npm view <pkg> version`) rather than writing older package versions from training weights.
- **Proactive Guidance Rule**:
  - The user welcomes proactive feedback and recommendations. If a requested approach has architectural, security, legal, DNS, or cost downsides, point it out clearly and suggest a better alternative.

## 2. Repository Layout (Unified Angular 22 Application)

Everything for `dmh.dev`—both the main personal website/blog and custom interactive apps (`Voynich Manuscript Explorer`, `Kaleidoscope`, and future projects)—lives inside a single, unified Angular 22 SSR/Prerender application:

```text
dmh.dev/
├── src/                        # Main dmh.dev Angular 22 application source
│   ├── app/
│   │   ├── core/               # Singleton services (theme.ts, legal-info.ts, seo.ts, shell-context.ts)
│   │   ├── shared/             # Reusable UI components (social-links.ts)
│   │   ├── features/           # Lazy-loaded route feature components
│   │   │   ├── home/           # Home page + Projects showcase grid
│   │   │   ├── blog/           # Blog index
│   │   │   ├── voynich/        # Voynich Manuscript Explorer (/voynich & /voynich/:section)
│   │   │   ├── kaleidoscope/   # Full-bleed WebGL Sakura & Fractal Kaleidoscope (/kaleidoscope)
│   │   │   ├── impressum/      # Bilingual Impressum / Legal Notice
│   │   │   └── privacy/        # Bilingual Datenschutzerklärung / Privacy Policy
│   │   ├── app.config.ts       # Client providers (Router + ViewTransitions + AnchorScrolling, HttpClient + Fetch, Hydration)
│   │   ├── app.config.server.ts# Server providers (provideServerRendering with serverRoutes)
│   │   ├── app.routes.ts       # Client route definitions & route SEO/Open Graph metadata
│   │   ├── app.routes.server.ts# Hybrid rendering config (RenderMode.Prerender + RenderMode.Server)
│   │   ├── app.ts              # Root shell component (Context-aware Material Toolbar, Projects flyout, theme toggle, footer)
│   │   ├── app.html            # Accessible site shell template
│   │   └── app.css             # Shell & Projects flyout layout styles
│   ├── server.ts               # Express 5 + AngularNodeAppEngine SSR server (/healthz, /api/legal-info, /pages/*, /data/*)
│   ├── main.ts                 # Browser bootstrap
│   ├── main.server.ts          # Server bootstrap
│   ├── theme.scss              # Angular Material 3 mat.theme() config (rose/sakura + Google Sans Flex Variable)
│   ├── styles.css              # Global CSS (Sakura light-dark() tokens, 66ch .markdown-body typography, focus styles)
│   └── index.html              # Root HTML document (color-scheme meta, FOUC script, default Open Graph tags)
├── public/                     # Static public assets (favicon.svg, og-image.png, robots.txt, llms.txt, content/voynich/*)
├── scripts/
│   └── sync-voynich.mjs        # Syncs Voynich corpus, guides, and commit metadata from ../voynich
├── angular.json                # Angular CLI build/serve/SSR/lint configuration & SSRF allowedHosts
├── eslint.config.js            # ESLint + angular-eslint (TS, inline templates, a11y rules)
├── package.json                # Root scripts & dependencies
├── AGENTS.md                   # Primary agent instructions & project architecture (this file)
└── .gemini/GEMINI.md           # Synchronized copy of AGENTS.md for Gemini tooling
```

> **Note**: Whenever you update `AGENTS.md` with new architectural decisions, services, or project routes, keep `.gemini/GEMINI.md` synchronized as well.

## 3. Main `dmh.dev` Application & Context-Aware Shell Details

- **Framework & Official Libraries**:
  - Angular v22 (`@angular/core` ^22.2.0, `@angular/ssr` ^22.2.2, `angular-eslint` ^22.5.0, TypeScript ~6.0, Vitest ^5.0).
  - UI & Helpers: `@angular/material` ^22.2.0 and `@angular/cdk` ^22.2.0 (`MediaMatcher`, `Platform`, `LiveAnnouncer`, `Clipboard`), plus `marked` ^18.1.1 for CommonMark + GFM Markdown rendering in Voynich Research Guides (`src/app/features/voynich/voynich-decoder.ts`). Prefer official Angular Material components and CDK utilities before reaching for third-party UI libraries.
- **Design System, Theme, Brand Mark & Social Links**:
  - **Theme**: Clean neutral light/dark surfaces with playful **Sakura / Cherry-Blossom Pink** accents (`--accent-light: #b81d5c`, `--accent-dark: #ff8ab5`, soft sakura containers `#fde8f0` / `#3b1225`). All color pairings exceed WCAG AA (4.5:1) contrast requirements.
  - **Brand Logo & Route-Aware Favicons**: Custom 5-petal notched Sakura cherry blossom SVG mark paired with `dmh.dev` in `src/app/app.html`. `SeoService` dynamically switches `<link rel="icon">` between the main Sakura badge (`public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`), the Voynich Astrolabe & Rosette icon (`public/favicon-voynich.svg`, `public/favicon-voynich.ico`), and the Kaleidoscope Prism & Sakura icon (`public/favicon-kaleidoscope.svg`, `public/favicon-kaleidoscope.ico`).
  - **Context-Aware Header (`ShellContextService` in `src/app/core/shell-context.ts`)**:
    - **Main `dmh.dev` Mode (`/`, `/blog`, `/impressum`, `/privacy`)**: Displays the Sakura brand mark on the left and `Home`, `Projects ▾` (a Prisma-inspired hover/click flyout card listing each interactive project with its custom SVG icon, title, subtitle, and `Explore all projects →` anchor link), and `Blog` on the right.
    - **Voynich Mode (`/voynich`, `/voynich/:section`)**: Switches the top toolbar to show a `← dmh.dev` back pill, the Voynich Astrolabe & Rosette icon + `dmh.dev Voynich`, the pinned `voynich-research` commit badge (`7489d4f · 2026-10-14` linking to `https://github.com/d2kx/voynich-research`), and the 6 Voynich sub-navigation links (`Overview`, `Walkthroughs`, `Identifications`, `Grammar`, `Library`, `Folios`).
    - **Kaleidoscope Mode (`/kaleidoscope`)**: Switches the shell into full-bleed viewport mode (`isFullBleed() === true`) with a translucent glassmorphic floating toolbar that gently dims on idle and exposes the `← dmh.dev` back pill, `dmh.dev Kaleidoscope` brand, optional live `FPS / ms` + SVG sparkline readout, `Stats` toggle, and `Fullscreen` button.
  - **Consolidated Home Page (`src/app/features/home/home.ts`)**: Combines the personal intro/bio, `<app-social-links />`, and the `t3.gg/sponsors`-inspired **Projects** grid (`#projects`). Once real blog posts are published in the future, `Home` should also include a preview section showing the latest 3 blog posts (headline + short summary).
  - **Social & Contact Links (`src/app/shared/social-links.ts`)**: Reusable `<app-social-links />` component displayed on `Home` with official inline SVG icons and light/dark brand color schemes for:
    - GitHub: `https://github.com/d2kx`
    - LinkedIn: `https://www.linkedin.com/in/dennis-martin-herbers-085058156`
    - X (Twitter): `https://x.com/D2KX_`
    - Email: `mailto:dennis@dmh.dev`
  - **Light/Dark Mode Toggle**: Implemented via `src/app/core/theme.ts` (`ThemeService`), `<meta name="color-scheme" content="light dark">` in `src/index.html`, and `:root:has(> head > meta[name="color-scheme"])` rules in `src/styles.css` so `light-dark()` and Angular Material M3 `--mat-sys-*` tokens adapt seamlessly with zero FOUC.
  - **Self-Hosted Font (`Google Sans Flex`)**: Uses `@fontsource-variable/google-sans-flex` (SIL Open Font License 1.1) bundled locally at build time via `angular.json`. **Never load fonts from `fonts.googleapis.com` or `fonts.gstatic.com`**—dynamic requests to Google Fonts CDN without prior consent violate German GDPR/DSGVO case law (LG München I, Az. 3 O 17493/20).
- **SEO, Open Graph & Social Link Previews (`src/app/core/seo.ts`)**:
  - `SeoService` (`src/app/core/seo.ts`) listens to router `NavigationEnd` events (during build-time prerendering, SSR, and client-side navigation) and reads `data['seo']` (`RouteSeoData`) from `src/app/app.routes.ts` to update `<meta name="description">`, Open Graph (`og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`, `og:locale`, `og:image`, `og:image:alt`), X/Twitter (`twitter:card`, `twitter:creator`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`), and `<link rel="canonical">`.
  - Social preview card images (`1200x630` PNG) are served at:
    - `public/og-image.png` (`https://www.dmh.dev/og-image.png`) for the main site (`/`, `/blog`, `/impressum`, `/privacy`)
    - `public/og-voynich.png` (`https://www.dmh.dev/og-voynich.png`) for `/voynich` and `/voynich/:section`
    - `public/og-kaleidoscope.png` (`https://www.dmh.dev/og-kaleidoscope.png`) for `/kaleidoscope`
- **German Legal Compliance (`Impressum` & `Datenschutzerklärung`)**:
  - Routes `/impressum` (`src/app/features/impressum/impressum.ts`) and `/privacy` (`src/app/features/privacy/privacy.ts`) are linked in the global footer (1 click from every page) and offer an instant **Deutsch (`de`) | English (`en`)** switcher via `LegalInfoService` (`src/app/core/legal-info.ts`).
  - `/impressum` covers **§ 5 DDG** (Digitale-Dienste-Gesetz) and **§ 18 Abs. 2 MStV** (Medienstaatsvertrag). In English mode it uses the clean heading `Legal Notice`.
  - `/privacy` covers **Art. 13 DSGVO (GDPR)** and **§ 25 Abs. 2 Nr. 2 TDDDG** (Railway server access logs, HTTPS, locally hosted `Google Sans Flex`, `localStorage` theme preference, email contact, and data subject rights).
  - **Runtime Contact Details (`/api/legal-info`)**: `src/server.ts` serves `/api/legal-info` from Railway environment variables (`LEGAL_NAME`, `LEGAL_STREET`, `LEGAL_POSTAL_CITY`, `LEGAL_COUNTRY_DE`, `LEGAL_COUNTRY_EN`, `LEGAL_EMAIL`, `LEGAL_PHONE`).
- **File Naming Style**: Angular `2025` ("Intent over Role") style guide — suffixless filenames (`home.ts`, `app.ts`) and class names (`Home`, `App`), with `.spec.ts` for unit tests and `.model.ts` for interfaces/models.
- **Hybrid Rendering (Prerender + SSR)**:
  - Configured via `outputMode: "server"` in `angular.json` and `serverRoutes` in `src/app/app.routes.server.ts`.
  - Static routes (`''`, `'voynich'`, `'voynich/:section'`, `'kaleidoscope'`, `'blog'`, `'impressum'`, `'privacy'`) use `RenderMode.Prerender`: pre-rendered into static HTML at `ng build` time (11 static routes).
  - Dynamic / catch-all routes (`'**'`) use `RenderMode.Server`: rendered on demand by `AngularNodeAppEngine` in `src/server.ts`.
- **SSRF Host Protection (`allowedHosts`)**:
  - Authorized hosts are configured in `angular.json` under `projects.dmh-dev.architect.build.options.security.allowedHosts`:
    `["dmh.dev", "*.dmh.dev", "*.up.railway.app", "localhost"]`.
- **Code Quality, Linting (`angular-eslint`), & Lighthouse Audits**:
  - Always run `npm run lint` alongside `npm run build` and `npm test` after making code changes.
  - **Lighthouse Habit**: Whenever relevant content, UI, or routing changes take place, run a Lighthouse audit and act upon its findings before wrapping up. Keep `public/robots.txt` and `public/llms.txt` up to date so SEO and Agentic Browsing audits continue to score 100.
- **Local Development & Scripts**:
  - `npm run dev` (or `ng serve`): Starts local dev server with HMR at `http://localhost:4200`.
  - `npm run sync:voynich`: Syncs Voynich Manuscript data and markdown guides from `../voynich` into `public/content/voynich/` and `src/app/features/voynich/voynich-version.ts`.
  - `npm run build` (or `ng build`): Builds browser and server bundles + prerenders static routes into `dist/dmh-dev/`.
  - `npm start` (or `npm run serve:ssr:dmh-dev`): Runs the compiled production Express + Angular SSR server (`node dist/dmh-dev/server/server.mjs`) on `PORT` (defaults to `4000`).
  - `npm run lint` (or `ng lint`): Lints all TypeScript and HTML templates in `src/` via `angular-eslint`.
  - `npm test` (or `ng test --watch=false`): Runs unit tests via Vitest.

## 4. Integrated Interactive Projects (`src/app/features/`)

All interactive projects are integrated directly into the main `dmh.dev` Angular 22 app as lazy-loaded feature routes:

1. **Voynich (`/voynich` & `/voynich/:section` in `src/app/features/voynich/`)**:
   - **Routes**: `/voynich` (`Overview`), `/voynich/walkthroughs`, `/voynich/identifications`, `/voynich/grammar`, `/voynich/library` (subtabs: `Research Guides`, `Scans & PDF Books`, `Datasets`), `/voynich/folios`.
   - **Design & Angular Material / CDK Integration**: Features an open editorial Overview (`1.0625rem` body typography, 4-folio visual showcase, and a research perspective & community links section), a 6-item `Explore the Sections` directory, a monochrome 4-segment morphological word analyzer strip (`.morph-strip`), searchable `Walkthroughs` and `Folios` sidebars powered by Angular CDK Virtual Scrolling (`CdkVirtualScrollViewport`) that expand to fill the available vertical viewport down to the footer while keeping the search/filter bar pinned outside the scroll container, a single-column stacked `Identifications` catalog displaying uncropped manuscript scans with Angular Material pagination (`<mat-paginator>`, 20 specimens per page), Angular Material tables (`MatTableModule`) for the 4 structured atlases on `Grammar`, Angular Material buttons (`MatButtonModule`: `mat-flat-button`, `mat-stroked-button`) for primary/secondary actions, and a decoupled `Library` with categorized `Research Guides` and paginated `Datasets` directories that open into full-width readers/inspectors (`← Back to Research Guides` / `← Back to All Datasets`) so wide tables and code blocks span the full container width while prose stays at `72ch`.
   - **Archival Sources & Public Domain Licensing**:
     - `voynich-yale-beinecke-2026-highres-214p.pdf` (214 pages, 138.4 MB) and all `/pages/*` folio scans originate from Yale University Library, Beinecke Rare Book and Manuscript Library Digital Collections ([Voynich Manuscript, MS 408](https://collections.library.yale.edu/catalog/2002046)) under **Public Domain (`CC0 1.0`)**.
     - `voynich-tcpdf-2014-bookmarked-210p.pdf` (210 pages, 75.2 MB) originates from the Internet Archive ([TheVoynichManuscript](https://archive.org/details/TheVoynichManuscript)), compiled from the Public Domain Yale Beinecke MS 408 scans with clickable folio bookmarks.
   - **Image Optimization (`NgOptimizedImage` + `sharp` Server Proxy in `src/server.ts`)**:
     - Uses Angular's `NgOptimizedImage` directive with a custom `IMAGE_LOADER` (`src/app/app.config.ts`) that requests `?format=webp&w=<width>` across standard responsive breakpoints (`240w` to `1600w`), lazy-loading off-screen images while prioritizing (`fetchpriority="high"`) above-the-fold LCP images.
     - `src/server.ts` serves `/pages/:filename` (520 high-res PNG scans) and `/data/:filename` (265 JSON/TXT research datasets) via a GDPR-safe first-party server-to-server proxy + `/tmp/voynich-edge-cache` disk cache + `sharp` WebP/AVIF resizing and compression + immutable `Cache-Control` headers pinned to `VOYNICH_VERSION.commitSha`.
     - Clicking any manuscript scan opens a full-resolution lightbox (`w=1600` WebP) with an **"Open Raw PNG ↗"** button (`/pages/:filename?raw=1`) that serves the untouched original lossless `.png`.
   - **Updating / Syncing Research (`npm run sync:voynich`)**:
     - Currently pinned to `d2kx/voynich-research` commit `7489d4fdc2371fa391b2ccb527a7bde9d1445d9c` (`7489d4f`, `2026-10-14`, Wave 58 / Attacks 241-243 / Discoveries 258-260) in `src/app/features/voynich/voynich-version.ts`.
      - **Visual Coverage & Core Assets**: Achieved **227/227 = 100.0%** global codex visual coverage across all 20 quires ($Q=A..T); 82 iconic folio walkthroughs (98 interactive folio views), 115 flagship visual specimens (`SPEC-01..115`), 68 markdown research guides, 520 high-res scans, 265 datasets, and 24 interactive explorer tabs (`v22.0` + Waves 57-58 audit & statistical attacks).
     - Whenever new commits land in `d2kx/voynich-research` (local clone at `C:\Users\denni\Documents\voynich`), run `npm run sync:voynich` (`node scripts/sync-voynich.mjs`).
2. **Kaleidoscope (`/kaleidoscope` in `src/app/features/kaleidoscope/`)**:
   - **Tech Stack**: Pure WebGL2/WebGL fullscreen GLSL shader engine (`kaleidoscope-gl.ts`) wrapped in a lazy-loaded standalone Angular 22 component (`kaleidoscope.ts`) with `afterNextRender` initialization and `DestroyRef` cleanup.
   - **Features**: Continuously evolving shader blending Sakura, Prism, Lotus, and Cyber aesthetics with smooth tear-free symmetry transitions (6–12 folds), breathing bloom, and toolbar controls for live `FPS / ms` + SVG sparkline stats and Fullscreen mode.

## 5. Railway Infrastructure & Cost Optimization

All infrastructure runs on a single consolidated Railway service (`web`) using the `use-railway` skill / Railway CLI.

### Railway Resource IDs & Domains
- **Workspace**: `Dennis Martin Herbers's Projects` (`7d85a0e4-7193-4b4c-857b-d779e3a36cd6`)
- **Project**: `dmh.dev` (`4df1008f-af41-461c-8af2-313e8e1b04b0`)
  - Dashboard: `https://railway.com/project/4df1008f-af41-461c-8af2-313e8e1b04b0`
- **Environment**: `production` (`ba9dcd20-f764-4a5e-b6fe-61a18bd66ae0`)
- **Main Service**: `web` (`9c477572-b4a1-491f-bee9-6a5261f63e68`)
  - **Region**: Europe (Netherlands / Amsterdam) (`europe-west4-drams3a`).
  - **Custom Domain**: `https://www.dmh.dev` (verified with SSL certificate on Railway, target port `8080`, `CNAME` `www` -> `sbnq1uoz.up.railway.app`).
  - **Railway Service Domain**: `https://web-production-e94e.up.railway.app` (target port `8080`).
  - **DNS / Nameserver Constraint**: The domain `dmh.dev` is managed on GoDaddy's nameservers. `www.dmh.dev` is the primary custom domain on Railway and `dmh.dev` uses GoDaddy Domain Forwarding (`301` redirect to `https://www.dmh.dev`).

### Cost-Control & Performance Configuration on `web`
1. **Builder**: `RAILPACK` (caches Node modules and build layers across deployments).
2. **Build & Start Commands**:
   - `build.buildCommand`: `"npm run build"`
   - `deploy.startCommand`: `"node dist/dmh-dev/server/server.mjs"`
   - `deploy.healthcheckPath`: `"/healthz"`
3. **Scoped Watch Patterns**:
   - `build.watchPatterns`: `["src/**", "public/**", "package.json", "package-lock.json", "angular.json", "tsconfig*.json"]`
4. **Serverless / App Sleep (`deploy.sleepApplication: true`)**:
   - Automatically puts the container to sleep after ~5–10 minutes of inactivity so idle compute cost is $0, waking automatically on incoming requests.
5. **Single EU Replica (`deploy.multiRegionConfig: { "europe-west4-drams3a": { "numReplicas": 1 } }`)**:
   - Runs a single lightweight instance in the EU (Netherlands) region for low latency in Germany/Europe and EU data residency.
6. **Railway Edge CDN Caching (`railway cdn enable --service web`)**:
   - Caches static assets (`maxAge: 1y`) and proxied Voynich scans/datasets (`immutable`) at the Railway CDN edge.
