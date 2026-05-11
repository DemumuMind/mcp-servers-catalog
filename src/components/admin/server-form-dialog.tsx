'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createServer, updateServer } from '@/app/actions/servers'
import React from 'react'

const serverFormSchema = z.object({
  name: z.string().min(1, 'Введите название'),
  description: z.string().min(1, 'Введите описание'),
  owner: z.string().min(1, 'Введите owner'),
  repo: z.string().min(1, 'Введите repo'),
  category: z.string().min(1, 'Выберите категорию'),
  githubUrl: z.string().url('Введите корректный URL'),
  tags: z.string().optional(),
  isOfficial: z.boolean(),
  isSponsored: z.boolean(),
  isRemote: z.boolean(),
  featured: z.boolean(),
  authType: z.string().optional(),
  endpoint: z.string().optional(),
})

type ServerFormData = z.infer<typeof serverFormSchema>

const categories = [
  'search', 'web-scraping', 'communication', 'productivity', 'development',
  'database', 'cloud-service', 'file-system', 'cloud-storage', 'version-control',
  'browser-automation', 'ai-ml', 'other'
]

interface ServerFormDialogProps {
  server?: {
    id: string
    name: string
    description: string
    owner: string
    repo: string
    category: string
    githubUrl: string
    tags: string[]
    isOfficial: boolean
    isSponsored: boolean
    isRemote: boolean
    featured: boolean
    authType: string | null
    endpoint: string | null
  } | null
  children: React.ReactNode
  onSuccess?: () => void
}

export function ServerFormDialog({ server, children, onSuccess }: ServerFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ServerFormData>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: server
      ? {
          ...server,
          tags: server.tags.join(', '),
          authType: server.authType || '',
          endpoint: server.endpoint || '',
        }
      : {
          name: '',
          description: '',
          owner: '',
          repo: '',
          category: '',
          githubUrl: '',
          tags: '',
          isOfficial: false,
          isSponsored: false,
          isRemote: false,
          featured: false,
          authType: '',
          endpoint: '',
        },
  })

  const onSubmit = async (data: ServerFormData) => {
    setIsSubmitting(true)
    try {
      const serverData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      }

      if (server) {
        await updateServer(server.id, serverData)
      } else {
        await createServer(serverData)
      }

      setOpen(false)
      form.reset()
      onSuccess?.()
    } catch (err) {
      console.error('Server form error:', err)
      alert('Ошибка при сохранении сервера')
    } finally {
      setIsSubmitting(false)
    }
  }

  const trigger = (
    <span onClick={() => setOpen(true)} style={{ display: 'inline-block' }} role="button" tabIndex={0}>
      {children}
    </span>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{server ? 'Редактировать сервер' : 'Добавить сервер'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Название</label>
              <Input {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub URL</label>
              <Input {...form.register('githubUrl')} />
              {form.formState.errors.githubUrl && (
                <p className="text-sm text-red-500">{form.formState.errors.githubUrl.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Описание</label>
            <Textarea {...form.register('description')} />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Owner</label>
              <Input {...form.register('owner')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Repo</label>
              <Input {...form.register('repo')} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Категория</label>
            <select
              {...form.register('category')}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="">Выберите категорию</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Теги (через запятую)</label>
            <Input {...form.register('tags')} placeholder="tag1, tag2, tag3" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Auth Type</label>
              <Input {...form.register('authType')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Endpoint</label>
              <Input {...form.register('endpoint')} />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={form.watch('isOfficial')}
                onCheckedChange={(checked) => form.setValue('isOfficial', checked as boolean)}
              />
              <span className="text-sm">Official</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={form.watch('isSponsored')}
                onCheckedChange={(checked) => form.setValue('isSponsored', checked as boolean)}
              />
              <span className="text-sm">Sponsored</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={form.watch('isRemote')}
                onCheckedChange={(checked) => form.setValue('isRemote', checked as boolean)}
              />
              <span className="text-sm">Remote</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={form.watch('featured')}
                onCheckedChange={(checked) => form.setValue('featured', checked as boolean)}
              />
              <span className="text-sm">Featured</span>
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : server ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
