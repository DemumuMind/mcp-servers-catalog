import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface ServerCardProps {
  server: {
    id: string
    name: string
    description: string
    owner: string
    repo: string
    isOfficial: boolean
    isSponsored: boolean
    tags: string[]
    category: string
  }
  locale?: string
}

export function ServerCard({ server, locale }: ServerCardProps) {
  const detailPath = locale
    ? `/${locale}/servers/${server.owner}/${server.repo}`
    : `/servers/${server.owner}/${server.repo}`

  return (
    <Link href={detailPath}>
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{server.name}</h3>
            <div className="flex gap-1">
              {server.isOfficial && (
                <Badge variant="default" className="bg-yellow-500">Официальный 🌟</Badge>
              )}
              {server.isSponsored && (
                <Badge variant="secondary">спонсор</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {server.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-3">
            {server.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
