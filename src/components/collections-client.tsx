'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Folder, Plus, Trash2, Share2, Settings, Download } from "lucide-react";
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

function CreateCollectionDialog({
  open,
  onOpenChange,
  newName,
  newDescription,
  onNameChange,
  onDescriptionChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  newName: string
  newDescription: string
  onNameChange: (val: string) => void
  onDescriptionChange: (val: string) => void
  onCreate: () => void
}) {
  const t = useTranslations('Collections')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('createTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            placeholder={t('namePlaceholder')}
            value={newName}
            onChange={(e) => onNameChange(e.target.value)}
          />
          <Textarea
            placeholder={t('descriptionPlaceholder')}
            value={newDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
          <Button onClick={onCreate} disabled={!newName.trim()}>
            {t('create')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EditCollectionDialog({
  collection,
  locale,
  editName,
  editDescription,
  editIsPublic,
  onNameChange,
  onDescriptionChange,
  onIsPublicChange,
  onSave,
  onClose,
}: {
  collection: Collection
  locale: string
  editName: string
  editDescription: string
  editIsPublic: boolean
  onNameChange: (val: string) => void
  onDescriptionChange: (val: string) => void
  onIsPublicChange: (val: boolean) => void
  onSave: () => void
  onClose: () => void
}) {
  const t = useTranslations('Collections')
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('editTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            aria-label={t('nameLabel')}
            value={editName}
            onChange={(e) => onNameChange(e.target.value)}
          />
          <Textarea
            aria-label={t('descriptionLabel')}
            value={editDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
          <label htmlFor="edit-is-public" className="flex items-center gap-2 text-sm">
            <input
              id="edit-is-public"
              type="checkbox"
              aria-label={t('publicLabel')}
              checked={editIsPublic}
              onChange={(e) => onIsPublicChange(e.target.checked)}
            />
            {t('publicLabel')}
          </label>
          {collection.isPublic && collection.shareSlug && (
            <div className="text-xs text-muted-foreground">
              {t('shareLink', { locale, slug: collection.shareSlug })}
            </div>
          )}
          <Button onClick={onSave}>
            {t('save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CollectionCard({
  collection,
  locale,
  onEdit,
  onDelete,
  onExport,
}: {
  collection: Collection
  locale: string
  onEdit: (collection: Collection) => void
  onDelete: (id: string) => void
  onExport: (id: string) => void
}) {
  const t = useTranslations('Collections')
  return (
    <Card className="relative">
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
              <Badge variant="secondary" className="text-xs">{t('public')}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <span>{t('serverCount', { count: collection.bookmarks.length })}</span>
          <span>·</span>
          <span>{new Date(collection.updatedAt).toLocaleDateString(locale)}</span>
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
            onClick={() => onEdit(collection)}
          >
            <Settings className="h-3 w-3 mr-1" />
            {t('settings')}
          </Button>

          {collection.shareSlug && collection.isPublic && (
            <Link
              href={`/${locale}/collections/${collection.shareSlug}`}
              target="_blank"
            >
              <Button variant="outline" size="sm">
                <Share2 className="h-3 w-3 mr-1" />
                {t('share')}
              </Button>
            </Link>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport(collection.id)}
          >
            <Download className="h-3 w-3 mr-1" />
            Config
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(collection.id)}
            aria-label={t('deleteLabel')}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function CollectionsClient({ collections, locale, userId: _userId }: CollectionsClientProps) {
  const t = useTranslations('Collections')
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
    if (!confirm(t('deleteConfirm'))) return
    await deleteCollection(id)
    router.refresh()
  }, [router, t])

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

  const handleEdit = (collection: Collection) => {
    setEditingId(collection.id)
    setEditName(collection.name)
    setEditDescription(collection.description || '')
    setEditIsPublic(collection.isPublic)
  }

  const editingCollection = editingId ? collections.find((c) => c.id === editingId) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <span className="text-sm text-muted-foreground">({collections.length})</span>
        </div>

        <Button size="sm" onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-1" />
          {t('newCollection')}
        </Button>
      </div>

      <CreateCollectionDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        newName={newName}
        newDescription={newDescription}
        onNameChange={setNewName}
        onDescriptionChange={setNewDescription}
        onCreate={handleCreate}
      />

      {collections.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">
          {t('emptyState')}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <div key={collection.id}>
              <CollectionCard
                collection={collection}
                locale={locale}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onExport={handleExport}
              />
              {editingId === collection.id && editingCollection && (
                <EditCollectionDialog
                  collection={editingCollection}
                  locale={locale}
                  editName={editName}
                  editDescription={editDescription}
                  editIsPublic={editIsPublic}
                  onNameChange={setEditName}
                  onDescriptionChange={setEditDescription}
                  onIsPublicChange={setEditIsPublic}
                  onSave={() => handleUpdate(collection.id)}
                  onClose={() => setEditingId(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
