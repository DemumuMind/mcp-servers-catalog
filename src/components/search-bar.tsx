'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [query, setQuery] = useState(searchParams.get('q') || defaultValue || '')
  const t = useTranslations('SearchBar')

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    router.push(`${pathname}?${params.toString()}`)
  }, [router, searchParams, pathname])

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={t('placeholder')}
        className="w-full rounded-3xl pl-11"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  )
}
