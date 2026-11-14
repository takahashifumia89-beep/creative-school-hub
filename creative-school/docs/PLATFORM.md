# Platform behavior and limits

## Saving and access

Editors save after 1.8 seconds of inactivity once a title is present. Changes are also backed up to account-, editor- and project-scoped localStorage. A recovered draft is offered explicitly, not applied over server data silently. JSON download remains available if storage is unavailable. Local backup is not an off-device backup; clearing browser data removes it.

Every mutation of an existing project requires its current `version`. A stale mutation returns HTTP 409. A failed load cannot enable editing. A conflict requires downloading your copy, reloading the current server version and reconciling changes; automatic merge is not implemented. Unsaved navigation warns on link clicks and tab close. Browser history navigation still relies on the local recovery draft.

Publishing intentionally makes the editable document available to viewers. The confirmation states this; work remains owned by its author. Public portfolios expose only `published` + `public` projects, while a direct project link may also expose `unlisted` work. Private/draft documents cannot be read through public endpoints. Raw SVG markup is never rendered from uploaded documents; document previews use validated data and React escaping.

Quotas: 500 projects per account, 200,000 characters per document, 500 design shapes, 200 scene objects, 30 video clips. Bodies over 260,000 bytes are rejected while streaming. Limits protect this small application, not a substitute for production load testing.

## Learning

The 23 pre-existing lesson IDs remain intact; 9 new lessons cover image editing, video editing and UX. All 32 lessons have trilingual objectives, substantive theory, a worked example, practical steps/deliverables, a self-review checklist and three topic-specific knowledge questions (96 total). Explanations appear after submission, including incorrect attempts; retries cannot duplicate XP. Lesson notes stay account-scoped on the device and can be downloaded. Reading downloads include publisher references; [SOURCES.md](SOURCES.md) documents 30 external source URLs and access limitations. Each course also has a distinct downloadable capstone brief. Russian extended reading from the original repository is retained as an optional appendix; it has not been translated into English or Kazakh. Practical exercises are self-reviewed, not teacher-graded. The server validates submitted answer indexes before recording progress. Answers necessarily exist in a downloadable client catalog: these are learning checks, not secure certification exams.

Offline submissions use per-account queues, are retried on reconnection or manually, and do not claim server XP until acknowledged. D1 triggers atomically record lesson/project XP. Course awards are included in the lesson batch and uniquely keyed. Existing XP is preserved. Permanent badge records survive deleting/unpublishing projects and ending a streak. Activity days use UTC+5, and sign-in alone does not extend a practice streak.

## Media

Image and video source files stay on the user's device. An account-scoped IndexedDB cache restores originals on the same browser, up to 350 MB per account. The UI reports storage failures and can explicitly clear cached copies. Only edit settings, cache IDs and source filenames persist to D1; another browser, cleared storage or exhausted quota requires relinking originals. No claim of cloud media storage is made. Images accept PNG, JPEG and WebP up to 20 MB / 40 megapixels. A draggable crop rectangle and numeric percentages support precise composition; zoom/fit, before/after, mirroring, filters and undo/redo are supported. PNG/JPEG/WebP exports preserve the chosen aspect ratio and are capped at 4096 pixels on the longest side; JPEG uses a white transparency matte. Color management, RAW, masks and advanced retouching are not implemented.

Video accepts browser-decodable sources up to 250 MB each / 2h per source. The canvas monitor previews the same title/color/fade composition used for export. A seekable timeline supports split, trim, duplicate, reorder and transactional undo/redo. Export is 16:9 WebM at 1280×720 or 720×405, with clip audio, an independent soundtrack, per-clip fade in/out, brightness/contrast and static titles, up to 10 minutes and 180 MB in real time. Export can be cancelled. Keep the tab foregrounded during export. Supported codecs vary by browser. MP4 encoding, proxy media, arbitrary effects/transitions, multitrack compositing, advanced audio automation/loudness normalization and background rendering are not implemented. Source filenames are relink hints; choosing the wrong file with the same name is possible, although trim bounds are checked against the new duration.

The 3D workbench provides hierarchy, names, visibility/locks, exact position/rotation/dimensions, snap, orthographic camera views, primitive segments and PBR materials. Primitives can be converted into welded meshes for individual vertex editing. Local OBJ import accepts geometry only, ignores external material references and validates face indices. OBJ/GLB export includes scene geometry and transforms; PNG captures the viewport. Limits include 10,000 mesh vertices and the existing document-size cap. UV editing, arbitrary topology operations, sculpting, rigging and animation are not implemented.

