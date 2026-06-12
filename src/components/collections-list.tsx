'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, FolderOpen, Users, Star } from 'lucide-react'

interface Collection {
  id: string
  name: string
  description: string | null
  serverCount: number
  authorName: string | null
  isPublic: boolean
  shareSlug: string | null
  tags: string[] | null
}

// Demo collections — will be replaced with DB query when collections feature is built out
const DEMO_COLLECTIONS: Collection[] = [
  {
    id: '1',
    name: 'AI & LLM Tools',
    description: 'Essential MCP servers for AI development and LLM integration',
    serverCount: 42,
    authorName: 'MCP Team',
    isPublic: true,
    shareSlug: 'ai-llm-tools',
    tags: ['ai', 'llm', 'development'],
  },
  {
    id: '2',
    name: 'Database Connectors',
    description: 'Connect to PostgreSQL, MySQL, SQLite, MongoDB and more',
    serverCount: 18,
    authorName: 'MCP Team',
    isPublic: true,
    shareSlug: 'database-connectors',
    tags: ['database', 'sql', 'nosql'],
  },
  {
    id: '3',
    name: 'Cloud Services',
    description: 'AWS, GCP, Azure integrations and cloud-native MCP servers',
    serverCount: 15,
    authorName: 'MCP Team',
    isPublic: true,
    shareSlug: 'cloud-services',
    tags: ['cloud', 'aws', 'gcp'],
  },
  {
    id: '4',
    name: 'Developer Tools',
    description: 'Git, CI/CD, code review, and development workflow servers',
    serverCount: 23,
    authorName: 'MCP Team',
    isPublic: true,
    shareSlug: 'developer-tools',
    tags: ['development', 'git', 'ci-cd'],
  },
  {
    id: '5',
    name: 'Communication & Messaging',
    description: 'Slack, Discord, email, and messaging platform integrations',
    serverCount: 12,
    authorName: 'MCP Team',
    isPublic: true,
    shareSlug: 'communication',
    tags: ['communication', 'slack', 'discord'],
  },
  {
    id: '6',
    name: 'File & Data Processing',
    description: 'File system access, data transformation, and document processing',
    serverCount: 9,
    authorName: 'MCP Team',
    isPublic: true,
    shareSlug: 'file-data',
    tags: ['file-system', 'data', 'processing'],
  },
]

export function CollectionsList({ locale }: { locale: string }) {
  const t = useTranslations('Collections')
  const [search, setSearch] = useState('')

  const filtered = DEMO_COLLECTIONS.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase()) ||
    c.tags?.some(tag => tag.includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Collections grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('empty')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(collection => (
            <Link
              key={collection.id}
              href={`/${locale}/collections/${collection.shareSlug}`}
              className="group"
            >
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    {collection.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {collection.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {collection.serverCount} {t('servers').toLowerCase()}
                    </span>
                    {collection.authorName && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {collection.authorName}
                      </span>
                    )}
                  </div>
                  {collection.tags && collection.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {collection.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
