'use server'

import { db, notifications, comments } from '@/lib/db'
import { eq, and, desc, count } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getUserNotifications(userId: string) {
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50)
}

export async function getUnreadNotificationsCount(userId: string) {
  const result = await db.select({ count: count() }).from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
  return result[0]?.count ?? 0
}

export async function getLatestNotification(userId: string) {
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(1)
    .then((r: any) => r[0] ?? null)
}

export async function markNotificationAsRead(id: string, userId: string) {
  const notification = await db.select().from(notifications)
    .where(eq(notifications.id, id))
    .limit(1)
    .then((r: any) => r[0] ?? null)

  if (!notification || notification.userId !== userId) {
    throw new Error('Unauthorized')
  }

  await db.update(notifications).set({ read: true }).where(eq(notifications.id, id))
  revalidatePath('/ru')
}

export async function markAllNotificationsAsRead(userId: string) {
  // Drizzle doesn't have updateMany — we use update with a where clause
  // This updates all rows matching the where condition
  await db.update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
  revalidatePath('/ru')
}

export async function createNotification(data: {
  userId: string
  type: string
  title: string
  message: string
  link?: string
}) {
  return db.insert(notifications).values({
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    link: data.link ?? null,
  }).returning().then((r: any) => r[0])
}

export async function moderateComment(commentId: string, userId: string, isAdmin: boolean) {
  if (!isAdmin) {
    throw new Error('Unauthorized')
  }
  await db.update(comments).set({ isModerated: true }).where(eq(comments.id, commentId))
  revalidatePath('/ru')
}
