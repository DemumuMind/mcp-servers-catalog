import { NextResponse } from 'next/server'
import { db, servers } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
import { fetchServerReleases } from '@/app/actions/releases'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const serverSlug = searchParams.get('server') // owner/repo

  const baseUrl = process.env.SITE_URL || 'https://mcpservers.org'

  // If server slug provided, return releases for that server
  if (serverSlug) {
    const [owner, repo] = serverSlug.split('/')
    if (!owner || !repo) {
      return NextResponse.json({ error: 'Invalid server slug' }, { status: 400 })
    }

    const server = await db.select().from(servers).where(eq(servers.fullSlug, serverSlug)).limit(1).then(r => r[0] ?? null)

    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    }

    const releases = await fetchServerReleases(owner, repo)

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(server.name)} — Releases</title>
    <link>${baseUrl}/ru/servers/${owner}/${repo}</link>
    <description>${escapeXml(server.description)}</description>
    <language>ru</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${releases
      .map(
        (release: any) => `
    <item>
      <title>${escapeXml(release.name || release.tag)}</title>
      <link>${release.url}</link>
      <description>${escapeXml(release.body?.slice(0, 500) || '')}</description>
      <pubDate>${new Date(release.publishedAt).toUTCString()}</pubDate>
      <guid>${release.url}</guid>
    </item>`
      )
      .join('')}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }

  // Default: all servers feed
  const serverList = category
    ? await db.select().from(servers).where(eq(servers.category, category)).orderBy(desc(servers.createdAt)).limit(50)
    : await db.select().from(servers).orderBy(desc(servers.createdAt)).limit(50)

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Awesome MCP Servers</title>
    <link>${baseUrl}</link>
    <description>Коллекция серверов для Model Context Protocol</description>
    <language>ru</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${serverList
      .map(
        (server: any) => `
    <item>
      <title>${escapeXml(server.name)}</title>
      <link>${baseUrl}/ru/servers/${server.owner}/${server.repo}</link>
      <description>${escapeXml(server.description)}</description>
      <category>${escapeXml(server.category)}</category>
      <pubDate>${new Date(server.createdAt).toUTCString()}</pubDate>
      <guid>${baseUrl}/ru/servers/${server.owner}/${server.repo}</guid>
    </item>`
      )
      .join('')}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
