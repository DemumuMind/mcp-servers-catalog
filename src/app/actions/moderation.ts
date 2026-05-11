'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getPendingComments() {
  return prisma.comment.findMany({
    where: { isModerated: false },
    include: {
      user: { select: { name: true, email: true } },
      server: { select: { name: true, owner: true, repo: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAllComments(limit: number = 100) {
  return prisma.comment.findMany({
    include: {
      user: { select: { name: true, email: true } },
      server: { select: { name: true, owner: true, repo: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function approveComment(id: string) {
  await prisma.comment.update({
    where: { id },
    data: { isModerated: true },
  })
  revalidatePath('/admin/moderation')
}

export async function rejectComment(id: string) {
  await prisma.comment.delete({
    where: { id },
  })
  revalidatePath('/admin/moderation')
}

export async function bulkApproveComments(ids: string[]) {
  await prisma.comment.updateMany({
    where: { id: { in: ids } },
    data: { isModerated: true },
  })
  revalidatePath('/admin/moderation')
}

export async function bulkRejectComments(ids: string[]) {
  await prisma.comment.deleteMany({
    where: { id: { in: ids } },
  })
  revalidatePath('/admin/moderation')
}
