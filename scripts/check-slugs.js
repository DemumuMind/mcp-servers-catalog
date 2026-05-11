const { PGlite } = require('@electric-sql/pglite')

async function main() {
  const pglite = new PGlite({ dataDir: process.env.DATABASE_DIR || '.pglite3' })
  const res = await pglite.query(`SELECT "fullSlug", name FROM "Server" WHERE owner = 'github' OR owner = 'n8n-io' LIMIT 5`)
  console.log(res.rows)
  await pglite.close()
}

main().catch(console.error)
