'use client'

import { useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ServerCard } from '@/components/server-card'
import { Download, Folder, User, Calendar } from 'lucide-react'
import { exportCollectionConfig } from '@/app/actions/collections'

interface PublicCollectionViewProps {
  collection: {
    id: string
    name: string
    description: string | null
    createdAt: Date
    user: {
      name: string | null
      email: string
    } | null
    bookmarks: Array<{
      id: string
      server: {
        id: string
        name: string
        description: string
        owner: string
        repo: string
        isRemote: boolean
        isOfficial: boolean
        isSponsored: boolean
        endpoint: string | null
        githubUrl: string
        tags: string[]
        category: string
        stars?: number
        forks?: number
        avgRating?: number | null
        ratingCount?: number
      }
    }>
  }
  locale: string
}

export function PublicCollectionView({ collection, locale }: PublicCollectionViewProps) {
  const handleExport = useCallback(async () => {
    const config = await exportCollectionConfig(collection.id)
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${collection.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}-mcp-config.json`
    link.click()
  }, [collection])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Folder className="h-4 w-4" />
          <span>Публичная коллекция</span>
        </div>
        <h1 className="text-2xl font-bold">{collection.name}</h1>
        {collection.description && (
          <p className="text-muted-foreground">{collection.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {collection.user && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {collection.user.name || collection.user.email}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(collection.createdAt).toLocaleDateString('ru-RU')}
          </span>
          <Badge variant="secondary">{collection.bookmarks.length} серверов</Badge>
        </div>
      </div>

      <Button onClick={handleExport} variant="outline" className="gap-2">
        <Download className="h-4 w-4" />
        Скачать конфигурацию для Claude Desktop
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {collection.bookmarks.map((bookmark) => (
          <ServerCard
            key={bookmark.id}
            server={bookmark.server}
            locale={locale}
          />
        ))}
      </div>
    </div>
  )
}