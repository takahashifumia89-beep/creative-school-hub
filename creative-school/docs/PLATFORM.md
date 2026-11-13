# Platform behavior and limits

## Saving and access

Editors save after 1.8 seconds of inactivity once a title is present. Changes are also backed up to account-, editor- and project-scoped localStorage. A recovered draft is offered explicitly, not applied over server data silently. JSON download remains available if storage is unavailable. Local backup is not an off-device backup; clearing browser data removes it.

Every mutation of an existing project requires its current `version`. A stale mutation returns HTTP 409. A failed load cannot enable editing. A conflict requires downloading your copy, reloading the current server version and reconciling changes; automatic merge is not implemented. Unsaved navigation warns on link clicks and tab close. Browser history navigation still relies on the local recovery draft.

Publishing intentionally makes the editable document available to viewers. The confirmation states this; work remains owned by its author. Public portfolios expose only `published` + `public` projects, while a direct project link may also expose `unlisted` work. Private/draft documents cannot be read through public endpoints. Raw SVG markup is never rendered from uploaded documents; document previews use validated data and React escaping.

Quotas: 500 projects per account, 200,000 characters per document, 500 design shapes, 200 scene objects, 30 video clips. Bodies over 260,000 bytes are rejected while streaming. Limits protect this small application, not a substitute for production load testing.

## Learning

The 23 pre-existing lesson IDs remain intact; 9 new lessons cover image editing, video editing and UX. Each lesson has trilingual core material, a practical brief, and two knowledge questions (64 total). Russian extended reading from the original repository is retained as an optional appendix; it has not been translated into English or Kazakh. Practical exercises are self-reviewed, not teacher-graded. The server validates submitted answer indexes before recording progress. Answers necessarily exist in a downloadable client catalog: these are learning checks, not secure certification exams.

Offline submissions use per-account queues, are retried on reconnection or manually, and do not claim server XP until acknowledged. D1 triggers atomically record lesson/project XP. Course awards are included in the lesson batch and uniquely keyed. Existing XP is preserved. Permanent badge records survive deleting/unpublishing projects and ending a streak. Activity days use UTC+5, and sign-in alone does not extend a practice streak.

## Media

Image and video source files stay on the user's device. Only edit settings and source filenames persist to D1; users must reselect originals on reopening. No claim of cloud media storage is made. Images accept PNG, JPEG and WebP up to 20 MB / 40 megapixels. PNG export is capped at 4096 pixels on the longest side; cropping is centered. Color management, RAW, masks and advanced retouching are not implemented.

Video accepts browser-decodable sources up to 250 MB each / 2h per source. Export is 16:9 WebM at 1280×720 or 720×405, with clip audio and static titles, up to 10 minutes in real time. Keep the tab foregrounded during export. Supported codecs vary by browser. MP4 encoding, proxy media, effects, transitions, multitrack compositing, audio mixing/normalization and background rendering are not implemented. Source filenames are relink hints; choosing the wrong file with the same name is possible.

The 3D studio assembles primitives, transforms and materials. GLB exports scene geometry/materials (not the editor camera/grid/lights). It is not a mesh topology, sculpting, rigging or animation editor. The 2D studio supports basic vector layout, not full professional illustration or desktop publishing.

## Security and accounts

Passwords use PBKDF2-SHA256 (100,000 iterations, the Worker limit), independent random salts, and versioned compatibility with existing password hashes. Session tokens and recovery keys are stored as SHA-256 hashes. Secure HttpOnly SameSite=Lax session cookies expire in 30 days. Write requests require same-origin JSON; project queries enforce ownership. The admin statistics endpoint checks the role on the server; client-side visibility never grants permissions.

Request counters are persisted in D1: 300 API requests/IP/minute, 15 authentication requests/IP/15 minutes, 10 authentication requests/email/15 minutes and 120 writes/user/minute. Security operations additionally require the current password and have a per-user limit. Deploy Cloudflare edge protection for distributed attacks; application counters alone are not DDoS protection.

Email ownership is not verified. Recovery is by a one-time-displayed random backup key, rotated on use. Existing users can generate one in Settings after entering their password. If an existing user has neither their password nor a recovery key, an administrator-assisted identity process is needed; no insecure self-service bypass exists. No recovery codes are written to logs. Email delivery, MFA and CAPTCHA are not integrated.

Account deletion cascades through projects, sessions, progress and rewards. Account data export requires the current password. Browser-local backups remain on that device; deleting an account should also clear its local cache (the UI handles account-scoped keys). Source code is not assigned a new open-source license by this update; only the bundled downloadable resource templates are offered under CC0.

## External integrations and release

Free resource downloads work without a payment provider. Paid products, creator sales, checkout, refunds, taxes, moderation workflows and seller payouts require separate integration and operational policies. Do not add a payment button that falsely reports a purchase.

No production deployment or remote database migration is performed by local testing. Apply migrations after taking a production backup and validate with the owner's Cloudflare account before rollout. Review translations with native speakers, test WebGL on real devices and Safari/Firefox media support, run an accessibility audit and production load tests before treating this as a mature production platform.
