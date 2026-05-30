import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
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
        data = await prisma.server.findMany({
          select: {
            id: true,
            name: true,
            description: true,
            owner: true,
            repo: true,
            category: true,
            tags: true,
            stars: true,
            forks: true,
            isOfficial: true,
            isRemote: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        })
        break
      case 'clients':
        data = await prisma.client.findMany({
          select: { id: true, name: true, description: true, url: true, featured: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        })
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
        },
      })
    }

    // JSON
    return NextResponse.json({ data, meta: { count: data.length, table } })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
