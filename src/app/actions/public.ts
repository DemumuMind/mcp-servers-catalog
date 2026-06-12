'use server'

import { db, servers, clients, bookmarks, ratings, comments, viewHistories, users, submissions } from '@/lib/db'
import { eq, and, or, like, desc, asc, count, avg, sql, inArray, gte, ne } from 'drizzle-orm'
import { rateLimit } from "@/lib/rate-limit";

// Check if a server already exists by owner/repo or fullSlug
export async function checkServerExists(owner: string, repo: string): Promise<{ exists: boolean; inCatalog: boolean; inSubmissions: boolean; serverUrl?: string }> {
  const fullSlug = `${owner}/${repo}`.toLowerCase()

  // Check servers table
  const serverMatch = await db.select({ id: servers.id, owner: servers.owner, repo: servers.repo })
    .from(servers)
    .where(sql`LOWER(${servers.fullSlug}) = ${fullSlug}`)
    .limit(1)

  // Check pending submissions
  const subMatch = await db.select({ id: submissions.id })
    .from(submissions)
    .where(and(
      sql`LOWER(${submissions.url}) LIKE ${`%${owner}/${repo}%`}`,
      eq(submissions.status, 'pending'),
    ))
    .limit(1)

  const inCatalog = serverMatch.length > 0
  const inSubmissions = subMatch.length > 0

  return {
    exists: inCatalog || inSubmissions,
    inCatalog,
    inSubmissions,
    serverUrl: inCatalog ? `/servers/${serverMatch[0].owner}/${serverMatch[0].repo}` : undefined,
  }
}
import { getCacheKey, getCache, setCache } from "@/lib/cache";
import { sanitizeUserHtml } from '@/lib/sanitize'

const ITEMS_PER_PAGE = 12

export interface ServerWithRating {
  id: string
  name: string
  description: string
  owner: string
  repo: string
  fullSlug: string
  category: string
  isOfficial: boolean
  isSponsored: boolean
  githubUrl: string
  tags: string[]
  isRemote: boolean
  authType: string | null
  endpoint: string | null
  featured: boolean
  featuredUntil: Date | null
  sponsoredUntil: Date | null
  stars: number
  forks: number
  authorId: string | null
  createdAt: Date
  updatedAt: Date
  avgRating: number | null
  ratingCount: number
}

export interface ServersPublicResult {
  servers: ServerWithRating[]
  total: number
  pages: number
  currentPage: number
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

  // Build where conditions
  const conditions = []
  if (search) {
    // Split into words and search each word separately (AND logic)
    const words = search.toLowerCase().split(/\s+/).filter(Boolean)
    if (words.length === 1) {
      const term = `%${words[0]}%`
      conditions.push(
        or(
          sql`LOWER(${servers.name}) LIKE ${term}`,
          sql`LOWER(${servers.description}) LIKE ${term}`,
          sql`LOWER(${servers.owner}) LIKE ${term}`,
          sql`LOWER(${servers.repo}) LIKE ${term}`,
          sql`EXISTS (SELECT 1 FROM json_each(${servers.tags}) WHERE LOWER(json_each.value) LIKE ${term})`,
        )
      )
    } else {
      // Multi-word: each word must match at least one field (AND across words)
      for (const word of words) {
        const term = `%${word}%`
        conditions.push(
          or(
            sql`LOWER(${servers.name}) LIKE ${term}`,
            sql`LOWER(${servers.description}) LIKE ${term}`,
            sql`LOWER(${servers.owner}) LIKE ${term}`,
            sql`LOWER(${servers.repo}) LIKE ${term}`,
            sql`EXISTS (SELECT 1 FROM json_each(${servers.tags}) WHERE LOWER(json_each.value) LIKE ${term})`,
          )
        )
      }
    }
  }
  if (category) conditions.push(eq(servers.category, category))
  if (tag) conditions.push(sql`EXISTS (SELECT 1 FROM json_each(${servers.tags}) WHERE json_each.value = ${tag})`)
  if (onlyOfficial) conditions.push(eq(servers.isOfficial, true))
  if (onlyFeatured) conditions.push(eq(servers.featured, true))
  if (onlyRemote) conditions.push(eq(servers.isRemote, true))

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Sort order mapping
  const orderByMap: Record<string, any[]> = {
    'featured': [desc(servers.featured)],
    'newest': [desc(servers.createdAt)],
    'stars': [desc(servers.stars)],
    'rating': [desc(servers.createdAt)], // Will sort by rating manually if needed
    'alphabetical': [asc(servers.name)],
    'trending': [desc(servers.createdAt)], // Will compute trend score
  }

  const orderByClause = orderByMap[sortBy] || [desc(servers.featured)]

  const serverRows = await db.select().from(servers).where(whereClause).orderBy(...orderByClause).offset(skip).limit(ITEMS_PER_PAGE)

  const totalResult = await db.select({ count: count() }).from(servers).where(whereClause)
  const total = totalResult[0]?.count ?? 0

