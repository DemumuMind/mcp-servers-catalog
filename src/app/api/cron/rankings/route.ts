import { NextRequest, NextResponse } from 'next/server'
import { computeServerRankings } from '@/app/actions/rankings'
import { verifyCronAuth } from '@/lib/cron-auth'

export async function GET(request: NextRequest) {
  const unauthorized = verifyCronAuth(request)
  if (unauthorized) return unauthorized

  try {
    const weekResult = await computeServerRankings('week')
    const monthResult = await computeServerRankings('month')

    return NextResponse.json({
      success: true,
      week: weekResult,
      month: monthResult,
    })
  } catch (error) {
    console.error('Rankings cron error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Failed to compute rankings', detail: msg }, { status: 500 })
  }
}
