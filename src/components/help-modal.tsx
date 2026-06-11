'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function HelpModal() {
  const t = useTranslations('Help')
  const [open, setOpen] = useState(false)

  const shortcuts = [
    { key: '/', action: t('searchAction'), scope: t('homeScope') },
    { key: 'Esc', action: t('escapeAction'), scope: t('everywhereScope') },
    { key: 'Ctrl + H', action: t('helpAction'), scope: t('everywhereScope') },
    { key: 'Ctrl + A', action: t('allAction'), scope: t('everywhereScope') },
    { key: 'Ctrl + S', action: t('submitAction'), scope: t('everywhereScope') },
    { key: '?', action: t('helpAltAction'), scope: t('everywhereScope') },
  ]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+H or ? (but not in input/textarea)
      if (
        (e.ctrlKey && e.key === 'h') ||
        (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName))
      ) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:opacity-90 transition-opacity"
        aria-label={t('ariaLabel')}
      >
        <Keyboard className="h-5 w-5" />
      </button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            {t('title')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.action}</span>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono border">
                  {s.key}
                </kbd>
                <span className="text-[10px] text-muted-foreground">{s.scope}</span>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
