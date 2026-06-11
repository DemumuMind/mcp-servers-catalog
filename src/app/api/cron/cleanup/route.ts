import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { healthChecks, viewHistories } from '@/lib/db/schema'
import { lt } from 'drizzle-orm'
import { verifyCronAuth } from '@/lib/cron-auth'

export async function GET(request: NextRequest) {
  const unauthorized = verifyCronAuth(request)
  if (unauthorized) return unauthorized

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  try {
    const healthDeleted = await db.delete(healthChecks).where(lt(healthChecks.createdAt, ninetyDaysAgo)).run()
    const viewDeleted = await db.delete(viewHistories).where(lt(viewHistories.createdAt, ninetyDaysAgo)).run()

    return NextResponse.json({
      success: true,
      deleted: {
        healthChecks: healthDeleted.rowsAffected,
        viewHistory: viewDeleted.rowsAffected,
      },
      olderThan: ninetyDaysAgo.toISOString(),
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
