import { MetadataRoute } from 'next'
import { db, servers, clients } from '@/lib/db'
import { desc } from 'drizzle-orm'

const BASE_URL = process.env.SITE_URL || 'https://mcpservers.org'
const LOCALES = ['en', 'ru']

const STATIC_PAGES = [
  '', '/servers', '/clients', '/rankings', '/about-mcp', '/guide',
  '/submit', '/compare', '/ecosystem', '/badges', '/whats-new',
  '/advanced-search', '/authors', '/api-status', '/official',
  '/remote-mcp-servers', '/collections', '/bookmarks',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    for (const page of STATIC_PAGES) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : page === '/servers' ? 0.9 : 0.7,
      })
    }
  }

  const serverRows = await db.select({
    owner: servers.owner,
    repo: servers.repo,
    updatedAt: servers.updatedAt,
  }).from(servers).orderBy(desc(servers.stars)).limit(5000)

  for (const s of serverRows) {
    const lastMod = s.updatedAt instanceof Date ? s.updatedAt : new Date()
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/servers/${s.owner}/${s.repo}`,
        lastModified: lastMod,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  const clientRows = await db.select({
    id: clients.id,
    name: clients.name,
    updatedAt: clients.updatedAt,
  }).from(clients)

  for (const c of clientRows) {
    const lastMod = c.updatedAt instanceof Date ? c.updatedAt : new Date()
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/clients/${c.id}`,
        lastModified: lastMod,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  return entries
}
