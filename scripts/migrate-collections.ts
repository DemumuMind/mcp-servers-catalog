import { PGlite } from '@electric-sql/pglite'

async function migrate() {
  const client = new PGlite({ dataDir: './.pglite' })

  // Add collectionId to Bookmark
  try {
    await client.query(`ALTER TABLE "Bookmark" ADD COLUMN IF NOT EXISTS "collectionId" TEXT;`)
    process.stdout.write('Added collectionId to Bookmark\n')
  } catch (e) {
    process.stdout.write(`collectionId already exists or error: ${(e as Error).message}\n`)
  }

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Collection" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)
    await client.query(`CREATE INDEX IF NOT EXISTS "Collection_userId_idx" ON "Collection"("userId");`)
    process.stdout.write('Created Collection table\n')
  } catch (e) {
    process.stdout.write(`Collection error: ${(e as Error).message}\n`)
  }

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "DigestSubscription" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "frequency" TEXT NOT NULL DEFAULT 'weekly',
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "DigestSubscription_userId_key" ON "DigestSubscription"("userId");`)
    process.stdout.write('Created DigestSubscription table\n')
  } catch (e) {
    process.stdout.write(`DigestSubscription error: ${(e as Error).message}\n`)
  }

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Vote" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "serverId" TEXT NOT NULL,
        "value" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "Vote_userId_serverId_key" ON "Vote"("userId", "serverId");`)
    process.stdout.write('Created Vote table\n')
  } catch (e) {
    process.stdout.write(`Vote error: ${(e as Error).message}\n`)
  }

  // Add vote relation to Server
  try {
    await client.query(`ALTER TABLE "Server" ADD COLUMN IF NOT EXISTS "voteCount" INTEGER DEFAULT 0;`)
    process.stdout.write('Added voteCount to Server\n')
  } catch (e) {
    process.stdout.write(`voteCount already exists or error: ${(e as Error).message}\n`)
  }

  await client.close()
  process.stdout.write('Migration complete\n')
}

migrate().catch(console.error)
