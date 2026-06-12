'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Star, GitFork, Shield, Clock } from 'lucide-react'

interface ActivityItem {
  type: 'server_added'
  id: string
  name: string
  owner: string
  repo: string
  stars: number
  forks: number
  isOfficial: boolean | null
  category: string | null
  createdAt: string
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export function ActivityFeed({ locale, items }: { locale: string; items: ActivityItem[] }) {
  const t = useTranslations('Activity')

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t('empty')}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="flex items-start gap-4 p-4 rounded-xl hover:bg-accent/50 transition-colors group"
        >
          {/* Timeline dot */}
          <div className="flex flex-col items-center pt-1">
            <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
            {idx < items.length - 1 && (
              <div className="w-px flex-1 bg-border mt-1 min-h-[40px]" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/${locale}/servers/${item.owner}/${item.repo}`}
                className="font-medium group-hover:text-primary transition-colors truncate"
              >
                {item.name}
              </Link>
              {item.isOfficial && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  <Shield className="h-3 w-3 mr-1" />
                  {t('official')}
                </Badge>
              )}
              {item.category && (
                <Badge variant="outline" className="text-xs shrink-0 capitalize">
                  {item.category.replace(/-/g, ' ')}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t('addedBy', { owner: item.owner })} · {item.owner}/{item.repo}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {item.stars.toLocaleString('en-US')}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-3 w-3" />
                {item.forks.toLocaleString('en-US')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo(item.createdAt)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
