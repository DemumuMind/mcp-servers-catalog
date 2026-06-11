import { syncGitHubStats, type SyncProgress } from '@/app/actions/sync'
import { getRateLimitInfo } from '@/lib/github'
import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimit, rateLimits } from '@/lib/api-rate-limit'
import { verifyCronAuth } from '@/lib/cron-auth'

const checkCronRateLimit = apiRateLimit(rateLimits.cron)

export async function GET(request: NextRequest) {
  const limited = await checkCronRateLimit(request)
  if (limited) return limited

  const unauthorized = verifyCronAuth(request)
  if (unauthorized) return unauthorized

  // Parse query parameters for resume / partial sync
  const { searchParams } = request.nextUrl

  const sinceStr = searchParams.get('since')
  const since = sinceStr ? new Date(sinceStr) : undefined
  if (sinceStr && isNaN(since!.getTime())) {
    return NextResponse.json(
      { error: 'Invalid `since` date format. Use ISO 8601, e.g. 2024-01-01' },
      { status: 400 }
    )
  }

  const limitStr = searchParams.get('limit')
  const limit = limitStr ? parseInt(limitStr, 10) : 0
  if (limitStr && (isNaN(limit) || limit < 1)) {
    return NextResponse.json(
      { error: 'Invalid `limit` parameter. Must be a positive integer.' },
      { status: 400 }
    )
  }

  const serverIdsStr = searchParams.get('serverIds')
  const serverIds = serverIdsStr
    ? serverIdsStr.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined

  // Pre-flight: check rate limit before starting
  const preFlight = await getRateLimitInfo()

  const result: SyncProgress = await syncGitHubStats({
    since,
    limit,
    serverIds,
  })

  return NextResponse.json({
    ...result,
    preFlightRateLimit: {
      remaining: preFlight.remaining,
      limit: preFlight.limit,
      resetAt: preFlight.resetAt.toISOString(),
    },
    params: {
      since: since?.toISOString() ?? null,
      limit: limit || null,
      serverIds: serverIds ?? null,
    },
  })
}
