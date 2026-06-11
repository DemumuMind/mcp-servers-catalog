'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Copy, Check, Terminal, Download } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface InstallButtonProps {
  server: {
    owner: string
    repo: string
    name: string
    isRemote: boolean
    endpoint?: string | null
  }
}

type ClientType = 'claude' | 'cursor' | 'continue'

function generateConfig(client: ClientType, server: InstallButtonProps['server']) {
  const serverName = server.name.toLowerCase().replace(/\s+/g, '-')
  const mcpServerEntry = {
    command: 'npx',
    args: ['-y', `@${server.owner}/${server.repo}`],
  }

  switch (client) {
    case 'claude':
    case 'cursor':
      return JSON.stringify({ mcpServers: { [serverName]: mcpServerEntry } }, null, 2)

    case 'continue':
      return JSON.stringify({ server: { name: serverName, ...mcpServerEntry } }, null, 2)

    default:
      return ''
  }
}

function getClientInstructions(client: ClientType, t: ReturnType<typeof useTranslations>) {
  const instructionsMap: Record<ClientType, { title: string; path: string; steps: string[] }> = {
    claude: {
      title: t('claudeTitle'),
      path: '~/Library/Application Support/Claude/claude_desktop_config.json',
      steps: [t('claudeStep0'), t('claudeStep1'), t('claudeStep2'), t('claudeStep3'), t('claudeStep4')],
    },
    cursor: {
      title: t('cursorTitle'),
      path: '~/.cursor/mcp.json',
      steps: [t('cursorStep0'), t('cursorStep1'), t('cursorStep2'), t('cursorStep3'), t('cursorStep4')],
    },
    continue: {
      title: t('continueTitle'),
      path: '~/.continue/config.json',
      steps: [t('continueStep0'), t('continueStep1'), t('continueStep2'), t('continueStep3')],
    },
  }
  return instructionsMap[client]
}

export function OneClickInstall({ server }: InstallButtonProps) {
  const t = useTranslations('Install')
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<ClientType | null>(null)
  const [selectedClient, setSelectedClient] = useState<ClientType>('claude')

  const handleCopy = async (client: ClientType) => {
    const config = generateConfig(client, server)
    await navigator.clipboard.writeText(config)
    setCopied(client)
    setTimeout(() => setCopied(null), 2000)
  }

  const instructions = getClientInstructions(selectedClient, t)
  const config = generateConfig(selectedClient, server)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" className="gap-2" type="button" onClick={() => setOpen(true)}>
        <Download className="w-4 h-4" />
        {t('button')}
      </Button>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('title', { name: server.name })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client selector */}
          <div className="flex gap-2">
            {(['claude', 'cursor', 'continue'] as ClientType[]).map((client) => (
              <Button
                key={client}
                variant={selectedClient === client ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedClient(client)}
              >
                {client === 'claude' && 'Claude'}
                {client === 'cursor' && 'Cursor'}
                {client === 'continue' && 'Continue'}
              </Button>
            ))}
          </div>

          {/* Config preview */}
          <div className="relative">
            <pre className="bg-muted rounded-lg p-4 text-xs overflow-auto max-h-48 font-mono">
              {config}
            </pre>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={() => handleCopy(selectedClient)}
            >
              {copied === selectedClient ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              {instructions.title}
            </h4>
            <p className="text-xs text-muted-foreground font-mono">
              {instructions.path}
            </p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              {instructions.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Quick npx command */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">{t('quickInstall')}</p>
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono block">
              npx -y @{server.owner}/{server.repo}
            </code>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
