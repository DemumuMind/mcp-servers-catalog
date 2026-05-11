'use server'

import { prisma } from '@/lib/db'
import { rateLimit, getClientIP } from '@/lib/rate-limit'
import { getCacheKey, getCache, setCache, delCachePattern } from '@/lib/cache'
import DOMPurify from 'isomorphic-dompurify'
import { Server } from '@prisma/client'

const ITEMS_PER_PAGE = 12

export interface ServerWithRating extends Server {
  avgRating: number | null
  ratingCount: number
}

export interface ServersPublicResult {
  servers: ServerWithRating[]
  total: number
  pages: number
  currentPage: number
}

function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'code', 'pre'], ALLOWED_ATTR: ['href', 'target', 'rel'] })
}

export async function getServersPublic(
  page: number = 1,
  search?: string,
  category?: string,
  tag?: string,
  onlyOfficial?: boolean,
  onlyFeatured?: boolean,
  onlyRemote?: boolean,
  sortBy: string = 'featured',
): Promise<ServersPublicResult> {
  const cacheKey = getCacheKey('servers:list', { page, search, category, tag, onlyOfficial, onlyFeatured, onlyRemote, sortBy })
  const cached = getCache<ServersPublicResult>(cacheKey)
  if (cached) return cached

  const skip = (page - 1) * ITEMS_PER_PAGE

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { owner: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (category) where.category = category
  if (tag) where.tags = { has: tag }
  if (onlyOfficial) where.isOfficial = true
  if (onlyFeatured) where.featured = true
  if (onlyRemote) where.isRemote = true

  // Sort order mapping
  const orderMap: Record<string, any> = {
    'featured': { featured: 'desc' },
    'newest': { createdAt: 'desc' },
    'stars': { stars: 'desc' },
    'rating': { createdAt: 'desc' }, // Will sort by rating manually if needed
    'alphabetical': { name: 'asc' as const },
    'trending': { createdAt: 'desc' }, // Will compute trend score
  }

  const orderBy = orderMap[sortBy] || { featured: 'desc' }

  const servers = await prisma.server.findMany({
    where,
    orderBy,
    skip,
    take: ITEMS_PER_PAGE,
  })

  const total = await prisma.server.count({ where })

  // Fetch ratings aggregation for these servers
  const serverIds = servers.map((s) => s.id)
  const ratingsAgg = serverIds.length > 0
    ? await prisma.rating.groupBy({
        by: ['serverId'],
        where: { serverId: { in: serverIds } },
        _avg: { value: true },
        _count: { value: true },
      })
    : []

  const ratingMap = new Map(ratingsAgg.map((r) => [r.serverId, { avg: r._avg.value, count: r._count.value }]))

  const serversWithRating = servers.map((server) => ({
    ...server,
    avgRating: ratingMap.get(server.id)?.avg ?? null,
    ratingCount: ratingMap.get(server.id)?.count ?? 0,
  }))

  const result = {
    servers: serversWithRating,
    total,
    pages: Math.ceil(total / ITEMS_PER_PAGE),
    currentPage: page,
  }

  setCache(cacheKey, result, 300) // 5 minutes
  return result
}

export async function getClientsPublic(
  page: number = 1,
  search?: string,
  onlyFeatured?: boolean
) {
  const skip = (page - 1) * ITEMS_PER_PAGE

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (onlyFeatured) where.featured = true

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.client.count({ where }),
  ])

  return {
    clients,
    total,
    pages: Math.ceil(total / ITEMS_PER_PAGE),
    currentPage: page,
  }
}

export async function getServerCategories() {
  const result = await prisma.server.groupBy({
    by: ['category'],
    _count: { category: true },
    orderBy: { _count: { category: 'desc' } },
  })
  return result.map((r) => ({ name: r.category, count: r._count.category }))
}

export async function getServerTags() {
  const servers = await prisma.server.findMany({ select: { tags: true } })
  const tagCounts: Record<string, number> = {}
  servers.forEach((s) => {
    s.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })
  return Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50)
}

export async function toggleBookmark(userId: string, serverId: string) {
  const existing = await prisma.bookmark.findUnique({
    where: { userId_serverId: { userId, serverId } },
  })

  if (existing) {
    await prisma.bookmark.delete({
      where: { userId_serverId: { userId, serverId } },
    })
    return { bookmarked: false }
  } else {
    await prisma.bookmark.create({
      data: { userId, serverId },
    })
    return { bookmarked: true }
  }
}

export async function getUserBookmarks(userId: string) {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: { server: true },
    orderBy: { createdAt: 'desc' },
  })
  return bookmarks.map((b) => b.server)
}

export async function isServerBookmarked(userId: string, serverId: string): Promise<boolean> {
  const bookmark = await prisma.bookmark.findUnique({
    where: { userId_serverId: { userId, serverId } },
  })
  return !!bookmark
}

export async function rateServer(userId: string, serverId: string, value: number) {
  if (value < 1 || value > 5) throw new Error('Rating must be between 1 and 5')

  await prisma.rating.upsert({
    where: { userId_serverId: { userId, serverId } },
    update: { value },
    create: { userId, serverId, value },
  })

  const avg = await prisma.rating.aggregate({
    where: { serverId },
    _avg: { value: true },
    _count: { value: true },
  })

  return { average: avg._avg.value || 0, count: avg._count.value }
}

