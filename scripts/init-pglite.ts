import { PGlite } from '@electric-sql/pglite'
import path from 'path'

async function initDatabase() {
  const dataDir = process.env.DATABASE_DIR
    ? path.resolve(process.env.DATABASE_DIR)
    : path.resolve(process.cwd(), '.pglite')

  console.log('Initializing PGLite database at:', dataDir)
  const db = new PGlite({ dataDir })

  try {
    // Create Server table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS "Server" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "owner" TEXT NOT NULL,
        "repo" TEXT NOT NULL,
        "fullSlug" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "isOfficial" BOOLEAN NOT NULL DEFAULT false,
        "isSponsored" BOOLEAN NOT NULL DEFAULT false,
        "githubUrl" TEXT NOT NULL,
        "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        "isRemote" BOOLEAN NOT NULL DEFAULT false,
        "authType" TEXT,
        "endpoint" TEXT,
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
      )
    `)

    await db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Server_fullSlug_key" ON "Server"("fullSlug")
    `)

    // Create User table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'user',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      )
    `)

    await db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")
    `)

    // Create Client table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS "Client" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "icon" TEXT,
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
      )
    `)

    await db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Client_url_key" ON "Client"("url")
    `)

    console.log('All tables created successfully')

  } catch (err) {
    console.error('Error creating tables:', err)
    process.exit(1)
  } finally {
    await db.close()
  }
}

initDatabase()
