import { readFileSync } from 'fs'
import * as path from 'path'
import { PrismaClient } from '@prisma/client'
import { PGlite } from '@electric-sql/pglite'
import { PrismaPGlite } from 'pglite-prisma-adapter'
import { fetchGitHubRepo, fetchRepoReadme } from '../src/lib/github'
import { analyzeReadme, mergeTags } from '../src/lib/readme-analysis'

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

const GITHUB_TOKEN = (typeof process !== "undefined" && process.env && process.env.GITHUB_TOKEN) || ""
const TARGET_COUNT = 120

function getDataDir(): string {
  const dir = process.env.DATABASE_DIR?.trim()
  return dir ? path.resolve(dir) : path.resolve(process.cwd(), '.pglite3')
}

function createPrisma() {
  const dataDir = getDataDir()
  process.stdout.write(`Using database directory: ${dataDir}\n`)
  const pglite = new PGlite({ dataDir })
  const adapter = new PrismaPGlite(pglite)
  return { prisma: new PrismaClient({ adapter }), pglite }
}

const CATEGORY_MAP: Record<string, string> = {
  database: 'database', sql: 'database', postgres: 'database', postgresql: 'database',
  mysql: 'database', sqlite: 'database', mongodb: 'database', redis: 'database',
  db: 'database', dbhub: 'database', supabase: 'database',
  'aws-s3': 'cloud-service', aws: 'cloud-service', azure: 'cloud-service',
  gcp: 'cloud-service', cloudflare: 'cloud-service', vercel: 'cloud-service',
  firebase: 'cloud-service', digitalocean: 'cloud-service',
  search: 'search', brave: 'search', google: 'search', bing: 'search',
  elasticsearch: 'search', opensearch: 'search', kagi: 'search', exa: 'search',
  tavily: 'search', duckduckgo: 'search', perplexity: 'search',
  browser: 'browser', puppeteer: 'browser', playwright: 'browser',
  selenium: 'browser', 'browser-use': 'browser', 'browser-tools': 'browser',
  ai: 'ai', openai: 'ai', anthropic: 'ai', claude: 'ai', gpt: 'ai',
  llm: 'ai', huggingface: 'ai', langchain: 'ai', ollama: 'ai',
  embedding: 'ai', rag: 'ai', vector: 'ai', chromadb: 'ai',
  git: 'git', github: 'git', gitlab: 'git', gitingest: 'git',
  notion: 'notes', obsidian: 'notes', notes: 'notes',
  test: 'testing', testing: 'testing', jest: 'testing', vitest: 'testing', cypress: 'testing',
  filesystem: 'filesystem', files: 'filesystem', fs: 'filesystem',
  memory: 'memory', cache: 'memory', store: 'memory', persist: 'memory', mem0: 'memory',
  calendar: 'calendar', schedule: 'calendar', event: 'calendar',
  email: 'email', mail: 'email', smtp: 'email', gmail: 'email',
  documentation: 'docs', docs: 'docs', readme: 'docs',
  http: 'web', rest: 'web', api: 'web', fetch: 'web', web: 'web',
  youtube: 'media', spotify: 'media', image: 'media', video: 'media', media: 'media',
  monitoring: 'monitoring', observability: 'monitoring', logging: 'monitoring',
  slack: 'social', discord: 'social', telegram: 'social', twitter: 'social', bluesky: 'social',
  productivity: 'productivity', todo: 'productivity', task: 'productivity',
  jira: 'productivity', confluence: 'productivity', trello: 'productivity', linear: 'productivity',
  stripe: 'finance', paypal: 'finance', finance: 'finance', payment: 'finance',
  docker: 'devops', kubernetes: 'devops', 'ci-cd': 'devops', terraform: 'devops',
  security: 'security', auth: 'security', encryption: 'security',
  game: 'gaming', minecraft: 'gaming', gaming: 'gaming',
  science: 'science', research: 'science', arxiv: 'science',
  map: 'location', maps: 'location', geocoding: 'location',
  'e2b': 'development', sandbox: 'development', 'code-execution': 'development',
}

function detectCategory(topics: string[], readmeTags: string[], name: string, description: string | null): string {
  const sources = [...topics, ...readmeTags, name, description || ''].map((s) => s.toLowerCase())
  for (const text of sources) {
    for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
      if (text.includes(keyword)) return category
    }
  }
  return 'tools'
}

