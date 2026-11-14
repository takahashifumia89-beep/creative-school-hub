# Creative School Hub

A trilingual creative learning workspace with React, TypeScript, Vite, Cloudflare Workers and D1/SQLite. The application lives in [`creative-school/`](creative-school/).

- 8 learning paths / 32 substantive lessons with worked examples, practice, self-review, 96 questions with explanations and 30 linked sources in Russian, English and Kazakh. Account-scoped notes, reading downloads and offline quiz queues are included. Existing extended Russian reading is preserved as an optional appendix.
- Design workbench: 13 editable shape/text types including diamonds, adjustable stars, arrows and polygons; zoom/pan, multi-selection, snapping, precise transforms, layers, multiline typography, templates, transactional undo/redo and PNG/SVG/JSON exports.
- 3D workbench: hierarchy, precise transforms, PBR materials, camera views, editable mesh vertices, safe OBJ import and OBJ/GLB/PNG/JSON exports.
- Photo workbench: draggable precise crop, comparison view, filters, undo/redo and sized PNG/JPEG/WebP exports.
- Video workbench: composed preview, playhead, split/trim/reorder, undo/redo, titles, fades, volume, soundtrack and real-time WebM export with audio.
- Account-scoped device media cache restores originals on the same browser; storage controls make its 350 MB limit visible. Files are not uploaded to cloud storage.
- Trilingual studio AI tutor through Cloudflare Workers AI with direction-specific help, opt-in project summaries and temporary chat history. No OpenAI key or paid fallback: the AI binding is configured in Wrangler, with a conservative daily free-allocation budget. Use Workers Free for a provider-enforced free limit; see [AI setup](creative-school/docs/AI_SETUP.md). The assistant gives advice; it does not operate the editors.
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

Course references and access notes are listed in [SOURCES.md](creative-school/docs/SOURCES.md). Lesson explanations and examples are original teaching material; linked external articles and videos retain their publishers' terms.
