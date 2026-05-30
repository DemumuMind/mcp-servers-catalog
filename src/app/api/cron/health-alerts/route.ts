import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createNotification } from '@/app/actions/notifications'

function verifyCronAuth(req: NextRequest | Request): NextResponse | null {
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

export async function GET(req: NextRequest) {
  const unauthorized = verifyCronAuth(req)
  if (unauthorized) return unauthorized

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

  try {
    // Find servers with health checks that have been offline for 3+ days
    const offlineServers = await prisma.$queryRaw<Array<{ serverId: string; name: string; authorId: string | null }>>`
      SELECT s.id as "serverId", s.name, s."authorId"
      FROM "Server" s
      WHERE s."isRemote" = true
        AND s."authorId" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "HealthCheck" hc
          WHERE hc."serverId" = s.id
            AND hc.status = 'online'
            AND hc."createdAt" >= ${threeDaysAgo}
        )
        AND EXISTS (
          SELECT 1 FROM "HealthCheck" hc
          WHERE hc."serverId" = s.id
            AND hc."createdAt" >= ${threeDaysAgo}
        )
    `

    let notificationsSent = 0

    for (const server of offlineServers) {
      if (!server.authorId) continue

      // Check if we already sent notification today
      const existing = await prisma.notification.findFirst({
        where: {
          userId: server.authorId,
          type: 'health_alert',
          link: `/servers/${server.serverId}`,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      })

      if (existing) continue

      await createNotification({
        userId: server.authorId,
        type: 'health_alert',
        title: 'Сервер не отвечает',
        message: `Ваш сервер "${server.name}" не отвечает более 3 дней. Проверьте endpoint.`,
        link: `/ru/servers/${server.serverId}`,
      })

      notificationsSent++
    }

    return NextResponse.json({
      success: true,
      offlineServers: offlineServers.length,
      notificationsSent,
    })
  } catch (error: any) {
    console.error('Health alerts cron failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
