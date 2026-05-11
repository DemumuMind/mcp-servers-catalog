import { advancedSearchServers, getServerCategories, getServerLanguages } from '@/app/actions/advanced-search'
import { AdvancedSearchClient } from '@/components/advanced-search-client'

export const dynamic = 'force-dynamic'

export default async function AdvancedSearchPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const [categories, languages] = await Promise.all([
    getServerCategories(),
    getServerLanguages(),
  ])

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">Расширенный поиск</h1>
        <p className="text-muted-foreground">
          Найдите MCP серверы с точными фильтрами
        </p>
      </div>

      <AdvancedSearchClient categories={categories} languages={languages} locale={locale} />
    </div>
  )
}
