'use server'

import { db, servers, viewHistories, bookmarks, ratings, comments, serverRankings } from '@/lib/db'
import { eq, gte, asc, count, SQL } from 'drizzle-orm'
import type { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core'

type ServerCountRow = { serverId: string; count: number }

type ServerRow = {
  id: string
  name: string
  stars: number
  forks: number
}

type RankingEntry = {
  serverId: string
  score: number
  views: number
  bookmarks: number
  ratings: number
}

type RankingInsertRow = {
  serverId: string
  period: string
  rank: number
  score: number
  views: number
  bookmarks: number
  ratings: number
  startDate: Date
  endDate: Date
}

type ServerRankingJoinedRow = {
  // serverRankings columns (spread)
  id: string
  serverId: string
  period: string
  rank: number
  score: number
  views: number
  bookmarks: number
  ratings: number
  startDate: Date | null
  endDate: Date | null
  createdAt: Date | null
  // joined server columns (aliased)
  serverId_col: string
  serverName: string
  serverOwner: string | null
  serverRepo: string | null
  serverDescription: string | null
  serverStars: number | null
}

/** Typed cast helper — replaces `as X` double-assertions with a single cast. */
function castResult<T>(val: unknown): T {
  return val as T
}

/** Fetch serverId -> count aggregation for any table with serverId and createdAt columns. */
async function fetchServerCountAgg(
  table: SQLiteTableWithColumns<any>,
  startDate: Date,
): Promise<ServerCountRow[]> {
  return castResult<Promise<ServerCountRow[]>>(
    db.select({ serverId: table.serverId, count: count() })
      .from(table)
      .where(gte(table.createdAt, startDate))
      .groupBy(table.serverId),
  )
}

export async function computeServerRankings(period: 'week' | 'month' = 'week') {
  const now = new Date()
  const startDate = period === 'week'
    ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const serverRows: ServerRow[] = await db.select({
    id: servers.id,
    name: servers.name,
    stars: servers.stars,
    forks: servers.forks,
  }).from(servers)

  const [viewAgg, bookmarkAgg, ratingAgg, commentAgg] = await Promise.all([
    fetchServerCountAgg(viewHistories, startDate),
    fetchServerCountAgg(bookmarks, startDate),
    fetchServerCountAgg(ratings, startDate),
    fetchServerCountAgg(comments, startDate),
  ])

  const viewMap = new Map(viewAgg.map((r) => [r.serverId, r.count]))
  const bookmarkMap = new Map(bookmarkAgg.map((r) => [r.serverId, r.count]))
  const ratingMap = new Map(ratingAgg.map((r) => [r.serverId, r.count]))
  const commentMap = new Map(commentAgg.map((r) => [r.serverId, r.count]))

  const rankingData: RankingEntry[] = serverRows.map((server) => {
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
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  await db.delete(serverRankings).where(eq(serverRankings.period, period))

  const endDate = now
  const insertValues: RankingInsertRow[] = sorted.map((r, index) => ({
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

  for (const row of insertValues) {
    await db.insert(serverRankings).values(row)
  }

  return { computed: sorted.length, period }
}

export async function getServerRankings(period: 'week' | 'month' = 'week', limit = 10) {
  const rankingRows = await castResult<ServerRankingJoinedRow[]>(
    db.select({
      id: serverRankings.id,
      serverId: serverRankings.serverId,
      period: serverRankings.period,
      rank: serverRankings.rank,
      score: serverRankings.score,
      views: serverRankings.views,
      bookmarks: serverRankings.bookmarks,
      ratings: serverRankings.ratings,
      startDate: serverRankings.startDate,
      endDate: serverRankings.endDate,
      createdAt: serverRankings.createdAt,
      serverId_col: servers.id,
      serverName: servers.name,
      serverOwner: servers.owner,
      serverRepo: servers.repo,
      serverDescription: servers.description,
      serverStars: servers.stars,
    }).from(serverRankings)
    .innerJoin(servers, eq(serverRankings.serverId, servers.id))
    .where(eq(serverRankings.period, period))
    .orderBy(asc(serverRankings.rank))
    .limit(limit),
  )

  return rankingRows.map(({ serverId_col, serverName, serverOwner, serverRepo, serverDescription, serverStars, ...rankingData }) => ({
    ...rankingData,
    server: { id: serverId_col, name: serverName, owner: serverOwner, repo: serverRepo, description: serverDescription, stars: serverStars },
  }))
}
