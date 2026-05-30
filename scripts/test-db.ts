import 'dotenv/config'
import { prisma } from '../src/lib/db'

async function test() {
  const servers = await prisma.server.findMany()
  console.log('Servers found:', servers.length)
  for (const s of servers) {
    console.log(`- ${s.name}: ${s.description?.substring(0, 30)}...`)
  }
}

test().catch(console.error).finally(() => process.exit(0))
