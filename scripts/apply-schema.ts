import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'fs'

async function main() {
  const dataDir = process.env.DATABASE_DIR || '.pglite'
  process.stdout.write(`Applying schema to ${dataDir}...\n`)
  
  const pglite = new PGlite({ dataDir })
  
  const sql = readFileSync('prisma/full-schema.sql', 'utf-8')
  await pglite.exec(sql)
  
  process.stdout.write('Schema applied successfully!\n')
  await pglite.close()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
