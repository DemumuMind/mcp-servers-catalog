import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, servers } from '@/lib/db'
import { eq, and, or, like, desc, asc, count, sql, SQL } from 'drizzle-orm'
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

function parseQueryParams(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries())
  return querySchema.safeParse(searchParams)
}

function buildWhereClause(
  search: string | undefined,
  category: string | undefined,
  tag: string | undefined,
  official: string | undefined,
  remote: string | undefined,
): SQL<unknown> | undefined {
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
    conditions.push(
      sql`EXISTS (SELECT 1 FROM json_each(${servers.tags}) WHERE json_each.value = ${tag})`
    )
  }
  if (official === 'true') conditions.push(eq(servers.isOfficial, true))
  if (remote === 'true') conditions.push(eq(servers.isRemote, true))

  return conditions.length > 0 ? and(...conditions) : undefined
}

async function fetchServers(whereClause: SQL<unknown> | undefined, sort: string, order: string, limit: number, offset: number) {
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

  return { serverList, total: totalResult?.total ?? 0 }
}

function formatResponse(
  serverList: Awaited<ReturnType<typeof fetchServers>>['serverList'],
  total: number,
  page: number,
  limit: number,
  baseUrl: string,
  search: string | undefined,
  category: string | undefined,
  tag: string | undefined,
  official: string | undefined,
  remote: string | undefined,
  sort: string,
  order: string,
) {
  const totalPages = Math.ceil(total / limit)
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

  const rateLimitLimit = rateLimits.api.maxRequests
  const rateLimitRemaining = Math.max(0, rateLimitLimit - 1)

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

export async function GET(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(rateLimits.api)(request)
  if (rateLimitResponse) return rateLimitResponse

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

  const parsed = parseQueryParams(request)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { page, limit, q: search, category, tag, official, remote, sort, order } = parsed.data
  const offset = (page - 1) * limit

  const whereClause = buildWhereClause(search, category, tag, official, remote)
  const { serverList, total } = await fetchServers(whereClause, sort, order, limit, offset)

  const baseUrl = new URL(request.url).origin
  return formatResponse(serverList, total, page, limit, baseUrl, search, category, tag, official, remote, sort, order)
}
