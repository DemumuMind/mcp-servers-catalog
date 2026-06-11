import { getServersPublic } from '@/app/actions/public'
import { AutocompleteSearch } from '@/components/autocomplete-search'
import { InfiniteServerList, type ServerWithRating } from '@/components/infinite-server-list'
import { SortDropdown } from '@/components/sort-dropdown'
import { EmptyState, FilterPanel, PageHero, PageShell } from '@/components/page-components'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Layers3, Filter, X } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const CATEGORIES = [
  'ai', 'database', 'tools', 'search', 'cloud-service',
  'development', 'browser', 'web', 'productivity', 'finance',
  'communication', 'security', 'filesystem', 'git', 'monitoring',
  'social', 'email', 'memory', 'calendar', 'web-scraping',
]

export default async function ServersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; category?: string; official?: string; remote?: string; sort?: string; view?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const search = sp.q
  const category = sp.category
  const onlyOfficial = sp.official === 'true'
  const onlyRemote = sp.remote === 'true'
  const sortBy = sp.sort || 'featured'
  const view = sp.view || 'grid'

  const t = await getTranslations({ locale, namespace: 'AllServers' })

  const { servers, pages, currentPage } = await getServersPublic(
    1, search, category, undefined, onlyOfficial, undefined, onlyRemote, sortBy
  )

  // Build filter URL helper
  const filterUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    if (overrides.q ?? search) params.set('q', overrides.q ?? search ?? '')
    if (overrides.category ?? category) params.set('category', overrides.category ?? category ?? '')
    if (overrides.official ?? (onlyOfficial ? 'true' : undefined)) params.set('official', 'true')
    if (overrides.remote ?? (onlyRemote ? 'true' : undefined)) params.set('remote', 'true')
    if (overrides.sort ?? sortBy) params.set('sort', overrides.sort ?? sortBy)
    const qs = params.toString()
    return `/${locale}/servers${qs ? `?${qs}` : ''}`
  }

  const activeFilters = [category, onlyOfficial && 'official', onlyRemote && 'remote', search && `"${search}"`].filter(Boolean)

  return (
    <PageShell className="space-y-8">
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      >
        <AutocompleteSearch locale={locale} defaultValue={search} />
      </PageHero>

      {/* Category sidebar + main content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Category sidebar */}
        <aside className="lg:w-56 shrink-0">
          <div className="sticky top-24 space-y-1">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
              Categories
            </h3>
            <Link
              href={filterUrl({ category: undefined })}
              className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${!category ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
            >
              All servers
            </Link>
            {CATEGORIES.map(cat => (
              <Link
                key={cat}
                href={filterUrl({ category: cat })}
                className={`block px-3 py-1.5 rounded-lg text-sm transition-colors capitalize ${category === cat ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
              >
                {cat.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 space-y-4">
          {/* Active filters + sort */}
          <FilterPanel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              {activeFilters.length > 0 && (
                <Link href={filterUrl({ category: undefined, official: undefined, remote: undefined, q: undefined })} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3 mr-1" /> Clear
                </Link>
              )}
              {category && <Badge variant="outline">{category}</Badge>}
              {onlyOfficial && <Badge>official</Badge>}
              {onlyRemote && <Badge>remote</Badge>}
              {search && <Badge variant="secondary">q: {search}</Badge>}
            </div>
            <SortDropdown currentSort={sortBy} locale={locale} />
          </FilterPanel>

          {servers.length === 0 ? (
            <EmptyState icon={Layers3} title={t('emptyTitle')} description={t('emptyDescription')} />
          ) : (
            <InfiniteServerList
              initialServers={servers as ServerWithRating[]}
              initialPage={currentPage}
              totalPages={pages}
              locale={locale}
              category={category}
              search={search}
              onlyOfficial={onlyOfficial}
              onlyRemote={onlyRemote}
              sortBy={sortBy}
            />
          )}
        </div>
      </div>
    </PageShell>
  )
}
