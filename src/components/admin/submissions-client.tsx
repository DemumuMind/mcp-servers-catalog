'use client'

import { useTranslations } from 'next-intl'
import { useTransition } from "react";
import { useRouter } from 'next/navigation'
import { approveSubmission, rejectSubmission, deleteSubmission } from "@/app/actions/submissions";
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

function getStatusBadge(status: string, t: (key: string) => string) {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500 text-white">{t('approved')}</Badge>
    case 'rejected':
      return <Badge className="bg-red-500 text-white">{t('rejected')}</Badge>
    default:
      return <Badge className="bg-yellow-500 text-white">{t('pending')}</Badge>
  }
}

export default function SubmissionsPageClient({
  submissions,
  statusFilter,
  searchQuery,
}: SubmissionsPageProps) {
  const t = useTranslations('Admin.submissions')
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
        alert(t('errorAction'))
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('filters')}</CardTitle>
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
              <label htmlFor="submissions-search" className="text-sm font-medium mb-2 block">{t('search')}</label>
              <Input
                name="q"
                placeholder={t('searchPlaceholder')}
                defaultValue={searchQuery}
              />
            </div>
            <div className="w-48">
              <label htmlFor="submissions-status" className="text-sm font-medium mb-2 block">{t('status')}</label>
              <Select
                name="status"
                defaultValue={statusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  <SelectItem value="pending">{t('pending')}</SelectItem>
                  <SelectItem value="approved">{t('approved')}</SelectItem>
                  <SelectItem value="rejected">{t('rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isPending}>
              {t('apply')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('noSubmissions')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.name')}</TableHead>
                  <TableHead>{t('table.email')}</TableHead>
                  <TableHead>{t('table.category')}</TableHead>
                  <TableHead>{t('table.premium')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.date')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
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
                        <Badge className="bg-amber-500 text-white">{t('premium')}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(sub.status, t)}</TableCell>
                    <TableCell>
                      {new Date(sub.createdAt).toLocaleDateString('en-US')}
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
                              title={t('buttonTitle.approve')}
                              onClick={() => handleAction('approve', sub.id)}
                              disabled={isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title={t('buttonTitle.reject')}
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
                          title={t('buttonTitle.delete')}
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
