'use server'

import { db, searchQueries } from '@/lib/db'
import { desc, sql, gte } from 'drizzle-orm'

// ─── Track Search ─────────────────────────────────────────────────────────────
export async function trackSearch(
  query: string,
  results: number,
  userId?: string,
  source?: string
): Promise<{ success: boolean }> {
  const trimmed = query.trim()
  if (!trimmed) return { success: false }

  await db.insert(searchQueries).values({
    query: trimmed.toLowerCase(),
    results,
    userId: userId ?? null,
    source: source ?? 'web',
  })

  return { success: true }
}

// ─── Get Popular Searches ─────────────────────────────────────────────────────
export async function getPopularSearches(
  limit: number = 20
): Promise<Array<{ query: string; count: number }>> {
  return db
    .select({
      query: searchQueries.query,
      count: sql<number>`count(*)`,
    })
    .from(searchQueries)
    .groupBy(searchQueries.query)
    .orderBy(desc(sql`count(*)`))
    .limit(limit)
}

// ─── Get Trending Searches ────────────────────────────────────────────────────
export async function getTrendingSearches(
  hours: number = 24,
  limit: number = 10
): Promise<Array<{ query: string; count: number }>> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)

  return db
    .select({
      query: searchQueries.query,
      count: sql<number>`count(*)`,
    })
    .from(searchQueries)
    .where(gte(searchQueries.createdAt, since))
    .groupBy(searchQueries.query)
    .orderBy(desc(sql`count(*)`))
    .limit(limit)
}
