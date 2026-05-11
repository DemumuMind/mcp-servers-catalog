import { PGlite } from '@electric-sql/pglite'
import path from 'path'

async function migrate() {
  const dataDir = process.env.DATABASE_DIR
    ? path.resolve(process.env.DATABASE_DIR)
    : path.resolve(process.cwd(), '.pglite')

  const db = new PGlite({ dataDir })

  try {
    // Add provider column to User if not exists
    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'provider') THEN
          ALTER TABLE "User" ADD COLUMN "provider" TEXT DEFAULT 'credentials';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'name') THEN
          ALTER TABLE "User" ADD COLUMN "name" TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'image') THEN
          ALTER TABLE "User" ADD COLUMN "image" TEXT;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'password' AND is_nullable = 'NO') THEN
          ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
        END IF;
      END $$;
    `)

    // Create Bookmark table
    await db.query(`
      CREATE TABLE IF NOT EXISTS "Bookmark" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "serverId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
        CONSTRAINT "Bookmark_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE,
        CONSTRAINT "Bookmark_userId_serverId_key" UNIQUE ("userId", "serverId")
      )
    `)

    // Create Rating table
    await db.query(`
      CREATE TABLE IF NOT EXISTS "Rating" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "serverId" TEXT NOT NULL,
        "value" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
        CONSTRAINT "Rating_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE,
        CONSTRAINT "Rating_userId_serverId_key" UNIQUE ("userId", "serverId")
      )
    `)

    // Create Comment table
    await db.query(`
      CREATE TABLE IF NOT EXISTS "Comment" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "serverId" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
        CONSTRAINT "Comment_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE
      )
    `)

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration error:', error)
  } finally {
    await db.close()
  }
}

migrate()
