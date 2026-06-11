import 'dotenv/config'
import { execSync } from 'child_process'

async function run() {
  process.stdout.write('Pushing schema via drizzle-kit...\n')
  execSync('npx drizzle-kit push', { stdio: 'inherit' })
  process.stdout.write('Schema applied successfully\n')
}

run().catch((e) => {
  console.error('Init failed:', e)
  process.exit(1)
})
