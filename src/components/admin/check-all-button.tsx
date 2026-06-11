'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Activity, Loader2 } from 'lucide-react'

export function CheckAllButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const t = useTranslations('Admin.monitoring')

  async function handleCheckAll() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/cron/health-checks?secret=manual', {
        method: 'GET',
      })
      const data = await res.json()
      if (data.success) {
        setResult(`Checked ${data.checked} servers: ${data.online} online, ${data.offline} offline`)
      } else {
        setResult(data.error || 'Check failed')
      }
    } catch {
      setResult('Failed to run health checks')
    }
    setLoading(false)
    // Refresh the page data after checks
    setTimeout(() => window.location.reload(), 2000)
  }

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className="text-xs text-muted-foreground">{result}</span>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCheckAll}
        disabled={loading}
        className="gap-1"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Activity className="h-3.5 w-3.5" />
        )}
        {loading ? t('checkAll.checking') : t('checkAll.checkAll')}
      </Button>
    </div>
  )
}
