'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Tag, Calendar } from 'lucide-react'

interface Release {
  tag_name: string
  name: string
  body: string | null
  published_at: string
  html_url: string
  prerelease: boolean
  draft: boolean
}

interface ReleasesChangelogProps {
  releases: Release[]
  repoUrl: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function truncateBody(body: string | null, maxLength: number = 200): string {
  if (!body) return ''
  const cleaned = body
    .replace(/#{1,6}\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim()
  
  if (cleaned.length <= maxLength) return cleaned
  return cleaned.slice(0, maxLength) + '...'
}

export function ReleasesChangelog({ releases, repoUrl }: ReleasesChangelogProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (releases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Последние обновления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Нет информации о релизах. Возможно, репозиторий не использует GitHub Releases.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Последние обновления
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {releases.map((release) => {
            const isExpanded = expanded === release.tag_name
            
            return (
              <div
                key={release.tag_name}
                className="border-l-2 border-muted pl-4 py-2 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={release.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-primary hover:underline"
                      >
                        {release.name || release.tag_name}
                      </a>
                      {release.prerelease && (
                        <Badge variant="secondary" className="text-xs">Pre-release</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(release.published_at)}
                    </div>

                    {release.body && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">
                          {isExpanded ? release.body : truncateBody(release.body)}
                        </p>
                        
                        {release.body.length > 200 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 h-auto p-0 text-xs"
                            onClick={() => setExpanded(isExpanded ? null : release.tag_name)}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3 h-3 mr-1" />
                                Свернуть
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3 mr-1" />
                                Подробнее
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t">
          <a
            href={`${repoUrl}/releases`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            Все релизы на GitHub →
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
