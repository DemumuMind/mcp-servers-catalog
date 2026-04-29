import { prisma } from '../lib/db-pglite'
import { hash } from 'bcryptjs'

async function main() {
  // Seed admin user
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD environment variable is required')
  }
  const password = await hash(adminPassword, 10)
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@example.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password,
      role: 'admin',
    },
  })

  // Seed sample MCP servers
  const servers = [
    {
      name: 'GitHub',
      description: "GitHub's official MCP Server",
      owner: 'github',
      repo: 'github-mcp-server',
      fullSlug: 'github/github-mcp-server',
      category: 'development',
      isOfficial: true,
      githubUrl: 'https://github.com/github/github-mcp-server',
      tags: ['official', 'git', 'api'],
      featured: true,
    },
    {
      name: 'Bright Data',
      description: 'Discover, extract, and interact with the web',
      owner: 'brightdata',
      repo: 'mcp-server',
      fullSlug: 'brightdata/mcp-server',
      category: 'web-scraping',
      isSponsored: true,
      githubUrl: 'https://github.com/brightdata/mcp-server',
      tags: ['sponsored', 'scraping'],
      featured: true,
    },
    {
      name: 'Cloudflare',
      description: 'Deploy, configure & interrogate your resources on the Cloudflare developer platform',
      owner: 'cloudflare',
      repo: 'mcp-server-cloudflare',
      fullSlug: 'cloudflare/mcp-server-cloudflare',
      category: 'cloud-service',
      isOfficial: true,
      githubUrl: 'https://github.com/cloudflare/mcp-server-cloudflare',
      tags: ['official', 'cloud', 'api'],
      featured: true,
    },
  ]

  for (const server of servers) {
    await prisma.server.upsert({
      where: { fullSlug: server.fullSlug },
      update: {},
      create: server,
    })
  }

  console.log(`Seeded ${servers.length} servers`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
