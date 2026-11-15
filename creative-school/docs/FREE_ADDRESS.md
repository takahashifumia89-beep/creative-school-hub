# A free address for this deployment

This application already uses the Cloudflare Worker named `creative-school-hub`. A Cloudflare account includes a configurable `workers.dev` subdomain. The public address has this shape:

`https://creative-school-hub.<your-account-subdomain>.workers.dev`

The account subdomain is not present in this repository, so the example above is a pattern, not a verified live URL. Do not put an API token into the website or share one in chat to retrieve it.

In the Cloudflare dashboard, open **Workers & Pages → creative-school-hub → Domains** (older dashboard versions show **Settings → Domains & Routes**). Copy the existing `workers.dev` address. If it is disabled, enable that route. This does not require buying a domain or migrating the application/database.

A custom domain such as `school.kz` or `school.com` is a separately registered name. After obtaining one and adding its DNS zone to Cloudflare, attach it to this same Worker through **Custom Domains**. Keep the Worker/D1 deployment in place. Existing portfolio links are built from the browser's current origin, so they automatically use the hostname visitors open.

No registrar purchase, account-subdomain change, DNS edit or new custom domain was performed by this code update.

Official references (checked November 15, 2026):
- https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
- https://developers.cloudflare.com/workers/configuration/routing/
