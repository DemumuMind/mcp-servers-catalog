import { getClients } from '@/app/actions/clients'
import { ClientCard } from '@/components/client-card'
import { SearchBar } from '@/components/search-bar'

export const dynamic = 'force-dynamic'

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const clients = await getClients({ search: searchParams.q })
  const featuredClients = clients.filter((c) => c.featured)
  const regularClients = clients.filter((c) => !c.featured)

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <section className="text-center py-8">
        <h1 className="text-3xl font-bold mb-2">MCP-клиенты</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Откройте для себя приложения и инструменты, поддерживающие MCP-серверы
        </p>
        <SearchBar />
      </section>

      {/* Featured */}
      {featuredClients.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Рекомендуемые</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        </section>
      )}

      {/* All Clients */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Все клиенты</h2>
        {regularClients.length === 0 && clients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchParams.q ? 'Нет клиентов, соответствующих поиску' : 'Нет клиентов'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
