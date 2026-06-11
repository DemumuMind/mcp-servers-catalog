'use server'

import { db, servers, viewHistories, bookmarks, ratings, comments, serverRankings } from '@/lib/db'
import { eq, and, gte, desc, asc, inArray, count } from 'drizzle-orm'

export async function computeServerRankings(period: 'week' | 'month' = 'week') {
  const now = new Date()
  const startDate = period === 'week'
    ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Aggregate metrics per server for the period
  const serverRows = await db.select({
    id: servers.id,
    name: servers.name,
    stars: servers.stars,
    forks: servers.forks,
  }).from(servers)

  const rankingData = await Promise.all(
    serverRows.map(async (server: any) => {
      const [viewResult, bookmarkResult, ratingResult, commentResult] = await Promise.all([
        db.select({ count: count() }).from(viewHistories).where(
          and(eq(viewHistories.serverId, server.id), gte(viewHistories.createdAt, startDate))
        ),
        db.select({ count: count() }).from(bookmarks).where(
          and(eq(bookmarks.serverId, server.id), gte(bookmarks.createdAt, startDate))
        ),
        db.select({ count: count() }).from(ratings).where(
          and(eq(ratings.serverId, server.id), gte(ratings.createdAt, startDate))
        ),
        db.select({ count: count() }).from(comments).where(
          and(eq(comments.serverId, server.id), gte(comments.createdAt, startDate))
        ),
      ])

      const views = viewResult[0]?.count ?? 0
      const bookmarkCount = bookmarkResult[0]?.count ?? 0
      const ratingCount = ratingResult[0]?.count ?? 0
      const commentCount = commentResult[0]?.count ?? 0

      // Composite score: views(1) + bookmarks(3) + ratings(2) + comments(2) + stars(0.5)
      const score = views * 1 + bookmarkCount * 3 + ratingCount * 2 + commentCount * 2 + (server.stars || 0) * 0.5

      return {
        serverId: server.id,
        score,
        views,
        bookmarks: bookmarkCount,
        ratings: ratingCount,
      }
    })
  )

  // Sort by score descending
  const sorted = rankingData
    .filter((r: any) => r.score > 0)
    .sort((a: any, b: any) => b.score - a.score)

  // Clear old rankings for this period
  await db.delete(serverRankings).where(
    and(eq(serverRankings.period, period), gte(serverRankings.startDate, startDate))
  )

  // Insert new rankings
  const endDate = now
  await Promise.all(
    sorted.map((r: any, index: any) =>
      db.insert(serverRankings).values({
        serverId: r.serverId,
        period,
        rank: index + 1,
        score: r.score,
        views: r.views,
        bookmarks: r.bookmarks,
        ratings: r.ratings,
        startDate,
        endDate,
      })
    )
  )

  return { computed: sorted.length, period }
}

export async function getServerRankings(period: 'week' | 'month' = 'week', limit = 10) {
  const rankingRows = await db.select({
    ...serverRankings,
    serverId_col: servers.id,
    serverName: servers.name,
    serverOwner: servers.owner,
    serverRepo: servers.repo,
    serverDescription: servers.description,
    serverStars: servers.stars,
  } as any).from(serverRankings)
    .innerJoin(servers, eq(serverRankings.serverId, servers.id))
    .where(eq(serverRankings.period, period))
    .orderBy(asc(serverRankings.rank))
    .limit(limit)

  // Map to include nested server object
  return rankingRows.map(({ serverId_col, serverName, serverOwner, serverRepo, serverDescription, serverStars, ...rankingData }: any) => ({
    ...rankingData,
    server: { id: serverId_col, name: serverName, owner: serverOwner, repo: serverRepo, description: serverDescription, stars: serverStars },
  }))
}
