# Decisions

Assumptions for the product catalogue PoC. Deferred items and the one-day follow-up are filled in when the submission docs are finished.

## Stack

React 19 and Node.js 24 / Express / TypeScript in one pnpm workspace. `@product-catalogue/shared` owns the Zod contracts used by the API and the web app.

## Assumptions

- Featured curation is the optional `FEATURED_PRODUCT_IDS` env var: comma-separated, cap 5. Existing ids stay in listed order. Unknown ids are skipped. When fewer than 5 ids resolve, the remaining slots are filled with the rank comparator, skipping ids already chosen. A blank value, an unset value, or a value whose ids are all unknown uses the rank comparator only. A token that is not a positive integer fails startup. There is no admin UI.
- Rank comparator: `rating` descending, then `ratingCount` descending, then `id` ascending. Featured fallback, category partitions, and search results all use it.
- Category slugs are the raw category strings, URL-encoded once by the client. The server matches case-insensitively after a single decode. `topRated` is the first 3 products of that sorted category. `additional` is the rest of the list. A category with fewer than 3 products returns a shorter `topRated` and `additional: []`. An unknown category is 404.
- The adapter loads `GET /products` once per cache window and filters category and search in memory. The in-memory TTL defaults to 5 minutes.
- Search is a case-insensitive substring over `title`, `description`, and `category`. `q` is required, trimmed, and 1–200 characters.
- Enquiry `phone` is optional and omitted when blank. The API success body is `{ "message": "Thank you" }`. The product page confirms with "Thank you. Your enquiry has been sent."
- Prices display as USD. Product images load from `imageUrl`. Product JSON is served by the API.
- Local web and API share `/api`: the Vite dev server proxies it, and nginx proxies it in Docker, so the frontend bundle does not bake a host.
- Enquiry spam control for this time-box is rate limiting on `POST /api/enquiries`. A honeypot field is deferred.
- The product cache is per process. A later multi-task deployment can add a shared cache behind the same `ProductRepository` port.

## Swapping a boundary

- A new product source implements `ProductRepository` and is constructed in `apps/api/src/composition.ts`. Ranking, category splits, and search stay in `ProductService`.
- A new email provider implements `EmailProvider.send`. AWS SES would be another adapter beside `SmtpEmailProvider`. The enquiry service stays the same.
- A new look is a change to the semantic tokens in `apps/web/src/app/styles/index.css`. `ModeToggle` still sets the `dark` class and the `theme` storage key. Feature slices keep using `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, and `bg-primary`.

## Deferred

Honeypot, pagination, Playwright, CI, ESLint/Prettier, Redis, AWS SDK, an admin UI for featured ids, Express 5, and an image proxy.

## Rate limit behind nginx

Compose sends every browser request through the web container, so the enquiry limiter sees one client address. `trust proxy` is unset. The limit is global for the demo.

## Docker pnpm

The image copies `/opt/pnpm` from `ghcr.io/pnpm/pnpm:12-alpine` and symlinks `pnpm` and `pnpx` into `/usr/local/bin`. That path is the one in the image. The repo `.npmrc` does not set a store directory. The image appends `store-dir=/pnpm/store`. The build stage copies that store and `/root/.cache/pnpm` from the fetch stage. Install uses `--frozen-lockfile --prefer-offline`. `--offline` fails on pnpm 12 because it looks for a `pnpm@12.3.4` store snapshot that `pnpm fetch` does not create when the image already runs that version. `pnpm deploy --prod` uses `--prefer-offline` for the same reason: `--offline` then fails the supply-chain metadata check for a deployed dependency. `pnpm dev` compiles the API to `dist` and runs `node --watch dist/index.js`, because Node's type stripper does not resolve a `.js` import to a `.ts` file.

## Another day

Request logging, login, a UI improvement, and CI that runs `pnpm test`.
