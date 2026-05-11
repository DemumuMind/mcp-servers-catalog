import { getServersPublic, getTrendingServers } from '@/app/actions/public'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from '@/components/section-header'
import { ServerCard } from '@/components/server-card'
import { Sparkles, TrendingUp, Clock, Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function WhatsNewPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // New servers this week
  const { servers: recentServers } = await getServersPublic(1, undefined, undefined, undefined, false, false)
  const newThisWeek = recentServers.filter((s) => new Date(s.createdAt) > oneWeekAgo)

  // Trending
  const trending = await getTrendingServers(6)

  // Most starred recently updated
  const recentlyUpdated = recentServers
    .filter((s) => new Date(s.updatedAt) > oneWeekAgo && s.stars && s.stars > 0)
    .sort((a, b) => (b.stars || 0) - (a.stars || 0))
    .slice(0, 6)

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold mb-4">Что нового?</h1>
        <p className="text-lg text-muted-foreground">
          Новые серверы, обновления и тренды за последнюю неделю
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Новых серверов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{newThisWeek.length}</div>
            <p className="text-xs text-muted-foreground">за последние 7 дней</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              В тренде
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{trending.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Обновлённые
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recentlyUpdated.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* New servers */}
      {newThisWeek.length > 0 && (
        <section>
          <SectionHeader title="Новые серверы" href={`/${locale}/all`} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newThisWeek.map((server) => (
              <ServerCard key={server.id} server={server} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section>
          <SectionHeader title="Сейчас в тренде" href={`/${locale}/all`} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.map((server: any) => (
              <ServerCard key={server.id} server={server} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Recently updated */}
      {recentlyUpdated.length > 0 && (
        <section>
          <SectionHeader title="Недавно обновлённые" href={`/${locale}/all`} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyUpdated.map((server) => (
              <ServerCard key={server.id} server={server} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {newThisWeek.length === 0 && trending.length === 0 && recentlyUpdated.length === 0 && (
        <div className="text-center py-16">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Пока ничего нового за эту неделю</p>
          <p className="text-sm text-muted-foreground mt-2">Возвращайтесь позже!</p>
        </div>
      )}
    </div>
  )
}
