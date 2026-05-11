import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  try {
    // Expire featured status
    const expiredFeatured = await prisma.server.updateMany({
      where: {
        featured: true,
        featuredUntil: { lt: now },
      },
      data: {
        featured: false,
        featuredUntil: null,
      },
    })

    // Expire sponsored status
    const expiredSponsored = await prisma.server.updateMany({
      where: {
        isSponsored: true,
        sponsoredUntil: { lt: now },
      },
      data: {
        isSponsored: false,
        sponsoredUntil: null,
      },
    })

    revalidatePath('/', 'layout')
    revalidatePath('/admin/servers', 'layout')

    return NextResponse.json({
      success: true,
      expiredFeatured: expiredFeatured.count,
      expiredSponsored: expiredSponsored.count,
    })
  } catch (error: any) {
    console.error('Expire premium cron failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
