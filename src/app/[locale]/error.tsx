'use client'

import { useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('Error')
  const locale = useLocale()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
      <h2 className="font-heading text-3xl font-semibold tracking-[-0.05em]">{t('title')}</h2>
      <p className="text-muted-foreground text-center max-w-md">
        {t('description')}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>{t('tryAgain')}</Button>
        <Button variant="outline" onClick={() => window.location.href = `/${locale}`}>
          {t('goHome')}
        </Button>
      </div>
    </div>
  )
}
