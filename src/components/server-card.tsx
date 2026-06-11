'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Star, GitFork, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ServerCardProps {
  server: {
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
  locale?: string
}

function ServerCardInner({ server, locale }: ServerCardProps) {
  const t = useTranslations('Server')
  const detailPath = locale
    ? `/${locale}/servers/${server.owner}/${server.repo}`
    : `/servers/${server.owner}/${server.repo}`

  const visibleTags = server.tags.slice(0, 8)

  return (
    <Link href={detailPath} prefetch className="group block h-full focus-ring rounded-2xl">
      <Card className="ambient-border h-full hover:-translate-y-1 hover:border-primary/35 hover:shadow-[var(--shadow-premium)]">
        <CardHeader className="pb-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                {server.owner}/{server.repo}
              </p>
              <h3 className="line-clamp-2 font-heading text-xl font-semibold tracking-[-0.05em] transition-colors group-hover:text-primary">
                {server.name}
              </h3>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted/70 text-muted-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <p className="min-h-[3rem] text-sm leading-6 text-muted-foreground line-clamp-2">
            {server.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {!!server.stars && (
              <span className="inline-flex items-center gap-1 rounded-xl bg-muted/65 px-2 py-1 font-mono" data-numeric>
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                {server.stars.toLocaleString('en-US')}
              </span>
            )}
            {!!server.forks && (
              <span className="inline-flex items-center gap-1 rounded-xl bg-muted/65 px-2 py-1 font-mono" data-numeric>
                <GitFork className="h-3.5 w-3.5" />
                {server.forks.toLocaleString('en-US')}
              </span>
            )}
            {server.avgRating !== undefined && server.avgRating !== null && (
              <span className="inline-flex items-center gap-1 rounded-xl bg-primary/10 px-2 py-1 font-mono font-semibold text-primary" data-numeric>
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                {server.avgRating.toFixed(1)}
                {server.ratingCount !== undefined && server.ratingCount > 0 && (
                  <span className="text-muted-foreground">({server.ratingCount})</span>
                )}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {server.isOfficial && (
              <Badge className="bg-primary text-primary-foreground">
                <ShieldCheck className="size-3" /> {t('official')}
              </Badge>
            )}
            {server.isSponsored && (
              <Badge className="bg-amber-500 text-white dark:bg-amber-400 dark:text-amber-950">
                <Sparkles className="size-3" /> {t('sponsored')}
              </Badge>
            )}
            {visibleTags.map((tag) => (
              <Badge key={tag} variant="outline" className={cn(tag === server.category && 'border-primary/30 text-primary')}>
                {tag}
              </Badge>
            ))}
            {server.tags.length > visibleTags.length && (
              <Badge variant="secondary">+{server.tags.length - visibleTags.length}</Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="mt-auto justify-between text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.16em]">{server.category}</span>
          <span className="font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">{t('open')}</span>
        </CardFooter>
      </Card>
    </Link>
  )
}

export const ServerCard = ServerCardInner
