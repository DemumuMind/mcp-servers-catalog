import { PGlite } from '@electric-sql/pglite'

async function main() {
  const pglite = new PGlite({ dataDir: '.pglite2' })
  
  // Add the "ghost" user from old .pglite database that exists in JWT cookie
  const oldUserId = 'cmp00y8uc00003ct8zun4g6ah'
  
  try {
    await pglite.query(`
      INSERT INTO "User" (id, email, password, role, "isVerifiedAuthor", "emailNotifications", "createdAt", "updatedAt")
      VALUES ($1, 'legacy@example.com', '', 'user', false, true, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `, [oldUserId])
    process.stdout.write('Added legacy user to .pglite2 successfully\n')
  } catch (e) {
    console.error('Error adding legacy user:', e)
  }
  
  // Verify
  const result = await pglite.query('SELECT id, email, role FROM "User"')
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
