'use client'

import { useTranslations } from 'next-intl'
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
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'

interface Comment {
  id: string
  userId: string
  serverId: string
  content: string
  isModerated: boolean
  createdAt: Date
  updatedAt: Date
  user: { name: string | null; email: string } | null
  server: { name: string; owner: string; repo: string } | null
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
  const t = useTranslations('Admin.moderation')
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
    if (!confirm(t('confirmBulkApprove', { count: selected.size }))) return
    startTransition(async () => {
      await bulkApproveAction(Array.from(selected))
      setSelected(new Set())
      router.refresh()
    })
  }

  const handleBulkReject = () => {
    if (!confirm(t('confirmBulkReject', { count: selected.size }))) return
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
          <span className="text-sm text-muted-foreground">{t('selected', { count: selected.size })}</span>
          <Button
            variant="default"
            size="sm"
            onClick={handleBulkApprove}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            {t('approve')}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkReject}
            disabled={isPending}
          >
            <XCircle className="h-4 w-4 mr-1" />
            {t('reject')}
          </Button>
        </div>
      )}

      <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selected.size === comments.length && comments.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>{t('table.server')}</TableHead>
                <TableHead>{t('table.author')}</TableHead>
                <TableHead>{t('table.comment')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead>{t('table.date')}</TableHead>
                <TableHead className="text-right">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {t('noComments')}
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
                      <div className="font-medium">{(comment.server?.name ?? "—")}</div>
                      <a
                        href={`/servers/${(comment.server?.owner ?? "")}/${(comment.server?.repo ?? "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {(comment.server?.owner ?? "")}/{(comment.server?.repo ?? "")}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{(comment.user?.name ?? "—") || t('anonymous')}</div>
                      <div className="text-sm text-muted-foreground">{(comment.user?.email ?? "")}</div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm line-clamp-3">{comment.content}</p>
                    </TableCell>
                    <TableCell>
                      {comment.isModerated ? (
                        <Badge className="bg-green-500 text-white">{t('approved')}</Badge>
                      ) : (
                        <Badge className="bg-yellow-500 text-white">{t('underReview')}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(comment.createdAt).toLocaleDateString('en-US')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!comment.isModerated && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title={t('buttonTitle.approve')}
                            onClick={() => handleAction('approve', comment.id)}
                            disabled={isPending}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          title="Delete"
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
    </div>
  )
}

