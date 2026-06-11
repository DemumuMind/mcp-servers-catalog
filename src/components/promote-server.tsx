'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Crown, Loader2 } from 'lucide-react'
import { createPremiumCheckout } from '@/app/actions/stripe'
import { isStripeEnabled } from '@/lib/stripe'

interface PromoteServerProps {
  serverId: string
  featured: boolean
  featuredUntil: Date | null
  isSponsored: boolean
  sponsoredUntil: Date | null
}

export function PromoteServer({
  serverId,
  featured,
  featuredUntil,
  isSponsored,
  sponsoredUntil,
}: PromoteServerProps) {
  const [open, setOpen] = useState(false)
  const [isPendingFeatured, startTransitionFeatured] = useTransition()
  const [isPendingSponsored, startTransitionSponsored] = useTransition()
  const stripeEnabled = isStripeEnabled()
  const t = useTranslations('Admin.promoteServer')

  const formatDate = (date: Date | null) => {
    if (!date) return null
    return new Date(date).toLocaleDateString()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" className="gap-1" type="button" onClick={() => setOpen(true)}>
        <Sparkles className="h-4 w-4" />
        {t('promote')}
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        {!stripeEnabled && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
            ⚠️ {t('paymentUnavailable')}
          </div>
        )}

        <div className="space-y-4 mt-4">
          {/* Featured Option */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">Featured</span>
              </div>
              <Badge variant="secondary">{t('featuredPrice')}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('featuredDescription')}
            </p>
            {featured && featuredUntil && (
              <p className="text-xs text-green-600">
                {t('activeUntil')} {formatDate(featuredUntil)}
              </p>
            )}
            <form
              action={() =>
                startTransitionFeatured(async () => {
                  await createPremiumCheckout(serverId, 'featured')
                })
              }
            >
              <Button
                type="submit"
                className="w-full"
                disabled={isPendingFeatured || !stripeEnabled}
              >
                {isPendingFeatured && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {featured ? t('renewFeatured') : t('buyFeatured')}
              </Button>
            </form>
          </div>

          {/* Sponsored Option */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <span className="font-semibold">Sponsored</span>
              </div>
              <Badge variant="secondary">{t('sponsoredPrice')}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('sponsoredDescription')}
            </p>
            {isSponsored && sponsoredUntil && (
              <p className="text-xs text-green-600">
                {t('activeUntil')} {formatDate(sponsoredUntil)}
              </p>
            )}
            <form
              action={() =>
                startTransitionSponsored(async () => {
                  await createPremiumCheckout(serverId, 'sponsored')
                })
              }
            >
              <Button
                type="submit"
                className="w-full"
                variant="secondary"
                disabled={isPendingSponsored || !stripeEnabled}
              >
                {isPendingSponsored && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isSponsored ? t('renewSponsored') : t('buySponsored')}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
