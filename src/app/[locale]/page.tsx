import { headers } from 'next/headers'
import { getServersPublic, getServerCategories, getServerTags, getTrendingServers } from '@/app/actions/public'
import { AutocompleteSearch } from '@/components/autocomplete-search'
import { CategoryTabs } from '@/components/category-tabs'
import { ServerCard } from '@/components/server-card'
import { FAQAccordion } from '@/components/faq-accordion'
import { SectionHeader } from '@/components/section-header'
import { Pagination } from '@/components/pagination'
import { SponsoredServers } from '@/components/sponsored-servers'

export const dynamic = 'force-dynamic'

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; q?: string; page?: string; tag?: string; official?: string; remote?: string }>
}) {
  const { locale } = await params
  const params_search = await searchParams
  const category = params_search.category || 'all'
  const search = params_search.q
  const tag = params_search.tag
  const onlyOfficial = params_search.official === 'true'
  const onlyRemote = params_search.remote === 'true'
  const page = parseInt(params_search.page || '1', 10)

  // A/B test variant from middleware
  const h = await headers()
  const abVariant = h.get('x-ab-variant') || 'featured'

  const { servers: featuredServers } = await getServersPublic(
    1,
    search,
    category !== 'all' ? category : undefined,
    tag,
    onlyOfficial,
    true,
    onlyRemote,
  )

  // A/B test: control = featured sort, test = trending sort
  const latestSortBy = abVariant === 'trending' ? 'trending' : 'featured'
  const { servers: latestServers, total, pages, currentPage } = await getServersPublic(
    page,
    search,
    category !== 'all' ? category : undefined,
    tag,
    onlyOfficial,
    false,
    onlyRemote,
    latestSortBy,
  )

  const categories = await getServerCategories()
  const tags = await getServerTags()
  const trendingServers = await getTrendingServers()

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Awesome MCP Servers</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Коллекция серверов для Model Context Protocol
        </p>
        <div className="flex justify-center">
          <AutocompleteSearch locale={locale} defaultValue={search} />
        </div>
      </section>

      {/* Sponsored Servers */}
      <SponsoredServers />

      {/* Filters */}
      <section className="space-y-4">
        <CategoryTabs activeCategory={category} />
        
        {/* Tag filters */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-sm text-muted-foreground mr-2">Теги:</span>
            {tags.slice(0, 15).map((t) => (
              <a
                key={t.name}
                href={`/${locale}?tag=${encodeURIComponent(t.name)}${category !== 'all' ? `&category=${category}` : ''}${onlyOfficial ? '&official=true' : ''}`}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  tag === t.name
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {t.name} ({t.count})
              </a>
            ))}
          </div>
        )}

        {/* Official & Remote filters */}
        <div className="flex justify-center gap-3">
          <a
            href={`/${locale}?${new URLSearchParams({
              ...(category !== 'all' ? { category } : {}),
              ...(tag ? { tag } : {}),
              ...(search ? { q: search } : {}),
              ...(onlyRemote ? { remote: 'true' } : {}),
              ...(onlyOfficial ? {} : { official: 'true' }),
            }).toString()}`}
            className={`text-sm px-3 py-1 rounded-full border transition-colors ${
              onlyOfficial
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            Только официальные
          </a>
          <a
            href={`/${locale}?${new URLSearchParams({
              ...(category !== 'all' ? { category } : {}),
              ...(tag ? { tag } : {}),
              ...(search ? { q: search } : {}),
              ...(onlyOfficial ? { official: 'true' } : {}),
              ...(onlyRemote ? {} : { remote: 'true' }),
            }).toString()}`}
            className={`text-sm px-3 py-1 rounded-full border transition-colors ${
              onlyRemote
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            Только remote
          </a>
        </div>
      </section>

      {/* Featured */}
      <section>
        <SectionHeader title="Рекомендуемые MCP" href={`/${locale}/all`} />
        {featuredServers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Нет рекомендуемых серверов</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredServers.map((server) => (
              <ServerCard key={server.id} server={server} locale={locale} />
            ))}
          </div>
        )}
      </section>

      {/* Trending */}
      <section>
        <SectionHeader title="Сейчас в тренде" href={`/${locale}/all`} />
        {trendingServers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Нет трендовых серверов</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingServers.filter(Boolean).map((server) => (
              <ServerCard key={server!.id} server={server!} locale={locale} />
            ))}
          </div>
        )}
      </section>

      {/* Latest */}
      <section>
        <SectionHeader title="Все MCP" href={`/${locale}/all`} />
        {latestServers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {search ? `Нет результатов для "${search}"` : 'Нет серверов'}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestServers.map((server) => (
                <ServerCard key={server.id} server={server} locale={locale} />
              ))}
            </div>
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={pages}
                baseUrl={`/${locale}`}
                searchParams={params_search}
              />
            </div>
          </>
        )}
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
