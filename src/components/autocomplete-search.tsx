'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Search, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAutocompleteSearch } from '@/components/use-autocomplete-search'
import { SearchResultsDropdown } from '@/components/search-results-dropdown'

interface AutocompleteSearchProps {
  locale?: string
  defaultValue?: string
  className?: string
}

export function AutocompleteSearch({ locale = 'en', defaultValue = '', className }: AutocompleteSearchProps) {
  const t = useTranslations('Search')
  const {
    query, results, showDropdown, loading, selectedIndex, dropdownPos,
    inputRef, containerRef,
    handleKeyDown, handleSubmit, clearQuery, onInputChange, onInputFocus,
    navigateToResult, setSelectedIndex,
  } = useAutocompleteSearch(locale, defaultValue)

  return (
    <div className={cn('relative w-full max-w-2xl', className)} ref={containerRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={t('placeholder')}
            className="h-13 rounded-3xl pl-12 pr-20 text-base shadow-[var(--shadow-soft)] [appearance:none] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            value={query}
            onChange={(e) => onInputChange(e.target.value)}
            onFocus={onInputFocus}
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
      {showDropdown && results.length > 0 && (
        <SearchResultsDropdown
          results={results}
          selectedIndex={selectedIndex}
          dropdownPos={dropdownPos}
          onSelect={navigateToResult}
          onHover={setSelectedIndex}
        />
      )}
    </div>
  )
}
