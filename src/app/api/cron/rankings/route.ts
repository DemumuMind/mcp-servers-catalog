import { NextResponse } from 'next/server'
import { computeServerRankings } from '@/app/actions/rankings'

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
  const unauthorized = verifyCronAuth(request)
  if (unauthorized) return unauthorized

  try {
    const [weekResult, monthResult] = await Promise.all([
      computeServerRankings('week'),
      computeServerRankings('month'),
    ])

    return NextResponse.json({
      success: true,
      week: weekResult,
      month: monthResult,
    })
  } catch (error) {
    console.error('Rankings cron error:', error)
    return NextResponse.json({ error: 'Failed to compute rankings' }, { status: 500 })
  }
}
