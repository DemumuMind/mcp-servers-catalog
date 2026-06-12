import { getAuditLogs } from '@/app/actions/audit-log'
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
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { getAdminTranslations } from '@/lib/admin-i18n'

export const dynamic = 'force-dynamic'

export default async function AuditLogPage() {
  const t = await getAdminTranslations('Admin.auditLog')
  const logs = await getAuditLogs(200)

  const actionColors: Record<string, string> = {
    'server.create': 'bg-green-500',
    'server.delete': 'bg-red-500',
    'server.update': 'bg-blue-500',
    'user.verify': 'bg-purple-500',
    'comment.approve': 'bg-yellow-500',
    'comment.reject': 'bg-orange-500',
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('title')}
        description={t('description')}
        eyebrow="Audit"
      />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.time')}</TableHead>
                <TableHead>{t('table.action')}</TableHead>
                <TableHead>{t('table.user')}</TableHead>
                <TableHead>{t('table.type')}</TableHead>
                <TableHead>{t('table.id')}</TableHead>
                <TableHead>{t('table.ip')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-white text-xs ${actionColors[log.action] || 'bg-gray-500'}`}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.user ? log.user.email : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.targetType || '—'}
                  </TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">
                    {log.targetId ? log.targetId.slice(0, 8) + '...' : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.ip || '—'}
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
