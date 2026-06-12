import { db, ratings, bookmarks } from '@/lib/db'
import { eq, and, inArray, avg, count } from 'drizzle-orm'
import crypto from 'crypto'

/**
 * Fetch a Map of serverId → { avg, count } for the given server IDs.
 * Returns an empty map when serverIds is empty.
 * Shared between advanced-search.ts and public.ts.
 */
export async function fetchRatingMap(
  serverIds: string[],
): Promise<Map<string, { avg: number | null; count: number }>> {
  if (serverIds.length === 0) return new Map()

  const ratingsAgg = (await db
    .select({
      serverId: ratings.serverId,
      avgValue: avg(ratings.value),
      countValue: count(),
    })
    .from(ratings)
    .where(inArray(ratings.serverId, serverIds))
    .groupBy(ratings.serverId)).map((row) => ({ serverId: row.serverId, avgRating: row.avgValue ? Number(row.avgValue) : 0, count: row.countValue ?? 0 }))

  return new Map(
    ratingsAgg.map((r: any) => [
      r.serverId,
      { avg: r.avgValue, count: r.countValue },
    ]),
  )
}

/**
 * Find an existing bookmark row id for a user+server pair.
 * Returns the bookmark id or undefined if none exists.
 * Shared between bookmarks.ts and collections.ts.
 */
export async function findExistingBookmarkId(
  userId: string,
  serverId: string,
): Promise<string | undefined> {
  const rows = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.serverId, serverId)))
    .limit(1)

  return rows[0]?.id
}

/**
 * Generate a URL-safe share slug for collections.
 * Shared between bookmarks.ts and collections.ts.
 */
export function generateShareSlug(): string {
  return crypto.randomBytes(9).toString('base64url')
}
