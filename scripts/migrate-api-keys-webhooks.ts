import { PGlite } from '@electric-sql/pglite'
import path from 'path'

async function main() {
  const dbPath = path.resolve(process.cwd(), '.pglite')
  const client = new PGlite(dbPath)

  console.log('Creating ApiKey table...')
  await client.query(`
    CREATE TABLE IF NOT EXISTS "ApiKey" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      "userId" TEXT NOT NULL,
      name TEXT NOT NULL,
      "keyHash" TEXT NOT NULL UNIQUE,
      "keyPrefix" TEXT NOT NULL,
      permissions TEXT[] DEFAULT ARRAY['read'],
      "lastUsedAt" TIMESTAMP(3),
      "expiresAt" TIMESTAMP(3),
      revoked BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  console.log('Creating Webhook table...')
  await client.query(`
    CREATE TABLE IF NOT EXISTS "Webhook" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      "userId" TEXT NOT NULL,
      url TEXT NOT NULL,
      secret TEXT NOT NULL,
      events TEXT[] DEFAULT ARRAY['server.created', 'server.updated'],
      active BOOLEAN NOT NULL DEFAULT true,
      "lastError" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  console.log('Creating indexes...')
  await client.query(`CREATE INDEX IF NOT EXISTS "ApiKey_userId_idx" ON "ApiKey"("userId")`)
  await client.query(`CREATE INDEX IF NOT EXISTS "ApiKey_keyHash_idx" ON "ApiKey"("keyHash")`)
  await client.query(`CREATE INDEX IF NOT EXISTS "Webhook_userId_idx" ON "Webhook"("userId")`)

  console.log('Migration completed successfully!')
  await client.close()
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
