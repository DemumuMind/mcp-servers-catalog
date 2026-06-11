'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/copy-button'
import { Code2, FileCode, Terminal } from 'lucide-react'

interface UsageExamplesProps {
  owner: string
  repo: string
  name: string
  isRemote?: boolean
  endpoint?: string | null
}

type TabKey = 'typescript' | 'python' | 'claude'

export function UsageExamples({ owner, repo, name, isRemote, endpoint }: UsageExamplesProps) {
  const t = useTranslations('Usage')
  const [activeTab, setActiveTab] = useState<TabKey>('typescript')

  const npmPackage = `@${owner}/${repo}`

  const typescriptExample = [
    'import { Client } from "@modelcontextprotocol/sdk/client/index.js";',
    'import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";',
    '',
    'const transport = new StdioClientTransport({',
    '  command: "npx",',
    '  args: ["-y", "' + npmPackage + '"]',
    '});',
    '',
    'const client = new Client({ name: "my-app", version: "1.0.0" });',
    'await client.connect(transport);',
    '',
    'const tools = await client.listTools();',
  ].join('\n')

  const pythonExample = [
    'from mcp import ClientSession, StdioServerParameters',
    'from mcp.client.stdio import stdio_client',
    '',
    'server_params = StdioServerParameters(',
    '    command="npx",',
    '    args=["-y", "' + npmPackage + '"]',
    ')',
    '',
    'async with stdio_client(server_params) as (read, write):',
    '    async with ClientSession(read, write) as session:',
    '        await session.initialize()',
    '        tools = await session.list_tools()',
    '        print(tools)',
  ].join('\n')

  const serverKey = name.toLowerCase().replace(/\s+/g, '-')

  const claudeConfig = isRemote && endpoint
    ? JSON.stringify({ mcpServers: { [serverKey]: { url: endpoint } } }, null, 2)
    : JSON.stringify({ mcpServers: { [serverKey]: { command: 'npx', args: ['-y', npmPackage] } } }, null, 2)

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; content: string; copyLabel: string }[] = [
    { key: 'typescript', label: 'TypeScript', icon: <FileCode className="h-4 w-4" />, content: typescriptExample, copyLabel: 'TS' },
    { key: 'python', label: 'Python', icon: <Terminal className="h-4 w-4" />, content: pythonExample, copyLabel: 'PY' },
    { key: 'claude', label: 'Claude Config', icon: <Code2 className="h-4 w-4" />, content: claudeConfig, copyLabel: 'JSON' },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Code2 className="w-5 h-5" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 inline-flex items-center justify-center rounded-2xl border border-border/70 bg-muted/60 p-1 shadow-[inset_0_1px_0_oklch(1_0_0_/_0.25)]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-1 text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'border-border/70 bg-background/78 text-foreground shadow-[var(--shadow-soft)]'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
              }`}
              role="tab"
              aria-selected={activeTab === tab.key}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {tabs.map((tab) => (
          <div
            key={tab.key}
            role="tabpanel"
            hidden={activeTab !== tab.key}
            className="mt-0"
          >
            {activeTab === tab.key && (
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  <code>{tab.content}</code>
                </pre>
                <div className="absolute top-2 right-2">
                  <CopyButton text={tab.content} label={tab.copyLabel} size="sm" variant="ghost" />
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
