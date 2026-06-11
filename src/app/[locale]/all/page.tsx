import { getServersPublic } from '@/app/actions/public'
import { AutocompleteSearch } from '@/components/autocomplete-search'
import { InfiniteServerList, type ServerWithRating } from '@/components/infinite-server-list'
import { SortDropdown } from '@/components/sort-dropdown'
import { EmptyState, FilterPanel, PageHero, PageShell } from '@/components/page-components'
import { Badge } from '@/components/ui/badge'
import { Layers3 } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function AllServersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; category?: string; official?: string; remote?: string; sort?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const search = sp.q
  const category = sp.category
  const onlyOfficial = sp.official === 'true'
  const onlyRemote = sp.remote === 'true'
  const sortBy = sp.sort || 'featured'

  const t = await getTranslations({ locale, namespace: 'AllServers' })

  const { servers, pages, currentPage } = await getServersPublic(
    1,
    search,
    category,
    undefined,
    onlyOfficial,
    undefined,
    onlyRemote,
    sortBy
  )

  return (
    <PageShell className="space-y-8">
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      >
        <AutocompleteSearch locale={locale} defaultValue={search} />
      </PageHero>

      <FilterPanel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {category && <Badge variant="outline">category: {category}</Badge>}
          {onlyOfficial && <Badge>official</Badge>}
          {onlyRemote && <Badge>remote</Badge>}
          {search && <Badge variant="secondary">query: {search}</Badge>}
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
    </PageShell>
  )
}
