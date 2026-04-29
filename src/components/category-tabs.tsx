'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const categories = [
  { id: 'all', label: 'Все' },
  { id: 'official', label: 'Официальный 🌟' },
  { id: 'search', label: 'Поиск' },
  { id: 'web-scraping', label: 'Веб-скрейпинг' },
  { id: 'communication', label: 'Коммуникация' },
  { id: 'productivity', label: 'Продуктивность' },
  { id: 'development', label: 'Разработка' },
  { id: 'database', label: 'База данных' },
  { id: 'cloud-service', label: 'Облачный сервис' },
  { id: 'file-system', label: 'Файловая система' },
  { id: 'cloud-storage', label: 'Облачное хранилище' },
  { id: 'version-control', label: 'Контроль версий' },
  { id: 'other', label: 'Другое' },
]

interface CategoryTabsProps {
  activeCategory: string
}

export function CategoryTabs({ activeCategory }: CategoryTabsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const params = new URLSearchParams(searchParams.toString())
        if (category.id === 'all') {
          params.delete('category')
        } else {
          params.set('category', category.id)
        }
        const href = params.toString() ? `${pathname}?${params.toString()}` : pathname

        return (
          <Link
            key={category.id}
            href={href}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              activeCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {category.label}
          </Link>
        )
      })}
    </div>
  )
}
