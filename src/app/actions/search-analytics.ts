import { db, searchQueries } from '@/lib/db'
import { sql, gte, desc } from 'drizzle-orm'
import { getClient } from '@/lib/db'

interface SearchGapRow {
  query: string
  count: number
  lastSearch: string
}

interface TopSearchRow {
  query: string
  count: number
  avgResults: number
}

export async function getPopularSearches(days: number = 7, limit: number = 10) {
  const since = new Date(Date.now() - days * 86400000)
  const rows = await db
    .select({ query: searchQueries.query, count: sql<number>`COUNT(*)` })
    .from(searchQueries)
    .where(gte(searchQueries.createdAt, since))
    .groupBy(searchQueries.query)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(limit)

  return rows.map((r) => ({ query: r.query, count: r.count }))
}

export async function getSearchGaps(limit: number = 50): Promise<SearchGapRow[]> {
  const result = await getClient().execute({
    sql: `SELECT query, COUNT(*) as count, MAX("createdAt") as "lastSearch" FROM "SearchQuery" WHERE results = 0 GROUP BY query ORDER BY count DESC LIMIT ?`,
    args: [limit],
  })

  return result.rows.map((row) => ({
    query: String(row.query ?? ''),
    count: Number(row.count ?? 0),
    lastSearch: String(row.lastSearch ?? ''),
  }))
}

export async function getTopSearches(limit: number = 20): Promise<TopSearchRow[]> {
  const result = await getClient().execute({
    sql: `SELECT query, COUNT(*) as count, AVG(results) as "avgResults" FROM "SearchQuery" GROUP BY query ORDER BY count DESC LIMIT ?`,
    args: [limit],
  })

  return result.rows.map((row) => ({
    query: String(row.query ?? ''),
    count: Number(row.count ?? 0),
    avgResults: Number(row.avgResults ?? 0),
  }))
}


export async function logSearchQuery(query: string, results: number = 0, userId?: string) {
  await db.insert(searchQueries).values({
    query: query.toLowerCase().trim(),
    results,
    userId: userId || null,
  })
}

export async function getSearchStats() {
  const total = await db.select({ count: sql<number>`COUNT(*)` }).from(searchQueries).then((r) => r[0]?.count ?? 0)
  const unique = await db.select({ count: sql<number>`COUNT(DISTINCT query)` }).from(searchQueries).then((r) => r[0]?.count ?? 0)
  const zeroResults = await db.select({ count: sql<number>`COUNT(*)` }).from(searchQueries).where(sql`results = 0`).then((r) => r[0]?.count ?? 0)
  return { total, unique, zeroResults }
}
