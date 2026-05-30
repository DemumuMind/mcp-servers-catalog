import { syncGitHubStats } from '@/app/actions/sync'
import { NextResponse } from 'next/server'
import { apiRateLimit, rateLimits } from '@/lib/api-rate-limit'

const checkCronRateLimit = apiRateLimit(rateLimits.cron)

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
  const limited = await checkCronRateLimit(request)
  if (limited) return limited

  const unauthorized = verifyCronAuth(request)
  if (unauthorized) return unauthorized

  const result = await syncGitHubStats()
  return NextResponse.json(result)
}
