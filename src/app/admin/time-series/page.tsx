import { getTimeSeriesMetrics, getCohortAnalysis } from '@/app/actions/analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, Server, Eye, Bookmark } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TimeSeriesDashboardPage() {
  const metrics = await getTimeSeriesMetrics(30)
  const cohorts = await getCohortAnalysis(8)

  const latestDau = metrics.dailyActiveUsers[metrics.dailyActiveUsers.length - 1]
  const latestServers = metrics.dailyServers[metrics.dailyServers.length - 1]
  const latestViews = metrics.dailyViews[metrics.dailyViews.length - 1]
  const latestBookmarks = metrics.dailyBookmarks[metrics.dailyBookmarks.length - 1]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              DAU (сегодня)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestDau?.count ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="h-4 w-4 text-green-500" />
              Новых серверов (сегодня)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestServers?.count ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              Просмотров (сегодня)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestViews?.count ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-amber-500" />
              Закладок (сегодня)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestBookmarks?.count ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Метрики за 30 дней</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Дата</th>
                  <th className="text-right py-2 px-3">DAU</th>
                  <th className="text-right py-2 px-3">Новые серверы</th>
                  <th className="text-right py-2 px-3">Просмотры</th>
                  <th className="text-right py-2 px-3">Закладки</th>
                </tr>
              </thead>
              <tbody>
                {metrics.dailyActiveUsers.map((dau, i) => (
                  <tr key={dau.date} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 px-3">{dau.date}</td>
                    <td className="text-right py-2 px-3">{dau.count}</td>
                    <td className="text-right py-2 px-3">{metrics.dailyServers[i]?.count ?? 0}</td>
                    <td className="text-right py-2 px-3">{metrics.dailyViews[i]?.count ?? 0}</td>
                    <td className="text-right py-2 px-3">{metrics.dailyBookmarks[i]?.count ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cohort Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Analysis (Retention, %)</CardTitle>
        </CardHeader>
        <CardContent>
          {cohorts.length === 0 ? (
            <p className="text-muted-foreground">Недостаточно данных для cohort analysis</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Cohort</th>
                    <th className="text-right py-2 px-3">Size</th>
                    {Array.from({ length: Math.max(...cohorts.map((c) => c.retention.length)) }).map((_, i) => (
                      <th key={i} className="text-right py-2 px-3">W{i}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cohorts.map((c) => (
                    <tr key={c.cohort} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 px-3 font-mono text-xs">{c.cohort}</td>
                      <td className="text-right py-2 px-3">{c.size}</td>
                      {c.retention.map((r, i) => (
                        <td key={i} className="text-right py-2 px-3">
                          <span className={r >= 50 ? 'text-green-600 font-medium' : r >= 20 ? 'text-yellow-600' : 'text-muted-foreground'}>
                            {r}%
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
