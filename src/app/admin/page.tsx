export const dynamic = 'force-dynamic'

import { db, servers, submissions, clients } from '@/lib/db'
import { eq, count, desc } from 'drizzle-orm'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyticsCharts } from '@/components/admin/analytics-charts'
import { SyncGithubButton } from '@/components/admin/sync-github-button'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { getAdminTranslations } from '@/lib/admin-i18n'

export default async function AdminDashboard() {
  const t = await getAdminTranslations('Admin.dashboard')

  const [
    serverCount,
    clientCount,
    submissionCount,
    pendingCount,
    approvedCount,
    rejectedCount,
    officialCount,
    featuredCount,
    remoteCount,
    allSubmissions,
    allServers,
  ] = await Promise.all([
    db.select({ count: count() }).from(servers).then((r: any) => r[0].count),
    db.select({ count: count() }).from(clients).then((r: any) => r[0].count),
    db.select({ count: count() }).from(submissions).then((r: any) => r[0].count),
    db.select({ count: count() }).from(submissions).where(eq(submissions.status, 'pending')).then((r: any) => r[0].count),
    db.select({ count: count() }).from(submissions).where(eq(submissions.status, 'approved')).then((r: any) => r[0].count),
    db.select({ count: count() }).from(submissions).where(eq(submissions.status, 'rejected')).then((r: any) => r[0].count),
    db.select({ count: count() }).from(servers).where(eq(servers.isOfficial, true)).then((r: any) => r[0].count),
    db.select({ count: count() }).from(servers).where(eq(servers.featured, true)).then((r: any) => r[0].count),
    db.select({ count: count() }).from(servers).where(eq(servers.isRemote, true)).then((r: any) => r[0].count),
    db.select().from(submissions).orderBy(desc(submissions.createdAt)),
    db.select().from(servers),
  ])

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t('title')} description={t('description')} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/servers">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{serverCount}</div>
              <div className="text-muted-foreground">{t('totalServers')}</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/clients">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{clientCount}</div>
              <div className="text-muted-foreground">{t('totalClients')}</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/submissions">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{submissionCount}</div>
              <div className="text-muted-foreground">{t('totalSubmissions')}</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('pending')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('approved')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('rejected')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('official')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{officialCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('featured')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featuredCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('remote')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remoteCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('totalStars')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allServers.reduce((acc: number, s: any) => acc + (s.stars || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <SyncGithubButton />
          </CardContent>
        </Card>
      </div>

      <AnalyticsCharts submissions={allSubmissions} servers={allServers} />
    </div>
  )
}
