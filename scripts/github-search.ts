import { readFileSync } from 'fs'
import path from 'path'
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
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
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

function getDataDir(): string {
  const dir = process.env.DATABASE_DIR?.trim()
  return dir ? path.resolve(dir) : path.resolve(process.cwd(), '.pglite3')
}

function createPrisma() {
  const dataDir = getDataDir()
  console.log(`Using database directory: ${dataDir}`)
  const pglite = new PGlite({ dataDir })
  const adapter = new PrismaPGlite(pglite)
  return { prisma: new PrismaClient({ adapter }), pglite }
}

const { prisma, pglite } = createPrisma()

const CATEGORY_MAP: Record<string, string> = {
  database: 'database',
  sql: 'database',
  postgres: 'database',
  postgresql: 'database',
  mysql: 'database',
  sqlite: 'database',
  mongodb: 'database',
  redis: 'database',
  db: 'database',
  dbhub: 'database',
  'aws-s3': 'cloud-service',
  aws: 'cloud-service',
  azure: 'cloud-service',
  gcp: 'cloud-service',
  cloudflare: 'cloud-service',
  vercel: 'cloud-service',
  firebase: 'cloud-service',
  heroku: 'cloud-service',
  digitalocean: 'cloud-service',
  search: 'search',
  brave: 'search',
  google: 'search',
  bing: 'search',
  elasticsearch: 'search',
  opensearch: 'search',
  kagi: 'search',
  agentql: 'search',
  browser: 'browser',
  puppeteer: 'browser',
  playwright: 'browser',
  selenium: 'browser',
  'browser-use': 'browser',
  'browser-tools': 'browser',
  ai: 'ai',
  openai: 'ai',
  anthropic: 'ai',
  claude: 'ai',
  gpt: 'ai',
  llm: 'ai',
  huggingface: 'ai',
  langchain: 'ai',
  superagent: 'ai',
  humanloop: 'ai',
  'magic-mcp': 'ai',
  agentrpc: 'ai',
  git: 'git',
  github: 'git',
  gitlab: 'git',
  gitingest: 'git',
  notion: 'notes',
  obsidian: 'notes',
  notes: 'notes',
  evernote: 'notes',
  bear: 'notes',
  test: 'testing',
  testing: 'testing',
  jest: 'testing',
  vitest: 'testing',
  cypress: 'testing',
  filesystem: 'filesystem',
  files: 'filesystem',
  fs: 'filesystem',
  memory: 'memory',
  cache: 'memory',
  store: 'memory',
  persist: 'memory',
  mem0: 'memory',
  calendar: 'calendar',
  schedule: 'calendar',
  event: 'calendar',
  email: 'email',
  mail: 'email',
  smtp: 'email',
  documentation: 'docs',
  docs: 'docs',
  readme: 'docs',
  http: 'web',
  rest: 'web',
  api: 'web',
  fetch: 'web',
  web: 'web',
  youtube: 'media',
  spotify: 'media',
  image: 'media',
  video: 'media',
  media: 'media',
  tmdb: 'media',
  applescript: 'media',
  monitoring: 'monitoring',
  observability: 'monitoring',
  logging: 'monitoring',
  metrics: 'monitoring',
  slack: 'social',
  discord: 'social',
  telegram: 'social',
  twitter: 'social',
  bluesky: 'social',
  linkedin: 'social',
  productivity: 'productivity',
  todo: 'productivity',
  task: 'productivity',
  planner: 'productivity',
  jira: 'productivity',
  confluence: 'productivity',
  trello: 'productivity',
  linear: 'productivity',
  asana: 'productivity',
  stripe: 'finance',
  paypal: 'finance',
  finance: 'finance',
  payment: 'finance',
  docker: 'devops',
  kubernetes: 'devops',
  'ci-cd': 'devops',
  devops: 'devops',
  terraform: 'devops',
  jenkins: 'devops',
  wordpress: 'cms',
  laravel: 'cms',
  content: 'cms',
  cms: 'cms',
  phabricator: 'cms',
  shopify: 'e-commerce',
  e2b: 'development',
  '1mcpserver': 'tools',
}

function detectCategory(topics: string[], readmeTags: string[], name: string, description: string | null): string {
  const sources = [...topics, ...readmeTags, name, description || ''].map((s) => s.toLowerCase())
  for (const text of sources) {
    for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
      if (text.includes(keyword)) {
        return category
      }
    }
  }
  return 'tools'
}

async function githubSearch(
  query: string,
  perPage = 100,
  page = 1
): Promise<Array<{ owner: string; repo: string; htmlUrl: string; fullName: string }>> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (GITHUB_TOKEN) headers.Authorization = `token ${GITHUB_TOKEN}`

  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}&page=${page}`
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub search failed: ${res.status} ${text.slice(0, 200)}`)
  }
  const data = await res.json()
  if (!data.items || !Array.isArray(data.items)) {
    throw new Error('Unexpected search response format')
  }
  return data.items.map((item: any) => ({
    owner: item.owner.login,
    repo: item.name,
    htmlUrl: item.html_url,
    fullName: item.full_name,
  }))
}

async function main() {
  console.log('Fetching MCP servers from GitHub Search API...')

  // Fetch up to 100 results from search
  const searchResults = await githubSearch('topic:mcp-server', 100, 1)
  console.log(`GitHub search returned ${searchResults.length} repositories`)

  // Get existing slugs from DB
  const existingServers = await prisma.server.findMany({ select: { fullSlug: true } })
  const existingSlugs = new Set(existingServers.map((s) => s.fullSlug.toLowerCase()))
  console.log(`Already in database: ${existingSlugs.size} servers`)

  let created = 0
  let skipped = 0
  let failed = 0
  let enriched = 0

  for (let i = 0; i < searchResults.length; i++) {
    const result = searchResults[i]
    const fullSlug = `${result.owner}/${result.repo}`.toLowerCase()

    if (existingSlugs.has(fullSlug)) {
      console.log(`[${i + 1}/${searchResults.length}] Skipping existing: ${fullSlug}`)
      skipped++
      continue
    }

    console.log(`[${i + 1}/${searchResults.length}] Processing ${fullSlug}...`)

    try {
      const repoData = await fetchGitHubRepo(result.htmlUrl)

      // Fetch and analyze README
      let readmeAnalysis = null
      try {
        const readme = await fetchRepoReadme(result.htmlUrl)
        if (readme) {
          readmeAnalysis = analyzeReadme(readme)
          enriched++
        }
      } catch (readmeErr) {
        console.warn(`  ⚠️ Failed to fetch README for ${fullSlug}:`, (readmeErr as Error).message)
      }

      const category = detectCategory(
        repoData.topics || [],
        readmeAnalysis?.suggestedTags || [],
        repoData.name,
        repoData.description
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

      created++
      console.log(`  ✓ Created ${fullSlug} (${category}, ${repoData.stars}⭐)`)
    } catch (err) {
      console.error(`  ✗ Failed ${fullSlug}:`, (err as Error).message)
      failed++
    }

    // Sleep to respect rate limits
    if (i < searchResults.length - 1) {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  console.log('\n--- GitHub search import complete ---')
  console.log(`Total search results: ${searchResults.length}`)
  console.log(`Created:              ${created}`)
  console.log(`Skipped (existing):   ${skipped}`)
  console.log(`Failed:               ${failed}`)
  console.log(`README enriched:      ${enriched}`)

  await prisma.$disconnect()
  await pglite.close()
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
