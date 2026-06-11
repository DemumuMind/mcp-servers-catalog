import { getServers } from '@/app/actions/servers'
import { ServerCard } from '@/components/server-card'
import { EmptyState, PageHero, PageShell } from '@/components/page-components'
import { ShieldCheck } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function OfficialServersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const servers = await getServers({ isOfficial: true })

  const t = await getTranslations({ locale, namespace: 'OfficialServers' })

  return (
    <PageShell className="space-y-8">
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      {servers.length === 0 ? (
        <EmptyState icon={ShieldCheck} title={t('emptyTitle')} description={t('emptyDescription')} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-5">
          {servers.map((server: any) => (
            <ServerCard key={`off-${server.id}`} server={server} locale={locale} />
          ))}
        </div>
      )}
    </PageShell>
  )
}
