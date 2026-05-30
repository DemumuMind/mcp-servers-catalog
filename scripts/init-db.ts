import 'dotenv/config'
import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'fs'
import { join } from 'path'

const dataDir = process.env.DATABASE_DIR || '.pglite3'

async function run() {
  const db = new PGlite({ dataDir })
  const sql = readFileSync(join(process.cwd(), 'prisma', 'full-schema.sql'), 'utf-8')
  console.log('Applying full schema...')
  await db.exec(sql)
  console.log('Schema applied successfully')
  await db.close()
}

run().catch((e) => {
  console.error('Init failed:', e)
  process.exit(1)
})
