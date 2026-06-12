'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Plus, GitFork, Star, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface ServerData {
  id: string
  name: string
  description: string | null
  owner: string
  repo: string
  stars: number
  forks: number
  category: string | null
  tags: string[] | null
  githubUrl: string
  isRemote: boolean
  endpoint: string | null
  isOfficial: boolean | null
  isFeatured: boolean | null
}

interface CompareViewProps {
  servers: ServerData[]
  locale: string
}

const METRICS = [
  { key: 'stars', label: 'Stars', icon: Star, render: (s: ServerData) => s.stars.toLocaleString('en-US') },
  { key: 'forks', label: 'Forks', icon: GitFork, render: (s: ServerData) => s.forks.toLocaleString('en-US') },
  { key: 'category', label: 'Category', render: (s: ServerData) => s.category || '—' },
  { key: 'remote', label: 'Remote', render: (s: ServerData) => s.isRemote ? 'Yes' : 'No' },
  { key: 'official', label: 'Official', render: (s: ServerData) => s.isOfficial ? 'Yes' : 'No' },
  { key: 'featured', label: 'Featured', render: (s: ServerData) => s.isFeatured ? 'Yes' : 'No' },
]

export function CompareView({ servers, locale }: CompareViewProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(servers.map(s => s.id))
  const [selectedServers, setSelectedServers] = useState<ServerData[]>(servers)
  const [searchQuery, setSearchQuery] = useState('')

  const _addServer = (server: ServerData) => {
    if (selectedIds.includes(server.id) || selectedIds.length >= 6) return
    setSelectedIds(prev => [...prev, server.id])
    setSelectedServers(prev => [...prev, server])
    updateUrl([...selectedIds, server.id])
  }

  const removeServer = (id: string) => {
    setSelectedIds(prev => prev.filter(i => i !== id))
    setSelectedServers(prev => prev.filter(s => s.id !== id))
    updateUrl(selectedIds.filter(i => i !== id))
  }

  const updateUrl = (ids: string[]) => {
    const url = new URL(window.location.href)
    if (ids.length >= 2) {
      url.searchParams.set('ids', ids.join(','))
    } else {
      url.searchParams.delete('ids')
    }
    window.history.replaceState({}, '', url.toString())
  }

  // Find best value for highlighting
  const bestStars = Math.max(...selectedServers.map(s => s.stars), 0)
  const bestForks = Math.max(...selectedServers.map(s => s.forks), 0)

  return (
    <div className="space-y-6">
      {/* Add server search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search servers to add..."
            className="w-full px-4 py-2 rounded-lg border bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {selectedServers.length}/6 selected
        </span>
      </div>

      {/* Empty state */}
      {selectedServers.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Plus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Select servers to compare</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Search and add at least 2 servers to see the comparison table
            </p>
          </CardContent>
        </Card>
      )}

      {/* Comparison table */}
      {selectedServers.length >= 2 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 bg-muted/50 rounded-l-lg min-w-[120px]">Feature</th>
                {selectedServers.map(server => (
                  <th key={server.id} className="p-3 bg-muted/50 min-w-[200px]">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/${locale}/servers/${server.owner}/${server.repo}`}
                        className="font-semibold hover:underline truncate"
                      >
                        {server.name}
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => removeServer(server.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{server.owner}/{server.repo}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Description */}
              <tr className="border-b">
                <td className="p-3 text-sm font-medium text-muted-foreground">Description</td>
                {selectedServers.map(server => (
                  <td key={server.id} className="p-3 text-sm">
                    {server.description || '—'}
                  </td>
                ))}
              </tr>
              {/* Metrics */}
              {METRICS.map(metric => (
                <tr key={metric.key} className="border-b">
                  <td className="p-3 text-sm font-medium text-muted-foreground flex items-center gap-2">
                    {metric.icon && <metric.icon className="h-4 w-4" />}
                    {metric.label}
                  </td>
                  {selectedServers.map(server => {
                    const value = metric.render(server)
                    const isBest = (metric.key === 'stars' && server.stars === bestStars && bestStars > 0) ||
                                   (metric.key === 'forks' && server.forks === bestForks && bestForks > 0)
                    return (
                      <td key={server.id} className={`p-3 text-sm ${isBest ? 'font-bold text-green-600 dark:text-green-400' : ''}`}>
                        {value}
                        {isBest && ' ★'}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {/* Tags */}
              <tr className="border-b">
                <td className="p-3 text-sm font-medium text-muted-foreground">Tags</td>
                {selectedServers.map(server => (
                  <td key={server.id} className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {(server.tags || []).slice(0, 5).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              {/* Actions */}
              <tr>
                <td className="p-3 text-sm font-medium text-muted-foreground">Link</td>
                {selectedServers.map(server => (
                  <td key={server.id} className="p-3">
                    <a href={`/${locale}/servers/${server.owner}/${server.repo}`} className="inline-flex items-center text-sm px-3 py-1 rounded-md border hover:bg-accent">
                      <ExternalLink className="h-3 w-3 mr-1" /> View
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Partial selection (1 server) */}
      {selectedServers.length === 1 && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-8">
            <Plus className="h-6 w-6 text-muted-foreground mr-2" />
            <span className="text-muted-foreground">Add at least 1 more server to compare</span>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
