'use server'

import { db, users, comments, ratings, servers, viewHistories, bookmarks } from '@/lib/db'
import { eq, desc, count } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function getUserProfile(userId: string) {
    const user = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    image: users.image,
    createdAt: users.createdAt,
    emailNotifications: users.emailNotifications,
  }).from(users).where(eq(users.id, userId)).limit(1).then((r: any) => r[0] ?? null)

  if (!user) return null

  const [bookmarkCount, commentCount, ratingCount] = await Promise.all([
        db.select({ count: count() }).from(bookmarks).where(eq(bookmarks.userId, userId)).then((r) => r[0]?.count ?? 0),
        db.select({ count: count() }).from(comments).where(eq(comments.userId, userId)).then((r) => r[0]?.count ?? 0),
        db.select({ count: count() }).from(ratings).where(eq(ratings.userId, userId)).then((r) => r[0]?.count ?? 0),
  ])

  return {
    ...user,
    _count: {
      bookmarks: bookmarkCount,
      comments: commentCount,
      ratings: ratingCount,
    },
  }
}

export async function getUserComments(userId: string) {
    const commentRows = await db.select({
    id: comments.id,
    userId: comments.userId,
    serverId: comments.serverId,
    content: comments.content,
    isModerated: comments.isModerated,
    createdAt: comments.createdAt,
    updatedAt: comments.updatedAt,
    serverId_col: servers.id,
    serverName: servers.name,
    serverOwner: servers.owner,
    serverRepo: servers.repo,
      }).from(comments
  )
    .innerJoin(servers, eq(comments.serverId, servers.id))
    .where(eq(comments.userId, userId))
    .orderBy(desc(comments.createdAt))

    return commentRows.map(({ serverId_col, serverName, serverOwner, serverRepo, ...commentData }: any) => ({
    ...commentData,
    server: { id: serverId_col, name: serverName, owner: serverOwner, repo: serverRepo },
  }))
}

export async function getUserRatings(userId: string) {
    const ratingRows = await db.select({
    id: ratings.id,
    userId: ratings.userId,
    serverId: ratings.serverId,
    value: ratings.value,
    createdAt: ratings.createdAt,
    updatedAt: ratings.updatedAt,
    serverId_col: servers.id,
    serverName: servers.name,
    serverOwner: servers.owner,
    serverRepo: servers.repo,
      }).from(ratings)
    .innerJoin(servers, eq(ratings.serverId, servers.id))
    .where(eq(ratings.userId, userId))
    .orderBy(desc(ratings.createdAt))

    return ratingRows.map(({ serverId_col, serverName, serverOwner, serverRepo, ...ratingData }: any) => ({
    ...ratingData,
    server: { id: serverId_col, name: serverName, owner: serverOwner, repo: serverRepo },
  }))
}

export async function getUserHistory(userId: string, limit = 50) {
    const historyRows = await db.select({
    id: viewHistories.id,
    userId: viewHistories.userId,
    serverId: viewHistories.serverId,
    createdAt: viewHistories.createdAt,
    serverId_col: servers.id,
    serverName: servers.name,
    serverDescription: servers.description,
    serverOwner: servers.owner,
    serverRepo: servers.repo,
    serverCategory: servers.category,
    serverStars: servers.stars,
    serverForks: servers.forks,
    serverIsOfficial: servers.isOfficial,
    serverIsSponsored: servers.isSponsored,
    serverTags: servers.tags,
      }).from(viewHistories)
    .innerJoin(servers, eq(viewHistories.serverId, servers.id))
    .where(eq(viewHistories.userId, userId))
    .orderBy(desc(viewHistories.createdAt))
    .limit(limit)

    const mapped = historyRows.map((row) => {
    const {
      serverId_col, serverName, serverDescription, serverOwner, serverRepo,
      serverCategory, serverStars, serverForks, serverIsOfficial, serverIsSponsored, serverTags,
      ...historyData
    } = row
    return {
      ...historyData,
      server: {
        id: serverId_col,
        name: serverName,
        description: serverDescription,
        owner: serverOwner,
        repo: serverRepo,
        category: serverCategory,
        stars: serverStars,
        forks: serverForks,
        isOfficial: serverIsOfficial,
        isSponsored: serverIsSponsored,
        tags: serverTags,
      },
    }
  })

  const seen = new Set<string>()
    return mapped.filter((h: any) => {
    if (seen.has(h.serverId)) return false
    seen.add(h.serverId)
    return true
  })
}

export async function trackServerView(userId: string, serverId: string) {
  try {
    await db.insert(viewHistories).values({ userId, serverId })
      .onConflictDoUpdate({
        target: [viewHistories.userId, viewHistories.serverId],
        set: { createdAt: new Date() },
      })
  } catch {
    // Expected to sometimes fail silently
  }
}

export async function updateProfile(userId: string, data: { name: string }) {
    const user = await db.update(users).set({ name: data.name }).where(eq(users.id, userId)).returning().then((r: any) => r[0])
  revalidatePath('/ru/profile')
  return { success: true, user: { name: user.name, email: user.email } }
}

export async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
    const user = await db.select({ password: users.password }).from(users).where(eq(users.id, userId)).limit(1).then((r: any) => r[0] ?? null)

  if (!user?.password) {
    throw new Error('CANNOT_CHANGE_PASSWORD')
  }

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) {
    throw new Error('INVALID_CURRENT_PASSWORD')
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await db.update(users).set({ password: hashed }).where(eq(users.id, userId))

  return { success: true }
}

export async function updateSettings(
  userId: string,
  data: { emailNotifications: boolean }
) {
    const user = await db.update(users).set({ emailNotifications: data.emailNotifications }).where(eq(users.id, userId)).returning().then((r: any) => r[0])
  revalidatePath('/ru/profile/settings')
  return { success: true, emailNotifications: user.emailNotifications }
}

export async function clearHistory(userId: string) {
  await db.delete(viewHistories).where(eq(viewHistories.userId, userId))
  revalidatePath('/ru/profile/history')
  return { success: true }
}
