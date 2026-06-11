import { getUserHistory } from "@/app/actions/profile";
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { History } from "lucide-react";
import { ServerCard } from '@/components/server-card'
import { ClearHistoryButton } from '@/components/clear-history-button'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function ProfileHistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ProfileHistory' })
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
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <span className="text-sm text-muted-foreground">({history.length})</span>
        </div>
        {history.length > 0 && (
          <ClearHistoryButton userId={session.user.id} />
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">
          {t('empty')}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((item: any) => (
            <ServerCard key={item.server.id} server={item.server} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
