import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, servers } from '@/lib/db'
import { or, like, desc, sql } from 'drizzle-orm'
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
  const rateLimitResponse = await apiRateLimit(rateLimits.search)(request)
  if (rateLimitResponse) return rateLimitResponse

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
  const searchPattern = `%${query}%`
  const lowerQuery = query.toLowerCase()

  const serverList = await db.select().from(servers)
    .where(
      or(
        like(servers.name, searchPattern),
        like(servers.description, searchPattern),
        like(servers.owner, searchPattern),
        // Tags is a JSON array — use json_each for robust tag matching in SQLite
        sql`EXISTS (SELECT 1 FROM json_each(${servers.tags}) WHERE json_each.value LIKE ${`%${lowerQuery}%`})`,
      )
    )
    .orderBy(desc(servers.stars))
    .limit(limit)

  return apiResponse(serverList)
}
