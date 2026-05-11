import { PGlite } from '@electric-sql/pglite'

async function migrate() {
  const client = new PGlite({ dataDir: './.pglite' })

  // Add collectionId to Bookmark
  try {
    await client.query(`ALTER TABLE "Bookmark" ADD COLUMN IF NOT EXISTS "collectionId" TEXT;`)
    console.log('Added collectionId to Bookmark')
  } catch (e) {
    console.log('collectionId already exists or error:', (e as Error).message)
  }

  // Create Collection table
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
    console.log('Created Collection table')
  } catch (e) {
    console.log('Collection error:', (e as Error).message)
  }

  // Create DigestSubscription table
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
    console.log('Created DigestSubscription table')
  } catch (e) {
    console.log('DigestSubscription error:', (e as Error).message)
  }

  // Create Vote table
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
    console.log('Created Vote table')
  } catch (e) {
    console.log('Vote error:', (e as Error).message)
  }

  // Add vote relation to Server
  try {
    await client.query(`ALTER TABLE "Server" ADD COLUMN IF NOT EXISTS "voteCount" INTEGER DEFAULT 0;`)
    console.log('Added voteCount to Server')
  } catch (e) {
    console.log('voteCount already exists or error:', (e as Error).message)
  }

  await client.close()
  console.log('Migration complete')
}

migrate().catch(console.error)
