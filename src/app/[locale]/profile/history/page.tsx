import { getUserHistory, clearHistory } from '@/app/actions/profile'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { History, ExternalLink, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { ServerCard } from '@/components/server-card'
import { ClearHistoryButton } from '@/components/clear-history-button'

export const dynamic = 'force-dynamic'

export default async function ProfileHistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const history = await getUserHistory(session.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <h1 className="text-xl font-bold">История просмотров</h1>
          <span className="text-sm text-muted-foreground">({history.length})</span>
        </div>
        {history.length > 0 && (
          <ClearHistoryButton userId={session.user.id} />
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">
          История просмотров пуста. Посещайте страницы серверов, чтобы они появились здесь.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((item) => (
            <ServerCard key={item.server.id} server={item.server} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
