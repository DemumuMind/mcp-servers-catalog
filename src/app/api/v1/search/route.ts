import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/app/actions/api-keys'
import { apiRateLimit, rateLimits } from '@/lib/api-rate-limit'

const querySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().min(1).max(50).default(20),
})

function apiResponse(data: unknown, status = 200) {
  return NextResponse.json(
    { data },
    {
      status,
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
        'Deprecation': 'true',
        'Sunset': 'Sat, 01 Jan 2028 00:00:00 GMT',
      },
    }
  )
}

export async function GET(request: NextRequest) {
  // Rate limit
  const rateLimitResponse = await apiRateLimit(rateLimits.search)(request)
  if (rateLimitResponse) return rateLimitResponse

  // Check API key if provided
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const key = authHeader.slice(7)
    const result = await validateApiKey(key)
    if (!result.valid) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }
  }

  const { searchParams } = new URL(request.url)
  const rawParams = Object.fromEntries(searchParams.entries())
  const parsed = querySchema.safeParse(rawParams)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { q: query, limit } = parsed.data

  const servers = await prisma.server.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { owner: { contains: query, mode: 'insensitive' } },
        { tags: { has: query.toLowerCase() } },
      ],
    },
    take: limit,
    orderBy: { stars: 'desc' },
  })

  return apiResponse(servers)
}
