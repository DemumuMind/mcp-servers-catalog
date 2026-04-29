import { prisma } from '../lib/db-pglite'

interface McpServerSeed {
  name: string
  description: string
  owner: string
  repo: string
  category: string
  isOfficial?: boolean
  isSponsored?: boolean
  githubUrl: string
  tags: string[]
  isRemote?: boolean
  authType?: string
  endpoint?: string
  featured?: boolean
}

// Fallback hardcoded servers if scraping fails
const fallbackServers: McpServerSeed[] = [
  {
    name: 'GitHub',
    description: "GitHub's official MCP Server for repository management, issue tracking, and code search",
    owner: 'github',
    repo: 'github-mcp-server',
    category: 'development',
    isOfficial: true,
    githubUrl: 'https://github.com/github/github-mcp-server',
    tags: ['official', 'git', 'api', 'github'],
    featured: true,
  },
  {
    name: 'Cloudflare',
    description: 'Deploy, configure & interrogate your resources on the Cloudflare developer platform',
    owner: 'cloudflare',
    repo: 'mcp-server-cloudflare',
    category: 'cloud-service',
    isOfficial: true,
    githubUrl: 'https://github.com/cloudflare/mcp-server-cloudflare',
    tags: ['official', 'cloud', 'api', 'cdn'],
    featured: true,
  },
  {
    name: 'Bright Data',
    description: 'Discover, extract, and interact with the web at scale using Bright Data infrastructure',
    owner: 'brightdata',
    repo: 'mcp-server',
    category: 'web-scraping',
    isSponsored: true,
    githubUrl: 'https://github.com/brightdata/mcp-server',
    tags: ['sponsored', 'scraping', 'proxy', 'data'],
    featured: true,
  },
  {
    name: 'Playwright',
    description: 'Microsoft Playwright MCP server for browser automation and end-to-end testing',
    owner: 'microsoft',
    repo: 'playwright-mcp',
    category: 'browser-automation',
    isOfficial: true,
    githubUrl: 'https://github.com/microsoft/playwright-mcp',
    tags: ['official', 'browser', 'automation', 'testing'],
    featured: true,
  },
  {
    name: 'Stripe',
    description: 'Interact with Stripe APIs for payments, billing, and financial operations',
    owner: 'stripe',
    repo: 'stripe-mcp',
    category: 'payment',
    isOfficial: true,
    githubUrl: 'https://github.com/stripe/stripe-mcp',
    tags: ['official', 'payments', 'billing', 'fintech'],
    featured: true,
  },
  {
    name: 'Tavily',
    description: 'AI search engine MCP server for real-time web search and information retrieval',
    owner: 'tavily-ai',
    repo: 'tavily-mcp',
    category: 'search',
    isOfficial: true,
    githubUrl: 'https://github.com/tavily-ai/tavily-mcp',
    tags: ['official', 'search', 'ai', 'web'],
    featured: true,
  },
  {
    name: 'Exa',
    description: 'Neural search MCP server for finding relevant web content with embeddings',
    owner: 'exa-labs',
    repo: 'mcp-server',
    category: 'search',
    isOfficial: true,
    githubUrl: 'https://github.com/exa-labs/mcp-server',
    tags: ['official', 'search', 'neural', 'ai'],
    featured: true,
  },
  {
    name: 'Perplexity',
    description: 'AI-powered search and question answering via Perplexity API',
    owner: 'ppl-ai',
    repo: 'modelcontextprotocol',
    category: 'search',
    isOfficial: true,
    githubUrl: 'https://github.com/ppl-ai/modelcontextprotocol',
    tags: ['official', 'search', 'ai', 'qa'],
    featured: false,
  },
  {
    name: 'Stagehand',
    description: 'Browserbase Stagehand MCP server for AI-driven web browsing and extraction',
    owner: 'browserbase',
    repo: 'stagehand',
    category: 'browser-automation',
    isOfficial: true,
    githubUrl: 'https://github.com/browserbase/stagehand',
    tags: ['official', 'browser', 'ai', 'automation'],
    featured: true,
  },
  {
    name: 'E2B',
    description: 'Sandboxed code execution environment for running untrusted code safely',
    owner: 'e2b-dev',
    repo: 'mcp-server',
    category: 'cloud-service',
    isOfficial: true,
    githubUrl: 'https://github.com/e2b-dev/mcp-server',
    tags: ['official', 'sandbox', 'execution', 'security'],
    featured: false,
  },
  {
    name: 'Supabase',
    description: 'Official Supabase MCP server for database management and real-time subscriptions',
    owner: 'supabase',
    repo: 'supabase-mcp',
    category: 'databases',
    isOfficial: true,
    githubUrl: 'https://github.com/supabase/supabase-mcp',
    tags: ['official', 'database', 'postgres', 'realtime'],
    featured: true,
  },
  {
    name: 'Upstash',
    description: 'Serverless Redis and Kafka MCP server for caching and messaging',
    owner: 'upstash',
    repo: 'mcp-server',
    category: 'databases',
    isOfficial: true,
    githubUrl: 'https://github.com/upstash/mcp-server',
    tags: ['official', 'redis', 'cache', 'serverless'],
    featured: false,
  },
  {
    name: 'Figma',
    description: 'Access and manipulate Figma design files and components programmatically',
    owner: 'figma',
    repo: 'figma-mcp',
    category: 'design',
    isOfficial: true,
    githubUrl: 'https://github.com/figma/figma-mcp',
    tags: ['official', 'design', 'ui', 'components'],
    featured: true,
  },
  {
    name: 'Linear',
    description: 'Issue tracking and project management via Linear API',
    owner: 'linear',
    repo: 'linear-mcp',
    category: 'productivity',
    isOfficial: true,
    githubUrl: 'https://github.com/linear/linear-mcp',
    tags: ['official', 'project-management', 'issues', 'tracking'],
    featured: false,
  },
  {
    name: 'Firecrawl',
    description: 'Turn entire websites into LLM-ready markdown or structured data',
    owner: 'mendableai',
    repo: 'firecrawl-mcp',
    category: 'web-scraping',
    isOfficial: true,
    githubUrl: 'https://github.com/mendableai/firecrawl-mcp',
    tags: ['official', 'scraping', 'markdown', 'crawl'],
    featured: true,
  },
  {
    name: 'Apify',
    description: 'Web scraping and automation platform MCP server with thousands of actors',
    owner: 'apify',
    repo: 'actors-mcp-server',
    category: 'web-scraping',
    isOfficial: true,
    githubUrl: 'https://github.com/apify/actors-mcp-server',
    tags: ['official', 'scraping', 'automation', 'actors'],
    featured: false,
  },
  {
    name: 'Axiom',
    description: 'Log management and observability via Axiom serverless data platform',
    owner: 'axiomhq',
    repo: 'axiom-mcp',
    category: 'analytics',
    isOfficial: true,
    githubUrl: 'https://github.com/axiomhq/axiom-mcp',
    tags: ['official', 'logs', 'observability', 'monitoring'],
    featured: false,
  },
  {
    name: 'Vercel AI SDK',
    description: 'Build AI-powered streaming text and structured output applications',
    owner: 'vercel',
    repo: 'ai',
    category: 'ai-ml',
    isOfficial: true,
    githubUrl: 'https://github.com/vercel/ai',
    tags: ['official', 'ai', 'streaming', 'llm'],
    featured: true,
  },
  {
    name: 'Toolhouse',
    description: 'Universal AI function calling and tool management platform',
    owner: 'toolhouse',
    repo: 'toolhouse-mcp',
    category: 'ai-ml',
    isOfficial: true,
    githubUrl: 'https://github.com/toolhouse/toolhouse-mcp',
    tags: ['official', 'tools', 'functions', 'ai'],
    featured: false,
  },
  {
    name: 'Jina AI',
    description: 'Neural search and embeddings for multimodal AI applications',
    owner: 'jina-ai',
    repo: 'mcp-server-jina',
    category: 'ai-ml',
    isOfficial: true,
    githubUrl: 'https://github.com/jina-ai/mcp-server-jina',
    tags: ['official', 'embeddings', 'search', 'multimodal'],
    featured: false,
  },
  {
    name: 'Google GenAI',
    description: 'Google Generative AI MCP server for Gemini models and Google AI services',
    owner: 'googlegenai',
    repo: 'genai-mcp-server',
    category: 'ai-ml',
    isOfficial: true,
    githubUrl: 'https://github.com/googlegenai/genai-mcp-server',
    tags: ['official', 'google', 'gemini', 'llm'],
    featured: true,
  },
  {
    name: 'Kubernetes',
    description: 'Manage Kubernetes clusters, pods, deployments, and services',
    owner: 'kubernetes',
    repo: 'kubernetes-mcp-server',
    category: 'cloud-service',
    isOfficial: true,
    githubUrl: 'https://github.com/kubernetes/kubernetes-mcp-server',
    tags: ['official', 'k8s', 'containers', 'orchestration'],
    featured: false,
  },
  {
    name: 'Repomix',
    description: 'Analyze and pack entire code repositories for AI context windows',
    owner: 'repomix',
    repo: 'repomix',
    category: 'development',
    isOfficial: true,
    githubUrl: 'https://github.com/repomix/repomix',
    tags: ['official', 'analysis', 'packing', 'code'],
    featured: false,
  },
  {
    name: 'Filesystem',
    description: 'Model Context Protocol reference server for secure local file system access',
    owner: 'modelcontextprotocol',
    repo: 'servers',
    category: 'productivity',
    isOfficial: true,
    githubUrl: 'https://github.com/modelcontextprotocol/servers',
    tags: ['official', 'reference', 'filesystem', 'local'],
    featured: false,
  },
  {
    name: 'AWS MCP',
    description: 'Interact with Amazon Web Services APIs for cloud resource management',
    owner: 'aws',
    repo: 'aws-mcp-server',
    category: 'cloud-service',
    isOfficial: true,
    githubUrl: 'https://github.com/aws/aws-mcp-server',
    tags: ['official', 'aws', 'cloud', 'infrastructure'],
    featured: true,
  },
]

