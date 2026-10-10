# `apps/` — Mini-Apps & Subdomain Services

This directory holds standalone mini-apps and additional services that are part of the `dmh.dev` monorepo and deployed to subdomains (e.g., `app1.dmh.dev`, `app2.dmh.dev`) or subpaths.

## How to Add a New Mini-App

### Option 1: Independent Service on a Subdomain (`<app-name>.dmh.dev`) — Recommended
1. Create a folder `apps/<app-name>/` with its own `package.json` (or `Dockerfile`, `pyproject.toml`, `go.mod`, etc.).
2. In the `dmh.dev` Railway project, create a new service:
   ```bash
   railway add --service <app-name> --json
   ```
3. Configure the service's root directory and watch patterns so it only rebuilds when files inside `apps/<app-name>/` change:
   ```bash
   railway environment edit --service-config <app-name> source.repo "d2kx/dmh.dev"
   railway environment edit --service-config <app-name> source.branch "main"
   railway environment edit --service-config <app-name> source.rootDirectory "/apps/<app-name>"
   railway environment edit --service-config <app-name> build.watchPatterns '["apps/<app-name>/**"]'
   railway environment edit --service-config <app-name> deploy.sleepApplication true
   ```
4. Attach the custom subdomain:
   ```bash
   railway domain <app-name>.dmh.dev --service <app-name> --json
   ```
5. Add the returned `CNAME` and `_railway-verify` `TXT` records in your DNS provider.

### Option 2: Shared Code / Angular Sub-Application
If a mini-app needs to share TypeScript libraries with the root Angular workspace, keep `source.rootDirectory` unset on the Railway service and override `build.buildCommand` and `deploy.startCommand` to build and serve that specific target.
