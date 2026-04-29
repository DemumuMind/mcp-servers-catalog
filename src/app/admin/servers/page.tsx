import { getServers } from '@/app/actions/servers'
import { ServerForm } from '@/components/admin/server-form'
import { DataTable } from '@/components/admin/data-table'

export default async function AdminServersPage() {
  const servers = await getServers({})

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Servers Management</h1>
        <ServerForm mode="create" />
      </div>
      <DataTable data={servers} />
    </div>
  )
}
