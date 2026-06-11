import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { getServersPublic, getServerTags, getTrendingServers } from '@/app/actions/public'
import { db } from '@/lib/db'
import { servers } from '@/lib/db/schema'
import { count, eq } from 'drizzle-orm'
import { AutocompleteSearch } from '@/components/autocomplete-search'
import { TrendingSearches } from '@/components/trending-searches'
import { RecentlyViewed } from '@/components/recently-viewed'
import { CategoryTabs } from '@/components/category-tabs'
import { ServerCard } from '@/components/server-card'
import { FAQAccordion } from '@/components/faq-accordion'
import { SectionHeader } from '@/components/section-header'
import { Pagination } from '@/components/pagination'
import { SponsoredServers } from '@/components/sponsored-servers'
import { EmptyState, FilterPanel, MetricCard, PageShell } from '@/components/page-components'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, Boxes, RadioTower, ShieldCheck, Sparkles, Tag } from 'lucide-react'
import { auth } from '@/lib/auth'

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

  const t = await getTranslations({ locale, namespace: 'Home' })

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

  const latestSortBy = abVariant === 'trending' ? 'trending' : 'featured'
  const { servers: latestServers, pages, currentPage } = await getServersPublic(
    page,
    search,
    category !== 'all' ? category : undefined,
    tag,
    onlyOfficial,
    false,
    onlyRemote,
    latestSortBy,
  )

  const tags = await getServerTags()
  const trendingServers = await getTrendingServers()
  const session = await auth()
  const userId = session?.user?.id
  // Use direct DB counts for stats (getServersPublic total is cached/unreliable)
  const totalCount = await db.select({ count: count() }).from(servers).then((r: any) => r[0]?.count ?? 0)
  const officialCount = await db.select({ count: count() }).from(servers).where(eq(servers.isOfficial, true)).then((r: any) => r[0]?.count ?? 0)
  const remoteCount = await db.select({ count: count() }).from(servers).where(eq(servers.isRemote, true)).then((r: any) => r[0]?.count ?? 0)

  // Always use comma separator (5,001) — space separator looks like "501" on screenshots
  const fmtNum = (n: number) => n.toLocaleString('en-US')

  return (
    <PageShell className="space-y-8">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/76 p-6 shadow-[var(--shadow-soft)] backdrop-blur-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-6 h-60 w-60 rounded-full bg-chart-2/10 blur-3xl" />
        <div className="relative grid items-center gap-8 xl:grid-cols-[minmax(0,1fr)_23rem]">
          <div className="min-w-0">
            <p className="eyebrow mb-4">{t('heroEyebrow')}</p>
            <h1 className="max-w-4xl font-heading text-[2.65rem] font-semibold leading-[1.04] tracking-[-0.06em] text-foreground sm:text-5xl lg:text-[4.05rem] xl:text-[4.45rem]">
              {t('heroTitle')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              {t('heroDescription')}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" render={<a href={`/${locale}/all`} aria-label={t('viewCatalog')} />}>
                {t('viewCatalog')}
                <ArrowUpRight className="size-4" />
              </Button>
              <Button variant="outline" size="lg" render={<a href={`/${locale}/submit`} aria-label={t('addServer')} />}>
                {t('addServer')}
              </Button>
            </div>
            <div className="mt-7 max-w-2xl">
              <AutocompleteSearch locale={locale} defaultValue={search} className="max-w-2xl" />
              <TrendingSearches locale={locale} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <MetricCard label={t('inCatalog')} value={fmtNum(totalCount)} icon={Boxes} hint={t('serversAndIntegrations')} />
            <MetricCard label={t('officialLabel')} value={fmtNum(officialCount)} icon={ShieldCheck} hint={t('verifiedSources')} />
            <MetricCard label={t('remoteLabel')} value={fmtNum(remoteCount)} icon={RadioTower} hint={t('availableByEndpoint')} />
          </div>
        </div>
      </section>

      <SponsoredServers />

      <FilterPanel className="space-y-4 p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">{t('filters')}</p>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.05em]">{t('quickNavigation')}</h2>
          </div>
        </div>
        <CategoryTabs activeCategory={category} />

        {tags.length > 0 && (
          <div className="space-y-3 border-t border-border/60 pt-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Tag className="size-4" />
              {t('popularTags')}
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 15).map((tagItem) => (
                <a
                  key={tagItem.name}
                  href={`/${locale}?tag=${encodeURIComponent(tagItem.name)}${category !== 'all' ? `&category=${category}` : ''}${onlyOfficial ? '&official=true' : ''}`}
                  className={`rounded-xl border px-3 py-1.5 font-mono text-xs font-semibold transition-all hover:-translate-y-0.5 ${
                    tag === tagItem.name
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border/70 bg-card/58 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                  }`}
                >
                  {tagItem.name} ({tagItem.count})
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3 border-t border-border/60 pt-4 sm:justify-start">
          <a
            href={`/${locale}?${new URLSearchParams({
              ...(category !== 'all' ? { category } : {}),
              ...(tag ? { tag } : {}),
              ...(search ? { q: search } : {}),
              ...(onlyRemote ? { remote: 'true' } : {}),
              ...(onlyOfficial ? {} : { official: 'true' }),
            }).toString()}`}
            className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition-all ${
              onlyOfficial
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border/70 bg-card/58 hover:border-primary/30 hover:bg-card/90'
            }`}
          >
            {t('officialOnly')}
          </a>
          <a
            href={`/${locale}?${new URLSearchParams({
              ...(category !== 'all' ? { category } : {}),
              ...(tag ? { tag } : {}),
              ...(search ? { q: search } : {}),
              ...(onlyOfficial ? { official: 'true' } : {}),
              ...(onlyRemote ? {} : { remote: 'true' }),
            }).toString()}`}
            className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition-all ${
              onlyRemote
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border/70 bg-card/58 hover:border-primary/30 hover:bg-card/90'
            }`}
          >
            {t('remoteOnly')}
          </a>
        </div>
      </FilterPanel>

      <section>
        <SectionHeader title={t('featured')} href={`/${locale}/all`} locale={locale} />
        {featuredServers.length === 0 ? (
          <EmptyState title={t('noFeatured')} description={t('changeFiltersOrCatalog')} />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-5">
            {featuredServers.map((server, i) => (
              <ServerCard key={`feat-${server.id}-${i}`} server={server} locale={locale} />
            ))}
          </div>
        )}
      </section>

      {trendingServers.filter(Boolean).length >= 3 && (
        <section>
          <SectionHeader title={t('trending')} href={`/${locale}/all`} locale={locale} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-5">
            {trendingServers.filter(Boolean).map((server: any, i: any) => (
              <ServerCard key={`trend-${server!.id}-${i}`} server={server!} locale={locale} />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title={t('allServers')} href={`/${locale}/all`} locale={locale} />
        {latestServers.length === 0 ? (
          <EmptyState icon={Sparkles} title={search ? t('noResultsFor', { search }) : t('noServers')} description={t('tryDifferent')} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-5">
              {latestServers.map((server, i) => (
                <ServerCard key={`latest-${server.id}-${i}`} server={server} locale={locale} />
              ))}
            </div>
            <div className="mt-8">
              <Pagination currentPage={currentPage} totalPages={pages} baseUrl={`/${locale}`} searchParams={params_search} />
            </div>
          </>
        )}
      </section>

      <section className="mx-auto max-w-4xl">
        <div className="premium-panel p-6 sm:p-8">
          <div className="mb-6 text-center">
            <p className="eyebrow mb-2">{t('faqEyebrow')}</p>
            <h2 className="font-heading text-3xl font-semibold tracking-[-0.05em]">
              {t('faqTitle')}
            </h2>
          </div>
          <FAQAccordion />
        </div>
      </section>

      <RecentlyViewed locale={locale} userId={userId} />
    </PageShell>
  )
}
