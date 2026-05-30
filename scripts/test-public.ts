import 'dotenv/config'
import { getServersPublic } from '../src/app/actions/public'

async function test() {
  const result = await getServersPublic(1, undefined, undefined, undefined, false, false, false, 'featured')
  console.log('Total:', result.total)
  console.log('Servers:', result.servers.length)
  for (const s of result.servers) {
    console.log(`- ${s.name}: ${s.description?.substring(0, 30)}...`)
  }
}

test().catch(console.error).finally(() => process.exit(0))
