import { NextRequest, NextResponse } from 'next/server'

/**
 * Verify cron job authentication via Bearer token or ?secret= URL param.
 * Compares against CRON_SECRET env var with whitespace trimmed.
 * Returns null if auth passes, or a 401/500 NextResponse if it fails.
 */
export function verifyCronAuth(req: NextRequest): NextResponse | null {
  const authHeader = req.headers.get('authorization')
  const token = (authHeader?.replace('Bearer ', '') ?? '').trim()
  const urlSecret = (new URL(req.url).searchParams.get('secret') ?? '').trim()
  const expected = (process.env.CRON_SECRET ?? '').trim()

  if (!expected) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }

  if (token !== expected && urlSecret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}
