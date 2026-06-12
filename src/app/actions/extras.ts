'use server'

import { db, votes, collections, bookmarks, servers, digestSubscriptions, users } from '@/lib/db'
import { eq, and, sum } from 'drizzle-orm'

// Simple spam detection
const SPAM_WORDS = ['casino', 'viagra', 'buy now', 'click here', 'earn money', 'free money', 'act now']

export async function detectSpam(content: string): Promise<{ isSpam: boolean; reason?: string }> {
  const lower = content.toLowerCase()
  
  const foundWords = SPAM_WORDS.filter(word => lower.includes(word))
  if (foundWords.length > 0) {
    return { isSpam: true, reason: `Contains spam words: ${foundWords.join(', ')}` }
  }
  
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
  if (capsRatio > 0.7 && content.length > 10) {
    return { isSpam: true, reason: 'Excessive capitalization' }
  }
  
  const linkCount = (content.match(/https?:\/\//g) || []).length
  if (linkCount > 2) {
    return { isSpam: true, reason: 'Too many links' }
  }
  
  return { isSpam: false }
}

// Vote actions
export async function voteServer(userId: string, serverId: string, value: number) {
  if (value !== 1 && value !== -1) throw new Error('Vote must be 1 or -1')
  
  // Upsert: try insert, on conflict update
  const existing = await db.select().from(votes).where(and(eq(votes.userId, userId), eq(votes.serverId, serverId))).limit(1).then((r: any) => r[0])
  
  if (existing) {
    await db.update(votes).set({ value }).where(and(eq(votes.userId, userId), eq(votes.serverId, serverId)))
  } else {
    await db.insert(votes).values({ userId, serverId, value })
  }
  
  const voteSum = await db.select({ total: sum(votes.value) }).from(votes).where(eq(votes.serverId, serverId)).then((r: any) => r[0]?.total ?? 0)
  
  return { success: true, total: Number(voteSum) || 0 }
}

// Collection actions
export async function createCollection(userId: string, name: string) {
  return db.insert(collections).values({ userId, name }).returning().then((r: any) => r[0])
}

export async function getUserCollections(userId: string) {
  // Get collections for user
  const userCollections = await db.select().from(collections).where(eq(collections.userId, userId))

  // For each collection, get its bookmarks with server data
  const withBookmarks = await Promise.all(userCollections.map(async (col: any) => {
    const colBookmarks = await db.select({
      id: bookmarks.id,
      userId: bookmarks.userId,
      serverId: bookmarks.serverId,
      collectionId: bookmarks.collectionId,
      createdAt: bookmarks.createdAt,
      server: {
        id: servers.id,
        name: servers.name,
        description: servers.description,
        owner: servers.owner,
        repo: servers.repo,
        fullSlug: servers.fullSlug,
        category: servers.category,
        isOfficial: servers.isOfficial,
        isSponsored: servers.isSponsored,
        githubUrl: servers.githubUrl,
        tags: servers.tags,
        isRemote: servers.isRemote,
        authType: servers.authType,
        endpoint: servers.endpoint,
        featured: servers.featured,
        featuredUntil: servers.featuredUntil,
        sponsoredUntil: servers.sponsoredUntil,
        stars: servers.stars,
        forks: servers.forks,
        authorId: servers.authorId,
        createdAt: servers.createdAt,
        updatedAt: servers.updatedAt,
      },
    }).from(bookmarks).innerJoin(servers, eq(bookmarks.serverId, servers.id)).where(eq(bookmarks.collectionId, col.id))

    return { ...col, bookmarks: colBookmarks }
  }))

  return withBookmarks
}

export async function addBookmarkToCollection(bookmarkId: string, collectionId: string) {
  return db.update(bookmarks).set({ collectionId }).where(eq(bookmarks.id, bookmarkId)).returning().then((r: any) => r[0])
}

// Digest subscription
export async function subscribeToDigest(
  userId: string, 
  frequency: 'daily' | 'weekly' = 'weekly',
  category?: string | null
) {
  const existing = await db.select().from(digestSubscriptions).where(eq(digestSubscriptions.userId, userId)).limit(1).then((r: any) => r[0])

  if (existing) {
    return db.update(digestSubscriptions).set({ frequency, active: true, category }).where(eq(digestSubscriptions.userId, userId)).returning().then((r: any) => r[0])
  } else {
    return db.insert(digestSubscriptions).values({ userId, frequency, category }).returning().then((r: any) => r[0])
  }
}

export async function getDigestSubscribers() {
  const subscribers = await db.select({
    id: digestSubscriptions.id,
    userId: digestSubscriptions.userId,
    frequency: digestSubscriptions.frequency,
    active: digestSubscriptions.active,
    category: digestSubscriptions.category,
    createdAt: digestSubscriptions.createdAt,
    email: users.email,
    name: users.name,
  }).from(digestSubscriptions).innerJoin(users, eq(digestSubscriptions.userId, users.id)).where(eq(digestSubscriptions.active, true))

  return subscribers.map((s: any) => ({
    id: s.id,
    userId: s.userId,
    frequency: s.frequency,
    active: s.active,
    category: s.category,
    createdAt: s.createdAt,
    user: { email: s.email, name: s.name },
  }))
}
