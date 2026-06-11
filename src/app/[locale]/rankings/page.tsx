import { Card, CardContent } from "@/components/ui/card";
import { getServerRankings } from '@/app/actions/rankings'
import { SectionHeader } from '@/components/section-header'
import { Trophy } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

interface RankingItem {
  id: string
  rank: number
  score: number
  views: number
  bookmarks: number
  ratings: number
  server: { name: string; description: string }
}

function RankingCard({ rank }: { rank: RankingItem }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="font-heading text-3xl font-semibold tracking-[-0.05em] w-12 text-center">
          #{rank.rank}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{rank.server.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {rank.server.description}
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>Score: {Math.round(rank.score)}</div>
          <div className="text-xs">
            {rank.views} views · {rank.bookmarks} bookmarks · {rank.ratings} ratings
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function RankingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Rankings' })
  const [weekly, monthly] = await Promise.all([
    getServerRankings('week', 10),
    getServerRankings('month', 10),
  ])

  return (
    <div className="page-shell">
      <div className="premium-panel p-8 text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Trophy className="h-10 w-10 text-yellow-500" />
          {t('title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {/* Weekly */}
      <section>
        <SectionHeader title={t('weeklyTop')} href={`/${locale}/all`} locale={locale} showLink={weekly.length > 0} />
        {weekly.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{t('noDataWeek')}</p>
        ) : (
          <div className="space-y-3">
            {weekly.map((rank: any) => (
              <RankingCard key={rank.id} rank={rank} />
            ))}
          </div>
        )}
      </section>

      {/* Monthly */}
      <section>
        <SectionHeader title={t('monthlyTop')} href={`/${locale}/all`} locale={locale} showLink={monthly.length > 0} />
        {monthly.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{t('noDataMonth')}</p>
        ) : (
          <div className="space-y-3">
            {monthly.map((rank: any) => (
              <RankingCard key={rank.id} rank={rank} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
