'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea'
import { Flag } from 'lucide-react'

interface ReportButtonProps {
  targetType: 'server' | 'comment' | 'review'
  targetId: string
  targetName?: string
}

export function ReportButton({ targetType: _targetType, targetId: _targetId, targetName }: ReportButtonProps) {
  const t = useTranslations('Reports')
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!reason.trim()) return
    startTransition(async () => {
      // In production, send to API/admin notification
      setSubmitted(true)
      setTimeout(() => {
        setOpen(false)
        setSubmitted(false)
        setReason('')
      }, 2000)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
      >
        <Flag className="h-3 w-3" />
        {t('report')}
      </button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        {submitted ? (
          <p className="text-green-600 text-sm">{t('thanks')}</p>
        ) : (
          <div className="space-y-3">
            {targetName && (
              <p className="text-sm text-muted-foreground">
                {t('target')}: <span className="font-medium">{targetName}</span>
              </p>
            )}
            <Textarea
              placeholder={t('reasonPlaceholder')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <Button onClick={handleSubmit} disabled={isPending || !reason.trim()}>
              {isPending ? t('submitting') : t('submit')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
