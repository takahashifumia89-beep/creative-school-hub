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

Back up D1 first. Set the Cloudflare project root to **`creative-school`**. Verify the D1 binding/database ID in `wrangler.toml`; do not replace an existing database just to deploy this update.

```sh
npm ci
npm run db:remote
npm run deploy
```

Apply **all five** migrations in order. Migration 0005 preserves existing accounts and projects, adds project versions/types, request counters and permanent badge records. Password verification remains compatible with the original hash format. Deploy the new Worker only after migration 0005 succeeds. Review Cloudflare build settings to prevent an old auto-deploy command from skipping migrations. Database backups and production rollout require access to the owner's Cloudflare account.

See [the architecture and limits](creative-school/docs/PLATFORM.md) for supported formats, recovery behavior, security boundaries and remaining work. This repository does not claim feature parity with desktop creative suites.
