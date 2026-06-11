import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { servers } from '@/lib/db/schema'
import { eq, and, lt, isNotNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { verifyCronAuth } from '@/lib/cron-auth'

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
