'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Folder, Plus, Trash2, Share2, ExternalLink, Settings, Download } from 'lucide-react'
import { createCollection, deleteCollection, updateCollection, exportCollectionConfig } from '@/app/actions/collections'
import Link from 'next/link'

interface Collection {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  shareSlug: string | null
  createdAt: Date
  updatedAt: Date
  bookmarks: Array<{
    id: string
    server: {
      id: string
      name: string
      owner: string
      repo: string
      isRemote: boolean
      endpoint: string | null
    }
  }>
}

interface CollectionsClientProps {
  collections: Collection[]
  locale: string
  userId: string
}

export function CollectionsClient({ collections, locale, userId }: CollectionsClientProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editIsPublic, setEditIsPublic] = useState(false)

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return
    await createCollection(newName.trim(), newDescription.trim() || undefined)
    setNewName('')
    setNewDescription('')
    setIsCreating(false)
    router.refresh()
  }, [newName, newDescription, router])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Удалить коллекцию?')) return
    await deleteCollection(id)
    router.refresh()
  }, [router])

  const handleUpdate = useCallback(async (id: string) => {
    await updateCollection(id, {
      name: editName,
      description: editDescription,
      isPublic: editIsPublic,
    })
    setEditingId(null)
    router.refresh()
  }, [editName, editDescription, editIsPublic, router])

  const handleExport = useCallback(async (id: string) => {
    const config = await exportCollectionConfig(id)
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `mcp-collection-config.json`
    link.click()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          <h1 className="text-xl font-bold">Мои коллекции</h1>
          <span className="text-sm text-muted-foreground">({collections.length})</span>
        </div>

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Новая коллекция
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать коллекцию</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Название"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Textarea
                placeholder="Описание (необязательно)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <Button onClick={handleCreate} disabled={!newName.trim()}>
                Создать
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {collections.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">
          У вас пока нет коллекций. Создайте первую, чтобы группировать серверы.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <Card key={collection.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{collection.name}</CardTitle>
                    {collection.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{collection.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {collection.isPublic && (
                      <Badge variant="secondary" className="text-xs">Публичная</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span>{collection.bookmarks.length} серверов</span>
                  <span>·</span>
                  <span>{new Date(collection.updatedAt).toLocaleDateString('ru-RU')}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {collection.bookmarks.slice(0, 3).map((b) => (
                    <Badge key={b.id} variant="outline" className="text-xs">
                      {b.server.name}
                    </Badge>
                  ))}
                  {collection.bookmarks.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{collection.bookmarks.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditingId(collection.id)
                      setEditName(collection.name)
                      setEditDescription(collection.description || '')
                      setEditIsPublic(collection.isPublic)
                    }}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Настроить
                  </Button>

                  {collection.shareSlug && collection.isPublic && (
                    <Link
                      href={`/${locale}/collections/${collection.shareSlug}`}
                      target="_blank"
                    >
                      <Button variant="outline" size="sm">
                        <Share2 className="h-3 w-3 mr-1" />
                        Поделиться
                      </Button>
                    </Link>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(collection.id)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Config
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(collection.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>

              {/* Edit Dialog */}
              {editingId === collection.id && (
                <Dialog open={true} onOpenChange={() => setEditingId(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Настройки коллекции</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={editIsPublic}
                          onChange={(e) => setEditIsPublic(e.target.checked)}
                        />
                        Публичная коллекция
                      </label>
                      {collection.isPublic && collection.shareSlug && (
                        <div className="text-xs text-muted-foreground">
                          Ссылка: mcpservers.org/{locale}/collections/{collection.shareSlug}
                        </div>
                      )}
                      <Button onClick={() => handleUpdate(collection.id)}>
                        Сохранить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}