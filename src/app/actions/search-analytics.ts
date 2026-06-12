'use server'

import { db, searchQueries, getClient } from '@/lib/db'
import { eq, gte, gt, and, count, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'

export async function logSearchQuery(query: string, results: number, source: string = 'web') {
  const session = await auth()
  const userId = session?.user?.id || null

  await db.insert(searchQueries).values({
    query: query.trim().toLowerCase().slice(0, 200),
    results,
    userId,
    source,
  })
}

export async function getSearchGaps(limit: number = 50) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gaps = await getClient().execute(sql<Array<{ query: string; count: bigint; lastSearch: Date }>>`
    SELECT query, COUNT(*) as count, MAX("createdAt") as "lastSearch"
    FROM "SearchQuery"
    WHERE results = 0
    GROUP BY query
    ORDER BY count DESC
    LIMIT ${limit}
  ` as any)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return gaps.rows.map((g: any) => ({
    query: g.query,
    count: Number(g.count),
    lastSearch: g.lastSearch,
  }))
}

export async function getTopSearches(limit: number = 20) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searches = await getClient().execute(sql<Array<{ query: string; count: bigint; avgResults: number }>>`
    SELECT query, COUNT(*) as count, AVG(results) as "avgResults"
    FROM "SearchQuery"
    GROUP BY query
    ORDER BY count DESC
    LIMIT ${limit}
  ` as any)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return searches.rows.map((s: any) => ({
    query: s.query,
    count: Number(s.count),
    avgResults: Number(s.avgResults),
  }))
}

export async function getSearchStats(since: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
  const [total, withResults, withoutResults] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.select({ count: count() }).from(searchQueries).where(gte(searchQueries.createdAt, since)).then((r: any) => r[0]?.count ?? 0),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.select({ count: count() }).from(searchQueries).where(and(gte(searchQueries.createdAt, since), gt(searchQueries.results, 0))).then((r: any) => r[0]?.count ?? 0),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db.select({ count: count() }).from(searchQueries).where(and(gte(searchQueries.createdAt, since), eq(searchQueries.results, 0))).then((r: any) => r[0]?.count ?? 0),
  ])

  return { total, withResults, withoutResults, gapRate: total > 0 ? (withoutResults / total) : 0 }
}
