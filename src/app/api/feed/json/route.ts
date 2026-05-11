import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  const where: any = {}
  if (category) where.category = category

  const servers = await prisma.server.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const baseUrl = process.env.SITE_URL || 'https://mcpservers.org'

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Awesome MCP Servers',
    home_page_url: baseUrl,
    feed_url: `${baseUrl}/api/feed/json`,
    description: 'Коллекция серверов для Model Context Protocol',
    language: 'ru',
    items: servers.map((server) => ({
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
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
