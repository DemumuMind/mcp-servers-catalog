import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeClient } from '@/lib/stripe'
import { db, servers } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(req: NextRequest) {
  const stripe = getStripeClient()
  if (!stripe) {
    throw new Error('STRIPE_NOT_CONFIGURED')
  }

  if (!webhookSecret) {
    console.error('[STRIPE] STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const payload = await req.text()
  const signature = req.headers.get('stripe-signature') || ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const serverId = session.metadata?.serverId
    const tier = session.metadata?.tier as 'featured' | 'sponsored' | undefined

    if (!serverId || !tier) {
      console.error('Missing metadata in checkout session:', session.id)
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const durationDays = 30
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)

    try {
      if (tier === 'featured') {
        await db.update(servers)
          .set({
            featured: true,
            featuredUntil: expiresAt,
          })
          .where(eq(servers.id, serverId))
      } else if (tier === 'sponsored') {
        await db.update(servers)
          .set({
            isSponsored: true,
            sponsoredUntil: expiresAt,
          })
          .where(eq(servers.id, serverId))
      }

      revalidatePath('/', 'layout')
    } catch (err: any) {
      console.error(`Failed to activate premium status: ${err.message}`)
      return NextResponse.json({ error: 'Activation failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
