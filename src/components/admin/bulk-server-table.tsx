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
import { ServerFormDialog } from '@/components/admin/server-form-dialog'
import { exportServersToCSV } from '@/app/actions/export'

interface Server {
  id: string
  name: string
  fullSlug: string
  category: string
  isOfficial: boolean
  featured: boolean
  featuredUntil: Date | null
  isSponsored: boolean
  sponsoredUntil: Date | null
}

interface BulkServerTableProps {
  servers: Server[]
  deleteAction: (ids: string[]) => Promise<void>
  toggleFeaturedAction?: (id: string, featured: boolean) => Promise<void>
}

export function BulkServerTable({ servers, deleteAction, toggleFeaturedAction }: BulkServerTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [featuredState, setFeaturedState] = useState<Record<string, boolean>>(
    Object.fromEntries(servers.map((s) => [s.id, s.featured]))
  )

  const toggleAll = () => {
    if (selected.size === servers.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(servers.map((s) => s.id)))
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
    if (!confirm(`Удалить ${selected.size} серверов?`)) return
    startTransition(async () => {
      await deleteAction(Array.from(selected))
      setSelected(new Set())
      router.refresh()
    })
  }

  const handleExport = async () => {
    const csv = await exportServersToCSV()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `servers_${new Date().toISOString().split('T')[0]}.csv`
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
                    checked={selected.size === servers.length && servers.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Official</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Featured до</TableHead>
                <TableHead>Sponsored до</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servers.map((server) => (
                <TableRow key={server.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(server.id)}
                      onCheckedChange={() => toggleOne(server.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{server.name}</div>
                    <div className="text-sm text-muted-foreground">{server.fullSlug}</div>
                  </TableCell>
                  <TableCell className="capitalize">{server.category}</TableCell>
                  <TableCell>{server.isOfficial ? '✅' : '—'}</TableCell>
                  <TableCell>
                    {toggleFeaturedAction ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={featuredState[server.id] ? 'text-green-600' : 'text-muted-foreground'}
                        onClick={() => {
                          const newValue = !featuredState[server.id]
                          setFeaturedState((prev) => ({ ...prev, [server.id]: newValue }))
                          startTransition(async () => {
                            await toggleFeaturedAction(server.id, newValue)
                            router.refresh()
                          })
                        }}
                        disabled={isPending}
                      >
                        {featuredState[server.id] ? '✅ Featured' : '—'}
                      </Button>
                    ) : (
                      <span>{server.featured ? '✅' : '—'}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {server.featuredUntil
                      ? new Date(server.featuredUntil).toLocaleDateString('ru-RU')
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {server.isSponsored
                      ? server.sponsoredUntil
                        ? new Date(server.sponsoredUntil).toLocaleDateString('ru-RU')
                        : '✅'
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ServerFormDialog server={server as any}>
                        <Button variant="outline" size="icon" type="button" aria-label="Редактировать сервер">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </ServerFormDialog>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (confirm('Удалить сервер?')) {
                            startTransition(async () => {
                              await deleteAction([server.id])
                              router.refresh()
                            })
                          }
                        }}
                        disabled={isPending}
                        aria-label="Удалить сервер"
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
