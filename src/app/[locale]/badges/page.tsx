import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Бейджи для репозиториев',
  description: 'Добавьте бейдж MCPServers.org в свой README',
}

export const dynamic = 'force-dynamic'

export default async function BadgesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const badgeTypes = [
    {
      name: 'Основной',
      type: 'default',
      description: 'Показывает, что сервер зарегистрирован в каталоге',
      example: `[![MCP](https://mcpservers.org/api/badge/owner/repo)](https://mcpservers.org/ru/servers/owner/repo)`,
      preview: 'https://mcpservers.org/api/badge/anthropics/anthropic',
    },
    {
      name: 'Звёзды',
      type: 'stars',
      description: 'Показывает количество звёзд на GitHub',
      example: `[![Stars](https://mcpservers.org/api/badge/owner/repo?type=stars)](https://mcpservers.org/ru/servers/owner/repo)`,
      preview: 'https://mcpservers.org/api/badge/anthropics/anthropic?type=stars',
    },
    {
      name: 'Официальный',
      type: 'official',
      description: 'Показывает статус официального/комьюнити сервера',
      example: `[![MCP](https://mcpservers.org/api/badge/owner/repo?type=official)](https://mcpservers.org/ru/servers/owner/repo)`,
      preview: 'https://mcpservers.org/api/badge/anthropics/anthropic?type=official',
    },
    {
      name: 'Категория',
      type: 'category',
      description: 'Показывает категорию сервера',
      example: `[![Category](https://mcpservers.org/api/badge/owner/repo?type=category)](https://mcpservers.org/ru/servers/owner/repo)`,
      preview: 'https://mcpservers.org/api/badge/anthropics/anthropic?type=category',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Бейджи для README</h1>
      <p className="text-muted-foreground mb-8">
        Добавьте бейдж в README вашего MCP сервера, чтобы привлечь больше пользователей.
      </p>

      <div className="space-y-8">
        {badgeTypes.map((badge) => (
          <div key={badge.type} className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">{badge.name}</h2>
            <p className="text-muted-foreground mb-4">{badge.description}</p>

            <div className="bg-muted rounded-lg p-4 mb-4">
              <code className="text-sm font-mono block">{badge.example}</code>
            </div>

            <p className="text-sm text-muted-foreground">
              URL бейджа: <code className="font-mono">{badge.preview}</code>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
        <p className="text-sm">
          <strong>Замените</strong> <code>owner/repo</code> на реальный путь вашего сервера.
          Например, для <code>anthropics/anthropic</code> используйте{' '}
          <code>/api/badge/anthropics/anthropic</code>.
        </p>
      </div>
    </div>
  )
}
