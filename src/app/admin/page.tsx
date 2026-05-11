export const dynamic = 'force-dynamic'

import { prisma, withDbRetry } from '@/lib/db'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyticsCharts } from '@/components/admin/analytics-charts'
import { SyncGithubButton } from '@/components/admin/sync-github-button'

export default async function AdminDashboard() {
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
    submissions,
    servers,
  ] = await Promise.all([
    withDbRetry(p => p.server.count()),
    withDbRetry(p => p.client.count()),
    withDbRetry(p => p.submission.count()),
    withDbRetry(p => p.submission.count({ where: { status: 'pending' } })),
    withDbRetry(p => p.submission.count({ where: { status: 'approved' } })),
    withDbRetry(p => p.submission.count({ where: { status: 'rejected' } })),
    withDbRetry(p => p.server.count({ where: { isOfficial: true } })),
    withDbRetry(p => p.server.count({ where: { featured: true } })),
    withDbRetry(p => p.server.count({ where: { isRemote: true } })),
    withDbRetry(p => p.submission.findMany({ orderBy: { createdAt: 'asc' } })),
    withDbRetry(p => p.server.findMany()),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/servers">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{serverCount}</div>
              <div className="text-muted-foreground">Всего серверов</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/clients">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{clientCount}</div>
              <div className="text-muted-foreground">Всего клиентов</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/submissions">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{submissionCount}</div>
              <div className="text-muted-foreground">Всего отправок</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">На рассмотрении</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Одобрено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Отклонено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Официальные</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{officialCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featuredCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remote</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remoteCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего звёзд</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {servers.reduce((acc, s) => acc + (s.stars || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <SyncGithubButton />
          </CardContent>
        </Card>
      </div>

      <AnalyticsCharts submissions={submissions} servers={servers} />
    </div>
  )
}
