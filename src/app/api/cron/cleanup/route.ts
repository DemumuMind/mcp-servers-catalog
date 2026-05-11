import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
