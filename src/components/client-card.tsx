import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'

interface ClientCardProps {
  client: {
    id: string
    name: string
    description: string
    url: string
    icon?: string | null
    featured: boolean
  }
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <Link href={client.url} target="_blank" rel="noopener noreferrer">
      <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {client.icon && (
                <span className="text-2xl">{client.icon}</span>
              )}
              <h3 className="font-semibold text-lg">{client.name}</h3>
            </div>
            <div className="flex gap-1">
              {client.featured && (
                <Badge variant="default" className="bg-yellow-500">рекомендуемый</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {client.description}
          </p>
          <div className="flex items-center gap-1 mt-3 text-xs text-primary">
            <ExternalLink className="h-3 w-3" />
            <span className="truncate">{client.url}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
