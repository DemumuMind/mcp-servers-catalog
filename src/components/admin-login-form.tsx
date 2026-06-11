'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/components/brand'
import { Input } from '@/components/ui/input'
import { AdminLocaleSwitcher } from '@/components/admin/admin-locale-switcher'

export default function AdminLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const t = useTranslations('Admin.login')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/admin',
    })

    setLoading(false)

    if (result?.error) {
      setError(t('invalidCredentials'))
    } else if (result?.ok) {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="premium-panel w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <BrandMark size={60} className="mx-auto mb-4" />
          <p className="eyebrow mb-2">{t('secureArea')}</p>
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.06em]">{t('title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('description')}</p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold">{t('email')}</label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold">{t('password')}</label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            {loading ? t('signingIn') : t('signIn')}
          </Button>
        </form>

        <div className="mt-6 flex justify-center">
          <AdminLocaleSwitcher />
        </div>
      </div>
    </div>
  )
}
