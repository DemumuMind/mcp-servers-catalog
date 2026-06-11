import { readFileSync } from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { PGlite } from '@electric-sql/pglite'
import { PrismaPGlite } from 'pglite-prisma-adapter'
import { fetchGitHubRepo, fetchRepoReadme } from '../src/lib/github'
import { analyzeReadme, mergeTags } from '../src/lib/readme-analysis'

// Load .env manually since tsx doesn't auto-load it
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
    // .env not found or unreadable
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
  process.stdout.write(`Using database directory: ${dataDir}\n`)
  const pglite = new PGlite({ dataDir })
  const adapter = new PrismaPGlite(pglite)
  return { prisma: new PrismaClient({ adapter }), pglite }
}

const { prisma, pglite } = createPrisma()

// Keywords → category mapping
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

const SKIP_REPOS = new Set([
  'wong2/awesome-mcp-servers',
  'yuzehao2023/awesome-mcp-servers',
])

async function validateMcpContent(
  owner: string,
  repo: string,
  topics: string[],
  description: string | null
): Promise<boolean> {
  const combined = [...topics, description || '', repo].map((s) => s.toLowerCase()).join(' ')
  if (
    combined.includes('mcp') ||
    combined.includes('model.context.protocol') ||
    combined.includes('model-context-protocol')
  ) {
    return true
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (GITHUB_TOKEN) headers.Authorization = `token ${GITHUB_TOKEN}`

  const GITHUB_API_BASE = process.env.GITHUB_API_URL || 'https://api.github.com'
  const files = ['package.json', 'pyproject.toml', 'setup.py', 'Cargo.toml', 'go.mod', 'requirements.txt']
  for (const file of files) {
    try {
      const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${file}`, { headers })
      if (!res.ok) continue
      const data = await res.json()
      if (!data.content) continue
      const content = Buffer.from(data.content, 'base64').toString('utf-8').toLowerCase()
      if (
        content.includes('mcp') ||
        content.includes('model-context-protocol') ||
        content.includes('model context protocol')
      ) {
        return true
      }
    } catch {
      continue
    }
  }
  return false
}

interface ImportCounters {
  created: number
  updated: number
  skipped: number
  failed: number
  enriched: number
}

function deduplicateUrls(urls: string[]): string[] {
  const seen = new Set<string>()
  const uniqueUrls: string[] = []
  for (const url of urls) {
    try {
      const parsed = new URL(url)
      const parts = parsed.pathname.split('/').filter(Boolean)
      if (parts.length < 2) continue
      const slug = `${parts[0]}/${parts[1]}`.toLowerCase()
      if (seen.has(slug)) continue
      seen.add(slug)
      uniqueUrls.push(url)
    } catch (err) {
      console.warn(`Invalid URL skipped: ${url}`, err)
    }
  }
  return uniqueUrls
}

async function processSingleServer(
  url: string,
  index: number,
  total: number,
  counters: ImportCounters
): Promise<void> {
  const parsed = new URL(url)
  const parts = parsed.pathname.split('/').filter(Boolean)
  const owner = parts[0]
  const repo = parts[1]
  const fullSlug = `${owner}/${repo}`.toLowerCase()

  if (SKIP_REPOS.has(fullSlug)) {
    process.stdout.write(`[${index + 1}/${total}] Skipping list repo: ${fullSlug}\n`)
    counters.skipped++
    return
  }

  process.stdout.write(`[${index + 1}/${total}] Processing ${fullSlug}...\n`)

  try {
    const repoData = await fetchGitHubRepo(url)

    const isMcp = await validateMcpContent(owner, repo, repoData.topics, repoData.description)
    if (!isMcp) {
      console.warn(`  ⚠️ No MCP keywords found in ${fullSlug}, importing anyway`)
    }

    let readmeAnalysis = null
    try {
      const readme = await fetchRepoReadme(url)
      if (readme) {
        readmeAnalysis = analyzeReadme(readme)
        counters.enriched++
      }
    } catch (readmeErr) {
      console.warn(`  ⚠️ Failed to fetch README for ${fullSlug}:`, (readmeErr as Error).message)
    }

    const category = detectCategory(
      repoData.topics,
      readmeAnalysis?.suggestedTags || [],
      repoData.name,
      repoData.description
    )

    const tags = readmeAnalysis
      ? mergeTags([], repoData.topics || [], readmeAnalysis.suggestedTags)
      : mergeTags([], repoData.topics || [], [])

    const existing = await prisma.server.findUnique({ where: { fullSlug } })

    await prisma.server.upsert({
      where: { fullSlug },
      update: {
        name: repoData.name,
        description: repoData.description || `${repoData.name} MCP server`,
        owner,
        repo,
        category,
        githubUrl: url,
        tags,
        stars: repoData.stars,
        forks: repoData.forks,
        updatedAt: new Date(),
      },
      create: {
        name: repoData.name,
        description: repoData.description || `${repoData.name} MCP server`,
        owner,
        repo,
        fullSlug,
        category,
        githubUrl: url,
        tags,
        stars: repoData.stars,
        forks: repoData.forks,
        isOfficial: false,
        isRemote: false,
        featured: false,
      },
    })

    if (existing) {
      counters.updated++
      process.stdout.write(`  ✓ Updated ${fullSlug} (${category}, ${repoData.stars}⭐)\n`)
    } else {
      counters.created++
      process.stdout.write(`  ✓ Created ${fullSlug} (${category}, ${repoData.stars}⭐)\n`)
    }
  } catch (err) {
    console.error(`  ✗ Failed ${fullSlug}:`, (err as Error).message)
    counters.failed++
  }
}

function printImportSummary(uniqueCount: number, counters: ImportCounters) {
  process.stdout.write('\n--- Bulk import complete ---\n')
  process.stdout.write(`Total unique:  ${uniqueCount}\n`)
  process.stdout.write(`Created:       ${counters.created}\n`)
  process.stdout.write(`Updated:       ${counters.updated}\n`)
  process.stdout.write(`Failed:        ${counters.failed}\n`)
  process.stdout.write(`Skipped:       ${counters.skipped}\n`)
  process.stdout.write(`README enriched: ${counters.enriched}\n`)
}

async function main() {
  const filePath = path.resolve(process.cwd(), 'scripts/mcp-servers-list.json')
  const urls: string[] = JSON.parse(readFileSync(filePath, 'utf-8'))

  const uniqueUrls = deduplicateUrls(urls)
  process.stdout.write(`Found ${urls.length} URLs, ${uniqueUrls.length} unique after dedup\n`)

  const counters: ImportCounters = { created: 0, updated: 0, skipped: 0, failed: 0, enriched: 0 }

  for (let i = 0; i < uniqueUrls.length; i++) {
    await processSingleServer(uniqueUrls[i], i, uniqueUrls.length, counters)

    // Rate limit sleep
    if (i < uniqueUrls.length - 1) {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  printImportSummary(uniqueUrls.length, counters)

  await prisma.$disconnect()
  await pglite.close()
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
