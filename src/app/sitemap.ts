import { getServersPublic, getClientsPublic } from '@/app/actions/public'

export const dynamic = 'force-dynamic'

export default async function sitemap() {
  const baseUrl = 'https://mcpservers.org'

  // Static pages
  const staticPages = [
    '',
    '/all',
    '/official',
    '/clients',
    '/submit',
    '/login',
    '/register',
  ].map((path) => ({
    url: `${baseUrl}/ru${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.8,
  }))

  // Server pages
  const { servers } = await getServersPublic(1)
  const serverPages = servers.map((server) => ({
    url: `${baseUrl}/ru/servers/${server.owner}/${server.repo}`,
    lastModified: server.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Client pages
  const { clients } = await getClientsPublic(1)
  const clientPages = clients.map((client) => ({
    url: `${baseUrl}/ru/clients`,
    lastModified: client.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...serverPages, ...clientPages]
}
