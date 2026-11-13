# Creative School

See the [repository README](../README.md) for installation, migration, test and deployment commands, and [PLATFORM.md](docs/PLATFORM.md) for architecture and product limits.

Source layout:

- `src/platform/`: trilingual interface, course catalog, documents, API client and studio lifecycle.
- `src/features/studio/`: 2D and 3D editors, loaded on demand.
- `worker/index.ts`: same-origin authenticated API and public read endpoints.
- `migrations/`: five ordered D1 migrations; XP/badge triggers run in the same transaction as lesson and project changes.
- `tests/`: document/curriculum checks and browser/API integration tests against local Workers/D1.

Paid payments and email delivery are not configured. Never store credentials in source control. Use Cloudflare secrets for any future mail/payment integration.
