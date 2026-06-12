'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { CLIENT_FAVICON_BASES } from '@/lib/client-urls'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ArrowUpRight, ExternalLink, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface ClientCardProps {
  client: {
    id: string
    name: string
    description: string
    url: string
    icon?: string | null
    featured: boolean
  }
}

// Official brand logos — direct favicon/logo URLs from actual websites
const brandLogoMap: Record<string, string> = {
  // IDEs & editors
  'Claude Code': 'https://claude.ai/images/favicon.ico',
  'Claude Desktop': 'https://claude.ai/images/favicon.ico',
  'Cursor': 'https://cursor.sh/favicon.ico',
  'VS Code Copilot': 'https://code.visualstudio.com/favicon.ico',
  'Windsurf': 'https://codeium.com/favicon.ico',
  'Cline': CLIENT_FAVICON_BASES['Cline'],
  'Continue': CLIENT_FAVICON_BASES['Continue'],
  'Zed': CLIENT_FAVICON_BASES['Zed'],
  'PearAI': CLIENT_FAVICON_BASES['PearAI'],
  'Roo Code': CLIENT_FAVICON_BASES['Roo Code'],
  'Aider': 'https://aider.chat/favicon.ico',
  'JetBrains AI': 'https://www.jetbrains.com/favicon.ico',
  // Dev platforms
  'Replit Agent': 'https://replit.com/public/icons/favicon-196.png',
  'bolt.new': 'https://bolt.new/favicon.ico',
  'Devin': 'https://www.cognition.ai/favicon.ico',
  'Vercel AI SDK': 'https://vercel.com/favicon.ico',
  'Amazon Q Developer': 'https://a0.awsstatic.com/libra-css/images/logos/aws_smiles-header.svg',
  // AI agents & frameworks
  'AutoGPT': 'https://agpt.co/favicon.ico',
  'CrewAI': 'https://crewai.com/favicon.ico',
  'Dify': 'https://dify.ai/favicon.ico',
  'LlamaIndex': 'https://llamaindex.ai/favicon.ico',
  'Open Interpreter': 'https://openinterpreter.com/favicon.ico',
  'Botpress': 'https://botpress.com/favicon.ico',
  'Superinterface': 'https://superinterface.ai/favicon.ico',
  'Glama': 'https://glama.ai/favicon.ico',
  'LibreChat': 'https://librechat.ai/favicon.ico',
  // Google & Microsoft
  'Google ADK': 'https://www.google.com/favicon.ico',
  'Copilot Studio': 'https://copilot.microsoft.com/favicon.ico',
  'Semantic Kernel': 'https://github.com/microsoft.png?size=64',
  // GitHub-based tools
  'MCP Inspector': 'https://github.com/modelcontextprotocol.png?size=64',
  'MCP CLI': 'https://github.com/modelcontextprotocol.png?size=64',
  'mcpm': 'https://github.com/mcpm-io.png?size=64',
  'Smithery CLI': 'https://smithery.ai/favicon.ico',
  'LangGraph Studio': 'https://github.com/langchain-ai.png?size=64',
  'OpenAI Agents SDK': 'https://openai.com/favicon.ico',
  'Hermes Agent': 'https://hermes-agent.nousresearch.com/favicon.ico',
  // Other
  'AIChat': 'https://github.com/sigoden.png?size=64',
  'Fireflies.ai': 'https://fireflies.ai/favicon.ico',
  'AgentGPT': 'https://raw.githubusercontent.com/reworkd/AgentGPT/main/public/favicon.ico',
}

function getFaviconUrl(pageUrl: string): string {
  try {
    const domain = new URL(pageUrl).hostname
    return `https://${domain}/favicon.ico`
  } catch {
    return ''
  }
}

export function ClientCard({ client }: ClientCardProps) {
  const [imgError, setImgError] = useState(false)
  const logoUrl = brandLogoMap[client.name] || getFaviconUrl(client.url)
  const showEmoji = !logoUrl || imgError

  return (
    <Link href={client.url} target="_blank" rel="noopener noreferrer" className="group block h-full focus-ring rounded-2xl">
      <Card className="h-full hover:-translate-y-1 hover:border-primary/35 hover:shadow-[var(--shadow-premium)]">
        <CardHeader className="pb-1">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 p-2 ring-1 ring-primary/15">
                {showEmoji ? (
                  <span className="text-xl">{client.icon || '⌘'}</span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={client.name}
                    className="size-7 object-contain"
                    loading="lazy"
                    onError={() => setImgError(true)}
                  />
                )}
              </span>
              <div className="min-w-0">
                <h3 className="truncate font-heading text-xl font-semibold tracking-[-0.05em] transition-colors group-hover:text-primary">
                  {client.name}
                </h3>
                {client.featured && (
                  <Badge className="mt-2 bg-primary text-primary-foreground">
                    <Sparkles className="size-3" /> recommended
                  </Badge>
                )}
              </div>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted/70 text-muted-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground line-clamp-3">
            {client.description}
          </p>
        </CardContent>
        <CardFooter className="mt-auto gap-2 text-xs text-primary">
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="truncate font-mono">{client.url}</span>
        </CardFooter>
      </Card>
    </Link>
  )
}
