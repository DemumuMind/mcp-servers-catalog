import { getServers } from '@/app/actions/servers'
import { ServerCard } from '@/components/server-card'
import { SearchBar } from '@/components/search-bar'
import { EmptyState, PageHero, PageShell } from '@/components/page-components'
import { RadioTower } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function RemoteServersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const servers = await getServers({ isRemote: true, search: sp.q })

  const t = await getTranslations({ locale, namespace: 'RemoteServers' })

  return (
    <PageShell className="space-y-8">
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      >
        <SearchBar />
      </PageHero>
      {servers.length === 0 ? (
        <EmptyState icon={RadioTower} title={t('emptyTitle')} description={t('emptyDescription')} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-5">
          {servers.map((server: any) => (
            <ServerCard key={`remote-${server.id}`} server={server} locale={locale} />
          ))}
        </div>
      )}
    </PageShell>
  )
}
