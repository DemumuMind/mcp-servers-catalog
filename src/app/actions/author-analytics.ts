'use server'

import { db, servers, users, viewHistories, bookmarks, ratings, comments } from '@/lib/db'
import { eq, and, ne, gte, desc, count, avg, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function claimServer(serverId: string, userId: string) {
  const session = await auth()
  if (!session?.user || session.user.id !== userId) {
    return { success: false, error: 'Unauthorized' }
  }

  const server = await db.select({ authorId: servers.authorId, owner: servers.owner }).from(servers).where(eq(servers.id, serverId)).limit(1).then((r: any) => r[0])

  if (server?.authorId) {
    return { success: false, error: 'Server already claimed' }
  }

  // NOTE: Production deployments should verify via GitHub API that the user
  // owns the repo matching server.owner. This is currently a trust-based claim.
  console.warn(`[AUTH] User ${userId} claimed server ${serverId} (${server?.owner}) without GitHub ownership verification`)

  await db.update(servers).set({ authorId: userId }).where(eq(servers.id, serverId))

  return { success: true }
}

export async function getAuthorServers(userId: string) {
  return db.select().from(servers).where(eq(servers.authorId, userId)).orderBy(desc(servers.createdAt))
}

export async function getServerAuthor(userId: string) {
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    image: users.image,
    isVerifiedAuthor: users.isVerifiedAuthor,
  }).from(users).where(eq(users.id, userId)).limit(1).then((r: any) => r[0] || null)
}

export async function verifyAuthor(userId: string, verified: boolean) {
  await db.update(users).set({ isVerifiedAuthor: verified }).where(eq(users.id, userId))
  return { success: true }
}

async function fetchAnalyticsData(serverId: string, since30Days: Date) {
  const [views, bookmarksCount, ratingsAgg, commentsCount, totalStars] = await Promise.all([
    db.select({ count: count() }).from(viewHistories).where(and(eq(viewHistories.serverId, serverId), gte(viewHistories.createdAt, since30Days))).then((r: any) => r[0]?.count ?? 0),
    db.select({ count: count() }).from(bookmarks).where(eq(bookmarks.serverId, serverId)).then((r: any) => r[0]?.count ?? 0),
    db.select({
      avgValue: avg(ratings.value),
      countValue: count(ratings.value),
    }).from(ratings).where(eq(ratings.serverId, serverId)).then((r: any) => r[0] ?? { avgValue: null, countValue: 0 }),
    db.select({ count: count() }).from(comments).where(eq(comments.serverId, serverId)).then((r: any) => r[0]?.count ?? 0),
    db.select({ stars: servers.stars }).from(servers).where(eq(servers.id, serverId)).limit(1).then((r: any) => r[0] ?? null),
  ])

  // SQLite: createdAt is stored as Unix timestamp integer, needs 'unixepoch' modifier
  const dailyViews = await db.execute(sql<Array<{ date: string; count: bigint }>>`
    SELECT date("createdAt", 'unixepoch') as date, COUNT(*) as count
    FROM "ViewHistory"
    WHERE "serverId" = ${serverId}
      AND "createdAt" >= ${since30Days}
    GROUP BY date("createdAt", 'unixepoch')
    ORDER BY date ASC
  `)

  return { views, bookmarks: bookmarksCount, ratings: ratingsAgg, comments: commentsCount, totalStars, dailyViews: dailyViews.rows }
}

async function fetchSimilarServers(serverId: string, category: string, since30Days: Date) {
  const similarServers = await db.select({
    id: servers.id,
    name: servers.name,
    stars: servers.stars,
  }).from(servers).where(and(eq(servers.category, category), ne(servers.id, serverId))).limit(5)

  // Fetch related data for each similar server
  const withStats = await Promise.all(similarServers.map(async (s: any) => {
    const [bmkCount, ratingRows, viewCount] = await Promise.all([
      db.select({ count: count() }).from(bookmarks).where(eq(bookmarks.serverId, s.id)).then((r: any) => r[0]?.count ?? 0),
      db.select({ value: ratings.value }).from(ratings).where(eq(ratings.serverId, s.id)),
      db.select({ count: count() }).from(viewHistories).where(and(eq(viewHistories.serverId, s.id), gte(viewHistories.createdAt, since30Days))).then((r: any) => r[0]?.count ?? 0),
    ])

    return {
      id: s.id,
      name: s.name,
      stars: s.stars,
      bookmarks: bmkCount,
      avgRating: ratingRows.length > 0
        ? ratingRows.reduce((sum: any, r: any) => sum + r.value, 0) / ratingRows.length
        : 0,
      views30d: viewCount,
    }
  }))

  return withStats
}

