import { NextResponse } from 'next/server'
import { db, servers, clients } from '@/lib/db'
import { desc } from 'drizzle-orm'
import { apiRateLimit, rateLimits } from '@/lib/api-rate-limit'

export async function GET(request: Request) {
  const limited = await apiRateLimit(rateLimits.api)(request)
  if (limited) return limited

  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json' // json or csv
  const table = searchParams.get('table') || 'servers' // servers, clients

  try {
    let data: any[] = []

    switch (table) {
      case 'servers':
        data = await db.select({
          id: servers.id,
          name: servers.name,
          description: servers.description,
          owner: servers.owner,
          repo: servers.repo,
          category: servers.category,
          tags: servers.tags,
          stars: servers.stars,
          forks: servers.forks,
          isOfficial: servers.isOfficial,
          isRemote: servers.isRemote,
          createdAt: servers.createdAt,
        }).from(servers).orderBy(desc(servers.createdAt))
        break
      case 'clients':
        data = await db.select({
          id: clients.id,
          name: clients.name,
          description: clients.description,
          url: clients.url,
          featured: clients.featured,
          createdAt: clients.createdAt,
        }).from(clients).orderBy(desc(clients.createdAt))
        break
      default:
        return NextResponse.json({ error: 'Invalid table. Allowed: servers, clients' }, { status: 400 })
    }

    if (format === 'csv') {
      if (data.length === 0) {
        return new NextResponse('', { headers: { 'Content-Type': 'text/csv' } })
      }
      const headers = Object.keys(data[0]).join(',')
      const rows = data.map((row) =>
        Object.values(row)
          .map((v) => {
            const str = String(v ?? '')
            if (str.includes(',') || str.includes('"')) return `"${str.replace(/"/g, '""')}"`
            return str
          })
          .join(',')
      )
      const csv = [headers, ...rows].join('\n')
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${table}.csv"`,
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      })
    }

    // JSON
    return NextResponse.json({ data, meta: { count: data.length, table } }, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