async function githubSearch(
  query: string,
  perPage = 100,
  page = 1,
): Promise<Array<{ owner: string; repo: string; htmlUrl: string; fullName: string }>> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' }
  if (GITHUB_TOKEN) headers.Authorization = `token ${GITHUB_TOKEN}`

  const GITHUB_API_BASE = process.env.GITHUB_API_URL || 'https://api.github.com'
  const url = `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}&page=${page}`
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub search failed: ${res.status} ${text.slice(0, 200)}`)
  }
  const data = await res.json()
  if (!data.items || !Array.isArray(data.items)) return []
  return data.items.map((item: any) => ({
    owner: item.owner.login,
    repo: item.name,
    htmlUrl: item.html_url,
    fullName: item.full_name,
  }))
}

interface SearchCounters {
  created: number
  skipped: number
  failed: number
  enriched: number
}

async function processSearchResult(
  result: { owner: string; repo: string; htmlUrl: string; fullName: string },
  index: number,
  total: number,
  existingSlugs: Set<string>,
  counters: SearchCounters,
): Promise<boolean> {
  const fullSlug = `${result.owner}/${result.repo}`.toLowerCase()

  if (existingSlugs.has(fullSlug)) {
    process.stdout.write(`[${index + 1}/${total}] Skip existing: ${fullSlug}\n`)
    counters.skipped++
    return false
  }

  process.stdout.write(`[${index + 1}/${total}] Processing ${fullSlug}...\n`)

  try {
    const repoData = await fetchGitHubRepo(result.htmlUrl)

    let readmeAnalysis = null
    try {
      const readme = await fetchRepoReadme(result.htmlUrl)
      if (readme) {
        readmeAnalysis = analyzeReadme(readme)
        counters.enriched++
      }
    } catch { /* non-critical */ }

    const category = detectCategory(
      repoData.topics || [],
      readmeAnalysis?.suggestedTags || [],
      repoData.name,
      repoData.description,
    )

    const tags = readmeAnalysis
      ? mergeTags([], repoData.topics || [], readmeAnalysis.suggestedTags)
      : mergeTags([], repoData.topics || [], [])

    await prisma.server.create({
      data: {
        name: repoData.name,
        description: repoData.description || `${repoData.name} MCP server`,
        owner: result.owner,
        repo: result.repo,
        fullSlug,
        category,
        githubUrl: result.htmlUrl,
        tags,
        stars: repoData.stars,
        forks: repoData.forks,
        isOfficial: false,
        isRemote: false,
        featured: false,
      },
    })

    existingSlugs.add(fullSlug)
    counters.created++
    process.stdout.write(`  + Created ${fullSlug} (${category}, ${repoData.stars}*)\n`)
    return true
  } catch (err) {
    process.stdout.write(`  x Failed ${fullSlug}: ${(err as Error).message.slice(0, 100)}\n`)
    counters.failed++
    return false
  }
}

const SEARCH_QUERIES = [
  'topic:mcp-server',
  'mcp server in:readme',
  'model context protocol server',
  'mcp-server language:typescript',
  'mcp-server language:python',
  'mcp server api',
  'mcp server database',
  'mcp server search',
  'mcp server ai',
  'mcp server browser',
  'mcp server tools',
  'mcp server git',
  'mcp server slack',
  'mcp server docker',
  'mcp server memory',
  'mcp server email',
  'mcp server filesystem',
  'mcp server cloud',
  'mcp server monitoring',
  'mcp server finance',
]

const { prisma, pglite } = createPrisma()

async function main() {
  process.stdout.write('=== Seed MCP Servers (target: 120+) ===\n')

  const existingServers = await prisma.server.findMany({ select: { fullSlug: true } })
  const existingSlugs = new Set(existingServers.map((s) => s.fullSlug.toLowerCase()))
  process.stdout.write(`Already in database: ${existingSlugs.size} servers\n`)

  if (existingSlugs.size >= TARGET_COUNT) {
    process.stdout.write(`Already have ${existingSlugs.size} servers (>= ${TARGET_COUNT}). Done!\n`)
    await prisma.$disconnect()
    await pglite.close()
    return
  }

  const counters: SearchCounters = { created: 0, skipped: 0, failed: 0, enriched: 0 }
  let totalProcessed = 0
  let needMore = true

  for (const query of SEARCH_QUERIES) {
    if (!needMore) break

    process.stdout.write(`\n--- Searching: "${query}" ---\n`)

    for (let page = 1; page <= 3; page++) {
      if (!needMore) break

      try {
        const results = await githubSearch(query, 100, page)
        if (results.length === 0) {
          process.stdout.write(`  Page ${page}: no results, moving on\n`)
          break
        }

        process.stdout.write(`  Page ${page}: ${results.length} results\n`)

        for (const result of results) {
          if (!needMore) break
          totalProcessed++
          await processSearchResult(result, totalProcessed, 0, existingSlugs, counters)

          if (existingSlugs.size >= TARGET_COUNT) {
            needMore = false
            break
          }

          // Rate limit: 1s between requests
          await new Promise((r) => setTimeout(r, 1200))
        }
      } catch (err) {
        process.stdout.write(`  Page ${page} failed: ${(err as Error).message.slice(0, 100)}\n`)
        // Rate limit hit — wait and continue with next query
        await new Promise((r) => setTimeout(r, 30_000))
        break
      }
    }
  }

  process.stdout.write('\n=== Seed Complete ===\n')
  process.stdout.write(`Total in DB now:  ${existingSlugs.size}\n`)
  process.stdout.write(`Created:          ${counters.created}\n`)
  process.stdout.write(`Skipped:          ${counters.skipped}\n`)
  process.stdout.write(`Failed:           ${counters.failed}\n`)
  process.stdout.write(`README enriched:  ${counters.enriched}\n`)

  await prisma.$disconnect()
  await pglite.close()
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
