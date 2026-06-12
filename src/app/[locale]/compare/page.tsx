import { db, servers } from '@/lib/db'
import { eq, or } from 'drizzle-orm'
import { PageHero, PageShell } from '@/components/page-components'
import { CompareView } from '@/components/compare-view'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ ids?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations({ locale, namespace: 'Compare' })

  const ids = sp.ids ? sp.ids.split(',').filter(Boolean) : []
  let compareServers: any[] = []

  if (ids.length >= 2) {
    compareServers = await db.select().from(servers)
      .where(or(...ids.map(id => eq(servers.id, id))))
      .limit(6)
  }

  return (
    <PageShell className="space-y-8">
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <CompareView servers={compareServers} locale={locale} />
    </PageShell>
  )
}
