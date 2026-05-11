'use client'

import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const sortOptions = [
  { value: 'featured', label: 'Рекомендуемые' },
  { value: 'newest', label: 'Новые' },
  { value: 'stars', label: 'По звёздам' },
  { value: 'alphabetical', label: 'По алфавиту' },
  { value: 'trending', label: 'В тренде' },
]

export function SortDropdown({ currentSort, locale }: { currentSort: string; locale: string }) {
  const router = useRouter()

  const handleChange = (value: string | null) => {
    if (!value) return
    const params = new URLSearchParams(window.location.search)
    params.set('sort', value)
    router.push(`/${locale}/all?${params.toString()}`)
  }

  return (
    <Select value={currentSort} onValueChange={handleChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Сортировка" />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
