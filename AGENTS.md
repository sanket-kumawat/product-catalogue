# AGENTS.md

Instructions for AI coding agents working in this repository.

## Project Overview
An evolvable Product Catalogue PoC built as a single **Node 24 LTS** + **pnpm** monorepo (`pnpm-workspace.yaml`):
- `packages/shared`: Shared Zod schemas and TypeScript DTOs (`@product-catalogue/shared`).
- `apps/api`: Node.js 24 + Express + TypeScript REST backend using Ports & Adapters (Hexagonal Architecture).
- `apps/web`: React 19 + Vite + TypeScript frontend using **Feature-Sliced Design (FSD)**, **TanStack Router** (file-based), **TanStack Query**, and **Tailwind CSS v4 + shadcn/ui** with light/dark theme support.

Read `docs/PLAN.md` before making architectural changes.

## Key Commands
Run from the repository root unless noted otherwise:
- `pnpm install` — Install all workspace dependencies.
- `docker compose up --build` — Start `api`, `web`, and `mailpit` (`http://localhost:8025`) locally.
- `pnpm dev` — Run `api` and `web` in local watch mode.
- `pnpm typecheck` — TypeScript check across all workspaces.
- `pnpm test` — Run Vitest unit, integration, and component tests across all workspaces.
- `pnpm build` — Build shared package, API, and static frontend bundle.

## Non-Negotiable Architecture Rules
1. **Package Manager (`pnpm` only):**
   - Use `pnpm` exclusively (`pnpm-workspace.yaml`, `pnpm-lock.yaml`, and `"workspace:*"` for internal packages like `@product-catalogue/shared`).
   - Never generate or commit `package-lock.json` or `yarn.lock`.
   - In Dockerfiles (`node:24-alpine`), install pnpm 12 via `COPY --from=ghcr.io/pnpm/pnpm:12-alpine /opt/pnpm /opt/pnpm` and symlink binaries rather than relying on `corepack enable`.
2. **Backend-only product fetching:** `apps/web` must NEVER call Fake Store API directly. All product data flows through `apps/api`.
3. **Ports & Adapters (`apps/api`):**
   - External dependencies sit behind interfaces in `apps/api/src/ports/` (`ProductRepository`, `EmailProvider`).
   - Map raw Fake Store payloads into our internal `Product` domain model inside `FakeStoreProductRepository`. Never leak upstream shapes (e.g., `rating.rate`) into services, routes, or the frontend.
   - Route handlers only validate input, call services, and return HTTP responses.
4. **Feature-Sliced Design (`apps/web/src`):**
   - Layer order (top to bottom): `app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`.
   - Strict downward imports only. No cross-slice imports on the same layer.
   - Every slice (`pages/*`, `widgets/*`, `features/*`, `entities/*`) must export through its `index.ts` public API; never deep-import internal files across slices.
   - Do not create `src/components/`. Place shadcn/ui primitives in `src/shared/ui/`.
   - TanStack Router files live in `src/app/routes/` and stay thin (delegate rendering to `@/pages/*`). Never manually edit `src/app/routeTree.gen.ts`.
5. **Swappable Theme & Dark Mode:**
   - Use semantic shadcn/ui CSS tokens (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`) defined in `src/app/styles/index.css`. Never hardcode raw Tailwind color scales (e.g., `bg-gray-900`) in feature slices.
6. **Security & Config:**
   - Strict TypeScript everywhere; never use `any`.
   - Never commit `.env` or secrets. Document all variables in `.env.example` and validate backend config with Zod on startup.
   - Escape all user-supplied enquiry inputs before interpolating into HTML emails.
7. **Testing:**
   - Never make live HTTP calls to Fake Store API or external SMTP servers in automated tests. Inject fakes/spies via dependency injection.

## Definition of Done (Per Milestone)
Before finishing a task:
- Confirm all new files follow FSD and Ports & Adapters boundaries.
- Run `pnpm typecheck` and `pnpm test` and fix any failures.
- Keep diffs scoped strictly to the requested milestone—do not add unrequested features or dependencies.