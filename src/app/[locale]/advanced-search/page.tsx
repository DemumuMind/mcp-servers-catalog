import { getServerCategories, getServerLanguages } from "@/app/actions/advanced-search";
import { AdvancedSearchClient } from '@/components/advanced-search-client'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function AdvancedSearchPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('AdvancedSearch')
  const [categories, languages] = await Promise.all([
    getServerCategories(),
    getServerLanguages(),
  ])

  return (
    <div className="page-shell">
      <div className="premium-panel p-8 text-center">
        <h1 className="font-heading text-4xl font-semibold tracking-[-0.06em] mb-4">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <AdvancedSearchClient categories={categories} languages={languages} locale={locale} />
    </div>
  )
}

