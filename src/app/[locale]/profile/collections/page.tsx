import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUserCollections } from '@/app/actions/collections'
import { CollectionsClient } from '@/components/collections-client'

export const dynamic = 'force-dynamic'

export default async function ProfileCollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const collections = await getUserCollections(session.user.id)

  return (
    <CollectionsClient
      collections={collections}
      locale={locale}
      userId={session.user.id}
    />
  )
}