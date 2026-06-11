'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  text: string
  label?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}

export function CopyButton({
  text,
  label,
  size = 'sm',
  variant = 'outline',
  className,
}: CopyButtonProps) {
  const t = useTranslations('CopyButton')
  const [copied, setCopied] = useState(false)

  const displayLabel = label || t('copy')

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [text])

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={className}
      title={copied ? t('copied') : displayLabel}
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {displayLabel && !copied && <span className="ml-1">{displayLabel}</span>}
      {copied && <span className="ml-1">{t('done')}</span>}
    </Button>
  )
}
