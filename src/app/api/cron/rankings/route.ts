import { NextResponse } from 'next/server'
import { computeServerRankings } from '@/app/actions/rankings'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
