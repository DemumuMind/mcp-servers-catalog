import { getUserBookmarks } from '@/app/actions/public'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { BookmarksClient } from '@/components/bookmarks-client'

export const dynamic = 'force-dynamic'

export default async function ProfileBookmarksPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const bookmarks = await getUserBookmarks(session.user.id)

  return (
    <BookmarksClient
      bookmarks={bookmarks.map((s) => ({ id: s.id, server: s }))}
      locale={locale}
      userId={session.user.id}
    />
  )
}
