import { readFileSync } from 'fs'
import * as path from 'path'
import { PGlite } from '@electric-sql/pglite'
import { PrismaPGlite } from 'pglite-prisma-adapter'
import { PrismaClient } from '@prisma/client'

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

const dataDir = process.env.DATABASE_DIR || '.pglite3'

interface SeedServer {
  name: string
  description: string
  owner: string
  repo: string
  fullSlug: string
  category: string
  githubUrl: string
  tags: string[]
  isOfficial: boolean
  isRemote: boolean
  featured: boolean
  stars: number
  forks: number
}

function normalizeCategory(cat: string): string {
  const map: Record<string, string> = {
    'ai': 'ai-ml',
    'ai-ml': 'ai-ml',
    'git': 'version-control',
    'social': 'communication',
    'email': 'communication',
    'calendar': 'productivity',
    'memory': 'productivity',
    'filesystem': 'file-system',
    'web': 'web-scraping',
    'monitoring': 'development',
    'security': 'development',
    'finance': 'development',
    'tools': 'other',
    'database': 'database',
    'cloud-service': 'cloud-service',
    'search': 'search',
    'browser': 'web-scraping',
    'productivity': 'productivity',
  }
  return map[cat] || cat
}

async function main() {
  const seedPath = path.resolve(process.cwd(), 'scripts', 'mcp-servers-seed.json')
  const data = readFileSync(seedPath, 'utf-8')
  const servers: SeedServer[] = JSON.parse(data)
  process.stdout.write(`Loaded ${servers.length} servers to seed\n`)

  const pglite = new PGlite({ dataDir })
  const adapter = new PrismaPGlite(pglite)
  const prisma = new PrismaClient({ adapter })

  let created = 0
  let skipped = 0

  for (let i = 0; i < servers.length; i++) {
    const s = servers[i]
    const category = normalizeCategory(s.category)
    const id = `seed-${s.fullSlug.replace(/[^a-zA-Z0-9-]/g, '-')}`

    try {
      const existing = await prisma.server.findUnique({ where: { id } })
      if (existing) {
        skipped++
        continue
      }

      await prisma.server.create({
        data: {
          id,
          name: s.repo,
          description: s.description,
          owner: s.fullSlug.split('/')[0],
          repo: s.fullSlug.split('/').slice(1).join('/'),
          fullSlug: s.fullSlug,
          category,
          isOfficial: s.isOfficial,
          isRemote: s.isRemote,
          featured: s.featured,
          githubUrl: s.githubUrl,
          tags: s.tags,
          stars: s.stars,
          forks: s.forks,
          updatedAt: new Date(),
        },
      })

      created++
      if ((i + 1) % 20 === 0 || i === 0) {
        process.stdout.write(`[${i + 1}/${servers.length}] + ${s.fullSlug} (${category}, ${s.stars}*)\n`)
      }
    } catch (err) {
      skipped++
      process.stdout.write(`[${i + 1}/${servers.length}] x ${s.fullSlug}: ${String(err).slice(0, 80)}\n`)
    }
  }

  process.stdout.write(`\n=== Seed Complete ===\n`)
  process.stdout.write(`Created: ${created}\n`)
  process.stdout.write(`Skipped: ${skipped}\n`)

  await prisma.$disconnect()
  await pglite.close()
  process.exit(0)
}

main().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})
