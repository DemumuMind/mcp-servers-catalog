import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface RemoteServerCardProps {
  server: {
    id: string
    name: string
    description: string
    endpoint: string
    authType?: string
    isOfficial: boolean
  }
}

export function RemoteServerCard({ server }: RemoteServerCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{server.name}</h3>
            {server.isOfficial && (
              <Badge variant="default" className="bg-yellow-500 mt-1">Официальный 🌟</Badge>
            )}
          </div>
          {server.authType && (
            <Badge variant="outline">{server.authType}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {server.description}
        </p>
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
            {server.endpoint}
          </code>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button size="sm">Подключить</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Настроить</DropdownMenuItem>
              <DropdownMenuItem>Копировать URL</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
