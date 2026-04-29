import { getServers } from '@/app/actions/servers'
import { ServerCard } from '@/components/server-card'
import { SearchBar } from '@/components/search-bar'

export const dynamic = 'force-dynamic'

export default async function AllServersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const servers = await getServers({ search: sp.q })

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">Все MCP серверы</h1>
        <div className="flex justify-center">
          <SearchBar />
        </div>
      </div>
      {servers.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Нет серверов</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {servers.map((server) => (
            <ServerCard key={server.id} server={server} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
