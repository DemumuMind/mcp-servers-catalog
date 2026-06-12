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
    const { rows: gapRows } = await getClient().execute({
    sql: 'SELECT query, COUNT(*) as count, MAX("createdAt") as "lastSearch" FROM "SearchQuery" WHERE results = 0 GROUP BY query ORDER BY count DESC LIMIT ?',
    args: [limit],
  })

  return gapRows.map((g) => ({
    query: String(g.query ?? ''),
    count: Number(g.count ?? 0),
    lastSearch: String(g.lastSearch ?? ''),
  }))
}

export async function getTopSearches(limit: number = 20) {
    const { rows: searchRows } = await getClient().execute({
    sql: 'SELECT query, COUNT(*) as count, AVG(results) as "avgResults" FROM "SearchQuery" GROUP BY query ORDER BY count DESC LIMIT ?',
    args: [limit],
  })

  return searchRows.map((s) => ({
    query: String(s.query ?? ''),
    count: Number(s.count ?? 0),
    avgResults: Number(s.avgResults ?? 0),
  }))
}

export async function getSearchStats(since: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
  const [total, withResults, withoutResults] = await Promise.all([
        db.select({ count: count() }).from(searchQueries).where(gte(searchQueries.createdAt, since)).then((r: unknown) => (r as {count?: number})?.count ?? 0),
        db.select({ count: count() }).from(searchQueries).where(and(gte(searchQueries.createdAt, since), gt(searchQueries.results, 0))).then((r: unknown) => (r as {count?: number})?.count ?? 0),
        db.select({ count: count() }).from(searchQueries).where(and(gte(searchQueries.createdAt, since), eq(searchQueries.results, 0))).then((r: unknown) => (r as {count?: number})?.count ?? 0),
  ])

  return { total, withResults, withoutResults, gapRate: total > 0 ? (withoutResults / total) : 0 }
}
