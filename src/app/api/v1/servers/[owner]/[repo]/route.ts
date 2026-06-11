import { NextResponse } from 'next/server'
import { db, servers } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { validateApiKey } from '@/app/actions/api-keys'

function apiResponse(data: unknown, status = 200) {
  return NextResponse.json(
    { data },
    {
      status,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    }
  )
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params

  // Check API key if provided
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const key = authHeader.slice(7)
    const result = await validateApiKey(key)
    if (!result.valid) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }
  }

  const server = await db.select({
    id: servers.id,
    name: servers.name,
    description: servers.description,
    owner: servers.owner,
    repo: servers.repo,
    category: servers.category,
    tags: servers.tags,
    isOfficial: servers.isOfficial,
    isSponsored: servers.isSponsored,
    stars: servers.stars,
    forks: servers.forks,
    githubUrl: servers.githubUrl,
    isRemote: servers.isRemote,
    authType: servers.authType,
    endpoint: servers.endpoint,
    createdAt: servers.createdAt,
    updatedAt: servers.updatedAt,
  }).from(servers)
    .where(and(eq(servers.owner, owner), eq(servers.repo, repo)))
    .get()

  if (!server) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  return apiResponse(server)
}
