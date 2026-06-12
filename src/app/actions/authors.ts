'use server'

import { db, servers, users, ratings, bookmarks, comments } from '@/lib/db'
import { isNotNull, eq, inArray } from 'drizzle-orm'

export async function getTopAuthors(limit: number = 20) {
  // Find all servers with authorId and aggregate stats
  const authorServers = await db.select({
    id: servers.id,
    stars: servers.stars,
    authorId: servers.authorId,
    authorName: users.name,
    authorEmail: users.email,
  }).from(servers).leftJoin(users, eq(servers.authorId, users.id)).where(isNotNull(servers.authorId))

  // Fetch related data for each server
  const serverIds = authorServers.map((s: any) => s.id)

  // Get all ratings for these servers
  const allRatings = serverIds.length > 0
    ? await db.select({ serverId: ratings.serverId, value: ratings.value }).from(ratings).where(inArray(ratings.serverId, serverIds))
    : []

  // Get all bookmarks for these servers
  const allBookmarks = serverIds.length > 0
    ? await db.select({ serverId: bookmarks.serverId, id: bookmarks.id }).from(bookmarks).where(inArray(bookmarks.serverId, serverIds))
    : []

  // Get all comments for these servers
  const allComments = serverIds.length > 0
    ? await db.select({ serverId: comments.serverId, id: comments.id }).from(comments).where(inArray(comments.serverId, serverIds))
    : []

  // Group by author
  const authorMap = new Map<string, {
    id: string
    name: string | null
    email: string
    servers: number
    totalStars: number
    totalBookmarks: number
    totalComments: number
    avgRating: number
    totalRatings: number
  }>()

  for (const server of authorServers) {
    if (!server.authorId) continue

    const serverRatings = allRatings.filter((r: any) => r.serverId === server.id)
    const serverBookmarks = allBookmarks.filter((b: any) => b.serverId === server.id)
    const serverComments = allComments.filter((c: any) => c.serverId === server.id)

    const existing = authorMap.get(server.authorId)
    const serverAvg = serverRatings.length > 0
      ? serverRatings.reduce((s: any, r: any) => s + r.value, 0) / serverRatings.length
      : 0

    if (existing) {
      existing.servers++
      existing.totalStars += server.stars
      existing.totalBookmarks += serverBookmarks.length
      existing.totalComments += serverComments.length
      existing.totalRatings += serverRatings.length
      // Recalculate weighted average
      const totalRatingValue = (existing.avgRating * (existing.totalRatings - serverRatings.length)) +
        serverAvg * serverRatings.length
      existing.avgRating = existing.totalRatings > 0 ? totalRatingValue / existing.totalRatings : 0
    } else {
      authorMap.set(server.authorId, {
        id: server.authorId,
        name: server.authorName,
        email: server.authorEmail || '',
        servers: 1,
        totalStars: server.stars,
        totalBookmarks: serverBookmarks.length,
        totalComments: serverComments.length,
        avgRating: serverAvg,
        totalRatings: serverRatings.length,
      })
    }
  }

  return Array.from(authorMap.values())
    .sort((a, b) => b.totalStars - a.totalStars)
    .slice(0, limit)
}
