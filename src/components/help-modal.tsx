'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Keyboard } from 'lucide-react'

const shortcuts = [
  { key: '/', action: 'Поиск серверов', scope: 'Главная' },
  { key: 'Esc', action: 'Закрыть модалку / поиск', scope: 'Везде' },
  { key: 'Ctrl + H', action: 'Помощь (это окно)', scope: 'Везде' },
  { key: 'Ctrl + A', action: 'Все серверы', scope: 'Везде' },
  { key: 'Ctrl + S', action: 'Отправить сервер', scope: 'Везде' },
  { key: '?', action: 'Это окно помощи', scope: 'Везде' },
]

export function HelpModal() {
  const [open, setOpen] = useState(false)

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
        aria-label="Keyboard shortcuts"
      >
        <Keyboard className="h-5 w-5" />
      </button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Горячие клавиши
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
