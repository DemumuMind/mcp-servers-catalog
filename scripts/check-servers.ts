import { prisma } from '../src/lib/db'

async function main() {
  const servers = await prisma.server.findMany({
    select: { id: true, name: true, owner: true, repo: true, fullSlug: true }
  })
  console.log('Servers in DB:')
  for (const s of servers) {
    console.log(' -', s.id, s.name, s.fullSlug)
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
