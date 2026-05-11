'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
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
    throw new Error('Необходимо авторизоваться')
  }

  const server = await prisma.server.findUnique({
    where: { id: serverId },
    select: { id: true, owner: true, repo: true, authorId: true, featured: true, isSponsored: true },
  })

  if (!server) {
    throw new Error('Сервер не найден')
  }

  const isAdmin = session.user.role === 'admin'
  const isAuthor = server.authorId === userId

  if (!isAdmin && !isAuthor) {
    throw new Error('Только автор или администратор может продвигать сервер')
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
      throw new Error('Не удалось создать сессию оплаты')
    }

    redirect(checkoutSession.url)
  } catch (err: any) {
    if (err.message?.includes('Stripe не настроен')) {
      throw new Error('Платежная система временно недоступна. Обратитесь к администратору.')
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
    await prisma.server.update({
      where: { id: serverId },
      data: {
        featured: true,
        featuredUntil: expiresAt,
      },
    })
  } else {
    await prisma.server.update({
      where: { id: serverId },
      data: {
        isSponsored: true,
        sponsoredUntil: expiresAt,
      },
    })
  }

  revalidatePath('/', 'layout')
  revalidatePath(`/servers/${serverId}`, 'layout')
}
