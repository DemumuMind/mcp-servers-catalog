import { getUserBookmarks } from '@/app/actions/public'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ServerCard } from '@/components/server-card'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function BookmarksPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('Bookmarks')
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/${locale}`)
  }

  const bookmarks = await getUserBookmarks(session.user.id)

  return (
    <div className="page-shell">
      <h1 className="font-heading text-4xl font-semibold tracking-[-0.06em] mb-8">{t('pageTitle')}</h1>
      
      {bookmarks.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">
          {t('emptyState')}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((server: any) => (
            <ServerCard key={`bm-${server.id}`} server={server} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}

