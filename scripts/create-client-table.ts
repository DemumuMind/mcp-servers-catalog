import { PGlite } from '@electric-sql/pglite'
import path from 'path'

async function createClientTable() {
  const dataDir = process.env.DATABASE_DIR
    ? path.resolve(process.env.DATABASE_DIR)
    : path.resolve(process.cwd(), '.pglite')

  console.log('Connecting to PGLite at:', dataDir)
  const db = new PGlite({ dataDir })

  try {
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

    // Create index on url
    await db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Client_url_key" ON "Client"("url")
    `)

    console.log('Client table created successfully')

    // Also check if _prisma_migrations needs updating
    const result = await db.query(`
      SELECT * FROM "_prisma_migrations" ORDER BY "finished_at" DESC LIMIT 5
    `)
    console.log('Recent migrations:', result.rows)

  } catch (err) {
    console.error('Error creating Client table:', err)
    process.exit(1)
  } finally {
    await db.close()
  }
}

createClientTable()
