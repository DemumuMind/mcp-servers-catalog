'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getServerHealthStatus, checkServerHealth } from '@/app/actions/health'
import { Activity } from 'lucide-react'

interface ServerHealthBadgeProps {
  serverId: string
}

export function ServerHealthBadge({ serverId }: ServerHealthBadgeProps) {
  const t = useTranslations('Health')
  const [status, setStatus] = useState<{
    latest: { status: string; latency?: number; createdAt: Date } | null
    uptimePercent: number
  } | null>(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    getServerHealthStatus(serverId).then(setStatus)
  }, [serverId])

  const handleCheck = async () => {
    setChecking(true)
    await checkServerHealth(serverId)
    const result = await getServerHealthStatus(serverId)
    setStatus(result)
    setChecking(false)
  }

  const rawStatus = status?.latest?.status ?? 'unknown'
  const colorMap: Record<string, string> = {
    online: 'bg-emerald-400',
    degraded: 'bg-amber-400',
    offline: 'bg-red-400',
    timeout: 'bg-red-400',
    unknown: 'bg-muted-foreground/40',
  }
  const labelMap: Record<string, string> = {
    online: t('healthy'),
    degraded: t('degraded'),
    offline: t('down'),
    timeout: t('down'),
    unknown: t('unknown'),
  }

  const dotColor = colorMap[rawStatus] ?? colorMap.unknown
  const label = labelMap[rawStatus] ?? t('unknown')

  return (
    <span className="inline-flex items-center gap-2 rounded-2xl border border-border/50 bg-card/50 px-3 py-1.5 text-xs font-semibold">
      <span className={`relative flex size-2.5`}>
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dotColor} opacity-50`}
        />
        <span
          className={`relative inline-flex size-2.5 rounded-full ${dotColor}`}
        />
      </span>
      <span className="text-foreground">{label}</span>
      {status?.latest?.latency != null && (
        <span className="font-mono text-muted-foreground">
          {status.latest.latency}ms
        </span>
      )}
      {status && status.uptimePercent >= 0 && (
        <span className="font-mono text-muted-foreground">
          {status.uptimePercent}%
        </span>
      )}
      <button
        onClick={handleCheck}
        disabled={checking}
        className="ml-1 inline-flex items-center gap-1 rounded-lg border border-border/40 px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground transition-colors hover:text-primary hover:border-primary/30 disabled:opacity-50"
      >
        <Activity className="size-3" />
        {checking ? '...' : t('checkButton')}
      </button>
    </span>
  )
}
