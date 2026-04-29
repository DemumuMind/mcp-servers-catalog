import { getServers } from '@/app/actions/servers'
import { getClients } from '@/app/actions/clients'

export default async function AdminDashboardPage() {
  const servers = await getServers({})
  const clients = await getClients({})
  const total = servers.length
  const official = servers.filter((s) => s.isOfficial).length
  const remote = servers.filter((s) => s.isRemote).length
  const totalClients = clients.length
  const featuredClients = clients.filter((c) => c.featured).length

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-muted-foreground text-sm">Total Servers</h3>
          <p className="text-3xl font-bold mt-2">{total}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-muted-foreground text-sm">Official Servers</h3>
          <p className="text-3xl font-bold mt-2">{official}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-muted-foreground text-sm">Remote Servers</h3>
          <p className="text-3xl font-bold mt-2">{remote}</p>
        </div>
      </div>
      <h2 className="text-xl font-bold mb-4">Clients</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-muted-foreground text-sm">Total Clients</h3>
          <p className="text-3xl font-bold mt-2">{totalClients}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-muted-foreground text-sm">Featured Clients</h3>
          <p className="text-3xl font-bold mt-2">{featuredClients}</p>
        </div>
      </div>
    </div>
  )
}
