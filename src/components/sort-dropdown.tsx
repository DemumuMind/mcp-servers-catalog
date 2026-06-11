'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const sortOptionKeys = [
  { value: 'featured', key: 'featured' },
  { value: 'newest', key: 'newest' },
  { value: 'stars', key: 'stars' },
  { value: 'alphabetical', key: 'alphabetical' },
  { value: 'trending', key: 'trending' },
]

export function SortDropdown({ currentSort, locale }: { currentSort: string; locale: string }) {
  const router = useRouter()
  const t = useTranslations('Sort')

  const handleChange = (value: string | null) => {
    if (!value) return
    const params = new URLSearchParams(window.location.search)
    params.set('sort', value)
    router.push(`/${locale}/all?${params.toString()}`)
  }

  return (
    <Select value={currentSort} onValueChange={handleChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder={t('sortPlaceholder')} />
      </SelectTrigger>
      <SelectContent>
        {sortOptionKeys.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {t(option.key)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
