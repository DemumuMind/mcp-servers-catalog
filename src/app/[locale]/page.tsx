import { getServers } from '@/app/actions/servers'
import { SearchBar } from '@/components/search-bar'
import { CategoryTabs } from '@/components/category-tabs'
import { ServerCard } from '@/components/server-card'
import { FAQAccordion } from '@/components/faq-accordion'
import { SectionHeader } from '@/components/section-header'

export const dynamic = 'force-dynamic'

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const { locale } = await params
  const params_search = await searchParams
  const category = params_search.category || 'all'

  const serverFilters = category !== 'all' ? { category } : undefined
  const featuredServers = await getServers({ featured: true, ...serverFilters })
  const latestServers = await getServers(serverFilters)

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Awesome MCP Servers</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Коллекция серверов для Model Context Protocol
        </p>
        <div className="flex justify-center">
          <SearchBar />
        </div>
      </section>

      {/* Categories */}
      <section>
        <CategoryTabs activeCategory={category} />
      </section>

      {/* Featured */}
      <section>
        <SectionHeader title="Рекомендуемые MCP" href={`/${locale}/all`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredServers.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      </section>

      {/* Latest */}
      <section>
        <SectionHeader title="Последние MCP" href={`/${locale}/all?sort=newest`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {latestServers.slice(0, 10).map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">
          Часто задаваемые вопросы о Model Context Protocol
        </h2>
        <FAQAccordion />
      </section>
    </div>
  )
}
