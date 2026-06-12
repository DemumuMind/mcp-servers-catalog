'use server'

import { db, servers, healthChecks } from '@/lib/db'
import { eq, desc, and, gte, sql } from 'drizzle-orm'

export async function checkServerHealth(
  serverId: string
): Promise<{ status: string; latency?: number; error?: string }> {
  const server = await db
    .select({
      endpoint: servers.endpoint,
      isRemote: servers.isRemote,
      githubUrl: servers.githubUrl,
    })
    .from(servers)
    .where(eq(servers.id, serverId))
    .limit(1)
    .then((r: any) => r[0])

  if (!server) {
    return { status: 'unknown', error: 'Server not found' }
  }

  const url = server.isRemote ? server.endpoint : server.githubUrl

  if (!url) {
    return { status: 'unknown', error: 'No URL available' }
  }

  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    })

    clearTimeout(timeout)
    const latency = Date.now() - startTime

    const status = response.ok ? 'online' : 'degraded'
    await db.insert(healthChecks).values({ serverId, status, latency })

    return { status, latency }
  } catch (error: any) {
    const latency = Date.now() - startTime
    const status = error.name === 'AbortError' ? 'timeout' : 'offline'
    const errorMsg = error.name === 'AbortError' ? 'Request timed out' : error.message
    await db.insert(healthChecks).values({ serverId, status, latency, error: errorMsg })

    return { status, latency, error: errorMsg }
  }
}

export interface HealthCheckRow {
  id: string
  serverId: string
  status: string
  latency: number | null
  error: string | null
  createdAt: Date
}

export async function getServerHealthHistory(
  serverId: string,
  limit: number = 30
): Promise<HealthCheckRow[]> {
  return db
    .select()
    .from(healthChecks)
    .where(eq(healthChecks.serverId, serverId))
    .orderBy(desc(healthChecks.createdAt))
    .limit(limit)
}

export async function getServerHealthStatus(
  serverId: string
): Promise<{
  latest: { status: string; latency?: number; error?: string; createdAt: Date } | null
  uptimePercent: number
}> {
  const latestCheck = await db
    .select()
    .from(healthChecks)
    .where(eq(healthChecks.serverId, serverId))
    .orderBy(desc(healthChecks.createdAt))
    .limit(1)
    .then((r: any) => r[0] ?? null)

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const stats = await db
    .select({
      total: sql<number>`count(*)`,
      online: sql<number>`sum(case when ${healthChecks.status} = 'online' then 1 else 0 end)`,
    })
    .from(healthChecks)
    .where(
      and(
        eq(healthChecks.serverId, serverId),
        gte(healthChecks.createdAt, twentyFourHoursAgo)
      )
    )
    .then((r: any) => r[0] ?? { total: 0, online: 0 })

  const uptimePercent =
    Number(stats.total) > 0
      ? Math.round((Number(stats.online) / Number(stats.total)) * 100)
      : -1 // -1 means no data

  return {
    latest: latestCheck
      ? {
          status: latestCheck.status,
          latency: latestCheck.latency ?? undefined,
          error: latestCheck.error ?? undefined,
          createdAt: latestCheck.createdAt,
        }
      : null,
    uptimePercent,
  }
}
