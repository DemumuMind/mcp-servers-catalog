import path from 'path'
import { PrismaClient } from '@prisma/client'
import { PGlite } from '@electric-sql/pglite'
import { PrismaPGlite } from 'pglite-prisma-adapter'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pgliteInstance: PGlite | undefined
}

function getDataDir(): string {
  const dir = process.env.DATABASE_DIR?.trim()
  return dir
    ? path.resolve(dir)
    : path.resolve(process.cwd(), '.pglite')
}

function createPrismaClient(): PrismaClient {
  const dataDir = getDataDir()
  
  // Lazy PGlite initialization with error handling
  let pglite = globalForPrisma.pgliteInstance
  if (!pglite) {
    try {
      pglite = new PGlite({ dataDir })
      globalForPrisma.pgliteInstance = pglite
    } catch (e) {
      console.error('[PGlite] Failed to initialize with dataDir:', dataDir, e)
      // Fallback: try in-memory mode
      try {
        pglite = new PGlite()
        globalForPrisma.pgliteInstance = pglite
        console.warn('[PGlite] Using in-memory fallback. Data will not persist.')
      } catch (e2) {
        console.error('[PGlite] In-memory fallback also failed:', e2)
        throw new Error('PGlite initialization failed. Please ensure WASM support is available.')
      }
    }
  }
  
  const adapter = new PrismaPGlite(pglite)
  return new PrismaClient({ adapter })
}

function getPrismaClient(): PrismaClient {
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

// Lazy export — don't initialize at module load time
let _prisma: PrismaClient | undefined

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!_prisma) {
      _prisma = getPrismaClient()
    }
    return (_prisma as any)[prop]
  },
})
