# Product catalogue

A small product catalogue. The browser talks only to this API. Product data comes from the Fake Store API behind a repository port, and enquiries go out through an email port.

## Stack

Node.js 24, Express, and TypeScript on the API. React 19, Vite, TanStack Router, and TanStack Query on the web. Zod contracts live in `@product-catalogue/shared`. pnpm workspaces tie the packages together.

## Run with Docker

```sh
docker compose up --build
```

- App: http://localhost:8080
- API health: http://localhost:3001/api/health
- Mailpit inbox: http://localhost:8025

Search, open a category, open a product, and send an enquiry. The message appears in Mailpit.

## Local development

Requires Node.js 24 and pnpm 12.

```sh
pnpm install
cp .env.example .env
pnpm dev
```

The web app is at http://localhost:5173 and the API is at http://localhost:3001. Vite proxies `/api` to the API. For a local enquiry to arrive, Mailpit (or another SMTP listener) must be on `localhost:1025`. `docker compose up mailpit` starts just the inbox. Do not run the Compose API and `pnpm dev` together: both bind port 3001.

## Environment

Copy `.env.example` to `.env`. The API validates these on startup. `VITE_API_URL` is read when the web app is built. Leave it unset so the app calls `/api`. An absolute URL is baked into the bundle and needs `CORS_ORIGIN` to match the page origin.

| Variable                       | Default                            | Purpose                                                      |
| ------------------------------ | ---------------------------------- | ------------------------------------------------------------ |
| `PORT`                         | `3001`                             | API listen port                                              |
| `NODE_ENV`                     | `development`                      | `development`, `test`, or `production`                       |
| `CORS_ORIGIN`                  | `http://localhost:5173`            | Allowed browser origin. Compose sets `http://localhost:8080` |
| `FAKE_STORE_BASE_URL`          | `https://fakestoreapi.com`         | Product source                                               |
| `PRODUCT_CACHE_TTL_MS`         | `300000`                           | In-memory catalogue cache                                    |
| `FEATURED_PRODUCT_IDS`         | empty                              | Optional comma-separated ids, cap 5                          |
| `SMTP_HOST`                    | `localhost`                        | Compose sets `mailpit`                                       |
| `SMTP_PORT`                    | `1025`                             | SMTP port                                                    |
| `SMTP_SECURE`                  | `false`                            | TLS                                                          |
| `SMTP_USER`                    | empty                              | Omit auth when empty                                         |
| `SMTP_PASS`                    | empty                              | Omit auth when empty                                         |
| `EMAIL_FROM`                   | `no-reply@product-catalogue.local` | From address                                                 |
| `SALES_INBOX_EMAIL`            | `sales@product-catalogue.local`    | Enquiry recipient                                            |
| `ENQUIRY_RATE_LIMIT_WINDOW_MS` | `60000`                            | Enquiry rate-limit window                                    |
| `ENQUIRY_RATE_LIMIT_MAX`       | `10`                               | Enquiries allowed per window                                 |
| `VITE_API_URL`                 | unset (`/api`)                     | Web API base, build time only                                |
