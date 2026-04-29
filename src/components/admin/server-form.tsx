'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { createServer, updateServer } from '@/app/actions/servers'

const serverSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  owner: z.string().min(1),
  repo: z.string().min(1),
  category: z.string().min(1),
  isOfficial: z.boolean(),
  isSponsored: z.boolean(),
  githubUrl: z.string().url(),
  tags: z.string().min(1),
  isRemote: z.boolean(),
  authType: z.string().optional(),
  endpoint: z.string().optional(),
  featured: z.boolean(),
})

type ServerFormData = z.infer<typeof serverSchema>

interface ServerFormProps {
  mode: 'create' | 'edit'
  server?: any
}

export function ServerForm({ mode, server }: ServerFormProps) {
  const [open, setOpen] = useState(false)
  const form = useForm<ServerFormData>({
    resolver: zodResolver(serverSchema),
    defaultValues: server
      ? {
          ...server,
          tags: Array.isArray(server.tags)
            ? server.tags.join(', ')
            : server.tags,
        }
      : {
          isOfficial: false,
          isSponsored: false,
          isRemote: false,
          featured: false,
          tags: '',
        },
  })

  const onSubmit = async (data: ServerFormData) => {
    const payload = {
      ...data,
      tags: data.tags.split(',').map((t) => t.trim()),
    }
    if (mode === 'create') {
      await createServer(payload)
    } else {
      await updateServer(server.id, payload)
    }
    setOpen(false)
    window.location.reload()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{mode === 'create' ? 'Add Server' : 'Edit'}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Server' : 'Edit Server'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input {...form.register('name')} />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input {...form.register('category')} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea {...form.register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Owner</label>
              <Input {...form.register('owner')} />
            </div>
            <div>
              <label className="text-sm font-medium">Repo</label>
              <Input {...form.register('repo')} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">GitHub URL</label>
            <Input {...form.register('githubUrl')} />
          </div>
          <div>
            <label className="text-sm font-medium">Tags (comma separated)</label>
            <Input {...form.register('tags')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Auth Type</label>
              <Input {...form.register('authType')} placeholder="oauth, http, sse" />
            </div>
            <div>
              <label className="text-sm font-medium">Endpoint</label>
              <Input {...form.register('endpoint')} />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <Controller
                name="isOfficial"
                control={form.control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              Official
            </label>
            <label className="flex items-center gap-2">
              <Controller
                name="isSponsored"
                control={form.control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              Sponsored
            </label>
            <label className="flex items-center gap-2">
              <Controller
                name="isRemote"
                control={form.control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              Remote
            </label>
            <label className="flex items-center gap-2">
              <Controller
                name="featured"
                control={form.control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              Featured
            </label>
          </div>
          <Button type="submit" className="w-full">
            {mode === 'create' ? 'Create Server' : 'Update Server'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
