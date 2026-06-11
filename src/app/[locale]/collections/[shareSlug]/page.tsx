import { notFound } from 'next/navigation'
import { getPublicCollection } from '@/app/actions/collections'
import { PublicCollectionView } from '@/components/public-collection-view'

export const dynamic = 'force-dynamic'

export default async function PublicCollectionPage({
  params,
}: {
  params: Promise<{ locale: string; shareSlug: string }>
}) {
  const { locale, shareSlug } = await params
  const collection = await getPublicCollection(shareSlug)

  if (!collection) {
    notFound()
  }

  return (
    <PublicCollectionView
      collection={collection}
      locale={locale}
    />
  )
}
