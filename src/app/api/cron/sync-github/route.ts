import { syncGitHubStats } from '@/app/actions/sync'
import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimit, rateLimits } from '@/lib/api-rate-limit'
import { verifyCronAuth } from '@/lib/cron-auth'

const checkCronRateLimit = apiRateLimit(rateLimits.cron)

export async function GET(request: NextRequest) {
  const limited = await checkCronRateLimit(request)
  if (limited) return limited

  const unauthorized = verifyCronAuth(request)
  if (unauthorized) return unauthorized

  const result = await syncGitHubStats()
  return NextResponse.json(result)
}
