'use client'

import { useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { subscribeDigest, unsubscribeDigest, updateDigestFrequency, getUserDigest } from '@/app/actions/digest'
import { Bell, BellOff, Mail, Sparkles } from 'lucide-react'

interface DigestSubscriptionProps {
  userId?: string
  locale: string
}

const FREQUENCIES = ['daily', 'weekly', 'monthly'] as const

export function DigestSubscription({ userId, locale: _locale }: DigestSubscriptionProps) {
  const t = useTranslations('Digest')
  const [subscription, setSubscription] = useState<{
    frequency: string
    active: boolean
    category: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    getUserDigest(userId).then((data) => {
      setSubscription(
        data ? { frequency: data.frequency, active: data.active, category: data.category } : null
      )
      setLoading(false)
    })
  }, [userId])

  const handleSubscribe = (frequency: 'daily' | 'weekly' | 'monthly') => {
    if (!userId) return
    startTransition(async () => {
      await subscribeDigest(userId, frequency)
      setSubscription({ frequency, active: true, category: null })
    })
  }

  const handleUnsubscribe = () => {
    if (!userId) return
    startTransition(async () => {
      await unsubscribeDigest(userId)
      setSubscription((prev) => (prev ? { ...prev, active: false } : null))
    })
  }

  const handleFrequencyChange = (frequency: 'daily' | 'weekly' | 'monthly') => {
    if (!userId) return
    startTransition(async () => {
      await updateDigestFrequency(userId, frequency)
      setSubscription((prev) => (prev ? { ...prev, frequency } : null))
    })
  }

  if (!userId) return null
  if (loading) {
    return (
      <div className="premium-panel p-6 animate-pulse">
        <div className="h-6 w-40 bg-muted/30 rounded mb-3" />
        <div className="h-4 w-64 bg-muted/20 rounded" />
      </div>
    )
  }

  const isSubscribed = subscription?.active === true

  return (
    <div className="premium-panel p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
          {isSubscribed ? (
            <Bell className="size-5" />
          ) : (
            <Mail className="size-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-lg font-semibold tracking-[-0.04em]">
            {t('title')}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {t('description')}
          </p>

          {isSubscribed ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
                <Sparkles className="size-3.5" />
                {t('subscribed')}
              </div>
              <div className="flex flex-wrap gap-2">
                {FREQUENCIES.map((freq) => (
                  <button
                    key={freq}
                    onClick={() => handleFrequencyChange(freq)}
                    disabled={isPending}
                    className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                      subscription?.frequency === freq
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border/60 bg-card/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    } disabled:opacity-50`}
                  >
                    {t(freq)}
                  </button>
                ))}
              </div>
              <button
                onClick={handleUnsubscribe}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/10 disabled:opacity-50"
              >
                <BellOff className="size-3.5" />
                {t('unsubscribe')}
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-xs text-muted-foreground">{t('updateFrequency')}</p>
              <div className="flex flex-wrap gap-2">
                {FREQUENCIES.map((freq) => (
                  <button
                    key={freq}
                    onClick={() => handleSubscribe(freq)}
                    disabled={isPending}
                    className="rounded-xl border border-border/60 bg-card/50 px-4 py-2 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                  >
                    {t(freq)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
