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
import { Pencil, Trash2, Download } from 'lucide-react'
import { ServerFormDialog } from '@/components/admin/server-form-dialog'
import { exportServersToCSV } from '@/app/actions/export'

interface Server {
  id: string
  name: string
  description: string
  owner: string
  repo: string
  fullSlug: string
  category: string
  githubUrl: string
  tags: string[]
  isOfficial: boolean
  isSponsored: boolean
  isRemote: boolean
  featured: boolean
  featuredUntil: Date | null
  sponsoredUntil: Date | null
  authType: string | null
  endpoint: string | null
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
    if (!confirm(`Delete ${selected.size} servers?`)) return
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
      <div className="premium-panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <>
              <span className="text-sm text-muted-foreground">
                Selected: {selected.size}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
      </div>

      <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selected.size === servers.length && servers.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Official</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Featured until</TableHead>
                <TableHead>Sponsored until</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                      ? new Date(server.featuredUntil).toLocaleDateString('en-US')
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {server.isSponsored
                      ? server.sponsoredUntil
                        ? new Date(server.sponsoredUntil).toLocaleDateString('en-US')
                        : '✅'
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ServerFormDialog server={server}>
                        <Button variant="outline" size="icon" type="button" aria-label="Edit server">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </ServerFormDialog>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          if (confirm('Delete server?')) {
                            startTransition(async () => {
                              await deleteAction([server.id])
                              router.refresh()
                            })
                          }
                        }}
                        disabled={isPending}
                        aria-label="Delete server"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
    </div>
  )
}

