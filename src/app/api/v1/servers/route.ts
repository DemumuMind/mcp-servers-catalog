import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/app/actions/api-keys'
import { apiRateLimit, rateLimits } from '@/lib/api-rate-limit'

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  q: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  official: z.enum(['true', 'false']).optional(),
})

function apiResponse(data: unknown, meta?: Record<string, unknown>, status = 200) {
  return NextResponse.json(
    { data, ...(meta ? { meta } : {}) },
    {
      status,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'Deprecation': 'true',
        'Sunset': 'Sat, 01 Jan 2028 00:00:00 GMT',
        'Link': '</api/v2/servers>; rel="successor-version"',
      },
    }
  )
}

export async function GET(request: NextRequest) {
  // Rate limit
  const rateLimitResponse = await apiRateLimit(rateLimits.api)(request)
  if (rateLimitResponse) return rateLimitResponse

  // Check API key if provided
  const authHeader = request.headers.get('authorization')
  let apiKeyUser = null
  
  if (authHeader?.startsWith('Bearer ')) {
    const key = authHeader.slice(7)
    const result = await validateApiKey(key)
    if (result.valid) {
      apiKeyUser = result.userId
    } else {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries())
  const parsed = querySchema.safeParse(searchParams)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { page, limit, q: search, category, tag, official } = parsed.data
  const skip = (page - 1) * limit

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
  if (official === 'true') where.isOfficial = true

  const [servers, total] = await Promise.all([
    prisma.server.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        owner: true,
        repo: true,
        category: true,
        tags: true,
        isOfficial: true,
        stars: true,
        forks: true,
        githubUrl: true,
        createdAt: true,
      },
    }),
    prisma.server.count({ where }),
  ])

  return apiResponse(servers, {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  })
}
