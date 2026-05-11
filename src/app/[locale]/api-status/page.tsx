import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Zap, Shield, Globe } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ApiStatusPage() {
  const endpoints = [
    { name: 'REST API v1', path: '/api/v1/servers', status: 'operational', latency: '<100ms' },
    { name: 'GraphQL API', path: '/api/graphql', status: 'operational', latency: '<150ms' },
    { name: 'Search API', path: '/api/v1/search', status: 'operational', latency: '<200ms' },
    { name: 'Feeds (RSS/JSON)', path: '/api/feed/rss', status: 'operational', latency: '<50ms' },
    { name: 'OG Images', path: '/api/og/owner/repo', status: 'operational', latency: '<300ms' },
    { name: 'Badges', path: '/api/badge/owner/repo', status: 'operational', latency: '<100ms' },
    { name: 'Embed Widget', path: '/api/embed', status: 'operational', latency: '<50ms' },
    { name: 'Image Proxy', path: '/api/proxy-image', status: 'operational', latency: '<500ms' },
  ]

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">API Status</h1>
        <p className="text-muted-foreground">
          Публичный статус API endpoints и информация об использовании
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Статус</div>
                <div className="text-lg font-semibold text-green-600">Все системы работают</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Rate Limit</div>
                <div className="text-lg font-semibold">100 req/min</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Аутентификация</div>
                <div className="text-lg font-semibold">API Key / Bearer</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {endpoints.map((ep) => (
              <div key={ep.path} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono text-xs">
                    GET
                  </Badge>
                  <div>
                    <div className="font-medium">{ep.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{ep.path}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-500 text-white">{ep.status}</Badge>
                  <span className="text-xs text-muted-foreground">{ep.latency}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Использование API</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">REST API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><code className="bg-muted px-1 py-0.5 rounded">GET /api/v1/servers</code> — список серверов</p>
              <p><code className="bg-muted px-1 py-0.5 rounded">GET /api/v1/servers/:id</code> — детали сервера</p>
              <p><code className="bg-muted px-1 py-0.5 rounded">GET /api/v1/search?q=query</code> — поиск</p>
              <p className="text-muted-foreground mt-2">Заголовок: <code className="bg-muted px-1 py-0.5 rounded">Authorization: Bearer YOUR_API_KEY</code></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">GraphQL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><code className="bg-muted px-1 py-0.5 rounded">POST /api/graphql</code></p>
              <p className="text-muted-foreground">Playground доступен по тому же адресу (GET)</p>
              <p className="text-muted-foreground mt-2">Rate limit: 60 requests/minute</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}