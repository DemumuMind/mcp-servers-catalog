import { NextRequest, NextResponse } from 'next/server'
import { backupDatabase } from '@/app/actions/backup'
import { verifyCronAuth } from '@/lib/cron-auth'

export async function GET(request: NextRequest) {
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
