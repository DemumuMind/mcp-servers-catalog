import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { servers } from '@/lib/db/schema'
import { eq, and, isNotNull } from 'drizzle-orm'
import { checkServerHealth } from '@/app/actions/health'
import { verifyCronAuth } from '@/lib/cron-auth'

export async function GET(req: NextRequest) {
  const unauthorized = verifyCronAuth(req)
  if (unauthorized) return unauthorized

  try {
    const remoteServers = await db.select({
      id: servers.id,
      name: servers.name,
    }).from(servers).where(
      and(eq(servers.isRemote, true), isNotNull(servers.endpoint))
    )

    if (remoteServers.length === 0) {
      return NextResponse.json({ success: true, checked: 0, results: [] })
    }

    const results: Array<{ id: string; name: string; status: string; latency: number | null }> = []

    for (const server of remoteServers) {
      try {
        const result = await checkServerHealth(server.id)
        results.push({
          id: server.id,
          name: server.name,
          status: result.status,
          latency: result.latency ?? null,
        })
      } catch {
        results.push({
          id: server.id,
          name: server.name,
          status: 'error',
          latency: null,
        })
      }
    }

    const online = results.filter((r) => r.status === 'online').length
    const offline = results.filter((r) => r.status === 'offline' || r.status === 'error').length
    const degraded = results.filter((r) => r.status === 'degraded').length

    return NextResponse.json({
      success: true,
      checked: results.length,
      online,
      offline,
      degraded,
      results,
    })
  } catch {
    return NextResponse.json({ error: 'Health check cron failed' }, { status: 500 })
  }
}
