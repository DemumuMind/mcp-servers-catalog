'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { getServersPublic } from '@/app/actions/public'
import { ServerCard } from '@/components/server-card'
import { Loader2 } from 'lucide-react'

export interface ServerWithRating {
  id: string
  name: string
  description: string
  owner: string
  repo: string
  isOfficial: boolean
  isSponsored: boolean
  tags: string[]
  category: string
  stars?: number
  forks?: number
  avgRating?: number | null
  ratingCount?: number
}

interface InfiniteServerListProps {
  initialServers: ServerWithRating[]
  initialPage: number
  totalPages: number
  locale: string
  category?: string
  search?: string
  onlyOfficial?: boolean
  onlyRemote?: boolean
  sortBy?: string
}

export function InfiniteServerList({
  initialServers,
  initialPage,
  totalPages,
  locale,
  category,
  search,
  onlyOfficial,
  onlyRemote,
  sortBy = 'featured',
}: InfiniteServerListProps) {
  const t = useTranslations('InfiniteList')
  const [servers, setServers] = useState<ServerWithRating[]>(initialServers)
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPage < totalPages)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)

    try {
      const nextPage = page + 1
      const result = await getServersPublic(
        nextPage,
        search,
        category,
        undefined,
        onlyOfficial,
        undefined,
        onlyRemote,
        sortBy
      )

      if (result.servers.length > 0) {
        setServers((prev) => {
          const existingIds = new Set(prev.map(s => s.id))
          const unique = (result.servers as ServerWithRating[]).filter(s => !existingIds.has(s.id))
          return [...prev, ...unique]
        })
        setPage(nextPage)
        setHasMore(nextPage < result.pages)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Failed to load more servers:', error)
    } finally {
      setLoading(false)
    }
  }, [page, loading, hasMore, search, category, onlyOfficial, onlyRemote, sortBy])

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMore, hasMore, loading])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {servers.map((server, index) => (
          <ServerCard key={`${server.id}-${index}`} server={server} locale={locale} />
        ))}
      </div>

      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t('loading')}</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && servers.length > 0 && (
        <p className="text-center text-muted-foreground py-8 text-sm">
          {t('allLoaded')}
        </p>
      )}
    </div>
  )
}
