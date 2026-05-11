'use server'

import { prisma } from '@/lib/db'

export async function getHealthMonitoringData() {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Get all servers with their latest health check
  const servers = await prisma.server.findMany({
    select: {
      id: true,
      name: true,
      owner: true,
      repo: true,
      isRemote: true,
      endpoint: true,
    },
    orderBy: { name: 'asc' },
  })

  const serverIds = servers.map((s) => s.id)

  // Get health checks for last 24 hours
  const recentChecks = await prisma.healthCheck.findMany({
    where: {
      serverId: { in: serverIds },
      createdAt: { gte: oneDayAgo },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get health checks for last 7 days for history
  const weeklyChecks = await prisma.healthCheck.findMany({
    where: {
      serverId: { in: serverIds },
      createdAt: { gte: sevenDaysAgo },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Calculate uptime % per server (last 24h)
  const serverStats = servers.map((server) => {
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
  })

  // Overall stats
  const totalServers = servers.length
  const serversWithHealth = serverStats.filter((s) => s.totalChecks > 0).length
  const onlineServers = serverStats.filter((s) => s.latestStatus === 'online').length
  const avgUptime =
    serverStats.filter((s) => s.uptimePercent !== null).length > 0
      ? Math.round(
          serverStats
            .filter((s) => s.uptimePercent !== null)
            .reduce((sum, s) => sum + (s.uptimePercent || 0), 0) /
            serverStats.filter((s) => s.uptimePercent !== null).length
        )
      : null

  return {
    servers: serverStats,
    overall: {
      totalServers,
      serversWithHealth,
      onlineServers,
      offlineServers: totalServers - onlineServers,
      avgUptime,
    },
  }
}
