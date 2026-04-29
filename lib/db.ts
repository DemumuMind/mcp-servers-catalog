import { PrismaClient } from '@prisma/client'
import { PGlite } from '@electric-sql/pglite'
import { PrismaPGlite } from 'pglite-prisma-adapter'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const client = new PGlite({ dataDir: process.env.DATABASE_DIR || './.pglite' })
const adapter = new PrismaPGlite(client)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