function generateRecommendations(
  server: { tags: string[]; isRemote: boolean },
  ratings: { avgValue: number | null; countValue: number },
  views: number,
  bookmarks: number
): string[] {
  const recommendations: string[] = []
  if (server.tags.length < 3) {
    recommendations.push('ADD_MORE_TAGS')
  }
  if (!server.isRemote && !server.tags.some((t) => ['local', 'stdio'].includes(t.toLowerCase()))) {
    recommendations.push('SPECIFY_CONNECTION_TYPE')
  }
  if (ratings.countValue === 0) {
    recommendations.push('ASK_FOR_FIRST_RATING')
  }
  if (views < 10) {
    recommendations.push('LOW_VIEWS_PROMOTE')
  }
  if (bookmarks < 3 && views > 20) {
    recommendations.push('LOW_BOOKMARK_CONVERSION')
  }
  return recommendations
}

export async function getServerAnalytics(serverId: string, userId: string) {
  // Verify ownership
  const server = await db.select().from(servers).where(and(eq(servers.id, serverId), eq(servers.authorId, userId))).limit(1).then((r: any) => r[0])

  if (!server) {
    return null
  }

  const since30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const { views, bookmarks, ratings, comments, totalStars, dailyViews } =
    await fetchAnalyticsData(serverId, since30Days)

  const similar = await fetchSimilarServers(serverId, server.category, since30Days)

  const recommendations = generateRecommendations(server, ratings, views, bookmarks)

  return {
    server: {
      id: server.id,
      name: server.name,
      stars: totalStars?.stars || 0,
      tags: server.tags,
      category: server.category,
    },
    views30d: views,
    bookmarks,
    avgRating: ratings.avgValue || 0,
    ratingsCount: ratings.countValue,
    comments,
    dailyViews: dailyViews.map((d: any) => ({
      date: d.date,
      count: Number(d.count),
    })),
    similar,
    recommendations,
  }
}

export async function getAuthorDashboardData(userId: string) {
  const authorServers = await db.select({
    id: servers.id,
    name: servers.name,
    stars: servers.stars,
    category: servers.category,
  }).from(servers).where(eq(servers.authorId, userId))

  // Fetch counts for each server
  const serversWithCounts = await Promise.all(authorServers.map(async (s: any) => {
    const [bmkCount, cmtCount, ratCount, viewCount] = await Promise.all([
      db.select({ count: count() }).from(bookmarks).where(eq(bookmarks.serverId, s.id)).then((r: any) => r[0]?.count ?? 0),
      db.select({ count: count() }).from(comments).where(eq(comments.serverId, s.id)).then((r: any) => r[0]?.count ?? 0),
      db.select({ count: count() }).from(ratings).where(eq(ratings.serverId, s.id)).then((r: any) => r[0]?.count ?? 0),
      db.select({ count: count() }).from(viewHistories).where(eq(viewHistories.serverId, s.id)).then((r: any) => r[0]?.count ?? 0),
    ])
    return { ...s, _bookmarks: bmkCount, _comments: cmtCount, _ratings: ratCount, _views: viewCount }
  }))

  const totalViews = serversWithCounts.reduce((sum: any, s: any) => sum + s._views, 0)
  const totalBookmarks = serversWithCounts.reduce((sum: any, s: any) => sum + s._bookmarks, 0)
  const totalComments = serversWithCounts.reduce((sum: any, s: any) => sum + s._comments, 0)
  const totalRatings = serversWithCounts.reduce((sum: any, s: any) => sum + s._ratings, 0)
  const totalStars = serversWithCounts.reduce((sum: any, s: any) => sum + s.stars, 0)

  // Top category
  const categoryCount: Record<string, number> = {}
  for (const s of serversWithCounts) {
    categoryCount[s.category] = (categoryCount[s.category] || 0) + 1
  }
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null

  return {
    servers: serversWithCounts.map((s: any) => ({
      id: s.id,
      name: s.name,
      stars: s.stars,
      bookmarks: s._bookmarks,
      comments: s._comments,
      ratings: s._ratings,
      views: s._views,
    })),
    summary: {
      totalServers: serversWithCounts.length,
      totalViews,
      totalBookmarks,
      totalComments,
      totalRatings,
      totalStars,
      topCategory,
    },
  }
}
