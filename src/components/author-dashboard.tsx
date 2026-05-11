'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Eye, Bookmark, Star, MessageCircle, ThumbsUp } from 'lucide-react'

interface DailyView {
  date: string
  count: number
}

interface SimilarServer {
  id: string
  name: string
  stars: number
  bookmarks: number
  avgRating: number
  views30d: number
}

interface ServerAnalytics {
  server: {
    id: string
    name: string
    stars: number
    tags: string[]
    category: string
  }
  views30d: number
  bookmarks: number
  avgRating: number
  ratingsCount: number
  comments: number
  dailyViews: DailyView[]
  similar: SimilarServer[]
  recommendations: string[]
}

interface AuthorDashboardProps {
  analytics: ServerAnalytics
}

export function AuthorDashboard({ analytics }: AuthorDashboardProps) {
  const [metric, setMetric] = useState<'views' | 'bookmarks'>('views')

  const stats = [
    { label: 'Просмотры (30д)', value: analytics.views30d, icon: Eye },
    { label: 'Закладки', value: analytics.bookmarks, icon: Bookmark },
    { label: 'Средний рейтинг', value: analytics.avgRating.toFixed(1), icon: ThumbsUp },
    { label: 'Оценок', value: analytics.ratingsCount, icon: Star },
    { label: 'Комментариев', value: analytics.comments, icon: MessageCircle },
    { label: 'GitHub Stars', value: analytics.server.stars, icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <s.icon className="h-4 w-4" />
                <span className="text-xs">{s.label}</span>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily Views Chart */}
      {analytics.dailyViews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Просмотры по дням</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analytics.dailyViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                  name="Просмотры"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Comparison with similar servers */}
      {analytics.similar.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Сравнение с похожими серверами</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  {
                    name: analytics.server.name.slice(0, 20),
                    stars: analytics.server.stars,
                    bookmarks: analytics.bookmarks,
                    views: analytics.views30d,
                  },
                  ...analytics.similar.map((s) => ({
                    name: s.name.slice(0, 20),
                    stars: s.stars,
                    bookmarks: s.bookmarks,
                    views: s.views30d,
                  })),
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="stars" fill="#fbbf24" name="Stars" />
                <Bar dataKey="bookmarks" fill="#3b82f6" name="Bookmarks" />
                <Bar dataKey="views" fill="#10b981" name="Views 30d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {analytics.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Рекомендации</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analytics.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {analytics.server.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}
