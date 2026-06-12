import { getServersPublic, getTrendingServers } from '@/app/actions/public'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionHeader } from '@/components/section-header'
import { ServerCard } from '@/components/server-card'
import { Sparkles, TrendingUp, Clock, Star } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function WhatsNewPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'WhatsNew' })

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const { servers: recentServers } = await getServersPublic(1, undefined, undefined, undefined, false, false)
  const newThisWeek = recentServers.filter((s) => new Date(s.createdAt) > oneWeekAgo)

  const trending = await getTrendingServers(6)

  const recentlyUpdated = recentServers
    .filter((s) => new Date(s.updatedAt) > oneWeekAgo && s.stars && s.stars > 0)
    .sort((a, b) => (b.stars || 0) - (a.stars || 0))
    .slice(0, 6)

  return (
    <div className="page-shell">
      <div className="premium-panel p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              {t('newServers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-4xl font-semibold tracking-[-0.06em]">{newThisWeek.length}</div>
            <p className="text-xs text-muted-foreground">{t('last7days')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              {t('trending')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-4xl font-semibold tracking-[-0.06em]">{trending.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              {t('updated')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-4xl font-semibold tracking-[-0.06em]">{recentlyUpdated.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* New servers */}
      {newThisWeek.length > 0 && (
        <section>
          <SectionHeader title={t('newServersSection')} href={`/${locale}/all`} locale={locale} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newThisWeek.map((server) => (
              <ServerCard key={`new-${server.id}`} server={server} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section>
          <SectionHeader title={t('trendingSection')} href={`/${locale}/all`} locale={locale} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.map((server: any) => (
              <ServerCard key={`trending-${server.id}`} server={server} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Recently updated */}
      {recentlyUpdated.length > 0 && (
        <section>
          <SectionHeader title={t('recentlyUpdatedSection')} href={`/${locale}/all`} locale={locale} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyUpdated.map((server) => (
              <ServerCard key={`latest-${server.id}`} server={server} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {newThisWeek.length === 0 && trending.length === 0 && recentlyUpdated.length === 0 && (
        <div className="text-center py-16">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">{t('nothingNew')}</p>
          <p className="text-sm text-muted-foreground mt-2">{t('comeBackLater')}</p>
        </div>
      )}
    </div>
  )
}
