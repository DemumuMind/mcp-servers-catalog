'use server'

import { db, bookmarks, servers } from '@/lib/db'
import { eq, inArray, ne, and } from 'drizzle-orm'

export async function getOftenUsedTogether(serverId: string, limit: number = 5) {
  const userBookmarks = await db.select({ userId: bookmarks.userId }).from(bookmarks).where(eq(bookmarks.serverId, serverId))

  const userIds = userBookmarks.map((b: any) => b.userId)
  if (userIds.length === 0) return []

  const otherBookmarks = await db.select({
    serverId: bookmarks.serverId,
  }).from(bookmarks).where(
    and(
      inArray(bookmarks.userId, userIds),
      ne(bookmarks.serverId, serverId)
    )
  )

  const freq: Record<string, number> = {}
  for (const b of otherBookmarks) {
    freq[b.serverId] = (freq[b.serverId] || 0) + 1
  }

  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  if (sorted.length === 0) return []

  const serverResults = await db.select({
    id: servers.id,
    name: servers.name,
    owner: servers.owner,
    repo: servers.repo,
    description: servers.description,
    isOfficial: servers.isOfficial,
    isSponsored: servers.isSponsored,
    tags: servers.tags,
    category: servers.category,
    stars: servers.stars,
    forks: servers.forks,
  }).from(servers).where(inArray(servers.id, sorted))

  return serverResults.map((s: any) => ({
    ...s,
    togetherCount: freq[s.id],
  }))
}
