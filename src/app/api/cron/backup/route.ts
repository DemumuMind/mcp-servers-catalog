import { NextResponse } from 'next/server'
import { backupDatabase } from '@/app/actions/backup'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
