import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, servers } from '@/lib/db'
import { eq, and, or, like, desc, asc, count, sql } from 'drizzle-orm'
import { validateApiKey } from '@/app/actions/api-keys'
import { apiRateLimit, rateLimits } from '@/lib/api-rate-limit'

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  q: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  official: z.enum(['true', 'false']).optional(),
  remote: z.enum(['true', 'false']).optional(),
  sort: z.enum(['stars', 'createdAt', 'name', 'forks']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

function apiResponse(data: unknown, meta?: Record<string, unknown>, status = 200) {
  return NextResponse.json(
    { data, ...(meta ? { meta } : {}) },
    {
      status,
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
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
  let _apiKeyUser = null
  
  if (authHeader?.startsWith('Bearer ')) {
    const key = authHeader.slice(7)
    const result = await validateApiKey(key)
    if (result.valid) {
      _apiKeyUser = result.userId
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

  const { page, limit, q: search, category, tag, official, remote, sort, order } = parsed.data
  const offset = (page - 1) * limit

  const conditions = []

  if (search) {
    const searchPattern = `%${search}%`
    conditions.push(
      or(
        like(servers.name, searchPattern),
        like(servers.description, searchPattern),
        like(servers.owner, searchPattern),
      )!
    )
  }
  if (category) conditions.push(eq(servers.category, category))
  if (tag) {
    // Tags is a JSON array — use json_each for robust tag matching in SQLite
    conditions.push(
      sql`EXISTS (SELECT 1 FROM json_each(${servers.tags}) WHERE json_each.value = ${tag})`
    )
  }
  if (official === 'true') conditions.push(eq(servers.isOfficial, true))
  if (remote === 'true') conditions.push(eq(servers.isRemote, true))

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Determine sort order
  const sortColumn = {
    stars: servers.stars,
    createdAt: servers.createdAt,
    name: servers.name,
    forks: servers.forks,
  }[sort] ?? servers.createdAt

  const orderByClause = order === 'asc' ? asc(sortColumn) : desc(sortColumn)

  const [serverList, totalResult] = await Promise.all([
    db.select({
      id: servers.id,
      name: servers.name,
      description: servers.description,
      owner: servers.owner,
      repo: servers.repo,
      category: servers.category,
      tags: servers.tags,
      isOfficial: servers.isOfficial,
      isRemote: servers.isRemote,
      stars: servers.stars,
      forks: servers.forks,
      githubUrl: servers.githubUrl,
      createdAt: servers.createdAt,
    }).from(servers)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(servers)
      .where(whereClause)
      .get(),
  ])

  const total = totalResult?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  // Build Link header for pagination
  const baseUrl = new URL(request.url).origin
  const linkParts: string[] = []

  const buildPageUrl = (p: number) =>
    `${baseUrl}/api/v1/servers?page=${p}&limit=${limit}${category ? `&category=${category}` : ''}${tag ? `&tag=${tag}` : ''}${official ? `&official=${official}` : ''}${remote ? `&remote=${remote}` : ''}${search ? `&q=${encodeURIComponent(search)}` : ''}${sort !== 'createdAt' ? `&sort=${sort}` : ''}${order !== 'desc' ? `&order=${order}` : ''}`

  if (page > 1) {
    linkParts.push(`<${buildPageUrl(1)}>; rel="first"`)
    linkParts.push(`<${buildPageUrl(page - 1)}>; rel="prev"`)
  }
  if (page < totalPages) {
    linkParts.push(`<${buildPageUrl(page + 1)}>; rel="next"`)
    linkParts.push(`<${buildPageUrl(totalPages)}>; rel="last"`)
  }

  // Rate limit info headers (reflect the api rate limit: 100/min)
  const rateLimitLimit = rateLimits.api.maxRequests
  const rateLimitRemaining = Math.max(0, rateLimitLimit - 1) // Approximation — actual tracking is per-IP

  return NextResponse.json(
    {
      data: serverList,
      meta: { total, page, limit, pages: totalPages },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'Deprecation': 'true',
        'Sunset': 'Sat, 01 Jan 2028 00:00:00 GMT',
        'Link': '</api/v2/servers>; rel="successor-version"' + (linkParts.length > 0 ? `, ${linkParts.join(', ')}` : ''),
        'X-Total-Count': String(total),
        'X-RateLimit-Limit': String(rateLimitLimit),
        'X-RateLimit-Remaining': String(rateLimitRemaining),
      },
    }
  )
}
