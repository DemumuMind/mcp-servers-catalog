'use server'

import { db, servers, healthChecks } from '@/lib/db'
import { inArray, gte, asc, desc, and } from 'drizzle-orm'

interface ServerInfo {
  id: string
  name: string
  owner: string
  repo: string
  isRemote: boolean
  endpoint: string | null
}

interface HealthCheckRow {
  serverId: string
  status: string
  latency: number | null
  createdAt: Date
}

const healthCheckSelectFields = {
  serverId: healthChecks.serverId,
  status: healthChecks.status,
  latency: healthChecks.latency,
  createdAt: healthChecks.createdAt,
}

/** Fetch health checks for a set of servers since a given date. */
async function fetchHealthChecks(serverIds: string[], sinceDate: Date, orderDir: 'asc' | 'desc' = 'desc'): Promise<HealthCheckRow[]> {
  if (serverIds.length === 0) return []
  const orderFn = orderDir === 'asc' ? asc : desc
  return db.select(healthCheckSelectFields).from(healthChecks).where(
    and(
      inArray(healthChecks.serverId, serverIds),
      gte(healthChecks.createdAt, sinceDate)
    )
  ).orderBy(orderFn(healthChecks.createdAt)) as Promise<HealthCheckRow[]>
}

function computeServerStats(
  server: ServerInfo,
  recentChecks: HealthCheckRow[],
  weeklyChecks: HealthCheckRow[]
) {
  const checks = recentChecks.filter((c) => c.serverId === server.id)
  const total = checks.length
  const online = checks.filter((c) => c.status === 'online').length
  const uptimePercent = total > 0 ? Math.round((online / total) * 100) : null
  const avgLatency =
    total > 0
      ? Math.round(checks.reduce((sum, c) => sum + (c.latency || 0), 0) / total)
      : null
  const latestCheck = checks[0] || null

  // Daily history (group by hour)
  const serverWeekly = weeklyChecks.filter((c) => c.serverId === server.id)
  const hourlyHistory: Record<string, { online: number; total: number; avgLatency: number }> = {}

  serverWeekly.forEach((check) => {
    const hour = check.createdAt.toISOString().slice(0, 13) // YYYY-MM-DDTHH
    if (!hourlyHistory[hour]) {
      hourlyHistory[hour] = { online: 0, total: 0, avgLatency: 0 }
    }
    hourlyHistory[hour].total++
    if (check.status === 'online') hourlyHistory[hour].online++
    hourlyHistory[hour].avgLatency += check.latency || 0
  })

  const history = Object.entries(hourlyHistory)
    .map(([hour, stats]) => ({
      hour,
      uptimePercent: Math.round((stats.online / stats.total) * 100),
      avgLatency: Math.round(stats.avgLatency / stats.total),
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour))

  return {
    ...server,
    totalChecks: total,
    uptimePercent,
    avgLatency,
    latestStatus: latestCheck?.status || 'unknown',
    latestLatency: latestCheck?.latency || null,
    latestCheckedAt: latestCheck?.createdAt || null,
    history,
  }
}

function computeOverallStats(
  serverStats: ReturnType<typeof computeServerStats>[]
) {
  const totalServers = serverStats.length
  const serversWithHealth = serverStats.filter((s) => s.totalChecks > 0).length
  const onlineServers = serverStats.filter((s) => s.latestStatus === 'online').length
  const withUptime = serverStats.filter((s) => s.uptimePercent !== null)
  const avgUptime =
    withUptime.length > 0
      ? Math.round(
          withUptime.reduce((sum, s) => sum + (s.uptimePercent || 0), 0) /
            withUptime.length
        )
      : null

  return {
    totalServers,
    serversWithHealth,
    onlineServers,
    offlineServers: totalServers - onlineServers,
    avgUptime,
  }
}

export async function getHealthMonitoringData() {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const serverList = await db.select({
    id: servers.id,
    name: servers.name,
    owner: servers.owner,
    repo: servers.repo,
    isRemote: servers.isRemote,
    endpoint: servers.endpoint,
  }).from(servers).orderBy(asc(servers.name))

  const serverIds = serverList.map((s: any) => s.id)

  const [recentChecks, weeklyChecks] = await Promise.all([
    fetchHealthChecks(serverIds, oneDayAgo, 'desc'),
    fetchHealthChecks(serverIds, sevenDaysAgo, 'asc'),
  ])

  const serverStats = serverList.map((server: any) =>
    computeServerStats(server, recentChecks, weeklyChecks)
  )

  const overall = computeOverallStats(serverStats)

  return {
    servers: serverStats,
    overall,
  }
}
