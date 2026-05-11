import { getUserBookmarks } from '@/app/actions/public'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ServerCard } from '@/components/server-card'

export const dynamic = 'force-dynamic'

export default async function BookmarksPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/${locale}`)
  }

  const bookmarks = await getUserBookmarks(session.user.id)

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Мои закладки</h1>
      
      {bookmarks.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">
          У вас пока нет закладок. Нажмите "В закладки" на карточке сервера, чтобы сохранить его.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((server) => (
            <ServerCard key={server.id} server={server} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
