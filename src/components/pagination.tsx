'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams: Record<string, string | undefined>
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
  const t = useTranslations('Pagination')

  const buildUrl = (page: number) => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        params.set(key, value)
      }
    })
    if (page > 1) {
      params.set('page', String(page))
    }
    const query = params.toString()
    return `${baseUrl}${query ? `?${query}` : ''}`
  }

  const pages: (number | string)[] = []
  const maxVisible = 5

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label={t('label')}>
      {currentPage > 1 && (
        <a
          href={buildUrl(currentPage - 1)}
          className="rounded-2xl border border-border/70 bg-card/58 px-4 py-2 text-sm font-semibold text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
        >
          {t('back')}
        </a>
      )}

      {pages.map((page, i) => (
        <span key={i}>
          {page === '...' ? (
            <span className="px-2 text-muted-foreground">...</span>
          ) : (
            <a
              href={buildUrl(page as number)}
              className={cn(
                'inline-flex size-10 items-center justify-center rounded-2xl border text-sm font-semibold transition-all',
                currentPage === page
                  ? 'border-primary bg-primary text-primary-foreground shadow-[0_16px_34px_-24px_var(--primary)]'
                  : 'border-border/70 bg-card/58 text-muted-foreground hover:-translate-y-0.5 hover:bg-muted hover:text-foreground'
              )}
            >
              {page}
            </a>
          )}
        </span>
      ))}

      {currentPage < totalPages && (
        <a
          href={buildUrl(currentPage + 1)}
          className="rounded-2xl border border-border/70 bg-card/58 px-4 py-2 text-sm font-semibold text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
        >
          {t('next')}
        </a>
      )}
    </nav>
  )
}
