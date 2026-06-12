'use server'

import { db, collections, bookmarks } from '@/lib/db'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { generateShareSlug, findExistingBookmarkId } from '@/lib/action-helpers'

/** Shared extended server columns for relational queries */
const extendedServerColumns = {
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
} as const

export async function getUserCollections(userId: string) {
  // Use relational query API for nested includes
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
            },
          },
        },
      },
    },
    orderBy: desc(collections.updatedAt),
  })
}

export async function getPublicCollection(shareSlug: string) {
  return db.query.collections.findFirst({
    where: and(eq(collections.shareSlug, shareSlug), eq(collections.isPublic, true)),
    with: {
      user: {
        columns: { name: true, email: true },
      },
      bookmarks: {
        with: {
          server: {
            columns: extendedServerColumns,
          },
        },
      },
    },
  })
}

export async function createCollection(name: string, description?: string) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthorized')

  const shareSlug = generateShareSlug()

  const [collection] = await db
    .insert(collections)
    .values({
      userId,
      name,
      description: description || null,
      shareSlug,
    })
    .returning()

  revalidatePath('/ru/profile')
  return collection
}

/** Verify the current user owns the given collection, throw if not */
async function verifyCollectionOwnership(collectionId: string) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthorized')

  const existing = await db
    .select({ userId: collections.userId })
    .from(collections)
    .where(eq(collections.id, collectionId))
    .limit(1)

  if (existing[0]?.userId !== userId) throw new Error('Unauthorized')
  return userId
}

export async function updateCollection(
  id: string,
  data: { name?: string; description?: string; isPublic?: boolean }
) {
  await verifyCollectionOwnership(id)

  const updateData: Record<string, any> = {}
  if (data.name) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.isPublic !== undefined) updateData.isPublic = data.isPublic

  const [updated] = await db
    .update(collections)
    .set(updateData)
    .where(eq(collections.id, id))
    .returning()

  revalidatePath('/ru/profile')
  return updated
}

export async function deleteCollection(id: string) {
  await verifyCollectionOwnership(id)

  await db.delete(collections).where(eq(collections.id, id))
  revalidatePath('/ru/profile')
}

export async function addServerToCollection(collectionId: string, serverId: string) {
  const userId = await verifyCollectionOwnership(collectionId)
  // Check if bookmark already exists for this user+server
  const existingId = await findExistingBookmarkId(userId, serverId)

  if (existingId) {
    await db
      .update(bookmarks)
      .set({ collectionId })
      .where(eq(bookmarks.id, existingId))
  } else {
    await db.insert(bookmarks).values({
      userId,
      serverId,
      collectionId,
    })
  }

  revalidatePath('/ru/profile')
}

export async function removeServerFromCollection(collectionId: string, serverId: string) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthorized')

  const bookmarkRows = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.userId, userId),
        eq(bookmarks.serverId, serverId),
        eq(bookmarks.collectionId, collectionId)
      )
    )
    .limit(1)

  if (bookmarkRows.length > 0) {
    await db.delete(bookmarks).where(eq(bookmarks.id, bookmarkRows[0].id))
  }

  revalidatePath('/ru/profile')
}

export async function exportCollectionConfig(collectionId: string) {
  const session = await auth()
  const userId = session?.user?.id

  // Use relational query for nested includes
  const collection = await db.query.collections.findFirst({
    where: eq(collections.id, collectionId),
    with: {
      bookmarks: {
        with: {
          server: {
            columns: extendedServerColumns,
          },
        },
      },
    },
  })

  if (!collection) throw new Error('Collection not found')
  if (!collection.isPublic && collection.userId !== userId) {
    throw new Error('Unauthorized')
  }

  const config: Record<string, any> = {}
  for (const bookmark of collection.bookmarks) {
    const server = bookmark.server
    const key = server.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    if (server.isRemote) {
      config[key] = {
        command: 'npx',
        args: ['-y', `@${server.owner}/${server.repo}`],
        env: {},
      }
    } else {
      config[key] = {
        command: 'npx',
        args: ['-y', `@${server.owner}/${server.repo}`],
      }
    }
  }

  return {
    mcpServers: config,
  }
}
