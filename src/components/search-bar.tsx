'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface SearchBarProps {
  onSearch?: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (onSearch) {
      onSearch(value)
    } else {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set('q', value)
      } else {
        params.delete('q')
      }
      router.push(`?${params.toString()}`)
    }
  }, [onSearch, router, searchParams])

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
