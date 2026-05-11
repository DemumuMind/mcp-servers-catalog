'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function getUserCollections(userId: string) {
  return prisma.collection.findMany({
    where: { userId },
    include: {
      bookmarks: {
        include: {
          server: {
            select: {
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
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getPublicCollection(shareSlug: string) {
  return prisma.collection.findUnique({
    where: { shareSlug, isPublic: true },
    include: {
      user: {
        select: { name: true, email: true },
      },
      bookmarks: {
        include: {
          server: {
            select: {
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

export async function createCollection(name: string, description?: string) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthorized')

  const shareSlug = generateShareSlug()

  const collection = await prisma.collection.create({
    data: {
      userId,
      name,
      description: description || null,
      shareSlug,
    },
  })

  revalidatePath('/ru/profile')
  return collection
}

export async function updateCollection(
  id: string,
  data: { name?: string; description?: string; isPublic?: boolean }
) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthorized')

  const collection = await prisma.collection.findUnique({
    where: { id },
    select: { userId: true },
  })
  if (collection?.userId !== userId) throw new Error('Unauthorized')

  const updated = await prisma.collection.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
    },
  })

  revalidatePath('/ru/profile')
  return updated
}

export async function deleteCollection(id: string) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthorized')

  const collection = await prisma.collection.findUnique({
    where: { id },
    select: { userId: true },
  })
  if (collection?.userId !== userId) throw new Error('Unauthorized')

  await prisma.collection.delete({ where: { id } })
  revalidatePath('/ru/profile')
}

export async function addServerToCollection(collectionId: string, serverId: string) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthorized')

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { userId: true },
  })
  if (collection?.userId !== userId) throw new Error('Unauthorized')

  // Check if bookmark already exists for this user+server
  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_serverId: { userId, serverId },
    },
  })

  if (existing) {
    // Update collectionId
    await prisma.bookmark.update({
      where: { id: existing.id },
      data: { collectionId },
    })
  } else {
    await prisma.bookmark.create({
      data: {
        userId,
        serverId,
        collectionId,
      },
    })
  }

  revalidatePath('/ru/profile')
}

export async function removeServerFromCollection(collectionId: string, serverId: string) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthorized')

  const bookmark = await prisma.bookmark.findFirst({
    where: { userId, serverId, collectionId },
  })

  if (bookmark) {
    await prisma.bookmark.delete({ where: { id: bookmark.id } })
  }

  revalidatePath('/ru/profile')
}

function generateShareSlug(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let slug = ''
  for (let i = 0; i < 12; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return slug
}

export async function exportCollectionConfig(collectionId: string) {
  const session = await auth()
  const userId = session?.user?.id

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    include: {
      bookmarks: {
        include: {
          server: true,
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
