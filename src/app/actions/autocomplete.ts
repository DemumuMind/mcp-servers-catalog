'use server'

import { prisma } from '@/lib/db'

export async function autocompleteServers(query: string, limit: number = 8) {
  if (!query || query.length < 2) return []

  const servers = await prisma.server.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { owner: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } },
      ],
    },
    take: limit,
    orderBy: { stars: 'desc' },
    select: {
      id: true,
      name: true,
      owner: true,
      repo: true,
      description: true,
      stars: true,
      category: true,
    },
  })

  // Also search tags and categories for suggestions
  const matchingTags = await prisma.server.findMany({
    where: {
      tags: { has: query },
      NOT: { id: { in: servers.map((s) => s.id) } },
    },
    take: limit - servers.length,
    orderBy: { stars: 'desc' },
    select: {
      id: true,
      name: true,
      owner: true,
      repo: true,
      description: true,
      stars: true,
      category: true,
    },
  })

  return [...servers, ...matchingTags]
}

export async function getPopularTags(limit: number = 10) {
  const result = await prisma.server.findMany({
    select: { tags: true },
  })

  const tagCounts: Record<string, number> = {}
  result.forEach((server) => {
    server.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}
