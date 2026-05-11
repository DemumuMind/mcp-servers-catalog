import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'fs'

async function main() {
  const dataDir = process.env.DATABASE_DIR || '.pglite'
  console.log(`Applying schema to ${dataDir}...`)
  
  const pglite = new PGlite({ dataDir })
  
  const sql = readFileSync('prisma/full-schema.sql', 'utf-8')
  await pglite.exec(sql)
  
  console.log('Schema applied successfully!')
  await pglite.close()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
