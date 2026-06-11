import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'
import { cookies } from 'next/headers'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
  let locale = 'en'
  try {
    const cookieStore = await cookies()
    const nextLocale = cookieStore.get('NEXT_LOCALE')?.value
    if (nextLocale === 'ru' || nextLocale === 'en') {
      locale = nextLocale
    }
  } catch { /* non-critical */ }

  const t = await getTranslations({ locale, namespace: 'NotFound' })

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 px-4">
      <div className="text-8xl font-heading font-semibold tracking-[-0.06em] text-muted-foreground/30">404</div>
      <p className="text-lg text-muted-foreground text-center">
        {t('title')}
      </p>
      <Link href={`/${locale}`}>
        <Button variant="outline" size="lg" className="gap-2">
          <Home className="size-4" />
          {t('goHome')}
        </Button>
      </Link>
    </div>
  )
}
