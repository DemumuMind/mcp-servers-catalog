'use server'

import { auth } from '@/lib/auth'
import { db, servers } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { createCheckoutSession } from '@/lib/stripe'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPremiumCheckout(
  serverId: string,
  tier: 'featured' | 'sponsored'
) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error('AUTH_REQUIRED')
  }

  const serverRows = await db
    .select({
      id: servers.id,
      owner: servers.owner,
      repo: servers.repo,
      authorId: servers.authorId,
      featured: servers.featured,
      isSponsored: servers.isSponsored,
    })
    .from(servers)
    .where(eq(servers.id, serverId))
    .limit(1)

  const server = serverRows[0]

  if (!server) {
    throw new Error('SERVER_NOT_FOUND')
  }

  const isAdmin = session.user.role === 'admin'
  const isAuthor = server.authorId === userId

  if (!isAdmin && !isAuthor) {
    throw new Error('PROMOTE_UNAUTHORIZED')
  }

  const baseUrl = process.env.SITE_URL || 'https://mcpservers.org'
  const successUrl = `${baseUrl}/servers/${server.owner}/${server.repo}?checkout=success&tier=${tier}`
  const cancelUrl = `${baseUrl}/servers/${server.owner}/${server.repo}?checkout=cancel`

  try {
    const checkoutSession = await createCheckoutSession(
      serverId,
      tier,
      successUrl,
      cancelUrl
    )

    if (!checkoutSession.url) {
      throw new Error('CHECKOUT_SESSION_FAILED')
    }

    redirect(checkoutSession.url)
  } catch (err: any) {
    if (err.message?.includes('STRIPE_NOT_CONFIGURED')) {
      throw new Error('PAYMENT_SYSTEM_UNAVAILABLE')
    }
    throw err
  }
}

export async function activatePremiumStatus(
  serverId: string,
  tier: 'featured' | 'sponsored',
  durationDays: number = 30
) {
  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)

  if (tier === 'featured') {
    await db
      .update(servers)
      .set({
        featured: true,
        featuredUntil: expiresAt,
      })
      .where(eq(servers.id, serverId))
  } else {
    await db
      .update(servers)
      .set({
        isSponsored: true,
        sponsoredUntil: expiresAt,
      })
      .where(eq(servers.id, serverId))
  }

  revalidatePath('/', 'layout')
  revalidatePath(`/servers/${serverId}`, 'layout')
}
