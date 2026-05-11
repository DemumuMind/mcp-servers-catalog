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
  if (cached) {
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

// Reset function for when PGLite crashes
export function resetDatabaseConnection() {
  console.log('[DB] Resetting database connection...')
  _prisma = undefined
  globalForPrisma.prisma = undefined
  globalForPrisma.pgliteInstance = undefined
}

// Helper to execute Prisma queries with automatic retry on PGLite crash
export async function withDbRetry<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  try {
    return await fn(prisma)
  } catch (err: any) {
    const message = err?.message || String(err)
    if (message.includes('Aborted') || message.includes('RuntimeError')) {
      console.warn('[DB] PGLite crashed, resetting and retrying...')
      resetDatabaseConnection()
      // Small delay to let filesystem settle
      await new Promise(r => setTimeout(r, 100))
      return await fn(prisma)
    }
    throw err
  }
}
