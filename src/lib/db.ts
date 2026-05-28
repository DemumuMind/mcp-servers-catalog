import path from 'path'
import { PrismaClient } from '@prisma/client'
import { PGlite } from '@electric-sql/pglite'
import { PrismaPGlite } from 'pglite-prisma-adapter'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pgliteInstance: PGlite | undefined
  pgPool: Pool | undefined
  dbFailed: boolean | undefined
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

// Create a mock Prisma client that returns empty results for all queries
// Used as fallback when database is unavailable (e.g., on Vercel serverless)
function createNullPrismaClient(): PrismaClient {
  const handler = {
    get(_target: any, prop: string) {
      if (['$connect', '$disconnect', '$transaction', '$queryRaw', '$executeRaw', '$queryRawUnsafe', '$executeRawUnsafe'].includes(prop)) {
        return async () => {
          console.warn(`[DB] Mock Prisma: ${prop} called, database unavailable`)
          return prop.startsWith('$query') ? [] : undefined
        }
      }
      if (prop === '$extends' || prop === '$on') {
        return () => createNullPrismaClient()
      }
      if (prop === '$use') {
        return () => {}
      }
      // Return a proxy for model methods (findMany, findUnique, etc.)
      return new Proxy({}, {
        get(_t, method) {
          return async () => {
            console.warn(`[DB] Mock Prisma: ${prop}.${String(method)} called, returning empty result`)
            if (method === 'count' || method === 'aggregate') return 0
            if (method === 'findUnique' || method === 'findFirst') return null
            if (method === 'groupBy') return []
            return []
          }
        }
      })
    }
  }
  return new Proxy({} as PrismaClient, handler) as PrismaClient
}

function isExternalPostgresUrl(url?: string): boolean {
  if (!url || url.trim() === '' || url === 'undefined') return false
  const lower = url.toLowerCase()
  // Reject dummy/localhost URLs used for local dev or build-time type generation
  if (lower.includes('localhost') || lower.includes('127.0.0.1')) return false
  return lower.startsWith('postgresql://') || lower.startsWith('postgres://')
}

function createStandardPrismaClient(): PrismaClient {
  let pool = globalForPrisma.pgPool
  if (!pool) {
    const connectionString = process.env.DATABASE_URL!
    pool = new Pool({ connectionString })
    globalForPrisma.pgPool = pool
  }
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

function getPrismaClient(): PrismaClient {
  // If DB already failed, return null client immediately
  if (globalForPrisma.dbFailed) {
    return createNullPrismaClient()
  }

  const dbUrl = process.env.DATABASE_URL

  // On Vercel serverless, check if a real external PostgreSQL DATABASE_URL is configured
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    if (isExternalPostgresUrl(dbUrl)) {
      console.log('[DB] Vercel serverless with external PostgreSQL detected, using standard Prisma client')
      return createStandardPrismaClient()
    }
    console.warn('[DB] Vercel serverless detected without external DB, using null Prisma client')
    globalForPrisma.dbFailed = true
    return createNullPrismaClient()
  }

  const cached = globalForPrisma.prisma
  if (cached) {
    return cached
  }

  try {
    const fresh = createPrismaClient()
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = fresh
    }
    return fresh
  } catch (err) {
    console.error('[DB] Failed to create Prisma client, using null fallback:', err)
    globalForPrisma.dbFailed = true
    return createNullPrismaClient()
  }
}

// Lazy export — don't initialize at module load time
let _prisma: PrismaClient | undefined
let _dbFailed = false

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (_dbFailed && globalForPrisma.dbFailed) {
      return (createNullPrismaClient() as any)[prop]
    }
    if (!_prisma) {
      try {
        _prisma = getPrismaClient()
      } catch (err) {
        console.error('[DB] Lazy init failed:', err)
        _dbFailed = true
        globalForPrisma.dbFailed = true
        _prisma = createNullPrismaClient()
      }
    }
    return (_prisma as any)[prop]
  },
})

// Reset function for when PGLite crashes
export function resetDatabaseConnection() {
  console.log('[DB] Resetting database connection...')
  _prisma = undefined
  _dbFailed = false
  globalForPrisma.prisma = undefined
  globalForPrisma.pgliteInstance = undefined
  globalForPrisma.pgPool = undefined
  globalForPrisma.dbFailed = undefined
}

// Helper to execute Prisma queries with automatic retry on PGLite crash
export async function withDbRetry<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  try {
    return await fn(prisma)
  } catch (err: any) {
    const message = err?.message || String(err)
    if (message.includes('Aborted') || message.includes('RuntimeError') || message.includes('PGlite')) {
      console.warn('[DB] PGLite crashed, resetting and retrying...')
      resetDatabaseConnection()
      // Small delay to let filesystem settle
      await new Promise(r => setTimeout(r, 100))
      return await fn(prisma)
    }
    throw err
  }
}
