'use server'

import { prisma } from '@/lib/db'

// Simple spam detection
const SPAM_WORDS = ['casino', 'viagra', 'buy now', 'click here', 'earn money', 'free money', 'act now']

export async function detectSpam(content: string): Promise<{ isSpam: boolean; reason?: string }> {
  const lower = content.toLowerCase()
  
  // Check for spam words
  const foundWords = SPAM_WORDS.filter(word => lower.includes(word))
  if (foundWords.length > 0) {
    return { isSpam: true, reason: `Contains spam words: ${foundWords.join(', ')}` }
  }
  
  // Check for excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
  if (capsRatio > 0.7 && content.length > 10) {
    return { isSpam: true, reason: 'Excessive capitalization' }
  }
  
  // Check for excessive links
  const linkCount = (content.match(/https?:\/\//g) || []).length
  if (linkCount > 2) {
    return { isSpam: true, reason: 'Too many links' }
  }
  
  return { isSpam: false }
}

// Vote actions
export async function voteServer(userId: string, serverId: string, value: number) {
  if (value !== 1 && value !== -1) throw new Error('Vote must be 1 or -1')
  
  await prisma.vote.upsert({
    where: { userId_serverId: { userId, serverId } },
    update: { value },
    create: { userId, serverId, value },
  })
  
  // Update vote count
  const votes = await prisma.vote.aggregate({
    where: { serverId },
    _sum: { value: true },
  })
  
  return { success: true, total: votes._sum.value || 0 }
}

// Collection actions
export async function createCollection(userId: string, name: string) {
  return prisma.collection.create({
    data: { userId, name },
  })
}

export async function getUserCollections(userId: string) {
  return prisma.collection.findMany({
    where: { userId },
    include: { bookmarks: { include: { server: true } } },
  })
}

export async function addBookmarkToCollection(bookmarkId: string, collectionId: string) {
  return prisma.bookmark.update({
    where: { id: bookmarkId },
    data: { collectionId },
  })
}

// Digest subscription
export async function subscribeToDigest(
  userId: string, 
  frequency: 'daily' | 'weekly' = 'weekly',
  category?: string | null
) {
  return prisma.digestSubscription.upsert({
    where: { userId },
    update: { frequency, active: true, category },
    create: { userId, frequency, category },
  })
}

export async function getDigestSubscribers() {
  return prisma.digestSubscription.findMany({
    where: { active: true },
    include: { user: { select: { email: true, name: true } } },
  })
}
