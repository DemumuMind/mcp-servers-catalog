'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { autocompleteServers } from '@/app/actions/autocomplete'
import { Input } from '@/components/ui/input'
import { Search, Star, Loader2, ArrowUpRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AutocompleteSearchProps {
  locale?: string
  defaultValue?: string
  className?: string
}

export function AutocompleteSearch({ locale = 'en', defaultValue = '', className }: AutocompleteSearchProps) {
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
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const t = useTranslations('Search')

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

  function updatePosition() {
    if (!inputRef.current) return
    const rect = inputRef.current.getBoundingClientRect()
    // Estimate dropdown height: ~42px per item + 40px footer
    const estimatedHeight = Math.min(results.length, 8) * 42 + 40
    const viewportHeight = window.innerHeight
    const spaceBelow = viewportHeight - rect.bottom - 8
    const spaceAbove = rect.top - 8

    let top: number
    // If enough space below, show below; otherwise show above
    if (spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove) {
      top = rect.bottom + 8
    } else {
      top = rect.top - estimatedHeight - 8
    }
    // Clamp to viewport
    top = Math.max(8, Math.min(top, viewportHeight - estimatedHeight - 8))

    setDropdownPos({
      top,
      left: rect.left,
      width: rect.width,
    })
  }

  useEffect(() => {
    if (showDropdown && results.length > 0) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [showDropdown, results])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest?.('[data-autocomplete-dropdown]')
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

  function clearQuery() {
    setQuery('')
    setResults([])
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  const dropdown = showDropdown && results.length > 0 ? createPortal(
    <div
      className="fixed z-[9999] overflow-y-auto overflow-x-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-2xl"
      data-autocomplete-dropdown
      style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, maxHeight: `min(400px, calc(100vh - ${dropdownPos.top + 16}px))` }}
    >
      {results.map((result, index) => (
        <button
          key={result.id}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors',
            index === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'
          )}
          onClick={() => navigateToResult(result)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <div className="min-w-0 flex-1">
            <span className="text-sm font-semibold text-foreground">{result.name}</span>
            <span className="ml-2 font-mono text-[0.68rem] text-muted-foreground">
              {result.owner}/{result.repo}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-1.5 py-0.5 font-mono text-primary">
              <Star className="h-3 w-3 fill-primary text-primary" />
              {result.stars.toLocaleString('en-US')}
            </span>
            <ArrowUpRight className="size-3.5 text-muted-foreground" />
          </div>
        </button>
      ))}
      <div className="border-t border-border/60 px-3.5 py-1.5 text-center font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
        {t('fullSearch')}
      </div>
    </div>,
    document.body
  ) : null

  return (
    <div className={cn("relative w-full max-w-2xl", className)} ref={containerRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={t('placeholder')}
            className="h-13 rounded-3xl pl-12 pr-20 text-base shadow-[var(--shadow-soft)] [appearance:none] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowDropdown(true)
              setSelectedIndex(-1)
            }}
            onFocus={() => {
              if (query.length >= 2) {
                updatePosition()
                setShowDropdown(true)
              }
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={clearQuery}
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <kbd className="hidden rounded-lg border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-[0.6rem] text-muted-foreground sm:inline-flex">
                Enter
              </kbd>
            )}
          </div>
        </div>
      </form>
      {dropdown}
    </div>
  )
}
