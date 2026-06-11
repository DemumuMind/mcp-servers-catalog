# Engineering Stabilization Design

Date: 2026-06-04
Project: `mcpservers-clone`

## Goal

Make the project safer to change before larger product work starts. The first increment focuses on reliable local and CI validation for the existing Next.js 16 application without changing product behavior, visual design, database schema, or user-facing workflows.

## Scope

This pass will:

- Replace the stale `next lint` script with a Next.js 16-compatible ESLint CLI command.
- Add explicit validation scripts for typechecking and combined local checks.
- Ensure CI runs the same validation path with Prisma generation, database initialization, seed data, unit tests, typecheck, build, and E2E tests.
- Align README/deployment documentation with the current `db:init`, `db:seed`, and `db:reset` workflow.
- Investigate Storybook only if it blocks the core validation path.

This pass will not:

- Add new product features.
- Redesign UI.
- Change authentication behavior, public API contracts, or database schema.
- Edit `.env` or expose secrets.
- Revert or overwrite unrelated existing working-tree changes.

## Current Findings

The project is a Next.js 16 App Router catalog for MCP servers and clients. It uses React 19, Prisma 7, PGLite for local development, optional external PostgreSQL for serverless deployment, NextAuth v5, `next-intl`, Vitest, and Playwright.

The current validation surface has several risks:

- `npm run lint` calls `next lint`, which is not appropriate for current Next.js 16 workflows.
- CI runs E2E tests but the workflow does not clearly prepare the local database schema and seed admin user used by Playwright auth setup.
- README setup instructions still reference older migration scripts instead of the current `db:init` and `db:seed` scripts.
- `typecheck` is used in CI as `npx tsc --noEmit`, but there is no named npm script for local use.
- The committed `package-lock.json` is not in sync with `package.json`, so `npm ci` fails before validation can run.
- `npm ci` runs `postinstall -> prisma generate`, and `prisma.config.ts` requires `DATABASE_URL`; CI install steps need safe database env values.

## Proposed Approach

Use a small stabilization pass rather than broad refactoring.

1. Update `package.json` scripts:
   - `lint`: use ESLint CLI.
   - `typecheck`: run TypeScript without emitting files.
   - `validate`: run lint, typecheck, and unit tests in a predictable order.

2. Update dependency lock state:
   - Sync `package-lock.json` with `package.json` so `npm ci` works in clean CI and worktree environments.

3. Update CI:
   - Keep `npm ci` and `npx prisma generate`.
   - Provide safe `DATABASE_URL` and `DATABASE_DIR` env values to each `npm ci` step because postinstall loads Prisma config.
   - Add explicit local database setup before E2E: set required test env vars, run `npm run db:init`, run `npm run db:seed`.
   - Replace direct `npx tsc --noEmit` with `npm run typecheck`.
   - Keep build and Playwright gates.

4. Update docs:
   - README setup should use `npm run db:init` and `npm run db:seed`.
   - README test section should mention lint/typecheck/validate.
   - Deployment docs should not imply PGLite is suitable for Vercel serverless production when code falls back to null Prisma without an external PostgreSQL URL.

## Data Flow And Boundaries

No runtime data flow changes are planned. The work touches only project metadata, CI definitions, and documentation unless validation reveals a minimal required compatibility fix.

The implementation should preserve these boundaries:

- Application runtime code under `src/app`, `src/components`, and `src/lib` remains unchanged unless a validation command exposes a direct compatibility issue.
- Prisma schema remains unchanged.
- Playwright tests remain unchanged unless the CI setup alone cannot make them deterministic.

## Error Handling

Validation scripts should fail fast by relying on normal command exit codes. CI should fail if lint, typecheck, build, unit tests, or E2E tests fail.

Database setup failures should remain visible in CI logs instead of being swallowed. The solution should not introduce fallback logic that masks broken migrations or seed data.

## Testing Plan

Run, as applicable after implementation:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`
- E2E only if local database setup succeeds and runtime constraints allow it: `npm run test:e2e`

If a command cannot be run or fails for an unrelated pre-existing issue, document the exact command and output summary.

## Success Criteria

The pass is successful when:

- `package.json` exposes clear lint, typecheck, unit, build, and validate commands.
- `package-lock.json` is synchronized so `npm ci` can run.
- CI prepares env for install-time Prisma generation and prepares the local database before Playwright E2E auth setup.
- Documentation reflects the current project setup path.
- No product behavior is intentionally changed.
- Verification results are reported with concrete command outcomes.

## Risks

- Existing uncommitted changes in the original workspace must not be reverted.
- Local PGLite directories and `.playwright-mcp/` artifacts may affect local runs. They should not be modified unless required by an explicit validation command.
- Storybook dependency/config mismatches may exist but are outside the core stabilization path unless they block validation.
