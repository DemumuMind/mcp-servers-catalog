'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

const categoryIds = [
  'all', 'official', 'search', 'web-scraping', 'communication',
  'productivity', 'development', 'database', 'cloud-service',
  'file-system', 'cloud-storage', 'version-control', 'other',
] as const

interface CategoryTabsProps {
  activeCategory: string
}

export function CategoryTabs({ activeCategory }: CategoryTabsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('Categories')

  return (
    <div className="flex flex-wrap gap-2">
      {categoryIds.map((id) => {
        const params = new URLSearchParams(searchParams.toString())
        if (id === 'all') {
          params.delete('category')
        } else {
          params.set('category', id)
        }
        const href = params.toString() ? `${pathname}?${params.toString()}` : pathname

        return (
          <Link
            key={id}
            href={href}
            className={cn(
              'rounded-2xl border border-transparent px-4 py-2 text-sm font-semibold transition-all focus-ring',
              activeCategory === id
                ? 'border-primary/20 bg-primary text-primary-foreground shadow-[0_16px_36px_-24px_var(--primary)]'
                : 'border-border/60 bg-card/58 text-muted-foreground hover:-translate-y-0.5 hover:border-primary/25 hover:bg-card/90 hover:text-foreground'
            )}
          >
            {t(id)}
          </Link>
        )
      })}
    </div>
  )
}
