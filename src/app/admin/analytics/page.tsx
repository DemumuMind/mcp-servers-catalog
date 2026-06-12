import { db, getClient, submissions, servers } from '@/lib/db'
import { asc, count, eq, desc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnalyticsCharts } from '@/components/admin/analytics-charts'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { getAdminTranslations } from '@/lib/admin-i18n'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const t = await getAdminTranslations('Admin.analytics')

  const allSubmissions = await db.select().from(submissions).orderBy(asc(submissions.createdAt))

  const allServers = await db.select().from(servers)

  const serversByCategory = await getClient().execute({
    sql: `SELECT category, COUNT(*) as count FROM "Server" GROUP BY category ORDER BY count DESC`,
    args: [],
  })

  const topSubmitters = await getClient().execute({
    sql: `SELECT email, COUNT(*) as count FROM "Submission" GROUP BY email ORDER BY count DESC LIMIT 10`,
    args: [],
  })

  const totalServersResult = await db.select({ count: count() }).from(servers)
  const totalServers = totalServersResult[0].count

  const totalSubmissionsResult = await db.select({ count: count() }).from(submissions)
  const totalSubmissions = totalSubmissionsResult[0].count

  const approvedCountResult = await db.select({ count: count() }).from(submissions).where(eq(submissions.status, 'approved'))
  const approvedCount = approvedCountResult[0].count

  const conversion = Math.round((approvedCount / Math.max(totalSubmissions, 1)) * 100)

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t('title')} description={t('description')} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('totalServers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('totalSubmissions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('conversion')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversion}%</div>
          </CardContent>
        </Card>
      </div>

      <AnalyticsCharts submissions={allSubmissions} servers={allServers} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('popularCategories')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {serversByCategory.rows.map((cat: any) => (
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
            <CardTitle>{t('topSubmitters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topSubmitters.rows.map((submitter: any, i: number) => (
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
