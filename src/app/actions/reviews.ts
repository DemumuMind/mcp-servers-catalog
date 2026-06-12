'use server'

import { db, reviews, reviewVotes, users, ratings } from '@/lib/db'
import { eq, and, desc, sql, inArray } from 'drizzle-orm'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeUserHtml } from '@/lib/sanitize'

/** Update helpfulCount/notHelpfulCount on a review by a delta */
async function updateReviewVoteCounts(reviewId: string, helpfulDelta: number, notHelpfulDelta: number) {
  const setFields: Record<string, any> = {}
  if (helpfulDelta !== 0) setFields.helpfulCount = sql`${reviews.helpfulCount} + ${helpfulDelta}`
  if (notHelpfulDelta !== 0) setFields.notHelpfulCount = sql`${reviews.notHelpfulCount} + ${notHelpfulDelta}`
  if (Object.keys(setFields).length > 0) {
    await db.update(reviews).set(setFields).where(eq(reviews.id, reviewId))
  }
}

export async function submitReview(
  userId: string,
  serverId: string,
  content: string
): Promise<{ success: boolean; reviewId?: string; error?: string }> {
  const rateLimitResult = await rateLimit(`review:${userId}`, 5, 60 * 60 * 1000)
  if (!rateLimitResult.success) {
    return { success: false, error: 'RATE_LIMIT_REVIEWS' }
  }

  const sanitized = sanitizeUserHtml(content)

  const existing = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.serverId, serverId)))
    .limit(1)
    .then((r: any) => r[0] ?? null)

  if (existing) {
    await db
      .update(reviews)
      .set({ content: sanitized, updatedAt: new Date() })
      .where(eq(reviews.id, existing.id))
    return { success: true, reviewId: existing.id }
  }

  const result = await db
    .insert(reviews)
    .values({ userId, serverId, content: sanitized })
    .returning({ id: reviews.id })
    .then((r: any) => r[0])

  return { success: true, reviewId: result?.id }
}

export async function getServerReviews(serverId: string) {
  const reviewRows = await db
    .select({
      id: reviews.id,
      userId: reviews.userId,
      serverId: reviews.serverId,
      content: reviews.content,
      helpfulCount: reviews.helpfulCount,
      notHelpfulCount: reviews.notHelpfulCount,
      isModerated: reviews.isModerated,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
      userName: users.name,
      userImage: users.image,
      userIsVerifiedAuthor: users.isVerifiedAuthor,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.serverId, serverId))
    .orderBy(desc(reviews.createdAt))

  const reviewIds = reviewRows.map((r: any) => r.id)
  const voteRows =
    reviewIds.length > 0
      ? await db
          .select({
            reviewId: reviewVotes.reviewId,
            userId: reviewVotes.userId,
            helpful: reviewVotes.helpful,
          })
          .from(reviewVotes)
          .where(inArray(reviewVotes.reviewId, reviewIds))
      : []

  const votesByReview = new Map<
    string,
    Array<{ userId: string; helpful: boolean }>
  >()
  voteRows.forEach((v: any) => {
    const arr = votesByReview.get(v.reviewId) || []
    arr.push({ userId: v.userId, helpful: v.helpful })
    votesByReview.set(v.reviewId, arr)
  })

  return reviewRows.map((r: any) => ({
    id: r.id,
    userId: r.userId,
    serverId: r.serverId,
    content: r.content,
    helpfulCount: r.helpfulCount,
    notHelpfulCount: r.notHelpfulCount,
    isModerated: r.isModerated,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    user: {
      id: r.userId,
      name: r.userName,
      image: r.userImage,
      isVerifiedAuthor: r.userIsVerifiedAuthor,
    },
    votes: votesByReview.get(r.id) || [],
  }))
}

export async function rateServer(
  userId: string,
  serverId: string,
  value: number
): Promise<{ success: boolean }> {
  const clamped = Math.min(5, Math.max(1, Math.round(value)))

  const existing = await db
    .select({ id: ratings.id })
    .from(ratings)
    .where(and(eq(ratings.userId, userId), eq(ratings.serverId, serverId)))
    .limit(1)
    .then((r: any) => r[0] ?? null)

  if (existing) {
    await db
      .update(ratings)
      .set({ value: clamped, updatedAt: new Date() })
      .where(eq(ratings.id, existing.id))
  } else {
    await db.insert(ratings).values({ userId, serverId, value: clamped })
  }

  return { success: true }
}

export async function getServerRating(serverId: string): Promise<{
  average: number
  count: number
}> {
  const result = await db
    .select({
      average: sql<number>`coalesce(avg(${ratings.value}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(ratings)
    .where(eq(ratings.serverId, serverId))
    .then((r: any) => r[0] ?? { average: 0, count: 0 })

  return { average: Number(result.average), count: Number(result.count) }
}

export async function voteReview(
  userId: string,
  reviewId: string,
  helpful: boolean
): Promise<{ success: boolean }> {
  const existing = await db
    .select({ id: reviewVotes.id, helpful: reviewVotes.helpful })
    .from(reviewVotes)
    .where(and(eq(reviewVotes.userId, userId), eq(reviewVotes.reviewId, reviewId)))
    .limit(1)
    .then((r: any) => r[0] ?? null)

  if (existing) {
    if (existing.helpful === helpful) {
      // Same vote — remove it (toggle off)
      await db.delete(reviewVotes).where(eq(reviewVotes.id, existing.id))
      await updateReviewVoteCounts(reviewId, helpful ? -1 : 0, helpful ? 0 : -1)
    } else {
      // Switching vote direction
      await db
        .update(reviewVotes)
        .set({ helpful })
        .where(eq(reviewVotes.id, existing.id))
      await updateReviewVoteCounts(reviewId, helpful ? 1 : -1, helpful ? -1 : 1)
    }
  } else {
    // New vote
    await db.insert(reviewVotes).values({ userId, reviewId, helpful })
    await updateReviewVoteCounts(reviewId, helpful ? 1 : 0, helpful ? 0 : 1)
  }

  return { success: true }
}

export async function getUserReview(
  userId: string,
  serverId: string
): Promise<typeof reviews.$inferSelect | null> {
  return db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.serverId, serverId)))
    .limit(1)
    .then((r: any) => r[0] ?? null)
}

export async function deleteReview(
  userId: string,
  reviewId: string
): Promise<{ success: boolean }> {
  const review = await db
    .select({ userId: reviews.userId })
    .from(reviews)
    .where(eq(reviews.id, reviewId))
    .limit(1)
    .then((r: any) => r[0] ?? null)

  if (!review || review.userId !== userId) {
    return { success: false }
  }

  // Delete votes first (FK constraint)
  await db.delete(reviewVotes).where(eq(reviewVotes.reviewId, reviewId))
  await db.delete(reviews).where(eq(reviews.id, reviewId))

  return { success: true }
}
