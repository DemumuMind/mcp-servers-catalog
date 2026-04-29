import { getServers } from '@/app/actions/servers'

export default async function AdminDashboardPage() {
  const servers = await getServers({})
  const total = servers.length
  const official = servers.filter((s) => s.isOfficial).length
  const remote = servers.filter((s) => s.isRemote).length

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </div>
  )
}
