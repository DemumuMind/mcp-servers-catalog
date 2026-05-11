import { PGlite } from '@electric-sql/pglite'
import path from 'path'

async function main() {
  const dbPath = path.resolve(process.cwd(), '.pglite')
  const client = new PGlite(dbPath)

  console.log('Creating HealthCheck table...')
  await client.query(`
    CREATE TABLE IF NOT EXISTS "HealthCheck" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      "serverId" TEXT NOT NULL,
      status TEXT NOT NULL,
      latency INTEGER,
      error TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  console.log('Creating indexes...')
  await client.query(`CREATE INDEX IF NOT EXISTS "HealthCheck_serverId_createdAt_idx" ON "HealthCheck"("serverId", "createdAt")`)

  console.log('Migration completed successfully!')
  await client.close()
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
