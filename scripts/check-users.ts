import { PGlite } from '@electric-sql/pglite'

async function main() {
  const pglite = new PGlite({ dataDir: '.pglite2' })
  const result = await pglite.query('SELECT id, email, role FROM "User" LIMIT 5')
  process.stdout.write('Users in .pglite2:\n')
  for (const row of result.rows as { id: string; email: string; role: string }[]) {
    process.stdout.write(` - ${row.id} ${row.email} ${row.role}\n`)
  }
  await pglite.close()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
