import { prisma } from '@/lib/db'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

// NOTE: This rate limiter uses an in-memory Map with file persistence.
// It does NOT work correctly on Vercel/serverless — each cold start creates
// a fresh instance, and the filesystem is ephemeral. For production serverless,
// use Redis (Upstash) or a database-backed rate limiter instead.

const RATE_LIMIT_FILE = join(process.cwd(), '.rate-limit.json')

interface PersistedEntry {
  count: number
  resetTime: number
}

function loadStore(): Map<string, PersistedEntry> {
  if (!existsSync(RATE_LIMIT_FILE)) return new Map()
  try {
    const data = JSON.parse(readFileSync(RATE_LIMIT_FILE, 'utf-8'))
    const store = new Map<string, PersistedEntry>()
    for (const [key, value] of Object.entries(data)) {
      store.set(key, value as PersistedEntry)
    }
    return store
  } catch {
    return new Map()
  }
}

function saveStore(store: Map<string, PersistedEntry>) {
  const obj: Record<string, PersistedEntry> = {}
  for (const [key, value] of store.entries()) {
    obj[key] = value
  }
  writeFileSync(RATE_LIMIT_FILE, JSON.stringify(obj, null, 2))
}

let memoryStore = loadStore()

// Persist every 30 seconds
setInterval(() => {
  saveStore(memoryStore)
}, 30_000)

export async function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const now = Date.now()
  const entry = memoryStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    const newEntry: PersistedEntry = {
      count: 1,
      resetTime: now + windowMs,
    }
    memoryStore.set(identifier, newEntry)
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: newEntry.resetTime,
    }
  }

  if (entry.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: entry.resetTime,
    }
  }

  entry.count++
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - entry.count,
    reset: entry.resetTime,
  }
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetTime) {
      memoryStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export async function getClientIP(request?: Request): Promise<string> {
  if (!request) return 'unknown'
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}
