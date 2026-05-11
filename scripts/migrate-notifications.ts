import { PGlite } from '@electric-sql/pglite'

async function migrate() {
  const client = new PGlite({ dataDir: './.pglite' })

  // Add isModerated to Comment if not exists
  try {
    await client.query(`ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "isModerated" BOOLEAN NOT NULL DEFAULT false;`)
    console.log('Added isModerated to Comment')
  } catch (e) {
    console.log('isModerated already exists or error:', (e as Error).message)
  }

  // Create Notification table
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
    console.log('Created Notification table')
  } catch (e) {
    console.log('Notification error:', (e as Error).message)
  }

  await client.close()
  console.log('Migration complete')
}

migrate().catch(console.error)
