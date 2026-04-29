import path from 'path'
import { PrismaClient } from '@prisma/client'
import { PGlite } from '@electric-sql/pglite'
import { PrismaPGlite } from 'pglite-prisma-adapter'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const dataDir = process.env.DATABASE_DIR
  ? path.resolve(process.env.DATABASE_DIR)
  : path.resolve(process.cwd(), '.pglite')

function createPrismaClient() {
  const client = new PGlite({ dataDir })
  const adapter = new PrismaPGlite(client)
  return new PrismaClient({ adapter })
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma
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
