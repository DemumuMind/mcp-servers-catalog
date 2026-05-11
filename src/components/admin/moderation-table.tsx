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
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'

interface Comment {
  id: string
  content: string
  isModerated: boolean
  createdAt: Date
  user: { name: string | null; email: string }
  server: { name: string; owner: string; repo: string }
}

interface ModerationTableProps {
  comments: Comment[]
  approveAction: (id: string) => Promise<void>
  rejectAction: (id: string) => Promise<void>
  bulkApproveAction: (ids: string[]) => Promise<void>
  bulkRejectAction: (ids: string[]) => Promise<void>
}

export function ModerationTable({
  comments,
  approveAction,
  rejectAction,
  bulkApproveAction,
  bulkRejectAction,
}: ModerationTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const toggleAll = () => {
    if (selected.size === comments.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(comments.map((c) => c.id)))
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

  const handleBulkApprove = () => {
    if (!confirm(`Одобрить ${selected.size} комментариев?`)) return
    startTransition(async () => {
      await bulkApproveAction(Array.from(selected))
      setSelected(new Set())
      router.refresh()
    })
  }

  const handleBulkReject = () => {
    if (!confirm(`Отклонить ${selected.size} комментариев?`)) return
    startTransition(async () => {
      await bulkRejectAction(Array.from(selected))
      setSelected(new Set())
      router.refresh()
    })
  }

  const handleAction = async (action: 'approve' | 'reject', id: string) => {
    startTransition(async () => {
      if (action === 'approve') {
        await approveAction(id)
      } else {
        await rejectAction(id)
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {selected.size > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Выбрано: {selected.size}</span>
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
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkReject}
            disabled={isPending}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Отклонить
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selected.size === comments.length && comments.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Сервер</TableHead>
                <TableHead>Автор</TableHead>
                <TableHead>Комментарий</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Нет комментариев
                  </TableCell>
                </TableRow>
              ) : (
                comments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(comment.id)}
                        onCheckedChange={() => toggleOne(comment.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{comment.server.name}</div>
                      <a
                        href={`/servers/${comment.server.owner}/${comment.server.repo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {comment.server.owner}/{comment.server.repo}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{comment.user.name || 'Аноним'}</div>
                      <div className="text-sm text-muted-foreground">{comment.user.email}</div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm line-clamp-3">{comment.content}</p>
                    </TableCell>
                    <TableCell>
                      {comment.isModerated ? (
                        <Badge className="bg-green-500 text-white">Одобрен</Badge>
                      ) : (
                        <Badge className="bg-yellow-500 text-white">На проверке</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(comment.createdAt).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!comment.isModerated && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Одобрить"
                            onClick={() => handleAction('approve', comment.id)}
                            disabled={isPending}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Удалить"
                          onClick={() => handleAction('reject', comment.id)}
                          disabled={isPending}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
