'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Copy, Check } from 'lucide-react'

interface RemoteServerCardProps {
  server: {
    id: string
    name: string
    description: string
    endpoint: string
    authType?: string
    isOfficial: boolean
  }
}

export function RemoteServerCard({ server }: RemoteServerCardProps) {
  const t = useTranslations('RemoteCard')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(server.endpoint)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Silently fail if clipboard API is unavailable
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{server.name}</h3>
            {server.isOfficial && (
              <Badge variant="default" className="bg-yellow-500 mt-1">{t('official')}</Badge>
            )}
          </div>
          {server.authType && (
            <Badge variant="outline">{server.authType}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {server.description}
        </p>
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
            {server.endpoint}
          </code>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 shrink-0"
            onClick={handleCopy}
            title={copied ? t('copied') : t('copyUrl')}
            aria-label={copied ? t('copied') : t('copyUrl')}
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button size="sm">{t('connect')}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>{t('configure')}</DropdownMenuItem>
              <DropdownMenuItem>{t('copyUrl')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
