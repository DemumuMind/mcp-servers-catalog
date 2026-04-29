import { PGlite } from '@electric-sql/pglite'
import { PrismaPGlite } from 'pglite-prisma-adapter'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const client = new PGlite({ dataDir: process.env.DATABASE_DIR || './.pglite' })
  const adapter = new PrismaPGlite(client)
  return new PrismaClient({ adapter })
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma
  // If cached client exists but doesn't have the 'client' model (e.g. stale schema),
  // discard it and create a fresh one
  if (cached && typeof (cached as any).client === 'object') {
    return cached
  }
  const fresh = createPrismaClient()
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = fresh
  }
  return fresh
}

export const prisma = getPrismaClient()
