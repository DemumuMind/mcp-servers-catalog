'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

export async function getUnreadNotificationsCount(userId: string) {
  return prisma.notification.count({
    where: { userId, read: false },
  })
}

export async function getLatestNotification(userId: string) {
  return prisma.notification.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function markNotificationAsRead(id: string, userId: string) {
  const notification = await prisma.notification.findUnique({ where: { id } })
  if (!notification || notification.userId !== userId) {
    throw new Error('Unauthorized')
  }
  await prisma.notification.update({
    where: { id },
    data: { read: true },
  })
  revalidatePath('/ru')
}

export async function markAllNotificationsAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  })
  revalidatePath('/ru')
}

export async function createNotification(data: {
  userId: string
  type: string
  title: string
  message: string
  link?: string
}) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
    },
  })
}

export async function moderateComment(commentId: string, userId: string, isAdmin: boolean) {
  if (!isAdmin) {
    throw new Error('Unauthorized')
  }
  await prisma.comment.update({
    where: { id: commentId },
    data: { isModerated: true },
  })
  revalidatePath('/ru')
}
