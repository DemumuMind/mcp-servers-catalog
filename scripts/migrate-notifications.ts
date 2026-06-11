import { PGlite } from '@electric-sql/pglite'

async function migrate() {
  const client = new PGlite({ dataDir: './.pglite' })

  // Add isModerated to Comment if not exists
  try {
    await client.query(`ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "isModerated" BOOLEAN NOT NULL DEFAULT false;`)
    process.stdout.write('Added isModerated to Comment\n')
  } catch (e) {
    process.stdout.write(`isModerated already exists or error: ${(e as Error).message}\n`)
  }

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "link" TEXT,
        "read" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)
    await client.query(`CREATE INDEX IF NOT EXISTS "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");`)
    process.stdout.write('Created Notification table\n')
  } catch (e) {
    process.stdout.write(`Notification error: ${(e as Error).message}\n`)
  }

  await client.close()
  process.stdout.write('Migration complete\n')
}

migrate().catch(console.error)
