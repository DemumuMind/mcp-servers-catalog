import { PGlite } from '@electric-sql/pglite'
import path from 'path'

async function main() {
  const dbPath = path.resolve(process.cwd(), '.pglite')
  const client = new PGlite(dbPath)

  process.stdout.write('Creating Sponsorship table...\n')
  await client.query(`
    CREATE TABLE IF NOT EXISTS "Sponsorship" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      "serverId" TEXT NOT NULL UNIQUE,
      "sponsorName" TEXT NOT NULL,
      "sponsorUrl" TEXT,
      "sponsorLogo" TEXT,
      "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "endDate" TIMESTAMP(3),
      amount REAL,
      currency TEXT NOT NULL DEFAULT 'USD',
      notes TEXT,
      active BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  process.stdout.write('Creating indexes...\n')
  await client.query(`CREATE INDEX IF NOT EXISTS "Sponsorship_serverId_idx" ON "Sponsorship"("serverId")`)
  await client.query(`CREATE INDEX IF NOT EXISTS "Sponsorship_active_endDate_idx" ON "Sponsorship"(active, "endDate")`)

  process.stdout.write('Migration completed successfully!\n')
  await client.close()
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
