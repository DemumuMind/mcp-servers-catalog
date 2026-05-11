'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('Common')

  function switchLocale(newLocale: string) {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPathname)
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
      <button
        onClick={() => switchLocale('ru')}
        className={`px-1.5 py-0.5 rounded ${locale === 'ru' ? 'bg-accent font-medium' : 'text-muted-foreground hover:text-foreground'}`}
      >
        RU
      </button>
      <span className="text-muted-foreground">|</span>
      <button
        onClick={() => switchLocale('en')}
        className={`px-1.5 py-0.5 rounded ${locale === 'en' ? 'bg-accent font-medium' : 'text-muted-foreground hover:text-foreground'}`}
      >
        EN
      </button>
    </div>
  )
}
