'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [query, setQuery] = useState(searchParams.get('q') || defaultValue || '')

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
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Поиск MCP серверов..."
        className="pl-10 w-full max-w-md"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  )
}
