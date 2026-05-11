'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getSubmissions, approveSubmission, rejectSubmission, deleteSubmission } from '@/app/actions/submissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Trash2, ExternalLink } from 'lucide-react'

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

interface SubmissionsPageProps {
  submissions: Submission[]
  statusFilter: string
  searchQuery: string
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

export default function SubmissionsPageClient({
  submissions,
  statusFilter,
  searchQuery,
}: SubmissionsPageProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleAction = async (action: 'approve' | 'reject' | 'delete', id: string) => {
    startTransition(async () => {
      try {
        if (action === 'approve') {
          await approveSubmission(id)
        } else if (action === 'reject') {
          await rejectSubmission(id)
        } else if (action === 'delete') {
          await deleteSubmission(id)
        }
        router.refresh()
      } catch (err) {
        console.error('Action error:', err)
        alert('Ошибка при выполнении действия')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Отправки MCP-серверов</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex gap-4 items-end"
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const q = formData.get('q') as string
              const status = formData.get('status') as string
              const params = new URLSearchParams()
              if (q) params.set('q', q)
              if (status && status !== 'all') params.set('status', status)
              router.push(`/admin/submissions?${params.toString()}`)
            }}
          >
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Поиск</label>
              <Input
                name="q"
                placeholder="Поиск по названию, описанию или email..."
                defaultValue={searchQuery}
              />
            </div>
            <div className="w-48">
              <label className="text-sm font-medium mb-2 block">Статус</label>
              <Select
                name="status"
                defaultValue={statusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="pending">На рассмотрении</SelectItem>
                  <SelectItem value="approved">Одобрено</SelectItem>
                  <SelectItem value="rejected">Отклонено</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isPending}>
              Применить
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет отправок для отображения
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
