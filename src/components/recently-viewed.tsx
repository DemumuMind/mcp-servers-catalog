'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { getRecentViews, clearViewHistory } from '@/app/actions/view-history'
import { Star, RadioTower, X, ChevronRight } from 'lucide-react'

interface RecentlyViewedProps {
  locale: string
  userId?: string
}

export function RecentlyViewed({ locale, userId }: RecentlyViewedProps) {
  const t = useTranslations('ViewHistory')
  const [servers, setServers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    getRecentViews(userId, 20).then((data) => {
      setServers(data)
      setLoading(false)
    })
  }, [userId])

  const handleClear = async () => {
    if (!userId) return
    await clearViewHistory(userId)
    setServers([])
  }

  if (!userId) return null
  if (loading) {
    return (
      <section className="mx-auto max-w-4xl">
        <div className="premium-panel p-6">
          <div className="animate-pulse h-8 w-48 bg-muted/30 rounded" />
        </div>
      </section>
    )
  }
  if (servers.length === 0) {
    return (
      <section className="mx-auto max-w-4xl">
        <div className="premium-panel p-6 text-center">
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-4xl">
      <div className="premium-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-xl font-semibold tracking-[-0.04em] text-foreground">
            {t('title')}
          </h3>
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-card/58 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:border-red-500/30 hover:text-red-400"
          >
            <X className="size-3" />
            {t('clear')}
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {servers.map((server) => (
            <Link
              key={server.id}
              href={`/${locale}/servers/${server.owner}/${server.repo}`}
              className="group flex-shrink-0 min-w-[220px] rounded-2xl border border-border/60 bg-card/50 p-4 transition-all hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center gap-2 mb-2">
                {server.isRemote && (
                  <RadioTower className="size-3.5 text-primary shrink-0" />
                )}
                <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                  {server.name}
                </p>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {server.description}
              </p>
              {server.stars > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="size-3 fill-primary text-primary" />
                  <span className="font-mono">{server.stars}</span>
                </div>
              )}
              <ChevronRight className="size-4 text-muted-foreground/40 mt-2 group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
