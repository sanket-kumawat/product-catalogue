---
name: review-pass
description: Critical review of the current diff against the project's rules. Use before commits, before opening/updating the PR, or when asked to "review".
---
# Review pass
Review the diff as a skeptical senior engineer. Report findings, do not fix
silently. Check:
1. Client calls Fake Store directly, or Fake Store types leak past the provider.
2. `any`, unchecked casts, validation only on the client.
3. Tests that only assert mocks or Tailwind classes, or critical paths with no test.
4. New dependencies, over-engineered abstractions, dead code.
5. Hardcoded URLs/config, secrets, `.env` committed.
6. Unescaped user input in email content, missing rate limit or honeypot.
7. Missing loading/error/empty/not-found states in the UI.
8. `routeTree.gen.ts` edited by hand or not committed; search params not
   validated; route loaders calling fetch directly instead of the Query client.
9. Node version mismatch between `.nvmrc`, `engines`, and Dockerfiles.
10. Hardcoded colours or light-only classes, anything that looks broken in dark
    mode, and unused shadcn components left in `components/ui`.
11. Assumptions made that are not yet recorded in DECISIONS.md.
Output: a list grouped by severity, each with file and line, plus a short
"assumptions to record" list.