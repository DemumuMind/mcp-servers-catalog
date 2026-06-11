import { PGlite } from '@electric-sql/pglite'

async function main() {
  const pglite = new PGlite({ dataDir: '.pglite' })
  const result = await pglite.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `)
  process.stdout.write('Tables in .pglite:\n')
  for (const row of result.rows as { table_name: string }[]) {
    process.stdout.write(` - ${row.table_name}\n`)
  }
  await pglite.close()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
