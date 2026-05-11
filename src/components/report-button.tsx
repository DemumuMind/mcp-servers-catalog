'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Flag } from 'lucide-react'

interface ReportButtonProps {
  targetType: 'server' | 'comment' | 'review'
  targetId: string
  targetName?: string
}

export function ReportButton({ targetType, targetId, targetName }: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!reason.trim()) return
    startTransition(async () => {
      // In production, send to API/admin notification
      console.log('Report submitted:', { targetType, targetId, reason })
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
        Пожаловаться
      </button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Пожаловаться</DialogTitle>
        </DialogHeader>
        {submitted ? (
          <p className="text-green-600 text-sm">Спасибо! Жалоба отправлена администратору.</p>
        ) : (
          <div className="space-y-3">
            {targetName && (
              <p className="text-sm text-muted-foreground">
                Объект: <span className="font-medium">{targetName}</span>
              </p>
            )}
            <Textarea
              placeholder="Опишите причину жалобы..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <Button onClick={handleSubmit} disabled={isPending || !reason.trim()}>
              {isPending ? 'Отправка...' : 'Отправить жалобу'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
