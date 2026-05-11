'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Pencil, Trash2, Download } from 'lucide-react'
import { ClientFormDialog } from '@/components/admin/client-form-dialog'
import { exportClientsToCSV } from '@/app/actions/export'

interface Client {
  id: string
  name: string
  description: string
  url: string
  featured: boolean
}

interface BulkClientTableProps {
  clients: Client[]
  deleteAction: (ids: string[]) => Promise<void>
}

export function BulkClientTable({ clients, deleteAction }: BulkClientTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const toggleAll = () => {
    if (selected.size === clients.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(clients.map((c) => c.id)))
    }
  }

  const toggleOne = (id: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  const handleBulkDelete = () => {
    if (!confirm(`Удалить ${selected.size} клиентов?`)) return
    startTransition(async () => {
      await deleteAction(Array.from(selected))
      setSelected(new Set())
      router.refresh()
    })
  }

  const handleExport = async () => {
    const csv = await exportClientsToCSV()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `clients_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <>
              <span className="text-sm text-muted-foreground">
                Выбрано: {selected.size}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Удалить
              </Button>
            </>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" />
          Экспорт CSV
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selected.size === clients.length && clients.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Название</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(client.id)}
                      onCheckedChange={() => toggleOne(client.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-muted-foreground">{client.description}</div>
                  </TableCell>
                  <TableCell>{client.url}</TableCell>
                  <TableCell>{client.featured ? '✅' : '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ClientFormDialog client={client as any}>
                        <Button variant="outline" size="icon" type="button" aria-label="Редактировать клиент">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </ClientFormDialog>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (confirm('Удалить клиент?')) {
                            startTransition(async () => {
                              await deleteAction([client.id])
                              router.refresh()
                            })
                          }
                        }}
                        disabled={isPending}
                        aria-label="Удалить клиент"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
