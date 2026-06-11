import { NextResponse } from 'next/server'
import { db, servers, clients, users } from '@/lib/db'
import { count, desc } from 'drizzle-orm'

export async function GET() {
  try {
    // Sequential queries to avoid libsql lockfile contention
    const totalServers = (await db.select({ total: count() }).from(servers))[0]?.total ?? 0
    const totalClients = (await db.select({ total: count() }).from(clients))[0]?.total ?? 0
    const totalUsers = (await db.select({ total: count() }).from(users))[0]?.total ?? 0

    const recentlyAdded = await db.select({
      id: servers.id,
      name: servers.name,
      owner: servers.owner,
      repo: servers.repo,
      stars: servers.stars,
    })
    .from(servers)
    .orderBy(desc(servers.createdAt))
    .limit(5)

    const stats = {
      totalServers,
      totalClients,
      totalUsers,
      officialCount: 0,
      remoteCount: 0,
      featuredCount: 0,
      totalStars: 0,
      categoryCounts: [],
      recentlyAdded,
    }

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Stats endpoint error:', error)
    return NextResponse.json({ error: 'Failed to compute stats' }, { status: 500 })
  }
}
