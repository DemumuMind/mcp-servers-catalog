'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function logSearchQuery(query: string, results: number, source: string = 'web') {
  const session = await auth()
  const userId = session?.user?.id || null

  await prisma.searchQuery.create({
    data: {
      query: query.trim().toLowerCase().slice(0, 200),
      results,
      userId,
      source,
    },
  })
}

export async function getSearchGaps(limit: number = 50) {
  // Queries with 0 results, grouped by query text, ordered by frequency
  const gaps = await prisma.$queryRaw<Array<{ query: string; count: bigint; lastSearch: Date }>>`
    SELECT query, COUNT(*) as count, MAX("createdAt") as "lastSearch"
    FROM "SearchQuery"
    WHERE results = 0
    GROUP BY query
    ORDER BY count DESC
    LIMIT ${limit}
  `

  return gaps.map((g) => ({
    query: g.query,
    count: Number(g.count),
    lastSearch: g.lastSearch,
  }))
}

export async function getTopSearches(limit: number = 20) {
  const searches = await prisma.$queryRaw<Array<{ query: string; count: bigint; avgResults: number }>>`
    SELECT query, COUNT(*) as count, AVG(results) as "avgResults"
    FROM "SearchQuery"
    GROUP BY query
    ORDER BY count DESC
    LIMIT ${limit}
  `

  return searches.map((s) => ({
    query: s.query,
    count: Number(s.count),
    avgResults: Number(s.avgResults),
  }))
}

export async function getSearchStats(since: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
  const [total, withResults, withoutResults] = await Promise.all([
    prisma.searchQuery.count({ where: { createdAt: { gte: since } } }),
    prisma.searchQuery.count({ where: { createdAt: { gte: since }, results: { gt: 0 } } }),
    prisma.searchQuery.count({ where: { createdAt: { gte: since }, results: 0 } }),
  ])

  return { total, withResults, withoutResults, gapRate: total > 0 ? (withoutResults / total) : 0 }
}
