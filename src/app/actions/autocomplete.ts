'use server'

import { db, servers } from '@/lib/db'
import { or, desc, notInArray, sql, and } from 'drizzle-orm'

export async function autocompleteServers(query: string, limit: number = 8) {
  if (!query || query.length < 2) return []

  // Split into words for multi-word search
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const fields = [
    sql`LOWER(${servers.name})`,
    sql`LOWER(${servers.description})`,
    sql`LOWER(${servers.owner})`,
    sql`LOWER(${servers.repo})`,
  ]

  // Build WHERE: each word must match at least one field (AND across words, OR across fields)
  const wordConditions = words.map(word => {
    const term = `%${word}%`
    return or(
      ...fields.map(f => sql`${f} LIKE ${term}`),
      sql`EXISTS (SELECT 1 FROM json_each(${servers.tags}) WHERE LOWER(json_each.value) LIKE ${term})`,
    )
  })

  const serversResult = await db.select({
    id: servers.id,
    name: servers.name,
    owner: servers.owner,
    repo: servers.repo,
    description: servers.description,
    stars: servers.stars,
    category: servers.category,
  }).from(servers).where(
    and(...wordConditions)
  ).orderBy(desc(servers.stars)).limit(limit)

  // Also search tags and categories for suggestions
  const excludedIds = serversResult.map((s: any) => s.id)
  const matchingTags = excludedIds.length > 0
    ? await db.select({
        id: servers.id,
        name: servers.name,
        owner: servers.owner,
        repo: servers.repo,
        description: servers.description,
        stars: servers.stars,
        category: servers.category,
      }).from(servers).where(
        and(
          sql`EXISTS (SELECT 1 FROM json_each(${servers.tags}) WHERE json_each.value LIKE ${`%${query}%`})`,
          notInArray(servers.id, excludedIds)
        )
      ).orderBy(desc(servers.stars)).limit(Math.max(0, limit - serversResult.length))
    : await db.select({
        id: servers.id,
        name: servers.name,
        owner: servers.owner,
        repo: servers.repo,
        description: servers.description,
        stars: servers.stars,
        category: servers.category,
      }).from(servers).where(
        sql`EXISTS (SELECT 1 FROM json_each(${servers.tags}) WHERE json_each.value LIKE ${`%${query}%`})`
      ).orderBy(desc(servers.stars)).limit(limit - serversResult.length)

  return [...serversResult, ...matchingTags]
}

export async function getPopularTags(limit: number = 10) {
  const result = await db.select({ tags: servers.tags }).from(servers)

  const tagCounts: Record<string, number> = {}
  result.forEach((server: any) => {
    server.tags.forEach((tag: any) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}
