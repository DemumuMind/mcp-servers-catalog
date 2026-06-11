'use client'

import { useTranslations } from 'next-intl'
import React, { useState } from "react";
import { useForm, UseFormReturn } from 'react-hook-form'
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

function getServerFormSchema(t: (key: string) => string) {
  return z.object({
  name: z.string().min(1, t('validation.nameRequired')),
  description: z.string().min(1, t('validation.descriptionRequired')),
  owner: z.string().min(1, t('validation.ownerRequired')),
  repo: z.string().min(1, t('validation.repoRequired')),
  category: z.string().min(1, t('validation.categoryRequired')),
  githubUrl: z.string().url(t('validation.urlInvalid')),
  tags: z.string().optional(),
  isOfficial: z.boolean(),
  isSponsored: z.boolean(),
  isRemote: z.boolean(),
  featured: z.boolean(),
  authType: z.string().optional(),
  endpoint: z.string().optional(),
  })
}

type ServerFormData = z.infer<ReturnType<typeof getServerFormSchema>>

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

function ServerFormFields({ form, t }: { form: UseFormReturn<ServerFormData>; t: (key: string) => string }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="srv-name" className="text-sm font-medium">{t('name')}</label>
          <Input id="srv-name" {...form.register('name')} />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="srv-github" className="text-sm font-medium">{t('githubUrl')}</label>
          <Input id="srv-github" {...form.register('githubUrl')} />
          {form.formState.errors.githubUrl && (
            <p className="text-sm text-red-500">{form.formState.errors.githubUrl.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="srv-desc" className="text-sm font-medium">{t('description')}</label>
        <Textarea id="srv-desc" {...form.register('description')} />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="srv-owner" className="text-sm font-medium">{t('owner')}</label>
          <Input id="srv-owner" {...form.register('owner')} />
        </div>
        <div className="space-y-2">
          <label htmlFor="srv-repo" className="text-sm font-medium">{t('repo')}</label>
          <Input id="srv-repo" {...form.register('repo')} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="srv-cat" className="text-sm font-medium">{t('category')}</label>
        <select
          {...form.register('category')}
          className="w-full p-2 border rounded-md bg-background"
        >
          <option value="">{t('selectCategory')}</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="srv-tags" className="text-sm font-medium">{t('tags')}</label>
        <Input id="srv-tags" {...form.register('tags')} placeholder={t('tagsPlaceholder')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="srv-auth" className="text-sm font-medium">{t('authType')}</label>
          <Input id="srv-auth" {...form.register('authType')} />
        </div>
        <div className="space-y-2">
          <label htmlFor="srv-endpoint" className="text-sm font-medium">{t('endpoint')}</label>
          <Input id="srv-endpoint" {...form.register('endpoint')} />
        </div>
      </div>
    </>
  )
}

function ServerCheckboxGroup({ form, t }: { form: UseFormReturn<ServerFormData>; t: (key: string) => string }) {
  const checkboxes: Array<{ id: string; field: keyof ServerFormData; label: string }> = [
    { id: 'srv-official', field: 'isOfficial', label: t('official') },
    { id: 'srv-sponsored', field: 'isSponsored', label: t('sponsored') },
    { id: 'srv-remote', field: 'isRemote', label: t('remote') },
    { id: 'srv-featured', field: 'featured', label: t('featured') },
  ]

  return (
    <div className="flex flex-wrap gap-4">
      {checkboxes.map(({ id, field, label }) => (
        /* eslint-disable-next-line jsx-a11y/label-has-associated-control */
        <label key={id} id={`label-${id}`} className="flex items-center gap-2">
          <Checkbox
            aria-labelledby={`label-${id}`}
            checked={form.watch(field) as boolean}
            onCheckedChange={(checked) => form.setValue(field, checked as boolean)}
          />
          <span className="text-sm">{label}</span>
        </label>
      ))}
    </div>
  )
}

export function ServerFormDialog({ server, children, onSuccess }: ServerFormDialogProps) {
  const t = useTranslations('Admin.servers.form')
  const ts = useTranslations('Admin.servers')
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ServerFormData>({
    resolver: zodResolver(getServerFormSchema(t)),
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{server ? ts('editServer') : ts('addServer')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ServerFormFields form={form} t={t} />
          <ServerCheckboxGroup form={form} t={t} />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('saving') : server ? t('save') : t('create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
