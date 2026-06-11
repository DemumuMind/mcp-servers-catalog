# Engineering Stabilization Design

Date: 2026-06-04 (updated 2026-06-12)
Project: `mcpservers-clone`

## Goal

Make the project safer to change before larger product work. Reliable local and CI validation for the Next.js 16 application.

## Completed Migration (2026-06-12)

The project migrated from **Prisma 7 + PGLite** to **Drizzle ORM + Turso (libsql)**:

- All Prisma references removed from `src/`
- `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/migrations/`, `prisma.config.ts` deleted
- 21 Drizzle tables defined in `src/lib/db/schema.ts`
- SQLite-compatible local DB: `file:.turso/local.db`
- Remote Turso: `libsql://dbname-org.turso.io`
- Schema migration: `npx drizzle-kit push` (replaces `npx prisma generate` + `npx prisma migrate`)
- Seed: `npm run db:seed` (unchanged command, new implementation)

## Current Tech Stack

- **Next.js 16** — App Router, Server Actions, Turbopack
- **React 19** + TypeScript
- **Drizzle ORM** + **Turso/libsql** — ORM and SQLite-compatible DB
- **NextAuth v5** — email/password + GitHub OAuth
- **next-intl** — i18n (EN/RU)
- **Vitest** + **Playwright** — testing
- **GitHub Actions** — CI

## Current Validation Surface

- `npm run typecheck` — 0 TypeScript errors
- `npm run lint` — ESLint
- `npm run test:unit` — Vitest
- `npm run validate` — lint + typecheck + unit
- `npm run build` — next build (PASS)

## Key Conventions

- Raw SQL in Drizzle must use **camelCase** table/column names (e.g. `"HealthCheck"."serverId"`, not `health_checks.server_id`)
- `getClient().execute({sql, args})` for raw SQL — not `db.execute()`
- Sequential DB queries on local SQLite (libsql lockfile — no parallel writes)
- Dev server must run from **PowerShell** on WSL (NTFS lockfile issue)
- ServerRanking has **unique index on (serverId, period)** — not just serverId
- `verifyCronAuth()` in `src/lib/cron-auth.ts` uses `.trim()` on all env values
- Numbers formatted with `toLocaleString('en-US')` — never 'ru-RU'

## Risks

- Local libsql lockfile fails on NTFS via WSL — must use PowerShell
- ISR (`export const revalidate`) causes server crash with libsql local DB — pages use `force-dynamic`
- `@prisma/client` remains in node_modules as transitive dep of drizzle-orm — cannot remove
- Turso production requires account/CLI — deferred until user has credentials
