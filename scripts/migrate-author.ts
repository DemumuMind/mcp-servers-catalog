import { PGlite } from '@electric-sql/pglite'
import path from 'path'

async function main() {
  const dbPath = path.resolve(process.cwd(), '.pglite')
  const client = new PGlite(dbPath)

  process.stdout.write('Adding authorId column to Server table...\n')
  await client.query(`
    ALTER TABLE "Server" 
    ADD COLUMN IF NOT EXISTS "authorId" TEXT
  `)

  process.stdout.write('Creating index on authorId...\n')
  await client.query(`CREATE INDEX IF NOT EXISTS "Server_authorId_idx" ON "Server"("authorId")`)

  process.stdout.write('Migration completed successfully!\n')
  await client.close()
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
