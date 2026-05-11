import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Гайд по использованию MCP серверов',
  description: 'Пошаговое руководство: как установить, настроить и использовать MCP серверы с Claude Desktop, Cursor, Continue и другими клиентами.',
  keywords: ['MCP гайд', 'MCP установка', 'как использовать MCP', 'MCP клиенты', 'Claude Desktop MCP'],
  openGraph: {
    title: 'Гайд по использованию MCP серверов',
    description: 'Пошаговое руководство по настройке MCP',
    type: 'article',
    locale: 'ru_RU',
  },
}

export const dynamic = 'force-dynamic'

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="prose dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-6">Гайд по использованию MCP серверов</h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Этот гайд поможет вам установить и настроить MCP серверы для работы с AI-ассистентами.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Выберите MCP клиент</h2>
        <p>
          MCP серверы работают с различными AI-клиентами. Вот самые популярные:
        </p>
        <div className="grid gap-4 my-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">🤖 Claude Desktop</h3>
            <p className="text-sm text-muted-foreground">
              Официальный десктопный клиент от Anthropic с полной поддержкой MCP. 
              Работает на macOS и Windows.
            </p>
            <a 
              href="https://claude.ai/download" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              Скачать Claude Desktop →
            </a>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">💻 Cursor</h3>
            <p className="text-sm text-muted-foreground">
              AI-редактор кода с встроенной поддержкой MCP. Отлично подходит для разработчиков.
            </p>
            <a 
              href="https://cursor.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              Скачать Cursor →
            </a>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">🔄 Continue</h3>
            <p className="text-sm text-muted-foreground">
              Открытый плагин для VS Code и других редакторов. Поддерживает множество моделей.
            </p>
            <a 
              href="https://continue.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              Установить Continue →
            </a>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Установите MCP сервер</h2>
        <p>
          MCP серверы устанавливаются через npm или npx. Вот базовый процесс:
        </p>
        
        <div className="bg-muted rounded-lg p-6 my-6 font-mono text-sm">
          <p className="mb-2"># Установка через npm</p>
          <p className="text-muted-foreground">npm install -g @modelcontextprotocol/server-filesystem</p>
          <p className="mt-4 mb-2"># Или запуск через npx (без установки)</p>
          <p className="text-muted-foreground">npx @modelcontextprotocol/server-filesystem /path/to/files</p>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Настройте конфигурацию</h2>
        <p>
          Добавьте сервер в конфигурационный файл вашего клиента:
        </p>
        
        <div className="bg-muted rounded-lg p-6 my-6 font-mono text-sm">
          <p className="mb-2"># Claude Desktop: ~/Library/Application Support/Claude/claude_desktop_config.json</p>
          <p className="mb-2"># Cursor: ~/.cursor/mcp.json</p>
          <pre className="text-muted-foreground">{'{\n  "mcpServers": {\n    "filesystem": {\n      "command": "npx",\n      "args": [\n        "-y",\n        "@modelcontextprotocol/server-filesystem",\n        "/Users/username/Documents"\n      ]\n    }\n  }\n}'}</pre>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Используйте инструменты</h2>
        <p>
          После подключения AI сможет использовать инструменты сервера:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Читать и записывать файлы (если разрешено)</li>
          <li>Выполнять поиск по документации</li>
          <li>Запрашивать данные из баз данных</li>
          <li>Управлять инфраструктурой</li>
          <li>Отправлять сообщения в мессенджеры</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Примеры популярных серверов</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Filesystem</p>
              <p className="text-sm text-muted-foreground">Работа с файловой системой</p>
            </div>
            <code className="text-xs bg-muted px-2 py-1 rounded">@modelcontextprotocol/server-filesystem</code>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">GitHub</p>
              <p className="text-sm text-muted-foreground">Интеграция с GitHub API</p>
            </div>
            <code className="text-xs bg-muted px-2 py-1 rounded">@modelcontextprotocol/server-github</code>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">PostgreSQL</p>
              <p className="text-sm text-muted-foreground">Запросы к PostgreSQL</p>
            </div>
            <code className="text-xs bg-muted px-2 py-1 rounded">@modelcontextprotocol/server-postgres</code>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">SQLite</p>
              <p className="text-sm text-muted-foreground">Работа с SQLite базами</p>
            </div>
            <code className="text-xs bg-muted px-2 py-1 rounded">@modelcontextprotocol/server-sqlite</code>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Найдите больше серверов</h2>
        <p>
          Посмотрите наш <a href={`/${locale}/all`} className="text-primary hover:underline">каталог MCP серверов</a> — 
          там собраны лучшие серверы сообщества с описаниями и рейтингами.
        </p>
      </article>
    </div>
  )
}
