import { PGlite } from '@electric-sql/pglite'

async function migrate() {
  const client = new PGlite({ dataDir: './.pglite' })

  // Add updatedAt to User if not exists
  try {
    await client.query(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `)
    console.log('Added updatedAt to User')
  } catch (e) {
    console.log('updatedAt already exists or error:', (e as Error).message)
  }

  // Add emailNotifications to User if not exists
  try {
    await client.query(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailNotifications" BOOLEAN NOT NULL DEFAULT true;
    `)
    console.log('Added emailNotifications to User')
  } catch (e) {
    console.log('emailNotifications already exists or error:', (e as Error).message)
  }

  // Create ViewHistory table
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "ViewHistory" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "serverId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ViewHistory_userId_serverId_key" ON "ViewHistory"("userId", "serverId");
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS "ViewHistory_userId_createdAt_idx" ON "ViewHistory"("userId", "createdAt");
    `)
    console.log('Created ViewHistory table')
  } catch (e) {
    console.log('ViewHistory error:', (e as Error).message)
  }

  await client.close()
  console.log('Migration complete')
}

migrate().catch(console.error)
