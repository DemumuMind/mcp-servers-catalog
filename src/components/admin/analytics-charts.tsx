'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

function EmptyChart({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-muted-foreground">
      <Icon className="size-10 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

interface AnalyticsChartsProps {
  submissions: Array<{
    id: string
    name: string
    description: string | null
    url: string
    category: string
    premium: boolean
    status: string
    email: string
    createdAt: Date | string
    updatedAt: Date | string
  }>
  servers: Array<{
    id: string
    name: string
    owner: string
    repo: string
    description: string | null
    category: string
    tags: string[]
    isOfficial: boolean
    isSponsored: boolean
    githubUrl: string
    isRemote: boolean
    authType: string | null
    endpoint: string | null
    featured: boolean
    createdAt: Date | string
    updatedAt: Date | string
  }>
}

export function AnalyticsCharts({ submissions, servers }: AnalyticsChartsProps) {
  const t = useTranslations('Admin.charts')

  const dailyData = useMemo(() => {
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)

    const dailySubmissions = submissions
      .filter((s) => new Date(s.createdAt) >= last30Days)
      .reduce((acc, s) => {
        const date = new Date(s.createdAt).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    return Object.entries(dailySubmissions)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [submissions])

  const statusData = useMemo(
    () => [
      { name: t('pending'), value: submissions.filter((s) => s.status === 'pending').length, color: '#FFBB28' },
      { name: t('approved'), value: submissions.filter((s) => s.status === 'approved').length, color: '#00C49F' },
      { name: t('rejected'), value: submissions.filter((s) => s.status === 'rejected').length, color: '#FF8042' },
    ],
    [submissions, t]
  )

  const categoryChartData = useMemo(() => {
    const categoryData = servers.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(categoryData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [servers])

  const premiumData = useMemo(
    () => [
      { name: t('free'), value: submissions.filter((s) => !s.premium).length },
      { name: t('premium'), value: submissions.filter((s) => s.premium).length },
    ],
    [submissions, t]
  )

  const hasStatusData = statusData.some((d) => d.value > 0)
  const hasCategoryData = categoryChartData.length > 0
  const hasPremiumData = premiumData.some((d) => d.value > 0)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('title')}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions by day */}
        <Card>
          <CardHeader>
            <CardTitle>{t('submissions30days')}</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyData.length === 0 ? (
              <EmptyChart icon={BarChart3} message={t('noSubmissions30days')} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#0088FE" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Submissions by status */}
        <Card>
          <CardHeader>
            <CardTitle>{t('submissionStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            {!hasStatusData ? (
              <EmptyChart icon={PieChartIcon} message={t('noSubmissionsYet')} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Servers by category */}
        <Card>
          <CardHeader>
            <CardTitle>{t('serversByCategory')}</CardTitle>
          </CardHeader>
          <CardContent>
            {!hasCategoryData ? (
              <EmptyChart icon={BarChart3} message={t('noServersCategorized')} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884D8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Premium vs Free */}
        <Card>
          <CardHeader>
            <CardTitle>{t('submissionTypes')}</CardTitle>
          </CardHeader>
          <CardContent>
            {!hasPremiumData ? (
              <EmptyChart icon={PieChartIcon} message={t('noSubmissionsYet')} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={premiumData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {premiumData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
