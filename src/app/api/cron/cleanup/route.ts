import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function verifyCronAuth(req: Request): NextResponse | null {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  const urlSecret = new URL(req.url).searchParams.get('secret')
  const expected = process.env.CRON_SECRET

  if (!expected || expected === '') {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }

  if (token !== expected && urlSecret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}

export async function GET(request: Request) {
  const unauthorized = verifyCronAuth(request)
  if (unauthorized) return unauthorized

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  try {
    const [healthDeleted, viewDeleted] = await Promise.all([
      prisma.healthCheck.deleteMany({
        where: { createdAt: { lt: ninetyDaysAgo } },
      }),
      prisma.viewHistory.deleteMany({
        where: { createdAt: { lt: ninetyDaysAgo } },
      }),
    ])

    return NextResponse.json({
      success: true,
      deleted: {
        healthChecks: healthDeleted.count,
        viewHistory: viewDeleted.count,
      },
      olderThan: ninetyDaysAgo.toISOString(),
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
