'use client'

import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { Star, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SearchResult } from '@/components/use-autocomplete-search'

interface SearchResultsDropdownProps {
  results: SearchResult[]
  selectedIndex: number
  dropdownPos: { top: number; left: number; width: number }
  onSelect: (result: SearchResult) => void
  onHover: (index: number) => void
}

export function SearchResultsDropdown({
  results, selectedIndex, dropdownPos, onSelect, onHover,
}: SearchResultsDropdownProps) {
  const t = useTranslations('Search')

  return createPortal(
    <div
      className="fixed z-[9999] overflow-y-auto overflow-x-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-2xl"
      data-autocomplete-dropdown
      style={{
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        maxHeight: `min(400px, calc(100vh - ${dropdownPos.top + 16}px))`,
      }}
    >
      {results.map((result, index) => (
        <button
          key={result.id}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors',
            index === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50',
          )}
          onClick={() => onSelect(result)}
          onMouseEnter={() => onHover(index)}
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
    document.body,
  )
}
