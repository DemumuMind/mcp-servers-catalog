'use server'

import { db, servers, viewHistories, bookmarks, ratings, comments, serverRankings } from '@/lib/db'
import { eq, gte, asc, count } from 'drizzle-orm'

type ServerCountRow = { serverId: string; count: number }

export async function computeServerRankings(period: 'week' | 'month' = 'week') {
  const now = new Date()
  const startDate = period === 'week'
    ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Aggregate metrics per server for the period — single batch query approach
  const serverRows = await db.select({
    id: servers.id,
    name: servers.name,
    stars: servers.stars,
    forks: servers.forks,
  }).from(servers)

  // Batch aggregate views, bookmarks, ratings, comments in single queries
  const [viewAgg, bookmarkAgg, ratingAgg, commentAgg] = await Promise.all([
    db.select({ serverId: viewHistories.serverId, count: count() })
      .from(viewHistories)
      .where(gte(viewHistories.createdAt, startDate))
      .groupBy(viewHistories.serverId) as unknown as ServerCountRow[],
    db.select({ serverId: bookmarks.serverId, count: count() })
      .from(bookmarks)
      .where(gte(bookmarks.createdAt, startDate))
      .groupBy(bookmarks.serverId) as unknown as ServerCountRow[],
    db.select({ serverId: ratings.serverId, count: count() })
      .from(ratings)
      .where(gte(ratings.createdAt, startDate))
      .groupBy(ratings.serverId) as unknown as ServerCountRow[],
    db.select({ serverId: comments.serverId, count: count() })
      .from(comments)
      .where(gte(comments.createdAt, startDate))
      .groupBy(comments.serverId) as unknown as ServerCountRow[],
  ])

  const viewMap = new Map(viewAgg.map((r: any) => [r.serverId, r.count]))
  const bookmarkMap = new Map(bookmarkAgg.map((r: any) => [r.serverId, r.count]))
  const ratingMap = new Map(ratingAgg.map((r: any) => [r.serverId, r.count]))
  const commentMap = new Map(commentAgg.map((r: any) => [r.serverId, r.count]))

  const rankingData = serverRows.map((server: any) => {
    const views = viewMap.get(server.id) ?? 0
    const bookmarkCount = bookmarkMap.get(server.id) ?? 0
    const ratingCount = ratingMap.get(server.id) ?? 0
    const commentCount = commentMap.get(server.id) ?? 0

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

  const sorted = rankingData
    .filter((r: any) => r.score > 0)
    .sort((a: any, b: any) => b.score - a.score)

  // Clear ALL old rankings for this period (not just gte startDate — avoid unique constraint violations)
  await db.delete(serverRankings).where(eq(serverRankings.period, period))

  // Insert new rankings (batch to avoid DB lock contention)
  const endDate = now
  const insertValues = sorted.map((r: any, index: any) => ({
    serverId: r.serverId,
    period,
    rank: index + 1,
    score: r.score,
    views: r.views,
    bookmarks: r.bookmarks,
    ratings: r.ratings,
    startDate,
    endDate,
  }))

  // Insert sequentially — libsql/local SQLite has write lock, no parallel/batch
  for (const row of insertValues) {
    await db.insert(serverRankings).values(row)
  }

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

  return rankingRows.map(({ serverId_col, serverName, serverOwner, serverRepo, serverDescription, serverStars, ...rankingData }: any) => ({
    ...rankingData,
    server: { id: serverId_col, name: serverName, owner: serverOwner, repo: serverRepo, description: serverDescription, stars: serverStars },
  }))
}
