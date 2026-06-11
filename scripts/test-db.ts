import 'dotenv/config'
import { prisma } from '../src/lib/db'

async function test() {
  const servers = await prisma.server.findMany()
  process.stdout.write(`Servers found: ${servers.length}\n`)
  for (const s of servers) {
    process.stdout.write(`- ${s.name}: ${s.description?.substring(0, 30)}...\n`)
  }
}

test().catch(console.error).finally(() => process.exit(0))
