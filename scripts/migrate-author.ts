import { PGlite } from '@electric-sql/pglite'
import path from 'path'

async function main() {
  const dbPath = path.resolve(process.cwd(), '.pglite')
  const client = new PGlite(dbPath)

  console.log('Adding authorId column to Server table...')
  await client.query(`
    ALTER TABLE "Server" 
    ADD COLUMN IF NOT EXISTS "authorId" TEXT
  `)

  console.log('Creating index on authorId...')
  await client.query(`CREATE INDEX IF NOT EXISTS "Server_authorId_idx" ON "Server"("authorId")`)

  console.log('Migration completed successfully!')
  await client.close()
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
