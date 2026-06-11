const { PGlite } = require('@electric-sql/pglite')

async function main() {
  const dataDir = process.env.DATABASE_DIR || '.pglite3'
  const pglite = new PGlite({ dataDir })

  const totalRes = await pglite.query('SELECT COUNT(*) as total FROM "Server"')
  process.stdout.write(`Total servers: ${totalRes.rows[0].total}\n`)

  const catRes = await pglite.query('SELECT category, COUNT(*) as cnt FROM "Server" GROUP BY category ORDER BY cnt DESC')
  process.stdout.write(`Categories: ${catRes.rows.map(r => `${r.category}:${r.cnt}`).join(', ')}\n`)

  const sample = await pglite.query('SELECT name, owner, repo, category, stars, tags FROM "Server" ORDER BY stars DESC LIMIT 10')
  process.stdout.write(`Top 10 by stars: ${JSON.stringify(sample.rows, null, 2)}\n`)

  await pglite.close()
}

main().catch(console.error)
