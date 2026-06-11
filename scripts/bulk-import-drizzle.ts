import { readFileSync } from 'fs'
import path from 'path'
import { db } from '../src/lib/db'
import { servers } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'

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
  } catch { /* non-critical */ }
}
loadEnv()

interface ServerData {
  owner: string
  repo: string
  description: string
  category: string
  stars?: number
  tags?: string[]
  isOfficial?: boolean
  isRemote?: boolean
  isSponsored?: boolean
  featured?: boolean
  githubUrl: string
  fullSlug: string
}

async function main() {
  const jsonPath = path.resolve(process.cwd(), 'scripts/mcp-servers-batch3.json')
  const data: ServerData[] = JSON.parse(readFileSync(jsonPath, 'utf-8'))
  
  console.log(`Importing ${data.length} servers from mcp-servers-batch3.json...`)
  
  let created = 0
  let skipped = 0
  let errors = 0
  
  for (const s of data) {
    try {
      // Check if already exists
      const existing = await db.select({ id: servers.id }).from(servers)
        .where(eq(servers.fullSlug, s.fullSlug))
        .limit(1)
      
      if (existing.length > 0) {
        skipped++
        continue
      }
      
      await db.insert(servers).values({
        name: s.repo.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: s.description,
        owner: s.owner,
        repo: s.repo,
        fullSlug: s.fullSlug,
        category: s.category,
        isOfficial: s.isOfficial ?? false,
        isSponsored: s.isSponsored ?? false,
        githubUrl: s.githubUrl,
        tags: s.tags ?? [],
        isRemote: s.isRemote ?? false,
        featured: s.featured ?? false,
        stars: s.stars ?? 0,
        forks: 0,
      })
      created++
      
      if (created % 20 === 0) {
        console.log(`  Progress: ${created} created, ${skipped} skipped, ${errors} errors`)
      }
    } catch (err: any) {
      errors++
      console.error(`  Error importing ${s.fullSlug}:`, err.message?.substring(0, 100))
    }
  }
  
  console.log(`\nImport complete: ${created} created, ${skipped} skipped, ${errors} errors`)
}

main()
  .catch(e => { console.error('Fatal:', e); process.exit(1) })
  .finally(() => process.exit(0))
