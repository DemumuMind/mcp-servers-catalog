export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Офлайн — MCP Servers',
  description: 'Нет подключения к интернету',
}

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-6xl mb-4">📡</div>
      <h1 className="text-2xl font-bold mb-2">Нет подключения к интернету</h1>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Похоже, вы потеряли соединение. Некоторые ранее загруженные страницы могут быть доступны.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Попробовать снова
      </button>
    </div>
  )
}
