'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function claimServer(serverId: string, userId: string) {
  const session = await auth()
  if (!session?.user || session.user.id !== userId) {
    return { success: false, error: 'Unauthorized' }
  }

  const server = await prisma.server.findUnique({
    where: { id: serverId },
    select: { authorId: true, owner: true },
  })

  if (server?.authorId) {
    return { success: false, error: 'Server already claimed' }
  }

  // NOTE: Production deployments should verify via GitHub API that the user
  // owns the repo matching server.owner. This is currently a trust-based claim.
  console.warn(`[AUTH] User ${userId} claimed server ${serverId} (${server?.owner}) without GitHub ownership verification`)

  await prisma.server.update({
    where: { id: serverId },
    data: { authorId: userId },
  })

  return { success: true }
}

export async function getAuthorServers(userId: string) {
  return prisma.server.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getServerAuthor(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true, isVerifiedAuthor: true },
  })
}

export async function verifyAuthor(userId: string, verified: boolean) {
  await prisma.user.update({
    where: { id: userId },
    data: { isVerifiedAuthor: verified },
  })
  return { success: true }
}

export async function getServerAnalytics(serverId: string, userId: string) {
  // Verify ownership
  const server = await prisma.server.findFirst({
    where: { id: serverId, authorId: userId },
  })

  if (!server) {
    return null
  }

  const since30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [views, bookmarks, ratings, comments, totalStars] = await Promise.all([
    prisma.viewHistory.count({
      where: { serverId, createdAt: { gte: since30Days } },
    }),
    prisma.bookmark.count({ where: { serverId } }),
    prisma.rating.aggregate({
      where: { serverId },
      _avg: { value: true },
      _count: { value: true },
    }),
    prisma.comment.count({ where: { serverId } }),
    prisma.server.findUnique({
      where: { id: serverId },
      select: { stars: true },
    }),
  ])

  // Daily views using raw SQL for proper DATE grouping
  const dailyViews = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
    SELECT DATE("createdAt") as date, COUNT(*) as count
    FROM "ViewHistory"
    WHERE "serverId" = ${serverId}
      AND "createdAt" >= ${since30Days}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `

  // Similar servers for comparison
  const similarServers = await prisma.server.findMany({
    where: {
      category: server.category,
      id: { not: serverId },
    },
    take: 5,
    select: {
      id: true,
      name: true,
      stars: true,
      bookmarks: { select: { id: true } },
      ratings: { select: { value: true } },
      viewHistory: { where: { createdAt: { gte: since30Days } } },
    },
  })

  const similar = similarServers.map((s) => ({
    id: s.id,
    name: s.name,
    stars: s.stars,
    bookmarks: s.bookmarks.length,
    avgRating: s.ratings.length > 0
      ? s.ratings.reduce((sum, r) => sum + r.value, 0) / s.ratings.length
      : 0,
    views30d: s.viewHistory.length,
  }))

  // Recommendations
  const recommendations: string[] = []
  if (server.tags.length < 3) {
    recommendations.push('Добавьте больше тегов — сервера с 5+ тегами получают в 2 раза больше просмотров')
  }
  if (!server.isRemote && !server.tags.some((t) => ['local', 'stdio'].includes(t.toLowerCase()))) {
    recommendations.push('Укажите тип подключения (local/stdio/remote) в тегах')
  }
  if (ratings._count.value === 0) {
    recommendations.push('Попросите пользователей оставить первый рейтинг — это повышает доверие')
  }
  if (views < 10) {
    recommendations.push('Сервер пока мало просматривается. Расскажите о нём в сообществах MCP.')
  }
  if (bookmarks < 3 && views > 20) {
    recommendations.push('Низкая конверсия в закладки. Улучшите описание, добавьте примеры использования.')
  }

  return {
    server: {
      id: server.id,
      name: server.name,
      stars: totalStars?.stars || 0,
      tags: server.tags,
      category: server.category,
    },
    views30d: views,
    bookmarks,
    avgRating: ratings._avg.value || 0,
    ratingsCount: ratings._count.value,
    comments,
    dailyViews: dailyViews.map((d) => ({
      date: d.date,
      count: Number(d.count),
    })),
    similar,
    recommendations,
  }
}

export async function getAuthorDashboardData(userId: string) {
  const servers = await prisma.server.findMany({
    where: { authorId: userId },
    select: {
      id: true,
      name: true,
      stars: true,
      category: true,
      _count: {
        select: {
          bookmarks: true,
          comments: true,
          ratings: true,
          viewHistory: true,
        },
      },
    },
  })

  const totalViews = servers.reduce((sum, s) => sum + s._count.viewHistory, 0)
  const totalBookmarks = servers.reduce((sum, s) => sum + s._count.bookmarks, 0)
  const totalComments = servers.reduce((sum, s) => sum + s._count.comments, 0)
  const totalRatings = servers.reduce((sum, s) => sum + s._count.ratings, 0)
  const totalStars = servers.reduce((sum, s) => sum + s.stars, 0)

  // Top category
  const categoryCount: Record<string, number> = {}
  for (const s of servers) {
    categoryCount[s.category] = (categoryCount[s.category] || 0) + 1
  }
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null

  return {
    servers: servers.map((s) => ({
      id: s.id,
      name: s.name,
      stars: s.stars,
      bookmarks: s._count.bookmarks,
      comments: s._count.comments,
      ratings: s._count.ratings,
      views: s._count.viewHistory,
    })),
    summary: {
      totalServers: servers.length,
      totalViews,
      totalBookmarks,
      totalComments,
      totalRatings,
      totalStars,
      topCategory,
    },
  }
}
