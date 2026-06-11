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
} from "@/components/ui/dialog";
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

interface FormCheckboxProps {
  name: string
  label: string
  control: any
}

function FormCheckbox({ name, label, control }: FormCheckboxProps) {
  const labelId = `label-sf-${name}`
  return (
    <label id={labelId} className="flex items-center gap-2">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Checkbox
            aria-labelledby={labelId}
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
      {label}
    </label>
  )
}

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
    <>
      <Button onClick={() => setOpen(true)}>
        {mode === 'create' ? 'Add Server' : 'Edit'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Server' : 'Edit Server'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sf-name" className="text-sm font-medium">Name</label>
              <Input id="sf-name" {...form.register('name')} />
            </div>
            <div>
              <label htmlFor="sf-category" className="text-sm font-medium">Category</label>
              <Input id="sf-category" {...form.register('category')} />
            </div>
          </div>
          <div>
            <label htmlFor="sf-description" className="text-sm font-medium">Description</label>
            <Textarea id="sf-description" {...form.register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sf-owner" className="text-sm font-medium">Owner</label>
              <Input id="sf-owner" {...form.register('owner')} />
            </div>
            <div>
              <label htmlFor="sf-repo" className="text-sm font-medium">Repo</label>
              <Input id="sf-repo" {...form.register('repo')} />
            </div>
          </div>
          <div>
            <label htmlFor="sf-githubUrl" className="text-sm font-medium">GitHub URL</label>
            <Input id="sf-githubUrl" {...form.register('githubUrl')} />
          </div>
          <div>
            <label htmlFor="sf-tags" className="text-sm font-medium">Tags (comma separated)</label>
            <Input id="sf-tags" {...form.register('tags')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sf-authType" className="text-sm font-medium">Auth Type</label>
              <Input id="sf-authType" {...form.register('authType')} placeholder="oauth, http, sse" />
            </div>
            <div>
              <label htmlFor="sf-endpoint" className="text-sm font-medium">Endpoint</label>
              <Input id="sf-endpoint" {...form.register('endpoint')} />
            </div>
          </div>
          <div className="flex gap-4">
            <FormCheckbox name="isOfficial" label="Official" control={form.control} />
            <FormCheckbox name="isSponsored" label="Sponsored" control={form.control} />
            <FormCheckbox name="isRemote" label="Remote" control={form.control} />
            <FormCheckbox name="featured" label="Featured" control={form.control} />
          </div>
          <Button type="submit" className="w-full">
            {mode === 'create' ? 'Create Server' : 'Update Server'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
