import 'dotenv/config'
import { getServersPublic } from '../src/app/actions/public'

async function test() {
  const result = await getServersPublic(1, undefined, undefined, undefined, false, false, false, 'featured')
  process.stdout.write(`Total: ${result.total}\n`)
  process.stdout.write(`Servers: ${result.servers.length}\n`)
  for (const s of result.servers) {
    process.stdout.write(`- ${s.name}: ${s.description?.substring(0, 30)}...\n`)
  }
}

test().catch(console.error).finally(() => process.exit(0))
