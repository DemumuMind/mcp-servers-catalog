'use client'

import { useLocale } from 'next-intl'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdminLocaleSwitcher() {
  const locale = useLocale()

  async function switchLocale(newLocale: string) {
    document.cookie = `admin-locale=${newLocale}; path=/admin; max-age=31536000; SameSite=Lax`
    window.location.reload()
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border/50 bg-card/50 p-0.5 text-xs">
      <Globe className="ml-1 size-3 text-muted-foreground" />
      {(['en', 'ru'] as const).map((item) => (
        <button
          key={item}
          onClick={() => switchLocale(item)}
          className={cn(
            'rounded-lg px-2 py-1 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.08em] transition-all hover:bg-muted hover:text-foreground',
            locale === item ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
          )}
        >
          {item}
        </button>
      ))}
    </div>
  )
}
