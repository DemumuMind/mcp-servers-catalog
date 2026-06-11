'use server'

import { db, viewHistories, servers } from '@/lib/db'
import { eq, and, desc, gte, sql } from 'drizzle-orm'

// ─── Record View ──────────────────────────────────────────────────────────────
export async function recordView(
  userId: string | null,
  serverId: string
): Promise<{ success: boolean }> {
  if (!userId) return { success: false }

  // Prevent duplicate within 5 minutes — upsert the view
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)

  const recent = await db
    .select({ id: viewHistories.id })
    .from(viewHistories)
    .where(
      and(
        eq(viewHistories.userId, userId),
        eq(viewHistories.serverId, serverId),
        gte(viewHistories.createdAt, fiveMinAgo)
      )
    )
    .limit(1)
    .then((r: any) => r[0] ?? null)

  if (recent) {
    // Already viewed within 5 minutes — update timestamp
    await db
      .update(viewHistories)
      .set({ createdAt: new Date() })
      .where(eq(viewHistories.id, recent.id))
    return { success: true }
  }

  // Insert or update (unique constraint on userId+serverId)
  const existing = await db
    .select({ id: viewHistories.id })
    .from(viewHistories)
    .where(
      and(eq(viewHistories.userId, userId), eq(viewHistories.serverId, serverId))
    )
    .limit(1)
    .then((r: any) => r[0] ?? null)

  if (existing) {
    await db
      .update(viewHistories)
      .set({ createdAt: new Date() })
      .where(eq(viewHistories.id, existing.id))
  } else {
    await db.insert(viewHistories).values({ userId, serverId })
  }

  return { success: true }
}

// ─── Get Recent Views ────────────────────────────────────────────────────────
export async function getRecentViews(
  userId: string,
  limit: number = 20
) {
  const rows = await db
    .select({
      viewId: viewHistories.id,
      viewedAt: viewHistories.createdAt,
      // Server fields
      serverId: servers.id,
      serverName: servers.name,
      serverDescription: servers.description,
      serverOwner: servers.owner,
      serverRepo: servers.repo,
      serverFullSlug: servers.fullSlug,
      serverCategory: servers.category,
      serverIsOfficial: servers.isOfficial,
      serverIsRemote: servers.isRemote,
      serverGithubUrl: servers.githubUrl,
      serverTags: servers.tags,
      serverStars: servers.stars,
      serverForks: servers.forks,
      serverFeatured: servers.featured,
      serverIsSponsored: servers.isSponsored,
      serverEndpoint: servers.endpoint,
    })
    .from(viewHistories)
    .innerJoin(servers, eq(viewHistories.serverId, servers.id))
    .where(eq(viewHistories.userId, userId))
    .orderBy(desc(viewHistories.createdAt))
    .limit(limit)

  return rows.map((r: any) => ({
    viewedAt: r.viewedAt,
    id: r.serverId,
    name: r.serverName,
    description: r.serverDescription,
    owner: r.serverOwner,
    repo: r.serverRepo,
    fullSlug: r.serverFullSlug,
    category: r.serverCategory,
    isOfficial: r.serverIsOfficial,
    isRemote: r.serverIsRemote,
    githubUrl: r.serverGithubUrl,
    tags: r.serverTags,
    stars: r.serverStars,
    forks: r.serverForks,
    featured: r.serverFeatured,
    isSponsored: r.serverIsSponsored,
    endpoint: r.serverEndpoint,
  }))
}

// ─── Clear View History ──────────────────────────────────────────────────────
export async function clearViewHistory(
  userId: string
): Promise<{ success: boolean }> {
  await db.delete(viewHistories).where(eq(viewHistories.userId, userId))
  return { success: true }
}

// ─── Get View Count ──────────────────────────────────────────────────────────
export async function getViewCount(serverId: string): Promise<{ count: number }> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(viewHistories)
    .where(eq(viewHistories.serverId, serverId))
    .then((r: any) => r[0] ?? { count: 0 })

  return { count: Number(result.count) }
}
