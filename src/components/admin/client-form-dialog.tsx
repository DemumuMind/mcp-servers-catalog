'use client'

import React, { useState } from "react";
import { useTranslations } from 'next-intl'
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

function getClientFormSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    description: z.string().min(1, t('validation.descriptionRequired')),
    url: z.string().url(t('validation.urlInvalid')),
    icon: z.string().optional(),
    featured: z.boolean(),
  })
}

type ClientFormData = z.infer<ReturnType<typeof getClientFormSchema>>

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
  const t = useTranslations('Admin.clients.form')
  const tc = useTranslations('Admin.clients')
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ClientFormData>({
    resolver: zodResolver(getClientFormSchema(t)),
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
      alert(t('errorSaving'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const trigger = (
    <button onClick={() => setOpen(true)} type="button" className="inline-flex items-center">
      {children}
    </button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{client ? tc('editClient') : tc('addClient')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">{t('name')}</label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">{t('description')}</label>
            <Textarea id="description" {...form.register('description')} />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">{t('url')}</label>
            <Input id="url" {...form.register('url')} />
            {form.formState.errors.url && (
              <p className="text-sm text-red-500">{form.formState.errors.url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="icon" className="text-sm font-medium">{t('iconUrl')}</label>
            <Input id="icon" {...form.register('icon')} />
          </div>

          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label id="label-cli-featured" className="flex items-center gap-2">
            <Checkbox
              aria-labelledby="label-cli-featured"
              checked={form.watch('featured')}
              onCheckedChange={(checked) => form.setValue('featured', checked as boolean)}
            />
            <span className="text-sm">{t('featured')}</span>
          </label>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('saving') : client ? t('save') : t('create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
