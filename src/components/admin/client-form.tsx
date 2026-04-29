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
  DialogTrigger,
} from '@/components/ui/dialog'
import { createClient, updateClient } from '@/app/actions/clients'

const clientSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url(),
  icon: z.string().optional(),
  featured: z.boolean(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  mode: 'create' | 'edit'
  client?: any
}

export function ClientForm({ mode, client }: ClientFormProps) {
  const [open, setOpen] = useState(false)
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client || {
      featured: false,
    },
  })

  const onSubmit = async (data: ClientFormData) => {
    if (mode === 'create') {
      await createClient(data)
    } else {
      await updateClient(client.id, data)
    }
    setOpen(false)
    window.location.reload()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>{mode === 'create' ? 'Add Client' : 'Edit'}</Button>} />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Client' : 'Edit Client'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input {...form.register('name')} />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea {...form.register('description')} />
          </div>
          <div>
            <label className="text-sm font-medium">URL</label>
            <Input {...form.register('url')} type="url" />
          </div>
          <div>
            <label className="text-sm font-medium">Icon (emoji or text)</label>
            <Input {...form.register('icon')} placeholder="e.g. 🖥️" />
          </div>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={form.watch('featured')}
              onCheckedChange={(checked) => form.setValue('featured', checked as boolean)}
            />
            Featured
          </label>
          <Button type="submit" className="w-full">
            {mode === 'create' ? 'Create Client' : 'Update Client'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
