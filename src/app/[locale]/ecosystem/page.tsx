import { getServerGraphData } from '@/app/actions/server-graph'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Network } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EcosystemPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const { nodes, links } = await getServerGraphData()

  // Group links by source server
  const connectionsByServer = new Map<string, Array<{ targetName: string; targetId: string; strength: number }>>()
  
  for (const link of links) {
    const sourceNode = nodes.find((n) => n.id === link.source)
    const targetNode = nodes.find((n) => n.id === link.target)
    if (!sourceNode || !targetNode) continue

    if (!connectionsByServer.has(sourceNode.id)) {
      connectionsByServer.set(sourceNode.id, [])
    }
    connectionsByServer.get(sourceNode.id)!.push({
      targetName: targetNode.name,
      targetId: targetNode.id,
      strength: link.strength,
    })
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Network className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Экосистема MCP</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего серверов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nodes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Связей по тегам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{links.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Средняя связность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nodes.length > 0 ? (links.length / nodes.length).toFixed(1) : '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simple SVG Graph Visualization */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Визуализация связей</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <svg
              viewBox={`0 0 ${Math.min(nodes.length * 30, 800)} ${Math.min(nodes.length * 20, 600)}`}
              className="w-full h-auto border rounded-lg bg-muted/30"
              style={{ minHeight: '400px' }}
            >
              {/* Links */}
              {links.slice(0, 100).map((link, i) => {
                const sourceIdx = nodes.findIndex((n) => n.id === link.source)
                const targetIdx = nodes.findIndex((n) => n.id === link.target)
                if (sourceIdx === -1 || targetIdx === -1) return null
                
                const sx = 50 + (sourceIdx % 10) * 70
                const sy = 50 + Math.floor(sourceIdx / 10) * 60
                const tx = 50 + (targetIdx % 10) * 70
                const ty = 50 + Math.floor(targetIdx / 10) * 60
                
                return (
                  <line
                    key={`link-${i}`}
                    x1={sx}
                    y1={sy}
                    x2={tx}
                    y2={ty}
                    stroke="currentColor"
                    strokeOpacity={0.15 + link.strength * 0.05}
                    strokeWidth={1 + link.strength * 0.5}
                  />
                )
              })}
              
              {/* Nodes */}
              {nodes.map((node, i) => {
                const x = 50 + (i % 10) * 70
                const y = 50 + Math.floor(i / 10) * 60
                const r = Math.max(4, Math.min(12, node.val))
                
                return (
                  <g key={node.id}>
                    <circle
                      cx={x}
                      cy={y}
                      r={r}
                      fill="hsl(var(--primary))"
                      opacity={0.8}
                    />
                    <text
                      x={x}
                      y={y + r + 10}
                      textAnchor="middle"
                      fontSize="8"
                      fill="currentColor"
                      opacity={0.7}
                    >
                      {node.name.length > 12 ? node.name.slice(0, 10) + '...' : node.name}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Connections Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Связи по тегам и категориям</h2>
        {Array.from(connectionsByServer.entries())
          .sort((a, b) => b[1].length - a[1].length)
          .slice(0, 20)
          .map(([serverId, connections]) => {
            const server = nodes.find((n) => n.id === serverId)
            if (!server) return null
            return (
              <Card key={serverId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    <Link
                      href={`/${locale}/servers/${server.owner}/${server.repo}`}
                      className="hover:underline"
                    >
                      {server.name}
                    </Link>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {connections.length} связей
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {connections.slice(0, 10).map((conn) => (
                      <Badge key={conn.targetId} variant="secondary" className="text-xs">
                        {conn.targetName}
                        {conn.strength > 1 && (
                          <span className="ml-1 opacity-60">×{conn.strength}</span>
                        )}
                      </Badge>
                    ))}
                    {connections.length > 10 && (
                      <Badge variant="outline" className="text-xs">
                        +{connections.length - 10} ещё
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
      </div>
    </div>
  )
}
