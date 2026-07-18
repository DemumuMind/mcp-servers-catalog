import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { servers } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq, count } from 'drizzle-orm'

async function authorizeAdmin(): Promise<NextResponse | null> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

export async function POST(req: NextRequest) {
  const authorizationError = await authorizeAdmin()
  if (authorizationError) return authorizationError

  try {
    const body = await req.json()
    const {
      name,
      description,
      owner,
      repo,
      category,
      githubUrl,
      tags,
      isOfficial,
      isRemote,
      authType,
      endpoint,
      featured,
      stars,
      forks,
    } = body

    if (!name || !owner || !repo || !githubUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const fullSlug = `${owner}/${repo}`.toLowerCase()

    // Check if already exists
    const existing = await db.select().from(servers).where(eq(servers.fullSlug, fullSlug)).get()
    if (existing) {
      return NextResponse.json({ error: 'Server already exists', id: existing.id }, { status: 409 })
    }

    const server = await db.insert(servers).values({
      name,
      description: description || `${name} MCP server`,
      owner,
      repo,
      fullSlug,
      category: category || 'tools',
      githubUrl,
      tags: tags || [],
      isOfficial: isOfficial || false,
      isRemote: isRemote || false,
      authType: authType || null,
      endpoint: endpoint || null,
      featured: featured || false,
      stars: stars || 0,
      forks: forks || 0,
    }).returning()

    return NextResponse.json({ id: server[0].id, fullSlug: server[0].fullSlug }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create server' }, { status: 500 })
  }
}

export async function GET() {
  const authorizationError = await authorizeAdmin()
  if (authorizationError) return authorizationError

  const result = await db.select({ count: count() }).from(servers).get()
  return NextResponse.json({ count: result?.count ?? 0 })
}
