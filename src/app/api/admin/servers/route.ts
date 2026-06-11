import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { servers } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  // Simple auth check - verify session cookie exists
  const sessionToken = req.cookies.get('authjs.session-token')?.value
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
      featured: featured || false,
      stars: stars || 0,
      forks: forks || 0,
    }).returning()

    return NextResponse.json({ id: server[0].id, fullSlug: server[0].fullSlug }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create server' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get('authjs.session-token')?.value
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await db.select({ count: count() }).from(servers).get()
  return NextResponse.json({ count: result?.count ?? 0 })
}
