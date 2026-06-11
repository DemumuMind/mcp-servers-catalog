import { getTrendingSearches } from '@/app/actions/search-tracking'
import { getTranslations } from 'next-intl/server'
import { TrendingUp } from 'lucide-react'

interface TrendingSearchesProps {
  locale: string
}

export async function TrendingSearches({ locale }: TrendingSearchesProps) {
  const t = await getTranslations({ locale, namespace: 'TrendingSearches' })
  const searches = await getTrendingSearches(24, 10)

  if (searches.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      <TrendingUp className="size-4 text-primary" />
      <span className="text-xs font-semibold text-muted-foreground">
        {t('title')}:
      </span>
      {searches.map((item) => (
        <a
          key={item.query}
          href={`/${locale}/all?q=${encodeURIComponent(item.query)}`}
          className="rounded-xl border border-border/50 bg-card/40 px-3 py-1 text-xs font-semibold text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:text-foreground"
        >
          {item.query}
          <span className="ml-1 font-mono text-[0.6rem] text-muted-foreground/60">
            ({item.count})
          </span>
        </a>
      ))}
    </div>
  )
}
