import { NextRequest, NextResponse } from 'next/server'
import { computeServerRankings } from '@/app/actions/rankings'
import { verifyCronAuth } from '@/lib/cron-auth'

export async function GET(request: NextRequest) {
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
