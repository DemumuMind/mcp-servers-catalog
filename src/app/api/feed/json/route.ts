import { NextResponse } from 'next/server'
import { db, servers } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
import { getSiteUrl } from '@/lib/site-url'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  const serverList = category
    ? await db.select().from(servers).where(eq(servers.category, category)).orderBy(desc(servers.createdAt)).limit(50)
    : await db.select().from(servers).orderBy(desc(servers.createdAt)).limit(50)

  const baseUrl = getSiteUrl()

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Awesome MCP Servers',
    home_page_url: baseUrl,
    feed_url: `${baseUrl}/api/feed/json`,
    description: 'Коллекция серверов для Model Context Protocol',
    language: 'ru',
    items: serverList.map((server: any) => ({
      id: server.id,
      title: server.name,
      content_text: server.description,
      url: `${baseUrl}/ru/servers/${server.owner}/${server.repo}`,
      date_published: server.createdAt,
      tags: [server.category, ...server.tags],
    })),
  }

  return NextResponse.json(feed, {
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
    },
  })
}