  const serverIds = serverRows.map((s: any) => s.id)
  const ratingsAgg = serverIds.length > 0
    ? (await db.select({
        serverId: ratings.serverId,
        avg: avg(ratings.value),
        count: count(),
      }).from(ratings).where(inArray(ratings.serverId, serverIds)).groupBy(ratings.serverId)) as any[]
    : []

  const ratingMap: Map<number, { avg: number | null; count: number }> = new Map(ratingsAgg.map((r: any) => [r.serverId, { avg: r.avg, count: r.count }]))

  const serversWithRating = serverRows.map((server: any) => ({
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

  const conditions = []
  if (search) {
    conditions.push(
      or(
        like(clients.name, `%${search}%`),
        like(clients.description, `%${search}%`),
      )
    )
  }
  if (onlyFeatured) conditions.push(eq(clients.featured, true))

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const [clientRows, totalResult] = await Promise.all([
    db.select().from(clients).where(whereClause).orderBy(desc(clients.createdAt)).offset(skip).limit(ITEMS_PER_PAGE),
    db.select({ count: count() }).from(clients).where(whereClause),
  ])

  const total = totalResult[0]?.count ?? 0

  return {
    clients: clientRows,
    total,
    pages: Math.ceil(total / ITEMS_PER_PAGE),
    currentPage: page,
  }
}

export async function getServerCategories() {
  const result = await db.select({
    category: servers.category,
    count: count(),
  }).from(servers).groupBy(servers.category).orderBy(desc(count()))

  return result.map((r: any) => ({ name: r.category, count: r.count }))
}

export async function getServerTags() {
  // Use raw libsql client for fast SQL aggregation (drizzle doesn't have .execute for turso)
  const { getClient } = await import('@/lib/db')
  const client = getClient()
  const result = await client.execute({
    sql: `SELECT json_each.value AS name, COUNT(*) AS count
          FROM Server, json_each(Server.tags)
          GROUP BY json_each.value
          ORDER BY count DESC
          LIMIT 50`,
    args: [],
  })
  return result.rows.map((row: any) => ({ name: String(row.name), count: Number(row.count) }))
}

export async function toggleBookmark(userId: string, serverId: string) {
  const existing = await db.select().from(bookmarks).where(
    and(eq(bookmarks.userId, userId), eq(bookmarks.serverId, serverId))
  ).limit(1).then((r: any) => r[0] ?? null)

  if (existing) {
    await db.delete(bookmarks).where(
      and(eq(bookmarks.userId, userId), eq(bookmarks.serverId, serverId))
    )
    return { bookmarked: false }
  } else {
    await db.insert(bookmarks).values({ userId, serverId })
    return { bookmarked: true }
  }
}

export async function getUserBookmarks(userId: string) {
  const bookmarkRows = await db.select({
    serverId: bookmarks.serverId,
    createdAt: bookmarks.createdAt,
    server: servers,
  }).from(bookmarks)
    .innerJoin(servers, eq(bookmarks.serverId, servers.id))
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt))

  return bookmarkRows.map((b: any) => b.server)
}

export async function isServerBookmarked(userId: string, serverId: string): Promise<boolean> {
  const bookmark = await db.select().from(bookmarks).where(
    and(eq(bookmarks.userId, userId), eq(bookmarks.serverId, serverId))
  ).limit(1).then((r: any) => r[0] ?? null)
  return !!bookmark
}

export async function rateServer(userId: string, serverId: string, value: number) {
  if (value < 1 || value > 5) throw new Error('Rating must be between 1 and 5')

  await db.insert(ratings).values({ userId, serverId, value })
    .onConflictDoUpdate({
      target: [ratings.userId, ratings.serverId],
      set: { value },
    })

  const aggResult = await db.select({
    avg: avg(ratings.value),
    count: count(),
  }).from(ratings).where(eq(ratings.serverId, serverId))

  return { average: aggResult[0]?.avg || 0, count: aggResult[0]?.count ?? 0 }
}

export async function getServerRating(serverId: string) {
  const aggResult = await db.select({
    avg: avg(ratings.value),
    count: count(),
  }).from(ratings).where(eq(ratings.serverId, serverId))

  const userRating = null // Will be fetched separately if needed

  return { average: aggResult[0]?.avg || 0, count: aggResult[0]?.count ?? 0, userRating }
}

export async function addComment(userId: string, serverId: string, content: string) {
  const rateLimitResult = await rateLimit(`comment:${userId}`, 10, 60 * 1000)
  if (!rateLimitResult.success) {
    throw new Error('RATE_LIMIT_COMMENTS')
  }

  const sanitizedContent = sanitizeUserHtml(content)

  const commentRow = await db.insert(comments).values({ userId, serverId, content: sanitizedContent }).returning().then((r: any) => r[0])

  // Fetch with user info via join
  const commentWithUser = await db.select({
    ...comments,
    userName: users.name,
    userImage: users.image,
  } as any).from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.id, commentRow.id))
    .limit(1).then((r: any) => r[0] ?? null)

  // Map to the shape expected by consumers (include nested user object)
  if (!commentWithUser) return commentRow
  const { userName, userImage, ...commentData } = commentWithUser
  return {
    ...commentData,
    user: { name: userName, image: userImage },
  }
}

