import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnalyticsCharts } from '@/components/admin/analytics-charts'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: 'asc' },
  })

  const servers = await prisma.server.findMany()

  const serversByCategory = await prisma.$queryRaw`
    SELECT category, COUNT(*) as count
    FROM "Server"
    GROUP BY category
    ORDER BY count DESC
  `

  const topSubmitters = await prisma.$queryRaw`
    SELECT email, COUNT(*) as count
    FROM "Submission"
    GROUP BY email
    ORDER BY count DESC
    LIMIT 10
  `

  const totalServers = await prisma.server.count()
  const totalSubmissions = await prisma.submission.count()
  const approvedCount = await prisma.submission.count({ where: { status: 'approved' } })
  const conversion = Math.round((approvedCount / Math.max(totalSubmissions, 1)) * 100)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего серверов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего отправок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Конверсия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversion}%</div>
          </CardContent>
        </Card>
      </div>

      <AnalyticsCharts submissions={submissions} servers={servers} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Популярные категории</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(serversByCategory as any[]).map((cat: any) => (
                <div key={cat.category} className="flex justify-between items-center">
                  <span className="capitalize">{cat.category}</span>
                  <Badge>{String(cat.count)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Топ отправителей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(topSubmitters as any[]).map((submitter: any, i: number) => (
                <div key={submitter.email} className="flex justify-between items-center">
                  <span className="text-sm">{i + 1}. {submitter.email}</span>
                  <Badge variant="outline">{String(submitter.count)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
