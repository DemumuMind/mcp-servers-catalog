import 'dotenv/config'
import { db } from '../src/lib/db'
import { users, servers } from '../src/lib/db/schema'
import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) throw new Error('ADMIN_PASSWORD required')
  const password = await hash(adminPassword, 10)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'

  // Upsert admin user
  const existing = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1)
  if (existing.length === 0) {
    await db.insert(users).values({ email: adminEmail, password, role: 'admin', isVerifiedAuthor: true })
    process.stdout.write(`Admin user created: ${adminEmail}\n`)
  } else {
    await db.update(users).set({ password, role: 'admin' }).where(eq(users.email, adminEmail))
    process.stdout.write(`Admin user updated: ${adminEmail}\n`)
  }

  // Seed sample servers
  const serverData = [
    { name: 'GitHub', description: "GitHub's official MCP Server", owner: 'github', repo: 'github-mcp-server', fullSlug: 'github/github-mcp-server', category: 'development', isOfficial: true, githubUrl: 'https://github.com/github/github-mcp-server', tags: ['official', 'git', 'api'], featured: true },
    { name: 'Bright Data', description: 'Discover, extract, and interact with the web', owner: 'brightdata', repo: 'mcp-server', fullSlug: 'brightdata/mcp-server', category: 'web-scraping', isSponsored: true, githubUrl: 'https://github.com/brightdata/mcp-server', tags: ['sponsored', 'scraping'], featured: true },
    { name: 'Cloudflare', description: 'Deploy, configure & interrogate your resources on the Cloudflare developer platform', owner: 'cloudflare', repo: 'mcp-server-cloudflare', fullSlug: 'cloudflare/mcp-server-cloudflare', category: 'cloud-service', isOfficial: true, githubUrl: 'https://github.com/cloudflare/mcp-server-cloudflare', tags: ['official', 'cloud', 'api'], featured: true },
  ]

  let created = 0
  for (const s of serverData) {
    const exists = await db.select().from(servers).where(eq(servers.fullSlug, s.fullSlug)).limit(1)
    if (exists.length === 0) {
      await db.insert(servers).values(s)
      created++
    }
  }
  process.stdout.write(`Seed servers: ${created} created, ${serverData.length - created} skipped\n`)
  process.stdout.write('Seed complete\n')
}

main().catch(e => { console.error(e); process.exit(1) })
