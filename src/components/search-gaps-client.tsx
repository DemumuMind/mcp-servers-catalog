'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Search, TrendingUp } from 'lucide-react'

interface SearchGap {
  query: string
  count: number
  lastSearch: Date
}

interface TopSearch {
  query: string
  count: number
  avgResults: number
}

interface SearchStats {
  total: number
  withResults: number
  withoutResults: number
  gapRate: number
}

interface SearchGapsClientProps {
  gaps: SearchGap[]
  topSearches: TopSearch[]
  stats: SearchStats
}

export function SearchGapsClient({ gaps, topSearches, stats }: SearchGapsClientProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Аналитика поиска</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Всего поисков (30д)</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">С результатами</div>
            <div className="text-2xl font-bold text-green-600">{stats.withResults}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Без результатов</div>
            <div className="text-2xl font-bold text-red-600">{stats.withoutResults}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Процент "не найдено"</div>
            <div className="text-2xl font-bold">{(stats.gapRate * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Поисковые дыры (0 результатов)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gaps.length === 0 ? (
              <p className="text-muted-foreground">Все запросы возвращают результаты. Отлично!</p>
            ) : (
              <div className="space-y-3">
                {gaps.map((gap) => (
                  <div key={gap.query} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{gap.query}</span>
                      <Badge variant="secondary" className="text-xs">
                        {gap.count} раз
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(gap.lastSearch).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Топ поисковых запросов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSearches.map((search) => (
                <div key={search.query} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{search.query}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">
                      {search.count} раз
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ~{Math.round(search.avgResults)} результатов
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}