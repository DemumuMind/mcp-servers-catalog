'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const t = useTranslations('ThemeToggle')

  useEffect(() => {
    setMounted(true)
  }, [])

  const wrapperClass = 'inline-flex items-center gap-1 rounded-2xl border border-border/70 bg-card/58 p-1 shadow-[var(--shadow-soft)] backdrop-blur-xl'

  if (!mounted) {
    return (
      <div className={wrapperClass}>
        <Button variant="ghost" size="icon-sm" disabled aria-label={t('light')}>
          <Sun className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" disabled aria-label={t('system')}>
          <Monitor className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" disabled aria-label={t('dark')}>
          <Moon className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={wrapperClass}>
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="icon-sm"
        onClick={() => setTheme('light')}
        title={t('light')}
        aria-label={t('light')}
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === 'system' ? 'default' : 'ghost'}
        size="icon-sm"
        onClick={() => setTheme('system')}
        title={t('system')}
        aria-label={t('system')}
      >
        <Monitor className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="icon-sm"
        onClick={() => setTheme('dark')}
        title={t('dark')}
        aria-label={t('dark')}
      >
        <Moon className="h-4 w-4" />
      </Button>
    </div>
  )
}
