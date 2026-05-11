'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Render a placeholder on server / before mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-1 rounded-lg border p-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled aria-label="Светлая тема">
          <Sun className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled aria-label="Системная тема">
          <Monitor className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled aria-label="Тёмная тема">
          <Moon className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border p-1">
      <Button
        variant={theme === 'light' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => setTheme('light')}
        title="Светлая тема"
        aria-label="Светлая тема"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === 'system' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => setTheme('system')}
        title="Системная тема"
        aria-label="Системная тема"
      >
        <Monitor className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === 'dark' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => setTheme('dark')}
        title="Тёмная тема"
        aria-label="Тёмная тема"
      >
        <Moon className="h-4 w-4" />
      </Button>
    </div>
  )
}
