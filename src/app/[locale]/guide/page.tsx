import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Settings, Zap, Server, BookOpen, Shield, Globe, Cpu, Code2, Database, Search } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { DigestSubscription } from '@/components/digest-subscription'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Guide' })
  return {
    title: t('title'),
    description: t('subtitle'),
    openGraph: { title: t('title'), description: t('subtitle'), type: 'article' },
  }
}

const clients = [
  { name: 'Claude Desktop', icon: '🤖', descKey: 'claudeDesktop', url: 'https://claude.ai/download', tagKey: 'recommended' },
  { name: 'Cursor', icon: '💻', descKey: 'cursor', url: 'https://cursor.com', tagKey: 'popular' },
  { name: 'Windsurf', icon: '🌊', descKey: 'windsurf', url: 'https://codeium.com/windsurf', tagKey: '' },
  { name: 'Cline', icon: '⚡', descKey: 'cline', url: 'https://cline.bot', tagKey: '' },
  { name: 'Continue', icon: '🔄', descKey: 'continueDev', url: 'https://continue.dev', tagKey: 'openSource' },
  { name: 'Zed', icon: '📝', descKey: 'zed', url: 'https://zed.dev', tagKey: '' },
]

const clientDescriptions: Record<string, Record<string, string>> = {
  ru: {
    claudeDesktop: 'Официальный десктопный клиент от Anthropic с полной поддержкой MCP. macOS и Windows.',
    cursor: 'AI-редактор кода с встроенной поддержкой MCP. Идеален для разработчиков.',
    windsurf: 'AI-first IDE от Codeium с нативной поддержкой MCP серверов.',
    cline: 'Автономный AI-агент для VS Code с поддержкой MCP инструментов.',
    continueDev: 'Открытый плагин для VS Code и JetBrains. Поддерживает множество моделей.',
    zed: 'Высокопроизводительный редактор с AI и MCP поддержкой.',
  },
  en: {
    claudeDesktop: 'Official desktop client from Anthropic with full MCP support. macOS and Windows.',
    cursor: 'AI code editor with built-in MCP support. Ideal for developers.',
    windsurf: 'AI-first IDE by Codeium with native MCP server support.',
    cline: 'Autonomous AI agent for VS Code with MCP tool support.',
    continueDev: 'Open-source plugin for VS Code and JetBrains. Supports multiple models.',
    zed: 'High-performance editor with AI and MCP support.',
  },
}

const popularServers = [
  { name: 'Filesystem', pkg: '@modelcontextprotocol/server-filesystem', descKey: 'filesystemDesc', icon: FolderIcon },
  { name: 'GitHub', pkg: 'github/github-mcp-server', descKey: 'githubDesc', icon: Code2 },
  { name: 'PostgreSQL', pkg: '@modelcontextprotocol/server-postgres', descKey: 'postgresDesc', icon: Database },
  { name: 'Brave Search', pkg: '@modelcontextprotocol/server-brave-search', descKey: 'braveDesc', icon: Search },
  { name: 'Playwright', pkg: 'microsoft/playwright-mcp', descKey: 'playwrightDesc', icon: Globe },
  { name: 'SQLite', pkg: '@modelcontextprotocol/server-sqlite', descKey: 'sqliteDesc', icon: Database },
]

const serverDescriptions: Record<string, Record<string, string>> = {
  ru: {
    filesystemDesc: 'Чтение, запись и поиск файлов',
    githubDesc: 'PR, issues, код и API GitHub',
    postgresDesc: 'SQL-запросы к PostgreSQL',
    braveDesc: 'Веб-поиск через Brave API',
    playwrightDesc: 'Браузерная автоматизация',
    sqliteDesc: 'Работа с SQLite базами данных',
  },
  en: {
    filesystemDesc: 'Read, write, and search files',
    githubDesc: 'PRs, issues, code, and GitHub API',
    postgresDesc: 'SQL queries to PostgreSQL',
    braveDesc: 'Web search via Brave API',
    playwrightDesc: 'Browser automation',
    sqliteDesc: 'Work with SQLite databases',
  },
}

const configPaths = [
  { client: 'Claude Desktop', path: '~/Library/Application Support/Claude/claude_desktop_config.json', os: 'macOS' },
  { client: 'Claude Desktop', path: '%APPDATA%\\Claude\\claude_desktop_config.json', os: 'Windows' },
  { client: 'Cursor', path: '~/.cursor/mcp.json', os: 'All' },
  { client: 'Windsurf', path: '~/.windsurf/mcp.json', os: 'All' },
  { client: 'Cline (VS Code)', path: 'VS Code Settings → Cline → MCP Servers', os: 'All' },
]

function FolderIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Guide' })
  const descMap = clientDescriptions[locale] || clientDescriptions['en']
  const servDescMap = serverDescriptions[locale] || serverDescriptions['en']
  const session = await auth()
  const userId = session?.user?.id

  return (
    <div className="page-shell max-w-4xl">
      {/* Hero */}
      <div className="mb-12 text-center">
        <p className="eyebrow mb-4">{t('eyebrow')}</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('title')}</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
      </div>

      {/* What is MCP */}
      <section className="premium-panel p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Zap className="size-5" />
          </div>
          <h2 className="text-xl font-bold">{t('whatIsMcp.title')}</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Model Context Protocol (MCP)</strong>{' '}
          {t('whatIsMcp.description')}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Server, title: t('whatIsMcp.servers'), desc: t('whatIsMcp.serversDesc') },
            { icon: Cpu, title: t('whatIsMcp.clients'), desc: t('whatIsMcp.clientsDesc') },
            { icon: Shield, title: t('whatIsMcp.security'), desc: t('whatIsMcp.securityDesc') },
          ].map(item => (
            <div key={item.title} className="rounded-xl border border-border/50 bg-muted/30 p-4 text-center">
              <item.icon className="mx-auto size-5 text-primary mb-2" />
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Step 1: Choose client */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
          <h2 className="text-xl font-bold">{t('step1.title')}</h2>
        </div>
        <p className="text-muted-foreground mb-5">{t('step1.description')}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map(client => (
            <a key={client.name} href={client.url} target="_blank" rel="noopener noreferrer" className="premium-card group flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xl">{client.icon}</span>
                {client.tagKey && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-semibold text-primary">
                    {t(`step1.${client.tagKey}`)}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{client.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{descMap[client.descKey]}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Step 2: Install server */}
      <section className="premium-panel p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
          <h2 className="text-xl font-bold">{t('step2.title')}</h2>
        </div>
        <p className="text-muted-foreground mb-5">{t('step2.description')}</p>
        <div className="rounded-xl border border-border/50 bg-[#0d0b09] p-5 font-mono text-sm space-y-1">
          <p className="text-muted-foreground/60">{t('step2.globalInstall')}</p>
          <p><span className="text-primary/70">$</span> npm install -g @modelcontextprotocol/server-filesystem</p>
          <p className="mt-4 text-muted-foreground/60">{t('step2.npxRun')}</p>
          <p><span className="text-primary/70">$</span> npx -y @modelcontextprotocol/server-filesystem /path/to/files</p>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{t('step2.tip')}</p>
      </section>

      {/* Step 3: Configure */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
          <h2 className="text-xl font-bold">{t('step3.title')}</h2>
        </div>
        <p className="text-muted-foreground mb-5">{t('step3.description')}</p>
        <div className="mb-5 grid gap-2 sm:grid-cols-2">
          {configPaths.map(cfg => (
            <div key={`${cfg.client}-${cfg.os}`} className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5 text-xs">
              <Settings className="size-3.5 text-primary shrink-0" />
              <span className="font-semibold text-foreground">{cfg.client}</span>
              <span className="text-muted-foreground truncate flex-1 text-right">{cfg.path}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[0.6rem] text-muted-foreground shrink-0">{cfg.os}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border/50 bg-[#0d0b09] p-5 font-mono text-sm overflow-x-auto">
          <p className="text-muted-foreground/60 mb-2">{"// claude_desktop_config.json"}</p>
          <pre className="text-muted-foreground">{`{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/Documents"
      ]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxx"
      }
    }
  }
}`}</pre>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{t('step3.apiKeys')}</p>
      </section>

      {/* Step 4: Use */}
      <section className="premium-panel p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">4</span>
          <h2 className="text-xl font-bold">{t('step4.title')}</h2>
        </div>
        <p className="text-muted-foreground mb-5">{t('step4.description')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { emoji: '📁', title: t('step4.files'), desc: t('step4.filesDesc') },
            { emoji: '🔍', title: t('step4.search'), desc: t('step4.searchDesc') },
            { emoji: '🗄️', title: t('step4.databases'), desc: t('step4.databasesDesc') },
            { emoji: '🐙', title: t('step4.github'), desc: t('step4.githubDesc') },
            { emoji: '🌐', title: t('step4.browser'), desc: t('step4.browserDesc') },
            { emoji: '☁️', title: t('step4.cloud'), desc: t('step4.cloudDesc') },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 p-3.5">
              <span className="text-lg">{item.emoji}</span>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Step 5: Popular servers */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">5</span>
          <h2 className="text-xl font-bold">{t('step5.title')}</h2>
        </div>
        <div className="space-y-2">
          {popularServers.map(server => (
            <Link
              key={server.pkg}
              href={`/${locale}/servers/${server.pkg.split('/')[0]}/${server.pkg.split('/')[1] || server.pkg}`}
              className="premium-card flex items-center gap-4 p-4"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <server.icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{server.name}</p>
                <p className="text-xs text-muted-foreground">{servDescMap[server.descKey]}</p>
              </div>
              <code className="hidden sm:block text-[0.65rem] text-muted-foreground truncate max-w-[200px]">{server.pkg}</code>
              <ArrowUpRight className="size-4 text-muted-foreground/50 shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Digest Subscription */}
      <div className="mb-8">
        <DigestSubscription userId={userId} locale={locale} />
      </div>

      {/* CTA */}
      <div className="premium-panel p-6 sm:p-8 text-center">
        <BookOpen className="mx-auto size-8 text-primary mb-3" />
        <h2 className="text-xl font-bold mb-2">{t('cta.title')}</h2>
        <p className="text-muted-foreground mb-5">{t('cta.description')}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={`/${locale}/all`} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:brightness-110">
            {t('cta.allServers')} <ArrowUpRight className="size-3.5" />
          </Link>
          <Link href={`/${locale}/clients`} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50">
            {t('cta.allClients')}
          </Link>
        </div>
      </div>
    </div>
  )
}
