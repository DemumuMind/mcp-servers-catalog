'use server'

import { prisma } from '@/lib/db'

export async function computeServerRankings(period: 'week' | 'month' = 'week') {
  const now = new Date()
  const startDate = period === 'week'
    ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Aggregate metrics per server for the period
  const servers = await prisma.server.findMany({
    select: { id: true, name: true, stars: true, forks: true },
  })

  const rankings = await Promise.all(
    servers.map(async (server) => {
      const [views, bookmarks, ratings, comments] = await Promise.all([
        prisma.viewHistory.count({
          where: { serverId: server.id, createdAt: { gte: startDate } },
        }),
        prisma.bookmark.count({
          where: { serverId: server.id, createdAt: { gte: startDate } },
        }),
        prisma.rating.count({
          where: { serverId: server.id, createdAt: { gte: startDate } },
        }),
        prisma.comment.count({
          where: { serverId: server.id, createdAt: { gte: startDate } },
        }),
      ])

      // Composite score: views(1) + bookmarks(3) + ratings(2) + comments(2) + stars(0.5)
      const score = views * 1 + bookmarks * 3 + ratings * 2 + comments * 2 + (server.stars || 0) * 0.5

      return {
        serverId: server.id,
        score,
        views,
        bookmarks,
        ratings,
      }
    })
  )

  // Sort by score descending
  const sorted = rankings
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  // Clear old rankings for this period
  await prisma.serverRanking.deleteMany({
    where: { period, startDate: { gte: startDate } },
  })

  // Insert new rankings
  const endDate = now
  await Promise.all(
    sorted.map((r, index) =>
      prisma.serverRanking.create({
        data: {
          serverId: r.serverId,
          period,
          rank: index + 1,
          score: r.score,
          views: r.views,
          bookmarks: r.bookmarks,
          ratings: r.ratings,
          startDate,
          endDate,
        },
      })
    )
  )

  return { computed: sorted.length, period }
}

export async function getServerRankings(period: 'week' | 'month' = 'week', limit = 10) {
  const rankings = await prisma.serverRanking.findMany({
    where: { period },
    orderBy: { rank: 'asc' },
    take: limit,
    include: {
      server: { select: { id: true, name: true, owner: true, repo: true, description: true, stars: true } },
    },
  })

  return rankings
}
