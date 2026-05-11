import { PGlite } from '@electric-sql/pglite'
import path from 'path'

async function main() {
  const dbPath = path.resolve(process.cwd(), '.pglite')
  const client = new PGlite(dbPath)

  console.log('Adding premium expiration columns to Server table...')
  await client.query(`
    ALTER TABLE "Server"
    ADD COLUMN IF NOT EXISTS "featuredUntil" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "sponsoredUntil" TIMESTAMP(3)
  `)

  console.log('Migration completed successfully!')
  await client.close()
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
