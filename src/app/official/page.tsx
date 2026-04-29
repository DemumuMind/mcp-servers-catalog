import { getServers } from '@/app/actions/servers'
import { ServerCard } from '@/components/server-card'

export const dynamic = 'force-dynamic'

export default async function OfficialServersPage() {
  const servers = await getServers({ isOfficial: true })

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">Официальные MCP серверы</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {servers.map((server) => (
          <ServerCard key={server.id} server={server} />
        ))}
      </div>
    </div>
  )
}