export async function getServerRating(serverId: string) {
  const avg = await prisma.rating.aggregate({
    where: { serverId },
    _avg: { value: true },
    _count: { value: true },
  })

  const userRating = null // Will be fetched separately if needed

  return { average: avg._avg.value || 0, count: avg._count.value, userRating }
}

export async function addComment(userId: string, serverId: string, content: string) {
  const rateLimitResult = await rateLimit(`comment:${userId}`, 10, 60 * 1000)
  if (!rateLimitResult.success) {
    throw new Error('Слишком много комментариев. Попробуйте позже.')
  }

  const sanitizedContent = sanitizeHtml(content)

  const comment = await prisma.comment.create({
    data: { userId, serverId, content: sanitizedContent },
    include: { user: { select: { name: true, image: true } } },
  })

  return comment
}

export async function getServerComments(serverId: string, isAdmin = false) {
  return prisma.comment.findMany({
    where: { 
      serverId,
      ...(isAdmin ? {} : { isModerated: true }),
    },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function searchServers(query: string, limit = 20): Promise<Server[]> {
  const cacheKey = getCacheKey('servers:search', { query, limit })
  const cached = getCache<Server[]>(cacheKey)
  if (cached) return cached

  const searchLower = query.toLowerCase()
  
  const servers = await prisma.server.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { owner: { contains: query, mode: 'insensitive' } },
        { tags: { has: searchLower } },
      ],
    },
    take: limit,
  })

  // Simple ranking: exact name match > name contains > description contains > tags > owner
  const ranked = servers.sort((a, b) => {
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()
    const aDesc = a.description.toLowerCase()
    const bDesc = b.description.toLowerCase()
    
    const aExact = aName === searchLower ? 4 : 0
    const bExact = bName === searchLower ? 4 : 0
    const aNameMatch = aName.includes(searchLower) ? 3 : 0
    const bNameMatch = bName.includes(searchLower) ? 3 : 0
    const aDescMatch = aDesc.includes(searchLower) ? 2 : 0
    const bDescMatch = bDesc.includes(searchLower) ? 2 : 0
    const aTagMatch = a.tags.some(t => t.toLowerCase().includes(searchLower)) ? 1 : 0
    const bTagMatch = b.tags.some(t => t.toLowerCase().includes(searchLower)) ? 1 : 0
    
    const aScore = aExact + aNameMatch + aDescMatch + aTagMatch
    const bScore = bExact + bNameMatch + bDescMatch + bTagMatch
    
    return bScore - aScore
  })

  // Log search query for analytics
  const { logSearchQuery } = await import('./search-analytics')
  await logSearchQuery(query, ranked.length)

  setCache(cacheKey, ranked, 180) // 3 minutes
  return ranked
}

export async function getTrendingServers(limit = 6): Promise<Server[]> {
  const cacheKey = getCacheKey('servers:trending', { limit })
  const cached = getCache<Server[]>(cacheKey)
  if (cached) return cached

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [views, bookmarks, ratings] = await Promise.all([
    prisma.viewHistory.groupBy({
      by: ['serverId'],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: { serverId: true },
    }),
    prisma.bookmark.groupBy({
      by: ['serverId'],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: { serverId: true },
    }),
    prisma.rating.groupBy({
      by: ['serverId'],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: { serverId: true },
    }),
  ])

  const scoreMap = new Map<string, number>()

  views.forEach((v) => {
    scoreMap.set(v.serverId, (scoreMap.get(v.serverId) || 0) + v._count.serverId * 1)
  })
  bookmarks.forEach((b) => {
    scoreMap.set(b.serverId, (scoreMap.get(b.serverId) || 0) + b._count.serverId * 3)
  })
  ratings.forEach((r) => {
    scoreMap.set(r.serverId, (scoreMap.get(r.serverId) || 0) + r._count.serverId * 2)
  })

  const sorted = Array.from(scoreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  let result
  if (sorted.length === 0) {
    // Fallback: return featured servers
    result = await prisma.server.findMany({
      where: { featured: true },
      take: limit,
    })
  } else {
    const servers = await prisma.server.findMany({
      where: { id: { in: sorted } },
    })

    // Sort by score order
    result = sorted.map((id) => servers.find((s) => s.id === id)).filter((s): s is Server => !!s)
  }

  setCache(cacheKey, result, 600) // 10 minutes
  return result
}

export async function getRelatedServers(serverId: string, category: string, tags: string[], limit = 4) {
  return prisma.server.findMany({
    where: {
      id: { not: serverId },
      OR: [
        { category },
        { tags: { hasSome: tags } },
      ],
    },
    take: limit,
  })
}

export async function getServersByIds(ids: string[]) {
  if (ids.length === 0) return []
  return prisma.server.findMany({
    where: { id: { in: ids } },
  })
}

export async function deleteComment(id: string, userId: string) {
  const comment = await prisma.comment.findUnique({ where: { id } })
  if (!comment || comment.userId !== userId) {
    throw new Error('Unauthorized')
  }
  await prisma.comment.delete({ where: { id } })
}
