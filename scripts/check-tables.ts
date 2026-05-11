import { PGlite } from '@electric-sql/pglite'

async function main() {
  const pglite = new PGlite({ dataDir: '.pglite' })
  const result = await pglite.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `)
  console.log('Tables in .pglite:')
  for (const row of result.rows as { table_name: string }[]) {
    console.log(' -', row.table_name)
  }
  await pglite.close()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
