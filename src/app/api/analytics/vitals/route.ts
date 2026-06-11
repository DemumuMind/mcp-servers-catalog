import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const metrics = await request.json()
    // Log web vitals (in production, send to analytics/Sentry)
    logger.info('[Analytics Vitals]', metrics)
    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}
