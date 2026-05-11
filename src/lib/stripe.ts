import Stripe from 'stripe'

function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    return null
  }
  return new Stripe(key, {
    apiVersion: '2026-04-22.dahlia' as any,
  })
}

export { getStripeClient }

export const STRIPE_PRODUCTS = {
  featured: {
    name: 'Featured MCP Server',
    description: 'Your server highlighted on the homepage for 30 days',
    price: 2900, // $29.00 in cents
  },
  sponsored: {
    name: 'Sponsored MCP Server',
    description: 'Premium placement with sponsor badge for 30 days',
    price: 9900, // $99.00 in cents
  },
}

export function isStripeEnabled(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

export async function createCheckoutSession(
  serverId: string,
  tier: 'featured' | 'sponsored',
  successUrl: string,
  cancelUrl: string
) {
  const stripe = getStripeClient()
  if (!stripe) {
    throw new Error('Stripe не настроен. Укажите STRIPE_SECRET_KEY в .env')
  }

  const product = STRIPE_PRODUCTS[tier]

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.price,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      serverId,
      tier,
    },
  })

  return session
}
