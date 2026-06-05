'use server'

import { prisma } from '@/lib/db'

export async function getTimeSeriesMetrics(days: number = 30) {
  const now = new Date()
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  const [dailyActiveUsers, dailyServers, dailyViews, dailyBookmarks] = await Promise.all([
    // Daily active users (unique users with view history per day)
    prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(DISTINCT "userId") as count
      FROM "ViewHistory"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
    // New servers per day
    prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "Server"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
    // Views per day
    prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "ViewHistory"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
    // Bookmarks per day
    prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "Bookmark"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
  ])

  return {
    dailyActiveUsers: dailyActiveUsers.map((r) => ({ date: r.date.toISOString().split('T')[0], count: Number(r.count) })),
    dailyServers: dailyServers.map((r) => ({ date: r.date.toISOString().split('T')[0], count: Number(r.count) })),
    dailyViews: dailyViews.map((r) => ({ date: r.date.toISOString().split('T')[0], count: Number(r.count) })),
    dailyBookmarks: dailyBookmarks.map((r) => ({ date: r.date.toISOString().split('T')[0], count: Number(r.count) })),
  }
}

export async function getCohortAnalysis(weeks: number = 8) {
  const cohorts: Array<{
    cohort: string
    size: number
    retention: number[]
  }> = []

  const now = new Date()

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
    const cohortLabel = weekStart.toISOString().split('T')[0]

    // Users who registered in this week
    const newUsers = await prisma.user.findMany({
      where: { createdAt: { gte: weekStart, lt: weekEnd } },
      select: { id: true },
    })

    if (newUsers.length === 0) continue

    const userIds = newUsers.map((u) => u.id)
    const size = userIds.length

    // Retention for each subsequent week (up to current)
    const retention: number[] = []
    const maxWeeks = Math.min(weeks - i, weeks)

    for (let w = 0; w < maxWeeks; w++) {
      const checkStart = new Date(weekStart.getTime() + w * 7 * 24 * 60 * 60 * 1000)
      const checkEnd = new Date(checkStart.getTime() + 7 * 24 * 60 * 60 * 1000)

      const activeCount = await prisma.viewHistory.count({
        where: {
          userId: { in: userIds },
          createdAt: { gte: checkStart, lt: checkEnd },
        },
      })

      retention.push(Math.round((activeCount / size) * 100))
    }

    cohorts.push({ cohort: cohortLabel, size, retention })
  }

  return cohorts
}
