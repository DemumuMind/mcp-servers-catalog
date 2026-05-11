'use server'

import { prisma } from '@/lib/db'

export async function recordHealthCheck(
  serverId: string,
  status: string,
  latency?: number,
  error?: string
) {
  return prisma.healthCheck.create({
    data: {
      serverId,
      status,
      latency,
      error,
    },
  })
}

export async function getServerHealthHistory(
  serverId: string,
  days: number = 7
) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const checks = await prisma.healthCheck.findMany({
    where: {
      serverId,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Group by day and calculate stats
  const grouped = checks.reduce((acc, check) => {
    const day = check.createdAt.toISOString().split('T')[0]
    if (!acc[day]) {
      acc[day] = { online: 0, degraded: 0, offline: 0, total: 0, latencies: [] as number[] }
    }
    acc[day][check.status as 'online' | 'degraded' | 'offline']++
    acc[day].total++
    if (check.latency) acc[day].latencies.push(check.latency)
    return acc
  }, {} as Record<string, any>)

  const history = Object.entries(grouped).map(([date, stats]) => ({
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
  return prisma.healthCheck.findFirst({
    where: { serverId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function cleanupOldHealthChecks(days: number = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return prisma.healthCheck.deleteMany({
    where: { createdAt: { lt: since } },
  })
}
