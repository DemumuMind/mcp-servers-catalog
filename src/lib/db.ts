import { createClient, type Client } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './db/schema'
import { logger } from '@/lib/logger'

// ─── Environment ─────────────────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL?.trim() || 'file:./.turso/local.db'
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN?.trim()

// ─── libsql client ───────────────────────────────────────────────────────────
// Supports:
//   - Local file:    file:./.turso/local.db   or  file:/abs/path.db
//   - Remote Turso:  libsql://dbname-org.turso.io?authToken=xxx
//   - Local + sync:  http://127.0.0.1:8080     (turso dev)

const isRemoteUrl = (url: string): boolean =>
  url.startsWith('libsql://') || url.startsWith('http://') || url.startsWith('https://')

function createTursoClient(): Client {
  const url = DATABASE_URL

  if (isRemoteUrl(url)) {
    logger.info('[DB] Connecting to remote Turso:', url.replace(/\?authToken=.+/, '?authToken=***'))
    return createClient({
      url,
      authToken: DATABASE_AUTH_TOKEN,
    })
  }

  // Local file path — ensure parent dir exists
  logger.info('[DB] Connecting to local Turso file:', url)
  return createClient({ url })
}

// ─── Singleton pattern (dev hot-reload safety) ──────────────────────────────
const globalForDb = globalThis as typeof globalThis & {
  _tursoClient?: Client
  _drizzleDb?: ReturnType<typeof drizzle<typeof schema>>
}

function getClient(): Client {
  if (!globalForDb._tursoClient) {
    globalForDb._tursoClient = createTursoClient()
  }
  return globalForDb._tursoClient
}

// ─── Drizzle instance ────────────────────────────────────────────────────────
export const db = (() => {
  if (globalForDb._drizzleDb) return globalForDb._drizzleDb

  const client = getClient()
  const instance = drizzle(client, { schema })

  if (process.env.NODE_ENV !== 'production') {
    globalForDb._drizzleDb = instance
  }

  return instance
})()

// ─── Health check ────────────────────────────────────────────────────────────
export async function healthCheck(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now()
  try {
    const client = getClient()
    await client.execute('SELECT 1')
    return { ok: true, latencyMs: Date.now() - start }
  } catch (err: any) {
    return { ok: false, latencyMs: Date.now() - start, error: err?.message || String(err) }
  }
}

// ─── Re-export schema for convenient imports ─────────────────────────────────
export * from './db/schema'

// ─── Export raw client for direct SQL when Drizzle API is insufficient ──────
export { getClient }


