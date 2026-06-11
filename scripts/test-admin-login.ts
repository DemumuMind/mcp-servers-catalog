import { PGlite } from '@electric-sql/pglite'

interface AdminUserRow {
  id: string
  email: string
  role: string
  password: string | null
}

async function main() {
  const pglite = new PGlite({ dataDir: '.pglite2' })
  
  const result = await pglite.query<AdminUserRow>(`
    SELECT id, email, role, password 
    FROM "User" 
    WHERE email = 'admin@example.com'
  `)
  
  process.stdout.write(`Users found: ${result.rows.length}\n`)
  for (const row of result.rows) {
    process.stdout.write(`ID: ${row.id}\n`)
    process.stdout.write(`Email: ${row.email}\n`)
    process.stdout.write(`Role: ${row.role}\n`)
    process.stdout.write(`Password hash exists: ${!!row.password}\n`)
    process.stdout.write(`Password hash length: ${row.password?.length}\n`)
  }
  
  await pglite.close()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
