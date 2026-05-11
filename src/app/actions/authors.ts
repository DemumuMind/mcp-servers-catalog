'use server'

import { prisma } from '@/lib/db'

export async function getTopAuthors(limit: number = 20) {
  // Find all servers with authorId and aggregate stats
  const servers = await prisma.server.findMany({
    where: { authorId: { not: null } },
    include: {
      author: { select: { id: true, name: true, email: true } },
      ratings: { select: { value: true } },
      bookmarks: { select: { id: true } },
      comments: { select: { id: true } },
    },
  })

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

  for (const server of servers) {
    if (!server.author) continue
    
    const existing = authorMap.get(server.author.id)
    const serverAvg = server.ratings.length > 0
      ? server.ratings.reduce((s, r) => s + r.value, 0) / server.ratings.length
      : 0
    
    if (existing) {
      existing.servers++
      existing.totalStars += server.stars
      existing.totalBookmarks += server.bookmarks.length
      existing.totalComments += server.comments.length
      existing.totalRatings += server.ratings.length
      // Recalculate weighted average
      const totalRatingValue = (existing.avgRating * (existing.totalRatings - server.ratings.length)) + 
        serverAvg * server.ratings.length
      existing.avgRating = existing.totalRatings > 0 ? totalRatingValue / existing.totalRatings : 0
    } else {
      authorMap.set(server.author.id, {
        id: server.author.id,
        name: server.author.name,
        email: server.author.email,
        servers: 1,
        totalStars: server.stars,
        totalBookmarks: server.bookmarks.length,
        totalComments: server.comments.length,
        avgRating: serverAvg,
        totalRatings: server.ratings.length,
      })
    }
  }

  return Array.from(authorMap.values())
    .sort((a, b) => b.totalStars - a.totalStars)
    .slice(0, limit)
}
