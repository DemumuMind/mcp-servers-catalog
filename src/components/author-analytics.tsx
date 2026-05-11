'use client'

import { useState, useEffect } from 'react'
import { getServerAnalytics, getAuthorServers } from '@/app/actions/author-analytics'
import { AuthorDashboard } from '@/components/author-dashboard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AuthorAnalyticsProps {
  userId: string
}

export function AuthorAnalytics({ userId }: AuthorAnalyticsProps) {
  const [servers, setServers] = useState<Array<{ id: string; name: string }>>([])
  const [selectedServer, setSelectedServer] = useState<string>('')
  const [analytics, setAnalytics] = useState<Awaited<ReturnType<typeof getServerAnalytics>>>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getAuthorServers(userId).then((data) => {
      setServers(data.map((s) => ({ id: s.id, name: s.name })))
      if (data.length > 0 && !selectedServer) {
        setSelectedServer(data[0].id)
      }
    })
  }, [userId])

  useEffect(() => {
    if (selectedServer) {
      setLoading(true)
      getServerAnalytics(selectedServer, userId).then((data) => {
        setAnalytics(data)
        setLoading(false)
      })
    }
  }, [selectedServer, userId])

  if (servers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        У вас пока нет привязанных серверов. Вы можете привязать сервер на странице сервера.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Select value={selectedServer} onValueChange={(value) => value && setSelectedServer(value)}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Выберите сервер" />
          </SelectTrigger>
          <SelectContent>
            {servers.map((server) => (
              <SelectItem key={server.id} value={server.id}>
                {server.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : analytics ? (
        <AuthorDashboard analytics={analytics} />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Выберите сервер для просмотра аналитики
        </div>
      )}
    </div>
  )
}
