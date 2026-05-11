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
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Trash2, ExternalLink, Download } from 'lucide-react'
import { exportSubmissionsToCSV } from '@/app/actions/export'

interface Submission {
  id: string
  name: string
  description: string
  url: string
  category: string
  email: string
  premium: boolean
  status: string
  createdAt: Date
}

interface BulkSubmissionsTableProps {
  submissions: Submission[]
  approveAction: (id: string) => Promise<void>
  bulkApproveAction?: (ids: string[]) => Promise<void>
  rejectAction: (id: string) => Promise<void>
  deleteAction: (ids: string[]) => Promise<void>
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500 text-white">Одобрено</Badge>
    case 'rejected':
      return <Badge className="bg-red-500 text-white">Отклонено</Badge>
    default:
      return <Badge className="bg-yellow-500 text-white">На рассмотрении</Badge>
  }
}

export function BulkSubmissionsTable({
  submissions,
  approveAction,
  bulkApproveAction,
  rejectAction,
  deleteAction,
}: BulkSubmissionsTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const toggleAll = () => {
    if (selected.size === submissions.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(submissions.map((s) => s.id)))
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
    if (!confirm(`Удалить ${selected.size} отправок?`)) return
    startTransition(async () => {
      await deleteAction(Array.from(selected))
      setSelected(new Set())
      router.refresh()
    })
  }

  const handleBulkApprove = () => {
    if (!bulkApproveAction) return
    if (!confirm(`Одобрить ${selected.size} отправок?`)) return
    startTransition(async () => {
      await bulkApproveAction(Array.from(selected))
      setSelected(new Set())
      router.refresh()
    })
  }

  const handleAction = async (action: 'approve' | 'reject' | 'delete', id: string) => {
    startTransition(async () => {
      try {
        if (action === 'approve') {
          await approveAction(id)
        } else if (action === 'reject') {
          await rejectAction(id)
        } else if (action === 'delete') {
          await deleteAction([id])
        }
        router.refresh()
      } catch (err) {
        console.error('Action error:', err)
        alert('Ошибка при выполнении действия')
      }
    })
  }

  const handleExport = async () => {
    const csv = await exportSubmissionsToCSV()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `submissions_${new Date().toISOString().split('T')[0]}.csv`
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
          {bulkApproveAction && (
            <Button
              variant="default"
              size="sm"
              onClick={handleBulkApprove}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Одобрить
            </Button>
          )}
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
                    checked={selected.size === submissions.length && submissions.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(sub.id)}
                      onCheckedChange={() => toggleOne(sub.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{sub.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {sub.description}
                    </div>
                  </TableCell>
                  <TableCell>{sub.email}</TableCell>
                  <TableCell className="capitalize">{sub.category}</TableCell>
                  <TableCell>
                    {sub.premium ? (
                      <Badge className="bg-amber-500 text-white">Premium</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell>
                    {new Date(sub.createdAt).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={sub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9 p-0 hover:bg-accent border"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      {sub.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Одобрить"
                            onClick={() => handleAction('approve', sub.id)}
                            disabled={isPending}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Отклонить"
                            onClick={() => handleAction('reject', sub.id)}
                            disabled={isPending}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Удалить"
                        onClick={() => handleAction('delete', sub.id)}
                        disabled={isPending}
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
