import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Что такое Model Context Protocol (MCP)',
  description: 'Подробное объяснение Model Context Protocol (MCP) — открытого протокола для интеграции AI-ассистентов с внешними инструментами, базами данных и сервисами.',
  keywords: ['MCP', 'Model Context Protocol', 'AI протокол', 'MCP серверы', 'что такое MCP'],
  openGraph: {
    title: 'Что такое Model Context Protocol (MCP)',
    description: 'Подробное объяснение протокола MCP для AI-интеграций',
    type: 'article',
    locale: 'ru_RU',
  },
}

export const dynamic = 'force-dynamic'

export default async function AboutMCPPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="prose dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-6">Что такое Model Context Protocol (MCP)?</h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Model Context Protocol (MCP) — это открытый протокол, разработанный компанией Anthropic 
          для стандартизации взаимодействия между AI-ассистентами и внешними источниками данных, 
          инструментами и сервисами.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Зачем нужен MCP?</h2>
        <p>
          До появления MCP каждый AI-интегратор создавал свой собственный способ подключения 
          к внешним системам. Это приводило к фрагментации: одни и те же интеграции приходилось 
          делать заново для каждого AI-клиента.
        </p>
        <p>
          MCP решает эту проблему, предоставляя единый стандарт. Теперь достаточно написать 
          <strong> MCP-сервер</strong> один раз, и он будет работать с любым MCP-совместимым клиентом: 
          Claude Desktop, Cursor, Continue, Cline и многими другими.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Как работает MCP?</h2>
        <div className="bg-muted rounded-lg p-6 my-6">
          <h3 className="text-lg font-medium mb-3">Архитектура MCP</h3>
          <ul className="space-y-2">
            <li><strong>MCP Сервер</strong> — предоставляет инструменты, ресурсы и промпты</li>
            <li><strong>MCP Клиент</strong> — AI-приложение, которое подключается к серверам</li>
            <li><strong>Транспорт</strong> — stdio, SSE (Server-Sent Events) или HTTP</li>
          </ul>
        </div>

        <p>
          MCP-сервер может предоставлять три типа возможностей:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Tools (Инструменты)</strong> — функции, которые AI может вызывать для выполнения действий (поиск, запись данных, отправка сообщений)</li>
          <li><strong>Resources (Ресурсы)</strong> — данные, которые AI может читать (файлы, базы данных, API-ответы)</li>
          <li><strong>Prompts (Промпты)</strong> — готовые шаблоны запросов для типовых задач</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Примеры использования</h2>
        <div className="grid gap-4 my-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">🗄️ Доступ к базе данных</h3>
            <p className="text-sm text-muted-foreground">
              AI может выполнять SQL-запросы, получать схемы таблиц и анализировать данные 
              без прямого доступа к БД.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">🔍 Поиск по документации</h3>
            <p className="text-sm text-muted-foreground">
              AI получает доступ к внутренней документации компании и может отвечать 
              на вопросы на основе актуальных данных.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">🛠️ Управление инфраструктурой</h3>
            <p className="text-sm text-muted-foreground">
              AI может читать логи, перезапускать сервисы, проверять метрики 
              через интеграцию с Kubernetes, AWS, Docker.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">📁 Работа с файлами</h3>
            <p className="text-sm text-muted-foreground">
              AI может читать, создавать и редактировать файлы в проекте 
              через файловую систему MCP-сервера.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Безопасность</h2>
        <p>
          MCP разработан с учётом безопасности:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Каждый инструмент требует явного подтверждения пользователя</li>
          <li>Гранулярные разрешения на уровне ресурсов</li>
          <li>Поддержка аутентификации (OAuth, API keys)</li>
          <li>Изоляция контекста между разными серверами</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Начните использовать MCP</h2>
        <p>
          Ознакомьтесь с нашим <a href={`/${locale}/guide`} className="text-primary hover:underline">гайдом по использованию</a> или 
          посмотрите <a href={`/${locale}/all`} className="text-primary hover:underline">каталог MCP серверов</a>.
        </p>
      </article>
    </div>
  )
}
