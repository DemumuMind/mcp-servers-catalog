'use client'

import React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Star, GitFork } from 'lucide-react'

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
  const detailPath = locale
    ? `/${locale}/servers/${server.owner}/${server.repo}`
    : `/servers/${server.owner}/${server.repo}`

  return (
    <Link href={detailPath} prefetch>
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{server.name}</h3>
            <div className="flex gap-1">
              {server.isOfficial && (
                <Badge variant="default" className="bg-yellow-500">Официальный 🌟</Badge>
              )}
              {server.isSponsored && (
                <Badge variant="default" className="bg-amber-500 text-white">Реклама</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {server.description}
          </p>
          
          {/* Stars, Forks & Rating */}
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            {!!server.stars && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {server.stars.toLocaleString()}
              </span>
            )}
            {!!server.forks && (
              <span className="flex items-center gap-1">
                <GitFork className="h-3 w-3" />
                {server.forks.toLocaleString()}
              </span>
            )}
            {server.avgRating !== undefined && server.avgRating !== null && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                {server.avgRating.toFixed(1)}
                {server.ratingCount !== undefined && server.ratingCount > 0 && (
                  <span className="text-muted-foreground font-normal">({server.ratingCount})</span>
                )}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {server.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export const ServerCard = React.memo(ServerCardInner, (prev, next) => {
  // Deep compare server object key fields
  if (prev.locale !== next.locale) return false
  const ps = prev.server
  const ns = next.server
  return (
    ps.id === ns.id &&
    ps.name === ns.name &&
    ps.description === ns.description &&
    ps.owner === ns.owner &&
    ps.repo === ns.repo &&
    ps.isOfficial === ns.isOfficial &&
    ps.isSponsored === ns.isSponsored &&
    ps.category === ns.category &&
    ps.stars === ns.stars &&
    ps.forks === ns.forks &&
    ps.avgRating === ns.avgRating &&
    ps.ratingCount === ns.ratingCount &&
    ps.tags.length === ns.tags.length &&
    ps.tags.every((t, i) => t === ns.tags[i])
  )
})
