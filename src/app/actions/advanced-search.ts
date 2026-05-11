'use server'

import { prisma } from '@/lib/db'

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
  const skip = (page - 1) * ITEMS_PER_PAGE

  const where: any = {}

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
      { owner: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  if (params.categories?.length) {
    where.category = { in: params.categories }
  }

  if (params.minStars !== undefined || params.maxStars !== undefined) {
    where.stars = {}
    if (params.minStars !== undefined) where.stars.gte = params.minStars
    if (params.maxStars !== undefined) where.stars.lte = params.maxStars
  }

  if (params.onlyRemote) where.isRemote = true
  if (params.onlyOfficial) where.isOfficial = true

  if (params.hasEndpoint) {
    where.endpoint = { not: null }
  }

  if (params.languages?.length) {
    // Languages stored in tags for now
    where.tags = { hasSome: params.languages }
  }

  const [servers, total] = await Promise.all([
    prisma.server.findMany({
      where,
      orderBy: { stars: 'desc' },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.server.count({ where }),
  ])

  // Fetch ratings for these servers
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

  // Filter by minRating if specified
  let filteredServers = servers.map((server) => ({
    ...server,
    avgRating: ratingMap.get(server.id)?.avg ?? null,
    ratingCount: ratingMap.get(server.id)?.count ?? 0,
  }))

  if (params.minRating !== undefined) {
    filteredServers = filteredServers.filter((s) => (s.avgRating || 0) >= params.minRating!)
  }

  return {
    servers: filteredServers,
    total: filteredServers.length < servers.length ? filteredServers.length : total,
    pages: Math.ceil((filteredServers.length < servers.length ? filteredServers.length : total) / ITEMS_PER_PAGE),
    currentPage: page,
  }
}

export async function getServerCategories() {
  const servers = await prisma.server.findMany({
    select: { category: true },
    distinct: ['category'],
  })
  return servers.map((s) => s.category).sort()
}

export async function getServerLanguages() {
  const servers = await prisma.server.findMany({
    select: { tags: true },
  })
  const languages = new Set<string>()
  const langTags = ['typescript', 'python', 'go', 'rust', 'javascript', 'java', 'csharp', 'cpp', 'ruby', 'php']
  
  servers.forEach((s) => {
    s.tags.forEach((tag) => {
      if (langTags.includes(tag.toLowerCase())) {
        languages.add(tag.toLowerCase())
      }
    })
  })
  
  return Array.from(languages).sort()
}
