'use client'

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
  onCategoryChange: (category: string) => void
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-colors',
            activeCategory === category.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}