/**
 * Decode basic HTML entities
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

/**
 * Extract owner and repo from a URL or slug
 */
function extractOwnerRepo(url: string, slug: string): { owner: string; repo: string } {
  // Try GitHub URL first
  const githubMatch = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)/)
  if (githubMatch) {
    return {
      owner: decodeURIComponent(githubMatch[1]),
      repo: decodeURIComponent(githubMatch[2]),
    }
  }

  // Try npmjs URL
  const npmMatch = url.match(/^https:\/\/www\.npmjs\.com\/package\/([^\/]+)\/([^\/]+)/)
  if (npmMatch) {
    return {
      owner: npmMatch[1].replace(/^@/, ''),
      repo: npmMatch[2],
    }
  }

  // Fallback to slug
  const slugParts = slug.split('/')
  if (slugParts.length >= 2) {
    return {
      owner: decodeURIComponent(slugParts[0]),
      repo: decodeURIComponent(slugParts[1]),
    }
  }

  // Last resort: use slug as owner, last path segment as repo
  const urlParts = new URL(url).pathname.split('/').filter(Boolean)
  return {
    owner: slug.replace(/^@/, '') || 'unknown',
    repo: urlParts[urlParts.length - 1] || 'unknown',
  }
}

/**
 * Scrape MCP servers from mcpservers.org/ru/
 */
