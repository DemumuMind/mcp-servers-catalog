import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

// Load .env manually
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

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers })
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
    } catch {
      console.warn(`Invalid URL skipped: ${url}`)
    }
  }

  console.log(`Starting validation of ${deduped.length} unique URLs...`)

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
      console.log(`[${i + 1}/${deduped.length}] Skipping list repo: ${fullSlug}`)
      skipped++
      continue
    }

    const exists = await checkRepoExists(owner, repo)
    if (exists) {
      valid.push(url)
      console.log(`[${i + 1}/${deduped.length}] ✓ Valid: ${fullSlug}`)
    } else {
      console.log(`[${i + 1}/${deduped.length}] ✗ Not found: ${fullSlug}`)
      failed++
    }
    checked++

    // Sleep to avoid rate limiting
    if (i < deduped.length - 1) {
      await new Promise((r) => setTimeout(r, 500))
    }
  }

  // Write back cleaned list
  writeFileSync(filePath, JSON.stringify(valid, null, 2) + '\n', 'utf-8')

  console.log('\n--- Cleanup complete ---')
  console.log(`Checked: ${checked}`)
  console.log(`Valid:   ${valid.length}`)
  console.log(`Failed:  ${failed}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Cleaned list written to scripts/mcp-servers-list.json`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
