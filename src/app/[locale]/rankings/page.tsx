import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getServerRankings } from '@/app/actions/rankings'
import { ServerCard } from '@/components/server-card'
import { SectionHeader } from '@/components/section-header'
import { Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RankingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const [weekly, monthly] = await Promise.all([
    getServerRankings('week', 10),
    getServerRankings('month', 10),
  ])

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Trophy className="h-10 w-10 text-yellow-500" />
          Рейтинг серверов
        </h1>
        <p className="text-lg text-muted-foreground">
          Топ серверов по активности сообщества
        </p>
      </div>

      {/* Weekly */}
      <section>
        <SectionHeader title="Топ недели" href={`/${locale}/all`} />
        {weekly.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Недостаточно данных за эту неделю</p>
        ) : (
          <div className="space-y-3">
            {weekly.map((rank) => (
              <Card key={rank.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-2xl font-bold w-12 text-center">
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
            ))}
          </div>
        )}
      </section>

      {/* Monthly */}
      <section>
        <SectionHeader title="Топ месяца" href={`/${locale}/all`} />
        {monthly.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Недостаточно данных за этот месяц</p>
        ) : (
          <div className="space-y-3">
            {monthly.map((rank) => (
              <Card key={rank.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-2xl font-bold w-12 text-center">
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
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
