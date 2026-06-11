'use server'

import { db, bookmarks, collections, servers } from '@/lib/db'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import crypto from 'crypto'

// ─── Bookmark Actions ───────────────────────────────────────────────────────

export async function toggleBookmark(
  userId: string,
  serverId: string
): Promise<{ bookmarked: boolean }> {
  const session = await auth()
  if (session?.user?.id !== userId) throw new Error('Unauthorized')

  const existing = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.serverId, serverId)))
    .limit(1)

  if (existing.length > 0) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id))
    revalidatePath('/')
    return { bookmarked: false }
  }

  await db.insert(bookmarks).values({ userId, serverId })
  revalidatePath('/')
  return { bookmarked: true }
}

export async function getUserBookmarks(userId: string) {
  return db
    .select({
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
      stars: servers.stars,
      forks: servers.forks,
      authorId: servers.authorId,
      createdAt: servers.createdAt,
      updatedAt: servers.updatedAt,
      bookmarkedAt: bookmarks.createdAt,
    })
    .from(bookmarks)
    .innerJoin(servers, eq(bookmarks.serverId, servers.id))
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt))
}

export async function removeBookmark(
  userId: string,
  serverId: string
): Promise<{ success: boolean }> {
  const session = await auth()
  if (session?.user?.id !== userId) throw new Error('Unauthorized')

  await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.serverId, serverId)))

  revalidatePath('/')
  return { success: true }
}

// ─── Collection Actions ─────────────────────────────────────────────────────

export async function createCollection(
  userId: string,
  name: string,
  description?: string,
  isPublic?: boolean
) {
  const session = await auth()
  if (session?.user?.id !== userId) throw new Error('Unauthorized')

  const shareSlug = generateShareSlug()

  const [collection] = await db
    .insert(collections)
    .values({
      userId,
      name,
      description: description || null,
      isPublic: isPublic ?? false,
      shareSlug,
    })
    .returning()

  revalidatePath('/')
  return collection
}

export async function getUserCollections(userId: string) {
  return db.query.collections.findMany({
    where: eq(collections.userId, userId),
    with: {
      bookmarks: {
        with: {
          server: {
            columns: {
              id: true,
              name: true,
              owner: true,
              repo: true,
              isRemote: true,
              endpoint: true,
              description: true,
              category: true,
              stars: true,
              forks: true,
            },
          },
        },
      },
    },
    orderBy: desc(collections.updatedAt),
  })
}

export async function addBookmarkToCollection(
  bookmarkId: string,
  collectionId: string
): Promise<{ success: boolean }> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthorized')

  // Verify the collection belongs to the user
  const collectionRows = await db
    .select({ userId: collections.userId })
    .from(collections)
    .where(eq(collections.id, collectionId))
    .limit(1)

  if (collectionRows[0]?.userId !== userId) throw new Error('Unauthorized')

  // Verify the bookmark belongs to the user
  const bookmarkRows = await db
    .select({ userId: bookmarks.userId })
    .from(bookmarks)
    .where(eq(bookmarks.id, bookmarkId))
    .limit(1)

  if (bookmarkRows[0]?.userId !== userId) throw new Error('Unauthorized')

  await db
    .update(bookmarks)
    .set({ collectionId })
    .where(eq(bookmarks.id, bookmarkId))

  revalidatePath('/')
  return { success: true }
}

export async function getCollectionBookmarks(collectionId: string) {
  return db
    .select({
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
      stars: servers.stars,
      forks: servers.forks,
      authorId: servers.authorId,
      createdAt: servers.createdAt,
      updatedAt: servers.updatedAt,
    })
    .from(bookmarks)
    .innerJoin(servers, eq(bookmarks.serverId, servers.id))
    .where(eq(bookmarks.collectionId, collectionId))
    .orderBy(desc(bookmarks.createdAt))
}

export async function getPublicCollection(shareSlug: string) {
  return db.query.collections.findFirst({
    where: and(eq(collections.shareSlug, shareSlug), eq(collections.isPublic, true)),
    with: {
      user: {
        columns: { name: true, image: true },
      },
      bookmarks: {
        with: {
          server: {
            columns: {
              id: true,
              name: true,
              owner: true,
              repo: true,
              isRemote: true,
              endpoint: true,
              description: true,
              githubUrl: true,
              isOfficial: true,
              isSponsored: true,
              tags: true,
              category: true,
              stars: true,
              forks: true,
            },
          },
        },
      },
    },
  })
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function generateShareSlug(): string {
  return crypto.randomBytes(9).toString('base64url')
}
