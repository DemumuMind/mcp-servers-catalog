import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/app/actions/api-keys'

const paramsSchema = z.object({
  id: z.string().cuid(),
})

function apiResponse(data: unknown, status = 200) {
  return NextResponse.json(
    { data },
    {
      status,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'Deprecation': 'true',
        'Sunset': 'Sat, 01 Jan 2028 00:00:00 GMT',
        'Link': '</api/v2/servers/{id}>; rel="successor-version"',
      },
    }
  )
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const parsed = paramsSchema.safeParse({ id })
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid server ID', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // Check API key if provided
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const key = authHeader.slice(7)
    const result = await validateApiKey(key)
    if (!result.valid) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }
  }

  const server = await prisma.server.findUnique({
    where: { id: parsed.data.id },
    select: {
      id: true,
      name: true,
      description: true,
      owner: true,
      repo: true,
      category: true,
      tags: true,
      isOfficial: true,
      isSponsored: true,
      stars: true,
      forks: true,
      githubUrl: true,
      isRemote: true,
      authType: true,
      endpoint: true,
      createdAt: true,
    },
  })

  if (!server) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  return apiResponse(server)
}
