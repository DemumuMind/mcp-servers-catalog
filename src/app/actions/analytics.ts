'use server'

import { db, viewHistories, servers, bookmarks, users } from '@/lib/db'
import { gte, lt, and, inArray, sql } from 'drizzle-orm'
import type { SQLiteColumn } from 'drizzle-orm/sqlite-core'

function buildDailyCountQuery(
  table: { createdAt: SQLiteColumn },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countExpr: any,
  startDate: Date,
) {
  return db
    .select({
      date: sql<string>`date(${table.createdAt}, 'unixepoch')`,
      count: countExpr,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from(table as any)
    .where(gte(table.createdAt, startDate))
    .groupBy(sql`date(${table.createdAt}, 'unixepoch')`)
    .orderBy(sql`date(${table.createdAt}, 'unixepoch') asc`)
}

export async function getTimeSeriesMetrics(days: number = 30) {
  const now = new Date()
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  const [dailyActiveUsers, dailyServers, dailyViews, dailyBookmarks] = await Promise.all([
    buildDailyCountQuery(viewHistories, sql<number>`count(distinct ${viewHistories.userId})`, startDate),
    buildDailyCountQuery(servers, sql<number>`count(*)`, startDate),
    buildDailyCountQuery(viewHistories, sql<number>`count(*)`, startDate),
    buildDailyCountQuery(bookmarks, sql<number>`count(*)`, startDate),
  ])

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dailyActiveUsers: dailyActiveUsers.map((r: any) => ({ date: r.date, count: Number(r.count) })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dailyServers: dailyServers.map((r: any) => ({ date: r.date, count: Number(r.count) })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dailyViews: dailyViews.map((r: any) => ({ date: r.date, count: Number(r.count) })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const newUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(and(gte(users.createdAt, weekStart), lt(users.createdAt, weekEnd)))

    if (newUsers.length === 0) continue

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userIds = newUsers.map((u: any) => u.id)
    const size = userIds.length

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
