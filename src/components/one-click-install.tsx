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
  
  switch (client) {
    case 'claude':
      return JSON.stringify({
        mcpServers: {
          [serverName]: {
            command: 'npx',
            args: [
              '-y',
              `@${server.owner}/${server.repo}`,
            ],
          },
        },
      }, null, 2)
    
    case 'cursor':
      return JSON.stringify({
        mcpServers: {
          [serverName]: {
            command: 'npx',
            args: [
              '-y',
              `@${server.owner}/${server.repo}`,
            ],
          },
        },
      }, null, 2)
    
    case 'continue':
      return JSON.stringify({
        server: {
          name: serverName,
          command: 'npx',
          args: [
            '-y',
            `@${server.owner}/${server.repo}`,
          ],
        },
      }, null, 2)
    
    default:
      return ''
  }
}

function getClientInstructions(client: ClientType): { title: string; path: string; steps: string[] } {
  switch (client) {
    case 'claude':
      return {
        title: 'Claude Desktop',
        path: '~/Library/Application Support/Claude/claude_desktop_config.json',
        steps: [
          'Откройте Claude Desktop',
          'Нажмите Cmd/Ctrl + , для настроек',
          'Откройте «Developer» → «Edit Config»',
          'Вставьте конфиг в файл',
          'Перезапустите Claude Desktop',
        ],
      }
    case 'cursor':
      return {
        title: 'Cursor',
        path: '~/.cursor/mcp.json',
        steps: [
          'Откройте Cursor',
          'Настройки → MCP',
          'Нажмите «Add MCP Server»',
          'Вставьте конфиг',
          'Сохраните и перезапустите',
        ],
      }
    case 'continue':
      return {
        title: 'Continue',
        path: '~/.continue/config.json',
        steps: [
          'Откройте VS Code с Continue',
          'Откройте настройки Continue',
          'Добавьте MCP server в config.json',
          'Перезапустите VS Code',
        ],
      }
  }
}

export function OneClickInstall({ server }: InstallButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<ClientType | null>(null)
  const [selectedClient, setSelectedClient] = useState<ClientType>('claude')

  const handleCopy = async (client: ClientType) => {
    const config = generateConfig(client, server)
    await navigator.clipboard.writeText(config)
    setCopied(client)
    setTimeout(() => setCopied(null), 2000)
  }

  const instructions = getClientInstructions(selectedClient)
  const config = generateConfig(selectedClient, server)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" className="gap-2" type="button" onClick={() => setOpen(true)}>
        <Download className="w-4 h-4" />
        Установить
      </Button>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Установка {server.name}</DialogTitle>
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
            <p className="text-sm font-medium mb-2">Быстрая установка через npx:</p>
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono block">
              npx -y @{server.owner}/{server.repo}
            </code>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
