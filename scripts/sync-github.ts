import { syncGitHubStats } from '../src/app/actions/sync'

async function main() {
  console.log('Starting GitHub stats sync for existing servers...')
  const result = await syncGitHubStats()
  console.log('Sync complete:', result)
}

main().catch(console.error)
