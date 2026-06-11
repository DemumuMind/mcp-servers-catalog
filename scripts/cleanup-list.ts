import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env')
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (process.env[key] === undefined) {
        process.env[key] = value
      }
    }
  } catch {
    // ignore
  }
}
loadEnv()

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
const SKIP_REPOS = new Set([
  'wong2/awesome-mcp-servers',
  'yuzehao2023/awesome-mcp-servers',
])

async function checkRepoExists(owner: string, repo: string): Promise<boolean> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (GITHUB_TOKEN) headers.Authorization = `token ${GITHUB_TOKEN}`

  const GITHUB_API_BASE = process.env.GITHUB_API_URL || 'https://api.github.com'
  try {
    const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers })
    return res.ok
  } catch {
    return false
  }
}

async function main() {
  const filePath = path.resolve(process.cwd(), 'scripts/mcp-servers-list.json')
  const urls: string[] = JSON.parse(readFileSync(filePath, 'utf-8'))

  // Deduplicate first
  const seen = new Set<string>()
  const deduped: string[] = []
  for (const url of urls) {
    try {
      const parsed = new URL(url)
      const parts = parsed.pathname.split('/').filter(Boolean)
      if (parts.length < 2) continue
      const slug = `${parts[0]}/${parts[1]}`.toLowerCase()
      if (seen.has(slug)) continue
      seen.add(slug)
      deduped.push(url)
    } catch (err) {
      console.warn(`Invalid URL skipped: ${url}`, err)
    }
  }

  process.stdout.write(`Starting validation of ${deduped.length} unique URLs...\n`)

  const valid: string[] = []
  let checked = 0
  let failed = 0
  let skipped = 0

  for (let i = 0; i < deduped.length; i++) {
    const url = deduped[i]
    const parsed = new URL(url)
    const parts = parsed.pathname.split('/').filter(Boolean)
    const owner = parts[0]
    const repo = parts[1]
    const fullSlug = `${owner}/${repo}`.toLowerCase()

    if (SKIP_REPOS.has(fullSlug)) {
      process.stdout.write(`[${i + 1}/${deduped.length}] Skipping list repo: ${fullSlug}\n`)
      skipped++
      continue
    }

    const exists = await checkRepoExists(owner, repo)
    if (exists) {
      valid.push(url)
      process.stdout.write(`[${i + 1}/${deduped.length}] ✓ Valid: ${fullSlug}\n`)
    } else {
      process.stdout.write(`[${i + 1}/${deduped.length}] ✗ Not found: ${fullSlug}\n`)
      failed++
    }
    checked++

    // Sleep to avoid rate limiting
    if (i < deduped.length - 1) {
      await new Promise((r) => setTimeout(r, 500))
    }
  }

  writeFileSync(filePath, JSON.stringify(valid, null, 2) + '\n', 'utf-8')

  process.stdout.write('\n--- Cleanup complete ---\n')
  process.stdout.write(`Checked: ${checked}\n`)
  process.stdout.write(`Valid:   ${valid.length}\n`)
  process.stdout.write(`Failed:  ${failed}\n`)
  process.stdout.write(`Skipped: ${skipped}\n`)
  process.stdout.write(`Cleaned list written to scripts/mcp-servers-list.json\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
