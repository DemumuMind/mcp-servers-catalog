'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { registerUser } from '@/app/actions/auth'
import { PageShell } from '@/components/page-components'
import { BrandMark } from '@/components/brand'
import { Loader2, UserPlus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'ru'
  const t = useTranslations('Auth')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError(t('passwordsNoMatch'))
      setLoading(false)
      return
    }

    try {
      await registerUser({ email, password, name: name || undefined })
      router.push(`/${locale}/login`)
    } catch (err: any) {
      setError(err.message || t('registrationError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell wide={false} className="flex min-h-[calc(100dvh-12rem)] items-center justify-center">
      <Card className="w-full max-w-md overflow-visible">
        <CardHeader className="items-center text-center">
          <BrandMark size={58} className="mb-4" />
          <p className="eyebrow">New account</p>
          <CardTitle className="text-3xl">{t('registerTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="reg-name" className="text-sm font-semibold">{t('name')} ({t('optional')})</label>
              <Input id="reg-name" type="text" placeholder={t('namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold">{t('email')}</label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold">{t('password')}</label>
              <Input id="password" type="password" placeholder={t('passwordMinLength')} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
            </div>
            <div className="space-y-2">
              <label htmlFor="reg-confirm-password" className="text-sm font-semibold">{t('confirmPassword')}</label>
              <Input id="reg-confirm-password" type="password" placeholder="••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
            </div>

            {error && <p className="rounded-2xl border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
              {loading ? t('registering') : t('registerButton')}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {t('hasAccount')}{' '}
            <Link href={`/${locale}/login`} className="font-semibold text-primary hover:underline">
              {t('loginButton')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
