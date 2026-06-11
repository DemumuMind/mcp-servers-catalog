import { PGlite } from '@electric-sql/pglite'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

async function main() {
  const dataDir = process.env.DATABASE_DIR || '.pglite'
  process.stdout.write(`Initializing PGlite in ${dataDir}...\n`)
  
  const pglite = new PGlite({ dataDir })
  
  const migrationsDir = 'prisma/migrations'
  const dirs = readdirSync(migrationsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort()
  
  for (const dir of dirs) {
    const sqlPath = join(migrationsDir, dir, 'migration.sql')
    process.stdout.write(`Applying ${dir}...\n`)
    const sql = readFileSync(sqlPath, 'utf-8')
    await pglite.exec(sql)
  }
  
  process.stdout.write('Migrations applied successfully!\n')
  await pglite.close()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
