'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export function KeyboardShortcuts({ locale }: { locale: string }) {
  const t = useTranslations('Keyboard')
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case '/':
          e.preventDefault()
          const searchPlaceholder = t('searchPlaceholder')
          const searchInput = document.querySelector(
            `input[type="search"], input[placeholder*="${searchPlaceholder}"]`
          ) as HTMLInputElement
          searchInput?.focus()
          break
        case 'Escape':
          const activeElement = document.activeElement as HTMLElement
          activeElement?.blur()
          break
        case 'h':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            router.push(`/${locale}`)
          }
          break
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            router.push(`/${locale}/all`)
          }
          break
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            router.push(`/${locale}/submit`)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, locale, t])

  return null
}
