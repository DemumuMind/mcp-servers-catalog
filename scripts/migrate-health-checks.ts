import { PGlite } from '@electric-sql/pglite'
import path from 'path'

async function main() {
  const dbPath = path.resolve(process.cwd(), '.pglite')
  const client = new PGlite(dbPath)

  process.stdout.write('Creating HealthCheck table...\n')
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

  process.stdout.write('Creating indexes...\n')
  await client.query(`CREATE INDEX IF NOT EXISTS "HealthCheck_serverId_createdAt_idx" ON "HealthCheck"("serverId", "createdAt")`)

  process.stdout.write('Migration completed successfully!\n')
  await client.close()
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
