import { PGlite } from '@electric-sql/pglite'
import path from 'path'

async function migrate() {
  const dataDir = process.env.DATABASE_DIR
    ? path.resolve(process.env.DATABASE_DIR)
    : path.resolve(process.cwd(), '.pglite')

  const db = new PGlite({ dataDir })

  try {
    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Server' AND column_name = 'stars') THEN
          ALTER TABLE "Server" ADD COLUMN "stars" INTEGER DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Server' AND column_name = 'forks') THEN
          ALTER TABLE "Server" ADD COLUMN "forks" INTEGER DEFAULT 0;
        END IF;
      END $$;
    `)

    process.stdout.write('Stars/Forks columns added successfully!\n')
  } catch (error) {
    console.error('Migration error:', error)
  } finally {
    await db.close()
  }
}

migrate()
