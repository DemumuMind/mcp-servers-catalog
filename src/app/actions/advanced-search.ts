'use server'

import { db, servers, ratings } from '@/lib/db'
import { eq, and, or, like, desc, gte, lte, inArray, isNotNull, count, avg, sql } from 'drizzle-orm'

const ITEMS_PER_PAGE = 12

export async function advancedSearchServers(params: {
  page?: number
  search?: string
  categories?: string[]
  minStars?: number
  maxStars?: number
  onlyRemote?: boolean
  onlyOfficial?: boolean
  minRating?: number
  languages?: string[]
  hasEndpoint?: boolean
}) {
  const page = params.page || 1
  const offset = (page - 1) * ITEMS_PER_PAGE

  const conditions = []

  if (params.search) {
    conditions.push(
      or(
        like(servers.name, `%${params.search}%`),
        like(servers.description, `%${params.search}%`),
        like(servers.owner, `%${params.search}%`),
      )
    )
  }

  if (params.categories?.length) {
    conditions.push(inArray(servers.category, params.categories))
  }

  if (params.minStars !== undefined) {
    conditions.push(gte(servers.stars, params.minStars))
  }
  if (params.maxStars !== undefined) {
    conditions.push(lte(servers.stars, params.maxStars))
  }

  if (params.onlyRemote) {
    conditions.push(eq(servers.isRemote, true))
  }
  if (params.onlyOfficial) {
    conditions.push(eq(servers.isOfficial, true))
  }

  if (params.hasEndpoint) {
    conditions.push(isNotNull(servers.endpoint))
  }

  if (params.languages?.length) {
    // Languages stored in tags (JSON array) — use json_each to check
    conditions.push(
      sql`EXISTS (SELECT 1 FROM json_each(${servers.tags}) WHERE json_each.value IN (${sql.join(params.languages.map(l => sql`${l}`), sql`, `)})`
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const [serverRows, countResult] = await Promise.all([
    db
      .select()
      .from(servers)
      .where(whereClause)
      .orderBy(desc(servers.stars))
      .limit(ITEMS_PER_PAGE)
      .offset(offset),
    db
      .select({ total: count() })
      .from(servers)
      .where(whereClause),
  ])

  const total = countResult[0]?.total ?? 0
  const serverIds = serverRows.map((s: any) => s.id)

  // Aggregate ratings per server
  const ratingsAgg: { serverId: number; avgValue: number | null; countValue: number }[] = serverIds.length > 0
    ? await db
        .select({
          serverId: ratings.serverId,
          avgValue: avg(ratings.value),
          countValue: count(),
        })
        .from(ratings)
        .where(inArray(ratings.serverId, serverIds))
        .groupBy(ratings.serverId)
    : []

  const ratingMap: Map<number, { avg: number | null; count: number }> = new Map(
    ratingsAgg.map((r: any) => [r.serverId, { avg: r.avgValue, count: r.countValue }])
  )

  // Attach rating data to servers
  let filteredServers = serverRows.map((server: any) => ({
    ...server,
    avgRating: ratingMap.get(server.id)?.avg ?? null,
    ratingCount: ratingMap.get(server.id)?.count ?? 0,
  }))

  // Filter by minRating if specified
  if (params.minRating !== undefined) {
    filteredServers = filteredServers.filter((s: any) => (s.avgRating || 0) >= params.minRating!)
  }

  return {
    servers: filteredServers,
    total: filteredServers.length < serverRows.length ? filteredServers.length : total,
    pages: Math.ceil((filteredServers.length < serverRows.length ? filteredServers.length : total) / ITEMS_PER_PAGE),
    currentPage: page,
  }
}

export async function getServerCategories() {
  const result = await db
    .selectDistinct({ category: servers.category })
    .from(servers)

  return result.map((s: any) => s.category).sort()
}

export async function getServerLanguages() {
  const result = await db
    .select({ tags: servers.tags })
    .from(servers)

  const languages = new Set<string>()
  const langTags = ['typescript', 'python', 'go', 'rust', 'javascript', 'java', 'csharp', 'cpp', 'ruby', 'php']
  
  result.forEach((s: any) => {
    s.tags.forEach((tag: any) => {
      if (langTags.includes(tag.toLowerCase())) {
        languages.add(tag.toLowerCase())
      }
    })
  })
  
  return Array.from(languages).sort()
}
