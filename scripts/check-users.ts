import { PGlite } from '@electric-sql/pglite'

async function main() {
  const pglite = new PGlite({ dataDir: '.pglite2' })
  const result = await pglite.query('SELECT id, email, role FROM "User" LIMIT 5')
  console.log('Users in .pglite2:')
  for (const row of result.rows as { id: string; email: string; role: string }[]) {
    console.log(' -', row.id, row.email, row.role)
  }
  await pglite.close()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
