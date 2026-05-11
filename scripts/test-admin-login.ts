import { PGlite } from '@electric-sql/pglite'

async function main() {
  const pglite = new PGlite({ dataDir: '.pglite2' })
  
  const result = await pglite.query(`
    SELECT id, email, role, password 
    FROM "User" 
    WHERE email = 'admin@example.com'
  `)
  
  console.log('Users found:', result.rows.length)
  for (const row of result.rows as any[]) {
    console.log('ID:', row.id)
    console.log('Email:', row.email)
    console.log('Role:', row.role)
    console.log('Password hash exists:', !!row.password)
    console.log('Password hash length:', row.password?.length)
  }
  
  await pglite.close()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