async function scrapeServersFromWebsite(): Promise<McpServerSeed[]> {
  const url = 'https://mcpservers.org/ru/'
  console.log(`Fetching ${url}...`)

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const html = await response.text()
  console.log(`Received ${html.length} bytes of HTML`)

  // Extract server objects from TanStack Router SSR data
  // The page embeds TSR dehydrated state in script tags with $R variable
  const regex =
    /\$R\[\d+\]=\{id:\d+,slug:"([^"]+)",name:"([^"]*)",description:"([^"]*)",content:[^,]*,url:"([^"]+)",category:"([^"]+)",tags:\$R\[\d+\]=\[([^\]]*)\],featured:(!0|!1)\}/g

  const servers: McpServerSeed[] = []
  let match: RegExpExecArray | null
  const seenSlugs = new Set<string>()

  while ((match = regex.exec(html)) !== null) {
    const slug = match[1]
    const name = decodeHtmlEntities(match[2])
    const description = decodeHtmlEntities(match[3])
    const serverUrl = match[4]
    const category = match[5]
    const tagsStr = match[6]
    const featured = match[7] === '!0'

    // Skip duplicates (featured and latest arrays may overlap)
    if (seenSlugs.has(slug)) continue
    seenSlugs.add(slug)

    // Parse tags
    const tags = tagsStr
      .split(',')
      .map((t) => t.replace(/"/g, '').trim())
      .filter(Boolean)

    // Determine official status from tags
    const isOfficial = tags.includes('official')

    // Extract owner/repo
    const { owner, repo } = extractOwnerRepo(serverUrl, slug)

    servers.push({
      name: name || slug,
      description: description || 'No description available',
      owner,
      repo,
      category: category || 'other',
      isOfficial,
      isSponsored: false,
      githubUrl: serverUrl,
      tags: tags.length > 0 ? tags : ['mcp'],
      featured,
    })
  }

  console.log(`Parsed ${servers.length} unique servers from HTML`)
  return servers
}

async function scrapeMcpServers() {
  let servers: McpServerSeed[]

  // Attempt scraping first
  try {
    servers = await scrapeServersFromWebsite()
    if (servers.length === 0) {
      console.warn('No servers scraped from website. Using fallback data...')
      servers = fallbackServers
    } else {
      console.log(`Successfully scraped ${servers.length} servers from mcpservers.org`)
    }
  } catch (err) {
    console.error('Failed to scrape mcpservers.org:', err)
    console.warn('Using fallback hardcoded servers...')
    servers = fallbackServers
  }

  console.log(`Starting to seed ${servers.length} MCP servers...`)

  let created = 0
  let updated = 0

  for (const server of servers) {
    const fullSlug = `${server.owner}/${server.repo}`
    const existing = await prisma.server.findUnique({
      where: { fullSlug },
    })

    if (existing) {
      await prisma.server.update({
        where: { fullSlug },
        data: {
          name: server.name,
          description: server.description,
          category: server.category,
          isOfficial: server.isOfficial ?? false,
          isSponsored: server.isSponsored ?? false,
          githubUrl: server.githubUrl,
          tags: server.tags,
          isRemote: server.isRemote ?? false,
          authType: server.authType ?? null,
          endpoint: server.endpoint ?? null,
          featured: server.featured ?? false,
        },
      })
      updated++
      console.log(`  Updated: ${fullSlug}`)
    } else {
      await prisma.server.create({
        data: {
          name: server.name,
          description: server.description,
          owner: server.owner,
          repo: server.repo,
          fullSlug,
          category: server.category,
          isOfficial: server.isOfficial ?? false,
          isSponsored: server.isSponsored ?? false,
          githubUrl: server.githubUrl,
          tags: server.tags,
          isRemote: server.isRemote ?? false,
          authType: server.authType ?? null,
          endpoint: server.endpoint ?? null,
          featured: server.featured ?? false,
        },
      })
      created++
      console.log(`  Created: ${fullSlug}`)
    }
  }

  console.log(`\nDone! Created ${created}, Updated ${updated}. Total: ${servers.length} servers.`)
}

scrapeMcpServers()
  .catch((err) => {
    console.error('Failed to seed MCP servers:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('Database connection closed.')
  })
