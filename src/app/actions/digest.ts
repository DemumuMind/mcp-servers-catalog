'use server'

import { db, digestSubscriptions, users } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function subscribeDigest(
  userId: string,
  frequency: 'daily' | 'weekly' | 'monthly',
  category?: string
): Promise<{ success: boolean }> {
  const existing = await db
    .select({ id: digestSubscriptions.id, active: digestSubscriptions.active })
    .from(digestSubscriptions)
    .where(eq(digestSubscriptions.userId, userId))
    .limit(1)
    .then((r: any) => r[0] ?? null)

  if (existing) {
    await db
      .update(digestSubscriptions)
      .set({ frequency, active: true, category: category ?? null })
      .where(eq(digestSubscriptions.id, existing.id))
  } else {
    await db.insert(digestSubscriptions).values({
      userId,
      frequency,
      active: true,
      category: category ?? null,
    })
  }

  return { success: true }
}

export async function unsubscribeDigest(
  userId: string
): Promise<{ success: boolean }> {
  await db
    .update(digestSubscriptions)
    .set({ active: false })
    .where(eq(digestSubscriptions.userId, userId))

  return { success: true }
}

export async function updateDigestFrequency(
  userId: string,
  frequency: 'daily' | 'weekly' | 'monthly'
): Promise<{ success: boolean }> {
  await db
    .update(digestSubscriptions)
    .set({ frequency })
    .where(eq(digestSubscriptions.userId, userId))

  return { success: true }
}

export async function getUserDigest(
  userId: string
): Promise<typeof digestSubscriptions.$inferSelect | null> {
  return db
    .select()
    .from(digestSubscriptions)
    .where(eq(digestSubscriptions.userId, userId))
    .limit(1)
    .then((r: any) => r[0] ?? null)
}

export async function getDigestSubscribers(
  frequency?: 'daily' | 'weekly' | 'monthly',
  category?: string
): Promise<Array<{ userId: string; email: string }>> {
  const conditions = [eq(digestSubscriptions.active, true)]
  if (frequency) conditions.push(eq(digestSubscriptions.frequency, frequency))
  if (category) conditions.push(eq(digestSubscriptions.category, category))

  const rows = await db
    .select({
      userId: digestSubscriptions.userId,
      email: users.email,
    })
    .from(digestSubscriptions)
    .innerJoin(users, eq(digestSubscriptions.userId, users.id))
    .where(and(...conditions))

  return rows
}
