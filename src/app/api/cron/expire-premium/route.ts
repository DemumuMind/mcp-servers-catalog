import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { servers } from '@/lib/db/schema'
import { eq, and, lt, isNotNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

function verifyCronAuth(req: NextRequest | Request): NextResponse | null {
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

export async function GET(req: NextRequest) {
  const unauthorized = verifyCronAuth(req)
  if (unauthorized) return unauthorized

  const now = new Date()

  try {
    // Expire featured status
    const expiredFeatured = await db.update(servers)
      .set({ featured: false, featuredUntil: null })
      .where(and(eq(servers.featured, true), lt(servers.featuredUntil!, now)))
      .run()

    // Expire sponsored status
    const expiredSponsored = await db.update(servers)
      .set({ isSponsored: false, sponsoredUntil: null })
      .where(and(eq(servers.isSponsored, true), lt(servers.sponsoredUntil!, now)))
      .run()

    revalidatePath('/', 'layout')
    revalidatePath('/admin/servers', 'layout')

    return NextResponse.json({
      success: true,
      expiredFeatured: expiredFeatured.rowsAffected,
      expiredSponsored: expiredSponsored.rowsAffected,
    })
  } catch (error: any) {
    console.error('Expire premium cron failed:', error)
    return NextResponse.json({ error: 'Expire premium cron failed' }, { status: 500 })
  }
}
