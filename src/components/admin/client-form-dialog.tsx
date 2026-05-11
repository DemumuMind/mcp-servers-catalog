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
import { createClient, updateClient } from '@/app/actions/clients'
import React from 'react'

const clientFormSchema = z.object({
  name: z.string().min(1, 'Введите название'),
  description: z.string().min(1, 'Введите описание'),
  url: z.string().url('Введите корректный URL'),
  icon: z.string().optional(),
  featured: z.boolean(),
})

type ClientFormData = z.infer<typeof clientFormSchema>

interface ClientFormDialogProps {
  client?: {
    id: string
    name: string
    description: string
    url: string
    icon: string | null
    featured: boolean
  } | null
  children: React.ReactNode
  onSuccess?: () => void
}

export function ClientFormDialog({ client, children, onSuccess }: ClientFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: client
      ? {
          ...client,
          icon: client.icon || '',
        }
      : {
          name: '',
          description: '',
          url: '',
          icon: '',
          featured: false,
        },
  })

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true)
    try {
      if (client) {
        await updateClient(client.id, data)
      } else {
        await createClient(data)
      }

      setOpen(false)
      form.reset()
      onSuccess?.()
    } catch (err) {
      console.error('Client form error:', err)
      alert('Ошибка при сохранении клиента')
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{client ? 'Редактировать клиент' : 'Добавить клиент'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Название</label>
            <Input {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Описание</label>
            <Textarea {...form.register('description')} />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">URL</label>
            <Input {...form.register('url')} />
            {form.formState.errors.url && (
              <p className="text-sm text-red-500">{form.formState.errors.url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Icon URL (опционально)</label>
            <Input {...form.register('icon')} />
          </div>

          <label className="flex items-center gap-2">
            <Checkbox
              checked={form.watch('featured')}
              onCheckedChange={(checked) => form.setValue('featured', checked as boolean)}
            />
            <span className="text-sm">Featured</span>
          </label>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : client ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
