'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { autocompleteServers } from '@/app/actions/autocomplete'
import { Input } from '@/components/ui/input'
import { Search, Star, Loader2 } from 'lucide-react'

interface AutocompleteSearchProps {
  locale?: string
  defaultValue?: string
}

export function AutocompleteSearch({ locale = 'ru', defaultValue = '' }: AutocompleteSearchProps) {
  const [query, setQuery] = useState(defaultValue)
  const [results, setResults] = useState<Array<{
    id: string
    name: string
    owner: string
    repo: string
    description: string
    stars: number
    category: string
  }>>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const debouncedSearch = useCallback(
    async (value: string) => {
      if (value.length < 2) {
        setResults([])
        return
      }
      setLoading(true)
      const data = await autocompleteServers(value)
      setResults(data)
      setLoading(false)
    },
    []
  )

  useEffect(() => {
    const timer = setTimeout(() => debouncedSearch(query), 200)
    return () => clearTimeout(timer)
  }, [query, debouncedSearch])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && results[selectedIndex]) {
        navigateToResult(results[selectedIndex])
      } else if (query) {
        router.push(`/${locale}/all?q=${encodeURIComponent(query)}`)
        setShowDropdown(false)
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      inputRef.current?.blur()
    }
  }

  function navigateToResult(result: typeof results[0]) {
    router.push(`/${locale}/servers/${result.owner}/${result.repo}`)
    setShowDropdown(false)
    setQuery('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query) {
      router.push(`/${locale}/all?q=${encodeURIComponent(query)}`)
      setShowDropdown(false)
    }
  }

  return (
    <div className="relative w-full max-w-xl mx-auto" ref={dropdownRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Поиск MCP серверов..."
            className="pl-10 pr-10"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowDropdown(true)
              setSelectedIndex(-1)
            }}
            onFocus={() => query.length >= 2 && setShowDropdown(true)}
            onKeyDown={handleKeyDown}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </form>

      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
          {results.map((result, index) => (
            <button
              key={result.id}
              className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-start gap-3 ${
                index === selectedIndex ? 'bg-muted' : ''
              }`}
              onClick={() => navigateToResult(result)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{result.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {result.owner}/{result.repo}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {result.description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {result.stars}
              </div>
            </button>
          ))}
          <div className="px-4 py-2 border-t text-xs text-muted-foreground text-center">
            Нажмите Enter для полного поиска
          </div>
        </div>
      )}
    </div>
  )
}
