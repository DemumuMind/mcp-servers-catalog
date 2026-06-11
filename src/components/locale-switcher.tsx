'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(newLocale: string) {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPathname)
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border border-border/70 bg-card/58 p-1 text-sm shadow-[var(--shadow-soft)] backdrop-blur-xl">
      <Globe className="ml-1 size-3.5 text-muted-foreground" />
      {(['ru', 'en'] as const).map((item) => (
        <button
          key={item}
          onClick={() => switchLocale(item)}
          className={cn(
            'rounded-xl px-2 py-1 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] transition-all hover:bg-muted hover:text-foreground focus-ring',
            locale === item ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
          )}
        >
          {item}
        </button>
      ))}
    </div>
  )
}
