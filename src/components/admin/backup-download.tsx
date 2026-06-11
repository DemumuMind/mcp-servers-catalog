'use client'

import { useTranslations } from 'next-intl'
import { useTransition } from "react";
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface BackupDownloadProps {
  backupAction: () => Promise<string>
}

export function BackupDownload({ backupAction }: BackupDownloadProps) {
  const t = useTranslations('Admin.backup')
  const [isPending, startTransition] = useTransition()

  const handleDownload = () => {
    startTransition(async () => {
      const sql = await backupAction()
      const blob = new Blob([sql], { type: 'application/sql' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.sql`
      link.click()
    })
  }

  return (
    <Button onClick={handleDownload} disabled={isPending}>
      <Download className="h-4 w-4 mr-2" />
      {isPending ? t('creating') : t('downloadBackup')}
    </Button>
  )
}
