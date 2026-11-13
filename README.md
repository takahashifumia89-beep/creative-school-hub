# Creative School Hub

A trilingual creative learning workspace with React, TypeScript, Vite, Cloudflare Workers and D1/SQLite. The application lives in [`creative-school/`](creative-school/).

- 8 learning paths / 32 lessons, practice briefs and server-validated quizzes in Russian, English and Kazakh. Existing extended Russian reading is preserved as an optional appendix.
- Design editor: shapes, text, layers, alignment, sizing, templates, undo/redo, PNG/SVG and JSON.
- 3D editor: primitives, transforms, PBR material controls, lighting, PNG, editable JSON and GLB export.
- Image editor: center cropping, rotation, brightness, contrast, saturation, grayscale and PNG export.
- Video editor: clip ordering, trimming, titles, volume and real-time WebM export with audio.
- Account-bound local drafts, autosave, schema validation, optimistic version checks, public portfolio/project links, permanent badges and atomic XP events.
- Recovery keys, password changes, session revocation, data export/deletion and request throttling.
- Free downloadable CC0 resources. Paid commerce is intentionally unavailable until a payment provider, seller onboarding and payout handling are implemented.

## Run locally

Node.js 22.12+ is required. From the repository root:

```sh
cd creative-school
npm ci
npm run db:local
npm run build
npm run dev:api
```

Open `http://localhost:8787`. For UI hot reload, also run `npm run dev` and open `http://localhost:5173` (API requests proxy to port 8787).

## Verify

```sh
npm run build  # includes frontend and Worker type checks
npm test
npx playwright install chromium
npm run test:e2e
```

Browser tests use a separate disposable local D1 database at `.wrangler/e2e-state`, never the deployed database. GitHub Actions runs the same checks.

## Deploy an existing installation

The original landing page, navigation, dashboard and card styling are preserved. New tools use the same theme tokens.

Cloudflare can build from either the repository root or `creative-school/`; both have a Wrangler configuration targeting the same existing D1 database. Node 22 is pinned in both locations. At the root, `npm run build` installs the nested lockfile and builds the app. In `creative-school/`, use `npm ci && npm run build`.

The Worker performs an **additive, idempotent schema upgrade** on its first API request. It creates missing tables/columns/indexes/triggers without deleting accounts or projects and records the five migrations in D1's migration ledger. Existing password hashes remain compatible. Manual migration commands still work on fresh installations but are not required for this release. A failed upgrade returns an error and can retry on a subsequent request; the application does not claim a successful save until the API acknowledges it.

Keep production backups enabled and verify the D1 binding/database ID in `wrangler.toml`. Never replace an existing database just to deploy this update.

See [the architecture and limits](creative-school/docs/PLATFORM.md) for supported formats, recovery behavior, security boundaries and remaining work. This repository does not claim feature parity with desktop creative suites.
