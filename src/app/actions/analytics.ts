'use server'

import { db, viewHistories, servers, bookmarks, users } from '@/lib/db'
import { gte, lt, and, inArray, sql } from 'drizzle-orm'

export async function getTimeSeriesMetrics(days: number = 30) {
  const now = new Date()
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  const [dailyActiveUsers, dailyServers, dailyViews, dailyBookmarks] = await Promise.all([
    // Daily active users (unique users with view history per day)
    // SQLite: createdAt stored as Unix timestamp, needs 'unixepoch' modifier
    db
      .select({
        date: sql<string>`date(${viewHistories.createdAt}, 'unixepoch')`,
        count: sql<number>`count(distinct ${viewHistories.userId})`,
      })
      .from(viewHistories)
      .where(gte(viewHistories.createdAt, startDate))
      .groupBy(sql`date(${viewHistories.createdAt}, 'unixepoch')`)
      .orderBy(sql`date(${viewHistories.createdAt}, 'unixepoch') asc`),
    // New servers per day
    db
      .select({
        date: sql<string>`date(${servers.createdAt}, 'unixepoch')`,
        count: sql<number>`count(*)`,
      })
      .from(servers)
      .where(gte(servers.createdAt, startDate))
      .groupBy(sql`date(${servers.createdAt}, 'unixepoch')`)
      .orderBy(sql`date(${servers.createdAt}, 'unixepoch') asc`),
    // Views per day
    db
      .select({
        date: sql<string>`date(${viewHistories.createdAt}, 'unixepoch')`,
        count: sql<number>`count(*)`,
      })
      .from(viewHistories)
      .where(gte(viewHistories.createdAt, startDate))
      .groupBy(sql`date(${viewHistories.createdAt}, 'unixepoch')`)
      .orderBy(sql`date(${viewHistories.createdAt}, 'unixepoch') asc`),
    // Bookmarks per day
    db
      .select({
        date: sql<string>`date(${bookmarks.createdAt}, 'unixepoch')`,
        count: sql<number>`count(*)`,
      })
      .from(bookmarks)
      .where(gte(bookmarks.createdAt, startDate))
      .groupBy(sql`date(${bookmarks.createdAt}, 'unixepoch')`)
      .orderBy(sql`date(${bookmarks.createdAt}, 'unixepoch') asc`),
  ])

  return {
    dailyActiveUsers: dailyActiveUsers.map((r: any) => ({ date: r.date, count: Number(r.count) })),
    dailyServers: dailyServers.map((r: any) => ({ date: r.date, count: Number(r.count) })),
    dailyViews: dailyViews.map((r: any) => ({ date: r.date, count: Number(r.count) })),
    dailyBookmarks: dailyBookmarks.map((r: any) => ({ date: r.date, count: Number(r.count) })),
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
    const newUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(and(gte(users.createdAt, weekStart), lt(users.createdAt, weekEnd)))

    if (newUsers.length === 0) continue

    const userIds = newUsers.map((u: any) => u.id)
    const size = userIds.length

    // Retention for each subsequent week (up to current)
    const retention: number[] = []
    const maxWeeks = Math.min(weeks - i, weeks)

    for (let w = 0; w < maxWeeks; w++) {
      const checkStart = new Date(weekStart.getTime() + w * 7 * 24 * 60 * 60 * 1000)
      const checkEnd = new Date(checkStart.getTime() + 7 * 24 * 60 * 60 * 1000)

      const activeUsers = await db
        .selectDistinct({ userId: viewHistories.userId })
        .from(viewHistories)
        .where(
          and(
            inArray(viewHistories.userId, userIds),
            gte(viewHistories.createdAt, checkStart),
            lt(viewHistories.createdAt, checkEnd),
          )
        )
      const activeCount = activeUsers.length

      retention.push(Math.min(100, Math.round((activeCount / size) * 100)))
    }

    cohorts.push({ cohort: cohortLabel, size, retention })
  }

  return cohorts
}
