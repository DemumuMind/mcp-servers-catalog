import { syncGitHubStats } from '@/app/actions/sync'
import { NextResponse } from 'next/server'
import { apiRateLimit, rateLimits } from '@/lib/api-rate-limit'

const checkCronRateLimit = apiRateLimit(rateLimits.cron)

export async function GET(request: Request) {
  // Rate limit cron endpoint
  const limited = await checkCronRateLimit(request)
  if (limited) return limited

  // Optional: verify cron secret
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await syncGitHubStats()
  return NextResponse.json(result)
}
