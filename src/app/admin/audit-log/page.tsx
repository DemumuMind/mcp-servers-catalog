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
import { Shield } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AuditLogPage() {
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
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Audit Log</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Время</TableHead>
                <TableHead>Действие</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('ru-RU')}
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
