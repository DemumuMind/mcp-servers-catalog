import { db, servers } from '@/lib/db'
import { desc } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { PageHero, PageShell } from '@/components/page-components'
import { ActivityFeed } from '@/components/activity-feed'

export const dynamic = 'force-dynamic'

export default async function ActivityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Activity' })

  const recentServers = await db.select({
    id: servers.id,
    name: servers.name,
    owner: servers.owner,
    repo: servers.repo,
    stars: servers.stars,
    forks: servers.forks,
    isOfficial: servers.isOfficial,
    category: servers.category,
    createdAt: servers.createdAt,
  }).from(servers).orderBy(desc(servers.createdAt)).limit(30)

  return (
    <PageShell>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
      <ActivityFeed locale={locale} items={recentServers.map(s => ({
        type: 'server_added' as const,
        id: s.id,
        name: s.name,
        owner: s.owner,
        repo: s.repo,
        stars: s.stars,
        forks: s.forks,
        isOfficial: s.isOfficial,
        category: s.category,
        createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
      }))} />
    </PageShell>
  )
}
