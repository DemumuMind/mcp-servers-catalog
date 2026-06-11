'use server'

import { db, healthChecks } from '@/lib/db'
import { eq, gte, lt, asc, desc, and } from 'drizzle-orm'

interface DayStats {
  online: number
  degraded: number
  offline: number
  total: number
  latencies: number[]
}

export async function recordHealthCheck(
  serverId: string,
  status: string,
  latency?: number,
  error?: string
) {
  return db.insert(healthChecks).values({
    serverId,
    status,
    latency,
    error,
  }).returning().then((r: any) => r[0])
}

export async function getServerHealthHistory(
  serverId: string,
  days: number = 7
) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const checks = await db.select().from(healthChecks).where(
    and(eq(healthChecks.serverId, serverId), gte(healthChecks.createdAt, since))
  ).orderBy(asc(healthChecks.createdAt))

  // Group by day and calculate stats
  const grouped = checks.reduce((acc: any, check: any) => {
    const day = check.createdAt.toISOString().split('T')[0]
    if (!acc[day]) {
      acc[day] = { online: 0, degraded: 0, offline: 0, total: 0, latencies: [] as number[] }
    }
    acc[day][check.status as 'online' | 'degraded' | 'offline']++
    acc[day].total++
    if (check.latency) acc[day].latencies.push(check.latency)
    return acc
  }, {} as Record<string, DayStats>)

  const history = Object.entries(grouped as Record<string, DayStats>).map(([date, stats]: [string, DayStats]) => ({
    date,
    online: stats.online,
    degraded: stats.degraded,
    offline: stats.offline,
    total: stats.total,
    avgLatency: stats.latencies.length > 0
      ? Math.round(stats.latencies.reduce((a: number, b: number) => a + b, 0) / stats.latencies.length)
      : null,
    uptime: stats.total > 0 ? Math.round((stats.online / stats.total) * 100) : 0,
  }))

  return history
}

export async function getLatestHealthCheck(serverId: string) {
  return db.select().from(healthChecks).where(eq(healthChecks.serverId, serverId)).orderBy(desc(healthChecks.createdAt)).limit(1).then((r: any) => r[0] || null)
}

export async function cleanupOldHealthChecks(days: number = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return db.delete(healthChecks).where(lt(healthChecks.createdAt, since)).returning()
}
