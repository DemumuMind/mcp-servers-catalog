'use client'

import { useState, useEffect } from 'react'
import { getServerHealthHistory } from '@/app/actions/health-checks'
import { checkServerStatus } from '@/app/actions/health'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, RefreshCw } from 'lucide-react'

interface HealthHistoryProps {
  serverId: string
  isRemote: boolean
}

export function HealthHistory({ serverId, isRemote }: HealthHistoryProps) {
  const [history, setHistory] = useState<Array<{
    date: string
    online: number
    degraded: number
    offline: number
    total: number
    avgLatency: number | null
    uptime: number
  }>>([])
  const [latest, setLatest] = useState<{
    status: string
    latency: number | null
    createdAt: Date
  } | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadHistory() {
    const data = await getServerHealthHistory(serverId, 7)
    setHistory(data)
  }

  async function checkNow() {
    setLoading(true)
    await checkServerStatus(serverId)
    await loadHistory()
    setLoading(false)
  }

  useEffect(() => {
    if (isRemote) {
      loadHistory()
    }
  }, [isRemote, serverId])

  if (!isRemote) return null

  const statusColors: Record<string, string> = {
    online: 'bg-green-500',
    degraded: 'bg-yellow-500',
    offline: 'bg-red-500',
    timeout: 'bg-orange-500',
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Доступность сервера
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkNow}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {latest && (
          <div className="flex items-center gap-2 text-sm">
            <Badge className={statusColors[latest.status] || 'bg-gray-500'}>
              {latest.status}
            </Badge>
            {latest.latency && (
              <span className="text-muted-foreground">{latest.latency}ms</span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Пока нет данных о проверках. Нажмите обновить для первой проверки.
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-sm w-24">{day.date}</span>
                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden flex">
                  {day.online > 0 && (
                    <div
                      className="bg-green-500 h-full"
                      style={{ width: `${(day.online / day.total) * 100}%` }}
                      title={`Online: ${day.online}`}
                    />
                  )}
                  {day.degraded > 0 && (
                    <div
                      className="bg-yellow-500 h-full"
                      style={{ width: `${(day.degraded / day.total) * 100}%` }}
                      title={`Degraded: ${day.degraded}`}
                    />
                  )}
                  {day.offline > 0 && (
                    <div
                      className="bg-red-500 h-full"
                      style={{ width: `${(day.offline / day.total) * 100}%` }}
                      title={`Offline: ${day.offline}`}
                    />
                  )}
                </div>
                <span className="text-sm font-medium w-12">{day.uptime}%</span>
                {day.avgLatency && (
                  <span className="text-xs text-muted-foreground w-16">
                    {day.avgLatency}ms
                  </span>
                )}
              </div>
            ))}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Online
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                Degraded
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                Offline
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
