import { auth } from '@/lib/auth'

export async function requireAdmin(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  if (session.user.role !== 'admin') throw new Error('Forbidden: admin only')
  return session.user.id
}

export function validateSecret(name: string, value: string | undefined, disallowPlaceholders: string[] = []): void {
  if (!value || value.trim() === '') {
    console.warn(`[SECURITY] ${name} is not set. Some features may not work.`)
    return
  }
  for (const placeholder of disallowPlaceholders) {
    if (value === placeholder) {
      console.error(`[SECURITY] ${name} is set to a known placeholder "${placeholder}". This is insecure in production!`)
    }
  }
}

export function validateProductionSecrets(): void {
  if (process.env.NODE_ENV !== 'production') return

  validateSecret('AUTH_SECRET', process.env.AUTH_SECRET, ['your-secret-key-here', 'change-me', 'secret'])
  validateSecret('CRON_SECRET', process.env.CRON_SECRET)
  validateSecret('STRIPE_WEBHOOK_SECRET', process.env.STRIPE_WEBHOOK_SECRET)
}
