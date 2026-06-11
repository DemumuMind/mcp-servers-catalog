import { prisma } from '../src/lib/db'

async function main() {
  const servers = await prisma.server.findMany({
    select: { id: true, name: true, owner: true, repo: true, fullSlug: true }
  })
  process.stdout.write('Servers in DB:\n')
  for (const s of servers) {
    process.stdout.write(` - ${s.id} ${s.name} ${s.fullSlug}\n`)
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
