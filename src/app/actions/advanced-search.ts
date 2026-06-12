'use server'

import { db, servers } from '@/lib/db'
import { eq, and, or, like, desc, gte, lte, inArray, isNotNull, count, sql } from 'drizzle-orm'
import { fetchRatingMap } from '@/lib/action-helpers'
import { ITEMS_PER_PAGE, getServerCategoriesAgg } from './public-helpers'

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

  const ratingMap = await fetchRatingMap(serverIds)

  let filteredServers = serverRows.map((server: any) => ({
    ...server,
    avgRating: ratingMap.get(server.id)?.avg ?? null,
    ratingCount: ratingMap.get(server.id)?.count ?? 0,
  }))

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
  const agg = await getServerCategoriesAgg()
  return agg.map((c: any) => c.name).sort()
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