The 2D workbench includes a collapsible shape library (diamond, star with adjustable points/inner radius, pentagon, hexagon, octagon, arrow, cross, parallelogram and trapezoid) alongside the original rectangle, ellipse, triangle and text. The same polygon geometry is used for editing, SVG/PNG export and portfolio previews. It supports pan/zoom/fit, rotated multi-selection, snapping/guides, alignment/distribution, precise numeric transforms, layers with names/visibility/locks, multiline typography, templates and transactional undo/redo. SVG/PNG exports omit editing handles and optionally omit the background; PNG is capped at 4096 pixels. The clipboard stays inside this editor. Arbitrary paths, Boolean operations and raster placement are not implemented. Focus mode hides the surrounding navigation; Escape restores it. New untitled documents are created only after an edit, and the first server save preserves the active editor and loaded media.

## Studio AI tutor

The assistant uses Cloudflare Workers AI through an authenticated server endpoint and the fixed free-allocation model `@cf/google/gemma-4-26b-a4b-it`. It uses the current studio's actual capabilities and RU/EN/KK language, plus optional summarized document parameters. Project sharing is off by default. Media bytes, filenames, cache IDs, hidden objects and mesh vertices are excluded. The assistant cannot inspect pixels/audio or operate the editor.

Both Wrangler files configure the AI binding. No API key is needed and old OpenAI secrets are ignored; there is no paid fallback. Request input is capped at 12,000 UTF-8 bytes, output at 768 tokens with thinking disabled. D1 atomically reserves a conservative daily budget of 6000 Neurons before inference, in addition to per-user/IP limits and a hard site ceiling of 100 daily requests. Limits can only be lowered through server settings. Failed/timed-out requests keep their reservations. Workers Free enforces the provider's free daily allocation; on an already Paid account, other account-wide usage may still cause overage charges. This application does not inspect account billing. See [AI_SETUP.md](AI_SETUP.md).

Requests reject arbitrary roles, provider URLs, models and extra fields and use session/origin checks. Chat stays in page memory, never D1. Replies render as escaped text; `store: false` is sent to Cloudflare, whose own data policies apply. Errors are sanitized, the request times out after 35 seconds, and there are no automatic retries. Without an enabled binding, the panel shows an unavailable state and related lessons. Exhausting the free budget stops requests with a clear message.

## Security and accounts

Passwords use PBKDF2-SHA256 (100,000 iterations, the Worker limit), independent random salts, and versioned compatibility with existing password hashes. Session tokens and recovery keys are stored as SHA-256 hashes. Secure HttpOnly SameSite=Lax session cookies expire in 30 days. Write requests require same-origin JSON; project queries enforce ownership. The admin statistics endpoint checks the role on the server; client-side visibility never grants permissions.

Request counters are persisted in D1: 300 API requests/IP/minute, 15 authentication requests/IP/15 minutes, 10 authentication requests/email/15 minutes and 120 writes/user/minute. Security operations additionally require the current password and have a per-user limit. Deploy Cloudflare edge protection for distributed attacks; application counters alone are not DDoS protection.

Email ownership is not verified. Recovery is by a one-time-displayed random backup key, rotated on use. Existing users can generate one in Settings after entering their password. If an existing user has neither their password nor a recovery key, an administrator-assisted identity process is needed; no insecure self-service bypass exists. No recovery codes are written to logs. Email delivery, MFA and CAPTCHA are not integrated.

Account deletion cascades through projects, sessions, progress and rewards. Account data export requires the current password. Browser-local backups remain on that device; deleting an account should also clear its local cache (the UI handles account-scoped keys). Source code is not assigned a new open-source license by this update; only the bundled downloadable resource templates are offered under CC0.

## External integrations and release

Free resource downloads work without a payment provider. Paid products, creator sales, checkout, refunds, taxes, moderation workflows and seller payouts require separate integration and operational policies. Do not add a payment button that falsely reports a purchase.

No production deployment or remote database migration is performed by local testing. The Worker automatically adds missing schema elements on the first API request and marks the five migrations applied, so no manual migration action is required for this release. Automatic schema setup and legacy-data preservation are tested against SQLite and a fresh local D1 instance. Keep production backups enabled and inspect the Cloudflare rollout status. Review translations with native speakers, test WebGL on real devices and Safari/Firefox media support, run an accessibility audit and production load tests before treating this as a mature production platform.

## Visual continuity

The original `main` landing composition, colors, fonts, sidebar, dashboard and project/portfolio cards are retained. Localization runs inside React through translation keys and templates; no DOM mutation translator is used. New editors and settings extend the existing theme.

The assistant occupies its own layout area: beside the editor on wide displays and above it on smaller screens. It never floats over editing controls; its response text is larger and scrolls independently. Account settings keep profile editing visible and put security actions in a collapsible section with one selected operation at a time. Existing password checks and deletion confirmation still apply.
