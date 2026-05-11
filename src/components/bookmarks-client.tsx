'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ServerCard } from '@/components/server-card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Bookmark, Download, FileJson, FileSpreadsheet, Scale } from 'lucide-react'

interface BookmarkWithServer {
  id: string
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
}

interface BookmarksClientProps {
  bookmarks: BookmarkWithServer[]
  locale: string
  userId: string
}

export function BookmarksClient({ bookmarks, locale, userId }: BookmarksClientProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const router = useRouter()

  const toggleOne = (serverId: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(serverId)) {
      newSelected.delete(serverId)
    } else {
      newSelected.add(serverId)
    }
    setSelected(newSelected)
  }

  const handleCompare = () => {
    if (selected.size < 2) {
      alert('Выберите хотя бы 2 сервера для сравнения')
      return
    }
    const ids = Array.from(selected)
    router.push(`/${locale}/compare?ids=${ids.join(',')}`)
  }

  const handleExportJSON = useCallback(async () => {
    const { exportBookmarksJSON } = await import('@/app/actions/export-bookmarks')
    const json = await exportBookmarksJSON(userId)
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `bookmarks_${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }, [userId])

  const handleExportCSV = useCallback(async () => {
    const { exportBookmarksCSV } = await import('@/app/actions/export-bookmarks')
    const csv = await exportBookmarksCSV(userId)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `bookmarks_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }, [userId])

  if (bookmarks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          <h1 className="text-xl font-bold">Мои закладки</h1>
          <span className="text-sm text-muted-foreground">(0)</span>
        </div>
        <p className="text-muted-foreground text-center py-16">
          У вас пока нет закладок. Нажмите "В закладки" на карточке сервера, чтобы сохранить его.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          <h1 className="text-xl font-bold">Мои закладки</h1>
          <span className="text-sm text-muted-foreground">({bookmarks.length})</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportJSON}>
            <FileJson className="h-4 w-4 mr-1" />
            JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            CSV
          </Button>
        </div>
      </div>

      {/* Compare bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">Выбрано: {selected.size}</span>
          <Button size="sm" onClick={handleCompare} disabled={selected.size < 2}>
            <Scale className="h-4 w-4 mr-1" />
            Сравнить
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            Очистить
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="relative">
            <div className="absolute top-3 left-3 z-10">
              <Checkbox
                checked={selected.has(bookmark.server.id)}
                onCheckedChange={() => toggleOne(bookmark.server.id)}
                className="bg-background border-2"
              />
            </div>
            <div className="pl-10">
              <ServerCard server={bookmark.server} locale={locale} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
