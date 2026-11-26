# AI usage

## Key prompts

**Planning the catalogue.** I asked for a milestone plan from PRD.pdf, AGENTS.md, and .cursor/rules, with no application code. That produced docs/PLAN.md: boundaries, the REST contract, Docker, seven milestones, and the critical-path tests. Package names in the plan are @product-catalogue/*.

**Building from the plan.** I asked for milestones 1–7 one at a time. That produced the pnpm workspace, the Express ports-and-adapters API, the FSD web app, and Docker Compose with Mailpit. The rules in `.cursor/rules/00-architecture.mdc`, `01-backend-security.mdc`, and `02-frontend-and-testing.mdc`, plus `AGENTS.md` and `docs/PLAN.md`, set the boundaries.

## AI mistakes

**API dev server.** `node --watch src/index.ts` failed because Node strips types and does not resolve a `.js` specifier to a `.ts` file. Caught by starting the API. `apps/api/dev.sh` compiles to `dist` and watches that output.

Later mistakes get a short entry here when review, tests, or a manual run catch them.
