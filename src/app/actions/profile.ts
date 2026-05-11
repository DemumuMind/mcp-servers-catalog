'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      emailNotifications: true,
      _count: {
        select: {
          bookmarks: true,
          comments: true,
          ratings: true,
        },
      },
    },
  })
  return user
}

export async function getUserComments(userId: string) {
  return prisma.comment.findMany({
    where: { userId },
    include: {
      server: {
        select: {
          id: true,
          name: true,
          owner: true,
          repo: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getUserRatings(userId: string) {
  return prisma.rating.findMany({
    where: { userId },
    include: {
      server: {
        select: {
          id: true,
          name: true,
          owner: true,
          repo: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getUserHistory(userId: string, limit = 50) {
  const history = await prisma.viewHistory.findMany({
    where: { userId },
    include: {
      server: {
        select: {
          id: true,
          name: true,
          description: true,
          owner: true,
          repo: true,
          category: true,
          stars: true,
          forks: true,
          isOfficial: true,
          isSponsored: true,
          tags: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  // Deduplicate by server (keep most recent)
  const seen = new Set<string>()
  return history.filter((h) => {
    if (seen.has(h.serverId)) return false
    seen.add(h.serverId)
    return true
  })
}

export async function trackServerView(userId: string, serverId: string) {
  try {
    await prisma.viewHistory.upsert({
      where: {
        userId_serverId: { userId, serverId },
      },
      update: { createdAt: new Date() },
      create: { userId, serverId },
    })
  } catch {
    // Silently fail if server doesn't exist or other error
  }
}

export async function updateProfile(userId: string, data: { name: string }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: data.name },
  })
  revalidatePath('/ru/profile')
  return { success: true, user: { name: user.name, email: user.email } }
}

export async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  })

  if (!user?.password) {
    throw new Error('Невозможно сменить пароль для этого типа аккаунта')
  }

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) {
    throw new Error('Текущий пароль неверен')
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  })

  return { success: true }
}

export async function updateSettings(
  userId: string,
  data: { emailNotifications: boolean }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { emailNotifications: data.emailNotifications },
  })
  revalidatePath('/ru/profile/settings')
  return { success: true, emailNotifications: user.emailNotifications }
}

export async function clearHistory(userId: string) {
  await prisma.viewHistory.deleteMany({
    where: { userId },
  })
  revalidatePath('/ru/profile/history')
  return { success: true }
}
