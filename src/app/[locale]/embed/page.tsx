import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Embed виджет',
  description: 'Встраивайте карточки MCP серверов на свой сайт',
}

export const dynamic = 'force-dynamic'

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const baseUrl = process.env.SITE_URL || 'https://mcpservers.org'

  const exampleCode = `<iframe
  src="${baseUrl}/api/embed?id=SERVER_ID"
  width="100%"
  height="160"
  frameborder="0"
  style="border-radius: 8px; overflow: hidden;"
></iframe>`

  const scriptCode = `<script
  src="${baseUrl}/embed.js"
  data-server-id="SERVER_ID"
  data-width="100%"
  data-height="160"
></script>`

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Embed виджет</h1>
      <p className="text-muted-foreground mb-8">
        Встраивайте карточки MCP серверов на свои сайты, блоги и документацию.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">Способ 1: iframe</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Простой и надёжный способ. Замените SERVER_ID на ID сервера из URL.
          </p>
          <div className="bg-muted rounded-lg p-4">
            <code className="text-sm font-mono block whitespace-pre">{exampleCode}</code>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Способ 2: JavaScript</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Автоматическая адаптация размеров и ленивая загрузка.
          </p>
          <div className="bg-muted rounded-lg p-4">
            <code className="text-sm font-mono block whitespace-pre">{scriptCode}</code>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Где взять ID сервера?</h2>
          <p className="text-muted-foreground">
            Откройте страницу сервера и скопируйте часть URL после{' '}
            <code>/servers/</code>. Например, для{' '}
            <code>mcpservers.org/ru/servers/anthropics/anthropic</code>
            {' '}ID сервера можно найти в админ-панели или через API.
          </p>
        </section>
      </div>
    </div>
  )
}
