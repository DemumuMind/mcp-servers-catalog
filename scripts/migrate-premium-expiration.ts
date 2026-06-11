import { PGlite } from '@electric-sql/pglite'
import path from 'path'

async function main() {
  const dbPath = path.resolve(process.cwd(), '.pglite')
  const client = new PGlite(dbPath)

  process.stdout.write('Adding premium expiration columns to Server table...\n')
  await client.query(`
    ALTER TABLE "Server"
    ADD COLUMN IF NOT EXISTS "featuredUntil" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "sponsoredUntil" TIMESTAMP(3)
  `)

  process.stdout.write('Migration completed successfully!\n')
  await client.close()
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
