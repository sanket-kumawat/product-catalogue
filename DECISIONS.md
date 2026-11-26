# Decisions

Assumptions for the product catalogue PoC. Deferred items and the one-day follow-up are filled in when the submission docs are finished.

## Stack

React 19 and Node.js 24 / Express / TypeScript in one pnpm workspace. `@product-catalogue/shared` owns the Zod contracts used by the API and the web app.

## Assumptions

- Featured curation is the optional `FEATURED_PRODUCT_IDS` env var: comma-separated, cap 5. Existing ids stay in listed order. Unknown ids are skipped. When fewer than 5 ids resolve, the remaining slots are filled with the rank comparator, skipping ids already chosen. A blank value, an unset value, or a value whose ids are all unknown uses the rank comparator only. There is no admin UI.
- Rank comparator: `rating` descending, then `ratingCount` descending, then `id` ascending. Featured fallback, category partitions, and search results all use it.
- Category slugs are the raw category strings, URL-encoded once by the client. The server matches case-insensitively after a single decode. `topRated` is the first 3 products of that sorted category. `additional` is the rest of the list. A category with fewer than 3 products returns a shorter `topRated` and `additional: []`. An unknown category is 404.
- The adapter loads `GET /products` once per cache window and filters category and search in memory. The in-memory TTL defaults to 5 minutes.
- Search is a case-insensitive substring over `title`, `description`, and `category`. `q` is required, trimmed, and 1–200 characters.
- Enquiry `phone` is optional and omitted when blank. The API success body is `{ "message": "Thank you" }`. The product page confirms with "Thank you. Your enquiry has been sent."
- Prices display as USD. Product images load from `imageUrl`. Product JSON is served by the API.
- Local web and API share `/api`: the Vite dev server proxies it, and nginx proxies it in Docker, so the frontend bundle does not bake a host.
- Enquiry spam control for this time-box is rate limiting on `POST /api/enquiries`. A honeypot field is deferred.
- The product cache is per process. A later multi-task deployment can add a shared cache behind the same `ProductRepository` port.
