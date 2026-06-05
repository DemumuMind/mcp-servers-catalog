# Engineering Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make project validation reliable for the existing Next.js 16 app before larger product changes.

**Architecture:** This is a metadata, CI, and documentation stabilization pass. Runtime application code, Prisma schema, UI, auth behavior, and public APIs remain unchanged unless a validation command exposes a direct compatibility issue.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma 7, PGLite, Vitest, Playwright, GitHub Actions, npm.

---

## File Structure

- Modify: `package.json` — define current validation scripts: lint, typecheck, validate.
- Modify: `package-lock.json` — synchronize dependency lock state so `npm ci` succeeds.
- Modify: `.github/workflows/ci.yml` — use package scripts, provide install-time Prisma env, and prepare PGLite seed data before Playwright E2E.
- Modify: `README.md` — align install/test instructions with current scripts.
- Modify: `docs/DEPLOY.md` — align deployment/setup docs with current DB init/seed workflow and Vercel database requirements.

## Task 1: Update npm Validation Scripts

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json` only if required to make `npm ci` pass from a clean checkout.

- [x] **Step 1: Inspect current scripts**

Run: `npm pkg get scripts`

Expected: JSON output includes `"lint": "next lint"`, `"test:unit": "vitest run"`, and `"test:e2e": "playwright test"`.

- [x] **Step 2: Replace scripts block entries**

Change `package.json` scripts to include `lint: eslint .`, `typecheck: tsc --noEmit`, and `validate: npm run lint && npm run typecheck && npm run test:unit`, while preserving existing build, dev, Storybook, and DB commands.

- [x] **Step 3: Validate package JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json ok')"`

Expected: prints `package.json ok`.

- [x] **Step 4: Smoke-check script names**

Run: `npm pkg get scripts.lint scripts.typecheck scripts.validate`

Expected: output contains `eslint .`, `tsc --noEmit`, and `npm run lint && npm run typecheck && npm run test:unit`.

## Task 2: Make CI Use Current Validation And Seed E2E Data

**Files:**
- Modify: `.github/workflows/ci.yml`

- [x] **Step 1: Update typecheck job command**

Replace direct `npx tsc --noEmit` with `npm run typecheck`.

- [x] **Step 2: Add install-time Prisma env**

Add safe `DATABASE_URL` and `DATABASE_DIR` env values to every `npm ci` step because `postinstall` runs Prisma config.

- [x] **Step 3: Add E2E database initialization**

In the `test-e2e` job, after `npx prisma generate` and before `npx playwright install --with-deps chromium`, run `npm run db:init` and `npm run db:seed` with `.pglite3` and admin credentials.

- [x] **Step 4: Give E2E runtime the same database and admin env**

Set `AUTH_SECRET`, `NEXTAUTH_SECRET`, `DATABASE_DIR`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` on the `npm run test:e2e` step.

- [x] **Step 5: Validate typecheck command**

Run: `npm run typecheck`

Expected: passes or reports unrelated existing TypeScript errors.

## Task 3: Refresh README Setup And Test Docs

**Files:**
- Modify: `README.md`

- [x] **Step 1: Replace install/setup command block**

Use `npm run db:init` and `npm run db:seed` instead of stale migration scripts.

- [x] **Step 2: Replace tests section command block**

Document `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run validate`, and `npm run test:e2e`.

- [x] **Step 3: Validate README contains current scripts**

Run: `node -e "const s=require('fs').readFileSync('README.md','utf8'); for (const x of ['npm run db:init','npm run db:seed','npm run typecheck','npm run validate']) if (!s.includes(x)) throw new Error(x); console.log('README ok')"`

Expected: prints `README ok`.

## Task 4: Refresh Deployment Docs

**Files:**
- Modify: `docs/DEPLOY.md`

- [x] **Step 1: Correct Vercel database guidance**

Document external `DATABASE_URL` for Vercel/serverless production.

- [x] **Step 2: Update self-hosted setup commands**

Use `npm run db:init` and `npm run db:seed`.

- [x] **Step 3: Update required env table**

Keep `DATABASE_DIR` and add `DATABASE_URL` for Vercel/serverless production.

- [x] **Step 4: Update troubleshooting text**

Clarify local/self-hosted PGLite versus Vercel/serverless external PostgreSQL.

- [x] **Step 5: Validate deploy docs contain corrected guidance**

Run: `node -e "const s=require('fs').readFileSync('docs/DEPLOY.md','utf8'); for (const x of ['DATABASE_URL','serverless production','npm run db:init','npm run db:seed']) if (!s.includes(x)) throw new Error(x); console.log('DEPLOY ok')"`

Expected: prints `DEPLOY ok`.

## Task 5: Run Verification And Report Results

**Files:**
- No intended file edits.

- [ ] **Step 1: Check git diff before verification**

Run: `git diff -- package.json package-lock.json .github/workflows/ci.yml README.md docs/DEPLOY.md docs/superpowers/specs/2026-06-04-engineering-stabilization-design.md docs/superpowers/plans/2026-06-04-engineering-stabilization.md`

Expected: diff shows only the intended stabilization files.

- [ ] **Step 2: Run clean install verification**

Run: `npm ci` with safe `DATABASE_URL` and `DATABASE_DIR` env values.

Expected: passes.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: passes or reports existing lint findings.

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`

Expected: passes.

- [ ] **Step 5: Run unit tests**

Run: `npm run test:unit`

Expected: passes.

- [ ] **Step 6: Run build**

Run: `npm run build` with safe local test secrets if required.

Expected: passes or reports actionable build failures.

- [ ] **Step 7: Run E2E only if local DB setup is safe**

Run database init/seed and `npm run test:e2e` only if acceptable for local test state.

Expected: Playwright completes or reports actionable failures.

- [ ] **Step 8: Summarize final status**

Report changed files and verification outcomes.

## Self-Review Notes

- Spec coverage: scripts, lockfile sync, CI install env, CI E2E setup, docs alignment, and verification are covered.
- Placeholder scan: no TBD/TODO placeholders are present.
- Type consistency: commands and file paths match existing project scripts and paths.
