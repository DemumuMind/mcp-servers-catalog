import { PGlite } from '@electric-sql/pglite'
import path from 'path'

async function main() {
  const dbPath = path.resolve(process.cwd(), '.pglite')
  const client = new PGlite(dbPath)

  process.stdout.write('Adding category column to DigestSubscription table...\n')
  await client.query(`
    ALTER TABLE "DigestSubscription" 
    ADD COLUMN IF NOT EXISTS category TEXT
  `)

  process.stdout.write('Migration completed successfully!\n')
  await client.close()
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
