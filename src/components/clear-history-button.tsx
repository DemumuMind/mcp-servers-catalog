'use client'

import { clearHistory } from '@/app/actions/profile'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Trash2 } from 'lucide-react'

export function ClearHistoryButton({ userId }: { userId: string }) {
  const t = useTranslations('History')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    if (!confirm(t('clearConfirm'))) return
    setLoading(true)
    await clearHistory(userId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
      {loading ? t('clearing') : t('clearHistory')}
    </button>
  )
}
