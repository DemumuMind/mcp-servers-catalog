import { getTranslations } from 'next-intl/server'
import { PageHero, PageShell } from '@/components/page-components'
import { CollectionsList } from '@/components/collections-list'

export const dynamic = 'force-dynamic'

export default async function CollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Collections' })

  return (
    <PageShell>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
      <CollectionsList locale={locale} />
    </PageShell>
  )
}
