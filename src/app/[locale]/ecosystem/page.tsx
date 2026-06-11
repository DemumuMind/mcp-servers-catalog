import { getServerGraphData } from '@/app/actions/server-graph'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Network } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function EcosystemPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Ecosystem' })
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
    <div className="page-shell">
      <div className="flex items-center gap-3 mb-8">
        <Network className="h-6 w-6 text-primary" />
        <h1 className="font-heading text-4xl font-semibold tracking-[-0.06em]">{t('title')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('totalServers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-3xl font-semibold tracking-[-0.05em]">{nodes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('tagLinks')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-3xl font-semibold tracking-[-0.05em]">{links.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('avgConnectivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-3xl font-semibold tracking-[-0.05em]">
              {nodes.length > 0 ? (links.length / nodes.length).toFixed(1) : '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simple SVG Graph Visualization */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('connectionViz')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <svg
              viewBox={`0 0 ${Math.max(400, Math.min(nodes.length * 30, 800))} ${Math.max(300, Math.min(nodes.length * 20, 600))}`}
              className="w-full h-auto border rounded-lg bg-muted/30"
              style={{ minHeight: '400px' }}
            >
              {/* Links */}
              {links.slice(0, 100).map((link, i) => {
                const sourceIdx = nodes.findIndex((n) => n.id === link.source)
                const targetIdx = nodes.findIndex((n) => n.id === link.target)
                if (sourceIdx === -1 || targetIdx === -1) return null
                
                // Circular layout for better centering
                const total = nodes.length
                const angle1 = (2 * Math.PI * sourceIdx) / total - Math.PI / 2
                const angle2 = (2 * Math.PI * targetIdx) / total - Math.PI / 2
                const cx = 400
                const cy = 300
                const radius = Math.min(200, total * 8)
                const sx = cx + Math.cos(angle1) * radius
                const sy = cy + Math.sin(angle1) * radius
                const tx = cx + Math.cos(angle2) * radius
                const ty = cy + Math.sin(angle2) * radius
                
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
                const total = nodes.length
                const angle = (2 * Math.PI * i) / total - Math.PI / 2
                const cx = 400
                const cy = 300
                const radius = Math.min(200, total * 8)
                const x = cx + Math.cos(angle) * radius
                const y = cy + Math.sin(angle) * radius
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
        <h2 className="text-xl font-bold">{t('tagCategoryLinks')}</h2>
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
                      {t('connections', { count: connections.length })}
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
                        {t('more', { count: connections.length - 10 })}
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
