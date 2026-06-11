import { PGlite } from '@electric-sql/pglite'

async function migrate() {
  const client = new PGlite({ dataDir: './.pglite' })

  // Add updatedAt to User if not exists
  try {
    await client.query(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `)
    process.stdout.write('Added updatedAt to User\n')
  } catch (e) {
    process.stdout.write(`updatedAt already exists or error: ${(e as Error).message}\n`)
  }

  // Add emailNotifications to User if not exists
  try {
    await client.query(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailNotifications" BOOLEAN NOT NULL DEFAULT true;
    `)
    process.stdout.write('Added emailNotifications to User\n')
  } catch (e) {
    process.stdout.write(`emailNotifications already exists or error: ${(e as Error).message}\n`)
  }

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
    process.stdout.write('Created ViewHistory table\n')
  } catch (e) {
    process.stdout.write(`ViewHistory error: ${(e as Error).message}\n`)
  }

  await client.close()
  process.stdout.write('Migration complete\n')
}

migrate().catch(console.error)
