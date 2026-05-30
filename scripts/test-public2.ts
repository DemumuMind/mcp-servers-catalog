import 'dotenv/config'
import { getServersPublic } from '../src/app/actions/public'

async function test() {
  const result = await getServersPublic(1)
  const s = result.servers[0]
  console.log('Server:', JSON.stringify(s, null, 2))
}

test().catch(console.error).finally(() => process.exit(0))