export async function getServerComments(serverId: string, isAdmin = false) {
  const conditions = [eq(comments.serverId, serverId)]
  if (!isAdmin) conditions.push(eq(comments.isModerated, true))

  const commentRows = await db.select({
    ...comments,
    userName: users.name,
    userImage: users.image,
  } as any).from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(comments.createdAt))

  // Map to include nested user object
  return commentRows.map(({ userName, userImage, ...commentData }: any) => ({
    ...commentData,
    user: { name: userName, image: userImage },
  }))
}

export async function searchServers(query: string, limit = 20) {
  const cacheKey = getCacheKey('servers:search', { query, limit })
  const cached = getCache<any[]>(cacheKey)
  if (cached) return cached

  const searchLower = query.toLowerCase()

  const serverRows = await db.select().from(servers).where(
    or(
      like(servers.name, `%${query}%`),
      like(servers.description, `%${query}%`),
      like(servers.owner, `%${query}%`),
      sql`EXISTS (SELECT 1 FROM json_each(${servers.tags}) WHERE json_each.value LIKE ${`%${searchLower}%`})`,
    )
  ).limit(limit)

  // Simple ranking: exact name match > name contains > description contains > tags > owner
  const ranked = serverRows.sort((a: any, b: any) => {
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
    const aTagMatch = a.tags.some((t: any) => t.toLowerCase().includes(searchLower)) ? 1 : 0
    const bTagMatch = b.tags.some((t: any) => t.toLowerCase().includes(searchLower)) ? 1 : 0

    const aScore = aExact + aNameMatch + aDescMatch + aTagMatch
    const bScore = bExact + bNameMatch + bDescMatch + bTagMatch

    return bScore - aScore
  })

  const { logSearchQuery } = await import('./search-analytics')
  await logSearchQuery(query, ranked.length)

  setCache(cacheKey, ranked, 180) // 3 minutes
  return ranked
}

export async function getTrendingServers(limit = 6) {
  const cacheKey = getCacheKey('servers:trending', { limit })
  const cached = getCache<any[]>(cacheKey)
  if (cached) return cached

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [views, bookmarkAgg, ratingAgg] = await Promise.all([
    db.select({
      serverId: viewHistories.serverId,
      count: count(),
    }).from(viewHistories).where(gte(viewHistories.createdAt, sevenDaysAgo)).groupBy(viewHistories.serverId),
    db.select({
      serverId: bookmarks.serverId,
      count: count(),
    }).from(bookmarks).where(gte(bookmarks.createdAt, sevenDaysAgo)).groupBy(bookmarks.serverId),
    db.select({
      serverId: ratings.serverId,
      count: count(),
    }).from(ratings).where(gte(ratings.createdAt, sevenDaysAgo)).groupBy(ratings.serverId),
  ])

  const scoreMap = new Map<string, number>()

  views.forEach((v: any) => {
    scoreMap.set(v.serverId, (scoreMap.get(v.serverId) || 0) + v.count * 1)
  })
  bookmarkAgg.forEach((b: any) => {
    scoreMap.set(b.serverId, (scoreMap.get(b.serverId) || 0) + b.count * 3)
  })
  ratingAgg.forEach((r: any) => {
    scoreMap.set(r.serverId, (scoreMap.get(r.serverId) || 0) + r.count * 2)
  })

  const sorted = Array.from(scoreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  let result
  if (sorted.length === 0) {
    // Fallback: return featured servers
    result = await db.select().from(servers).where(eq(servers.featured, true)).limit(limit)
  } else {
    const serverRows = await db.select().from(servers).where(inArray(servers.id, sorted))

    // Sort by score order
    result = sorted.map((id) => serverRows.find((s: any) => s.id === id)).filter((s): s is typeof serverRows[0] => !!s)
  }

  setCache(cacheKey, result, 600) // 10 minutes
  return result
}

export async function getRelatedServers(serverId: string, category: string, tags: string[], limit = 4) {
  // SQLite/Turso: use json_each for array overlap (replaces PostgreSQL && operator)
  const tagsOverlap = tags.length > 0
    ? sql`EXISTS (SELECT 1 FROM json_each(${servers.tags}) WHERE json_each.value IN (${sql.join(tags.map(t => sql`${t}`), sql`, `)}))`
    : sql`false`
  return db.select().from(servers).where(
    and(
      ne(servers.id, serverId),
      or(
        eq(servers.category, category),
        tagsOverlap,
      ),
    )
  ).limit(limit)
}

export async function getServersByIds(ids: string[]) {
  if (ids.length === 0) return []
  return db.select().from(servers).where(inArray(servers.id, ids))
}

export async function deleteComment(id: string, userId: string) {
  const comment = await db.select().from(comments).where(eq(comments.id, id)).limit(1).then((r: any) => r[0] ?? null)
  if (!comment || comment.userId !== userId) {
    throw new Error('Unauthorized')
  }
  await db.delete(comments).where(eq(comments.id, id))
}
