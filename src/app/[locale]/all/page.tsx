import { getServersPublic } from '@/app/actions/public'
import { ServerCard } from '@/components/server-card'
import { AutocompleteSearch } from '@/components/autocomplete-search'
import { InfiniteServerList } from '@/components/infinite-server-list'
import { SortDropdown } from '@/components/sort-dropdown'

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
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">Все MCP серверы</h1>
        <div className="flex justify-center">
          <AutocompleteSearch locale={locale} defaultValue={search} />
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <SortDropdown currentSort={sortBy} locale={locale} />
      </div>

      {servers.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Нет серверов</p>
      ) : (
        <InfiniteServerList
          initialServers={servers as any}
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
  )
}
