import { syncGitHubStats } from '../src/app/actions/sync'

async function main() {
  process.stdout.write('Starting GitHub stats sync for existing servers...\n')
  const result = await syncGitHubStats()
  process.stdout.write(`Sync complete: ${result}\n`)
}

main().catch(console.error)
