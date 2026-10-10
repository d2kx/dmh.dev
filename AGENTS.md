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

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

---

# Project Context & Architecture (`dmh.dev`)

This section provides complete operational context so any fresh coding agent session can immediately understand the repository layout, architectural decisions, deployment pipeline, and rules without requiring re-explanation from the user.

## 1. Project Overview & Security Policy

- **Domain**: `dmh.dev` (owned by Dennis Martin Herbers, registered with GoDaddy).
- **GitHub Repository**: [`https://github.com/d2kx/dmh.dev`](https://github.com/d2kx/dmh.dev) (**PUBLIC** repository).
- **CRITICAL PUBLIC REPO RULE**:
  - **NEVER commit secrets, API keys, tokens, database URLs, or `.env` files to this repository.**
  - If any feature or integration could risk exposing sensitive data or credentials in the repository, **stop and warn the user immediately** before proceeding so they can decide whether to store it in Railway environment variables or make the repository private.
  - All runtime secrets and service-to-service connection strings must be configured as Railway Variables (e.g., `${{Postgres.DATABASE_URL}}`).
- **Proactive Guidance Rule**:
  - The user welcomes proactive feedback and recommendations. If a requested approach has architectural, security, DNS, or cost downsides, point it out clearly and suggest a better alternative.

## 2. Repository Layout (Monorepo)

Everything for `dmh.dev`—both the main personal website/blog and future standalone mini-apps—lives in this single repository:

```text
dmh.dev/
├── src/                        # Main dmh.dev Angular 22 application source
│   ├── app/
│   │   ├── features/           # Lazy-loaded route feature components (home, projects, blog, about)
│   │   ├── app.config.ts       # Client providers (Router + ViewTransitions, Hydration + EventReplay)
│   │   ├── app.config.server.ts# Server providers (provideServerRendering with serverRoutes)
│   │   ├── app.routes.ts       # Client route definitions
│   │   ├── app.routes.server.ts# Hybrid rendering config (RenderMode.Prerender + RenderMode.Server)
│   │   ├── app.ts              # Root shell component
│   │   ├── app.html            # Accessible site shell (header, nav, main, footer)
│   │   └── app.css             # Shell layout styles
│   ├── server.ts               # Express 5 + AngularNodeAppEngine SSR server & /healthz endpoint
│   ├── main.ts                 # Browser bootstrap
│   ├── main.server.ts          # Server bootstrap
│   ├── styles.css              # Global CSS (light-dark() theme, view transitions, a11y focus styles)
│   └── index.html              # Root HTML document
├── public/                     # Static public assets (favicon, etc.)
├── apps/                       # Directory for future standalone mini-apps (app1.dmh.dev, etc.)
│   └── README.md               # Guide for adding and deploying new mini-apps
├── angular.json                # Angular CLI build/serve/SSR configuration & SSRF allowedHosts
├── package.json                # Root scripts & dependencies
├── AGENTS.md                   # Primary agent instructions & project architecture (this file)
└── .gemini/GEMINI.md           # Synchronized copy of AGENTS.md for Gemini tooling
```

> **Note**: Whenever you update `AGENTS.md` with new architectural decisions, services, or mini-apps, keep `.gemini/GEMINI.md` synchronized as well.

## 3. Main `dmh.dev` Application Details

- **Framework**: Angular v22 (`@angular/core` ^22.2.0, `@angular/ssr` ^22.2.2, TypeScript ~6.0, Vitest ^5.0).
- **File Naming Style**: Angular `2025` ("Intent over Role") style guide — suffixless filenames (`home.ts`, `app.ts`) and class names (`Home`, `App`), with `.spec.ts` for unit tests and `.model.ts` for interfaces/models.
- **Hybrid Rendering (Prerender + SSR)**:
  - Configured via `outputMode: "server"` in `angular.json` and `serverRoutes` in `src/app/app.routes.server.ts`.
  - Static routes (`''`, `'projects'`, `'blog'`, `'about'`) use `RenderMode.Prerender`: they are pre-rendered into static HTML at `ng build` time and served immediately by the server without per-request rendering overhead.
  - Dynamic / catch-all routes (`'**'`) use `RenderMode.Server`: rendered on demand by `AngularNodeAppEngine` in `src/server.ts`.
  - Parameterized static routes (e.g., future `blog/:slug` posts) should use `RenderMode.Prerender` with `getPrerenderParams()` (and `fallback: PrerenderFallback.Server` if dynamic posts are added later).
- **SSRF Host Protection (`allowedHosts`)**:
  - Angular v22 enforces host header validation in `AngularNodeAppEngine` and returns `400 Bad Request` for unrecognized hostnames.
  - Authorized hosts are configured in `angular.json` under `projects.dmh-dev.architect.build.options.security.allowedHosts`:
    `["dmh.dev", "*.dmh.dev", "*.up.railway.app", "localhost"]`.
  - Can also be overridden at runtime via the `NG_ALLOWED_HOSTS` environment variable.
- **Local Development & Scripts**:
  - `npm run dev` (or `ng serve`): Starts local dev server with HMR at `http://localhost:4200`.
  - `npm run build` (or `ng build`): Builds browser and server bundles + prerenders static routes into `dist/dmh-dev/`.
  - `npm start` (or `npm run serve:ssr:dmh-dev`): Runs the production Express + Angular SSR server (`node dist/dmh-dev/server/server.mjs`) on `PORT` (defaults to `4000`).
  - `npm test` (or `ng test --watch=false`): Runs unit tests via Vitest.

## 4. Railway Infrastructure & Cost Optimization

All infrastructure is hosted on Railway using the `use-railway` skill / Railway CLI.

### Railway Resource IDs & Domains
- **Workspace**: `Dennis Martin Herbers's Projects` (`7d85a0e4-7193-4b4c-857b-d779e3a36cd6`)
- **Project**: `dmh.dev` (`4df1008f-af41-461c-8af2-313e8e1b04b0`)
  - Dashboard: `https://railway.com/project/4df1008f-af41-461c-8af2-313e8e1b04b0`
- **Environment**: `production` (`ba9dcd20-f764-4a5e-b6fe-61a18bd66ae0`)
- **Main Service**: `web` (`9c477572-b4a1-491f-bee9-6a5261f63e68`)
  - **Custom Domain**: `https://www.dmh.dev` (verified with SSL certificate on Railway, target port `8080`, `CNAME` `www` -> `sbnq1uoz.up.railway.app`).
  - **Railway Service Domain**: `https://web-production-e94e.up.railway.app` (target port `8080`).
  - **DNS / Nameserver Constraint**: The domain `dmh.dev` is managed on GoDaddy's nameservers (cannot be moved to third-party nameservers). Because GoDaddy does not support `CNAME` flattening at the root (`@`), `www.dmh.dev` is the primary custom domain on Railway and `dmh.dev` uses GoDaddy Domain Forwarding (`301` redirect to `https://www.dmh.dev`). Future mini-apps on subdomains (`app1.dmh.dev`, `app2.dmh.dev`, etc.) use standard `CNAME` records in GoDaddy DNS directly.

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
5. **Single Replica (`deploy.numReplicas: 1`)**:
   - Runs a single lightweight instance.
6. **Railway Edge CDN Caching (`railway cdn enable --service web`)**:
   - Caches static assets (`maxAge: 1y`) and cacheable responses at the Railway CDN edge so cache hits don't even wake or hit the Node container.

## 5. Adding Future Mini-Apps (`apps/`) & Databases

### Mini-Apps (`app1.dmh.dev`, `app2.dmh.dev`, etc.)
- Place each standalone mini-app in `apps/<app-name>/`.
- Create a dedicated Railway service in the `dmh.dev` project:
  ```bash
  railway add --service <app-name> --json
  ```
- Configure the service to build only from `/apps/<app-name>` with its own watch pattern and App Sleep enabled:
  ```bash
  railway environment edit --service-config <app-name> source.repo "d2kx/dmh.dev"
  railway environment edit --service-config <app-name> source.branch "main"
  railway environment edit --service-config <app-name> source.rootDirectory "/apps/<app-name>"
  railway environment edit --service-config <app-name> build.watchPatterns '["apps/<app-name>/**"]'
  railway environment edit --service-config <app-name> deploy.sleepApplication true
  ```
- Add the subdomain (`railway domain <app-name>.dmh.dev --service <app-name> --json`) and configure the returned `CNAME` + `_railway-verify` `TXT` records in DNS.
- Document every new mini-app in this `AGENTS.md` file under a **Current Apps & Services** list.

### Databases & Storage
- When a database is needed later, provision it inside the `dmh.dev` Railway project:
  ```bash
  railway add --database postgres --json
  ```
- Connect services using Railway reference variables over the private network (`${{Postgres.DATABASE_URL}}` -> `postgres.railway.internal`) so traffic stays internal and incurs zero egress fees:
  ```bash
  railway variable set DATABASE_URL='${{Postgres.DATABASE_URL}}' --service <service-name>
  ```
- Note: Keep active database connection pools minimal or close idle connections if you want services with `sleepApplication: true` to sleep during inactivity (active outbound DB heartbeats prevent App Sleep).
