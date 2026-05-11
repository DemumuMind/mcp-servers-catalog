'use server'

import { prisma } from '@/lib/db'

export async function getOftenUsedTogether(serverId: string, limit: number = 5) {
  // Find users who bookmarked this server
  const userBookmarks = await prisma.bookmark.findMany({
    where: { serverId },
    select: { userId: true },
  })

  const userIds = userBookmarks.map((b) => b.userId)
  if (userIds.length === 0) return []

  // Find other servers bookmarked by same users
  const otherBookmarks = await prisma.bookmark.findMany({
    where: {
      userId: { in: userIds },
      serverId: { not: serverId },
    },
    select: {
      serverId: true,
    },
  })

  // Count frequency
  const freq: Record<string, number> = {}
  for (const b of otherBookmarks) {
    freq[b.serverId] = (freq[b.serverId] || 0) + 1
  }

  // Sort by frequency
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  if (sorted.length === 0) return []

  // Fetch server details
  const servers = await prisma.server.findMany({
    where: { id: { in: sorted } },
    select: {
      id: true,
      name: true,
      owner: true,
      repo: true,
      description: true,
      isOfficial: true,
      isSponsored: true,
      tags: true,
      category: true,
      stars: true,
      forks: true,
    },
  })

  // Add frequency score
  return servers.map((s) => ({
    ...s,
    togetherCount: freq[s.id],
  }))
}
