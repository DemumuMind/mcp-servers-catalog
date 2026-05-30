import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
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
    return NextResponse.json({ error: 'Expire premium cron failed' }, { status: 500 })
  }
}
