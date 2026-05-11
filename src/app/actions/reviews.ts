'use server'

import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import DOMPurify from 'isomorphic-dompurify'

function sanitizeReviewContent(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'code', 'pre', 'br', 'p'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
}

export async function getServerReviews(serverId: string) {
  return prisma.review.findMany({
    where: { serverId },
    include: {
      user: { select: { id: true, name: true, image: true, isVerifiedAuthor: true } },
      votes: { select: { userId: true, helpful: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createReview(userId: string, serverId: string, content: string) {
  const rateLimitResult = await rateLimit(`review:${userId}`, 5, 60 * 60 * 1000) // 5 per hour
  if (!rateLimitResult.success) {
    throw new Error('Слишком много отзывов. Попробуйте позже.')
  }

  const sanitized = sanitizeReviewContent(content)

  // Check if user already reviewed this server
  const existing = await prisma.review.findUnique({
    where: { userId_serverId: { userId, serverId } },
  })

  if (existing) {
    throw new Error('Вы уже оставили отзыв на этот сервер.')
  }

  const review = await prisma.review.create({
    data: { userId, serverId, content: sanitized },
    include: {
      user: { select: { id: true, name: true, image: true, isVerifiedAuthor: true } },
      votes: { select: { userId: true, helpful: true } },
    },
  })

  return review
}

export async function voteReview(userId: string, reviewId: string, helpful: boolean) {
  const existing = await prisma.reviewVote.findUnique({
    where: { userId_reviewId: { userId, reviewId } },
  })

  if (existing) {
    // Toggle vote
    if (existing.helpful === helpful) {
      // Remove vote
      await prisma.reviewVote.delete({ where: { id: existing.id } })
      await prisma.review.update({
        where: { id: reviewId },
        data: { [helpful ? 'helpfulCount' : 'notHelpfulCount']: { decrement: 1 } },
      })
      return { action: 'removed' as const }
    } else {
      // Change vote
      await prisma.reviewVote.update({
        where: { id: existing.id },
        data: { helpful },
      })
      await prisma.review.update({
        where: { id: reviewId },
        data: {
          helpfulCount: { [helpful ? 'increment' : 'decrement']: 1 },
          notHelpfulCount: { [helpful ? 'decrement' : 'increment']: 1 },
        },
      })
      return { action: 'changed' as const }
    }
  }

  // New vote
  await prisma.reviewVote.create({
    data: { userId, reviewId, helpful },
  })
  await prisma.review.update({
    where: { id: reviewId },
    data: { [helpful ? 'helpfulCount' : 'notHelpfulCount']: { increment: 1 } },
  })

  return { action: 'added' as const }
}

export async function deleteReview(id: string, userId: string) {
  const review = await prisma.review.findUnique({ where: { id } })
  if (!review || review.userId !== userId) {
    throw new Error('Unauthorized')
  }
  await prisma.review.delete({ where: { id } })
}
