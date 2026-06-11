'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { syncGitHubStats } from '@/app/actions/sync'

export function SyncGithubButton() {
  const t = useTranslations('Admin.syncGithub')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ updated: number; failed: number; total: number } | null>(null)
  const [error, setError] = useState('')

  const handleSync = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await syncGitHubStats()
      setResult(res)
    } catch (err: any) {
      setError(err.message || t('syncError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSync}
        disabled={loading}
        variant="outline"
        className="w-full"
      >
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-2" />
        )}
        {loading ? t('syncing') : t('syncGithub')}
      </Button>

      {result && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="h-3 w-3" />
          {t('updatedErrors', { updated: result.updated, failed: result.failed })}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  )
}
