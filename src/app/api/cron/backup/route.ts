import { NextResponse } from 'next/server'
import { backupDatabase } from '@/app/actions/backup'

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
    const sql = await backupDatabase()
    return NextResponse.json({
      success: true,
      size: sql.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Scheduled backup failed:', error)
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 })
  }
}
