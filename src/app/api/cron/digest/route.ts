import { NextRequest, NextResponse } from 'next/server'
import { getDigestSubscribers } from '@/app/actions/extras'
import { getServersPublic } from '@/app/actions/public'
import { sendDigestEmail } from '@/lib/email'
import { apiRateLimit, rateLimits } from '@/lib/api-rate-limit'
import { verifyCronAuth } from '@/lib/cron-auth'

const checkCronRateLimit = apiRateLimit(rateLimits.cron)

export async function GET(request: NextRequest) {
  const limited = await checkCronRateLimit(request)
  if (limited) return limited

  const unauthorized = verifyCronAuth(request)
  if (unauthorized) return unauthorized

  const subscribers = await getDigestSubscribers()

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
    const { servers: latest } = await getServersPublic(
      1, undefined, category || undefined, undefined, false, false
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentServers = latest
      .filter((s: any) => new Date(s.createdAt) > oneWeekAgo)
      .slice(0, 10)

    if (recentServers.length === 0) continue

    const categoryTitle = category ? ` категории "${category}"` : ''

    const batches: Array<typeof subs> = []
    for (let i = 0; i < subs.length; i += 10) {
      batches.push(subs.slice(i, i + 10))
    }

    for (const batch of batches) {
      const results = await Promise.allSettled(
        batch.filter((sub) => sub.user.email).map((sub) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sendDigestEmail(sub.user.email!, categoryTitle, recentServers.map((s: any) => ({ name: s.name, description: s.description })))
        )
      )
      for (const r of results) {
        if (r.status === 'fulfilled') totalSent++
        else console.error('[DIGEST] Failed to send email:', (r as PromiseRejectedResult).reason)
      }
    }
  }

  return NextResponse.json({ sent: totalSent })
}
