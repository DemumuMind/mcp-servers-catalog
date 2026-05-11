import { NextResponse } from 'next/server'
import { getDigestSubscribers } from '@/app/actions/extras'
import { getServersPublic } from '@/app/actions/public'
import { sendDigestEmail } from '@/lib/email'
import { apiRateLimit, rateLimits } from '@/lib/api-rate-limit'

const checkCronRateLimit = apiRateLimit(rateLimits.cron)

export async function GET(request: Request) {
  // Rate limit cron endpoint
  const limited = await checkCronRateLimit(request)
  if (limited) return limited

  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscribers = await getDigestSubscribers()

  // Group subscribers by category
  const subscribersByCategory = new Map<string | null, typeof subscribers>()
  for (const sub of subscribers) {
    const cat = sub.category || null
    if (!subscribersByCategory.has(cat)) {
      subscribersByCategory.set(cat, [])
    }
    subscribersByCategory.get(cat)!.push(sub)
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  let totalSent = 0

  for (const [category, subs] of subscribersByCategory) {
    // Get recent servers, optionally filtered by category
    const { servers: latest } = await getServersPublic(
      1, undefined, category || undefined, undefined, false, false
    )
    
    const recentServers = latest
      .filter((s: any) => new Date(s.createdAt) > oneWeekAgo)
      .slice(0, 10)

    if (recentServers.length === 0) continue

    const categoryTitle = category ? ` категории "${category}"` : ''
    
    for (const sub of subs) {
      if (sub.user.email) {
        await sendDigestEmail(
          sub.user.email,
          categoryTitle,
          recentServers.map((s: any) => ({ name: s.name, description: s.description }))
        )
        totalSent++
      }
    }
  }

  return NextResponse.json({ sent: totalSent })
}
