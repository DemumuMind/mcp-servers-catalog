import { getClients } from '@/app/actions/clients'
import { ClientCard } from '@/components/client-card'
import { SearchBar } from '@/components/search-bar'
import { EmptyState, PageHero, PageShell } from '@/components/page-components'
import { SectionHeader } from '@/components/section-header'
import { MonitorCog } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function ClientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { locale } = await params
  const { q } = await searchParams
  const clients = await getClients({ search: q })
  const featuredClients = clients.filter((c: any) => c.featured)
  const regularClients = clients.filter((c: any) => !c.featured)

  const t = await getTranslations({ locale, namespace: 'Clients' })

  return (
    <PageShell className="space-y-10">
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      >
        <SearchBar />
      </PageHero>

      {featuredClients.length > 0 && (
        <section>
          <SectionHeader title={t('featuredTitle')} href="#all-clients" locale={locale} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
            {featuredClients.map((client: any) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        </section>
      )}

      <section id="all-clients" className="scroll-mt-24">
        <SectionHeader title={t('allTitle')} href="#all-clients" locale={locale} />
        {regularClients.length === 0 && clients.length === 0 ? (
          <EmptyState icon={MonitorCog} title={q ? t('emptySearchTitle') : t('emptyNoSearchTitle')} description={t('emptyDescription')} />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
            {regularClients.map((client: any) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}
