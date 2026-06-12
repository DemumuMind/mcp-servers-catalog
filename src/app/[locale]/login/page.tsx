'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageShell } from '@/components/page-components'
import { BrandMark } from '@/components/brand'
import { Loader2, LogIn } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: `/${locale}`,
    })

    setLoading(false)

    if (result?.error) {
      setError(t('invalidCredentials'))
    } else if (result?.ok) {
      router.push(`/${locale}`)
      router.refresh()
    }
  }

  return (
    <PageShell wide={false} className="flex min-h-[calc(100dvh-12rem)] items-center justify-center">
      <Card className="w-full max-w-md overflow-visible">
        <CardHeader className="items-center text-center">
          <BrandMark size={58} className="mb-4" />
          <p className="eyebrow">{t('account')}</p>
          <CardTitle className="text-3xl">{t('loginTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold">{t('email')}</label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold">{t('password')}</label>
              <Input type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>

            {error && <p className="rounded-2xl border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
              {loading ? t('signingIn') : t('loginButton')}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {t('noAccount')}{' '}
            <Link href={`/${locale}/register`} className="font-semibold text-primary hover:underline">
              {t('registerButton')}
            </Link>
          </div>

          <div className="mt-5 border-t border-border/60 pt-5 text-center text-xs text-muted-foreground">
            {t('adminPrompt')}{' '}
            <Link href="/admin" className="font-semibold text-primary hover:underline">{t('adminLink')}</Link>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
