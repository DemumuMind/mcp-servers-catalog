import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { servers, healthChecks, notifications } from '@/lib/db/schema'
import { eq, and, gte, isNotNull, sql } from 'drizzle-orm'
import { createNotification } from '@/app/actions/notifications'
import { verifyCronAuth } from '@/lib/cron-auth'

export async function GET(req: NextRequest) {
  const unauthorized = verifyCronAuth(req)
  if (unauthorized) return unauthorized

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

  try {
    // Find servers with health checks that have been offline for 3+ days
    const offlineServers = await db
      .select({
        serverId: servers.id,
        name: servers.name,
        authorId: servers.authorId,
      })
      .from(servers)
      .where(
        and(
          eq(servers.isRemote, true),
          isNotNull(servers.authorId),
          // NOT EXISTS: no online health check in last 3 days
          sql`NOT EXISTS (
            SELECT 1 FROM "HealthCheck" hc
            WHERE hc."serverId" = ${servers.id}
              AND hc."status" = 'online'
              AND hc."createdAt" >= ${threeDaysAgo}
          )`,
          // EXISTS: some health check exists in last 3 days
          sql`EXISTS (
            SELECT 1 FROM "HealthCheck" hc
            WHERE hc."serverId" = ${servers.id}
              AND hc."createdAt" >= ${threeDaysAgo}
          )`
        )
      )

    let notificationsSent = 0

    for (const server of offlineServers) {
      if (!server.authorId) continue

      // Check if we already sent notification today
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const existing = await db.select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, server.authorId),
            eq(notifications.type, 'health_alert'),
            eq(notifications.link, `/servers/${server.serverId}`),
            gte(notifications.createdAt, oneDayAgo)
          )
        )
        .get()

      if (existing) continue

      await createNotification({
        userId: server.authorId,
        type: 'health_alert',
        title: 'Server offline',
        message: `Your server "${server.name}" has been offline for 3+ days. Please check the endpoint.`,
        link: `/servers/${server.serverId}`,
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
    return NextResponse.json({ error: 'Health alerts cron failed' }, { status: 500 })
  }
}
