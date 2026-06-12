'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { getServerHealthHistory, checkServerHealth } from '@/app/actions/health'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, RefreshCw } from 'lucide-react'

interface HealthHistoryProps {
  serverId: string
  isRemote: boolean
}

export function HealthHistory({ serverId, isRemote }: HealthHistoryProps) {
  const t = useTranslations('Health')
  const [history, setHistory] = useState<Array<{
    date: string
    online: number
    degraded: number
    offline: number
    total: number
    avgLatency: number | null
    uptime: number
  }>>([])
  const [_latest, setLatest] = useState<{
    status: string
    latency: number | null
    createdAt: Date
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const loadHistory = useCallback(async () => {
    const data = await getServerHealthHistory(serverId, 7)
    setHistory(data as any)
    if (data.length > 0) {
      const first = (data as any)[0]
      setLatest({
        status: first.online > 0 ? 'online' : first.degraded > 0 ? 'degraded' : 'offline',
        latency: first.avgLatency ?? first.latency ?? null,
        createdAt: new Date(first.date ?? first.createdAt),
      })
    }
  }, [serverId])

  async function checkNow() {
    setLoading(true)
    await checkServerHealth(serverId)
    await loadHistory()
    setLoading(false)
  }

  const loadHistoryRef = useRef(loadHistory)
  loadHistoryRef.current = loadHistory

  useEffect(() => {
    if (isRemote) {
      loadHistoryRef.current()
    }
  }, [isRemote])

  if (!isRemote) return null

  const hasHistory = history.length > 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {t('title')}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkNow}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t('checkNow')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasHistory ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">{t('noData')}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{t('startMonitoring')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((day) => (
              <div key={day.date} className="flex items-center gap-3 text-sm">
                <span className="w-20 text-muted-foreground shrink-0">
                  {new Date(day.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </span>
                <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden flex">
                  {day.online > 0 && (
                    <div className="bg-green-500 h-full" style={{ width: `${(day.online / day.total) * 100}%` }} />
                  )}
                  {day.degraded > 0 && (
                    <div className="bg-yellow-500 h-full" style={{ width: `${(day.degraded / day.total) * 100}%` }} />
                  )}
                  {day.offline > 0 && (
                    <div className="bg-red-500 h-full" style={{ width: `${(day.offline / day.total) * 100}%` }} />
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {day.uptime.toFixed(1)}%
                  </Badge>
                  {day.avgLatency !== null && (
                    <span className="text-xs text-muted-foreground">
                      {day.avgLatency.toFixed(0)}ms
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
