import { PGlite } from '@electric-sql/pglite'
import path from 'path'

async function main() {
  const dbPath = path.resolve(process.cwd(), '.pglite')
  const client = new PGlite(dbPath)

  console.log('Adding category column to DigestSubscription table...')
  await client.query(`
    ALTER TABLE "DigestSubscription" 
    ADD COLUMN IF NOT EXISTS category TEXT
  `)

  console.log('Migration completed successfully!')
  await client.close()
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
