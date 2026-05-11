import { getHealthMonitoringData } from '@/app/actions/health-monitoring'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Activity, Server, AlertTriangle, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MonitoringPage() {
  const data = await getHealthMonitoringData()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Health Monitoring</h1>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="h-4 w-4" />
              Всего серверов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overall.totalServers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.overall.onlineServers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Offline / Проблемы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.overall.offlineServers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Средний Uptime (24ч)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overall.avgUptime !== null ? `${data.overall.avgUptime}%` : 'N/A'}
            </div>
            {data.overall.avgUptime !== null && (
              <Progress value={data.overall.avgUptime} className="mt-2 h-2" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Server Details */}
      <Card>
        <CardHeader>
          <CardTitle>Статус серверов</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Сервер</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Uptime (24ч)</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Последняя проверка</TableHead>
                <TableHead>Проверок</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.servers.map((server) => (
                <TableRow key={server.id}>
                  <TableCell className="font-medium">{server.name}</TableCell>
                  <TableCell>
                    {server.latestStatus === 'online' ? (
                      <Badge className="bg-green-500">Online</Badge>
                    ) : server.latestStatus === 'degraded' ? (
                      <Badge className="bg-yellow-500">Degraded</Badge>
                    ) : server.latestStatus === 'offline' ? (
                      <Badge className="bg-red-500">Offline</Badge>
                    ) : (
                      <Badge variant="outline">No data</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {server.uptimePercent !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{server.uptimePercent}%</span>
                        <Progress value={server.uptimePercent} className="w-20 h-2" />
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {server.avgLatency !== null ? (
                      <span className="text-sm">{server.avgLatency}ms</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {server.latestCheckedAt
                      ? new Date(server.latestCheckedAt).toLocaleString('ru-RU')
                      : '—'}
                  </TableCell>
                  <TableCell className="text-sm">{server.totalChecks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
