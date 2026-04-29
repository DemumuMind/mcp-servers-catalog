import { getClients } from '@/app/actions/clients'
import { ClientForm } from '@/components/admin/client-form'
import { ClientDataTable } from '@/components/admin/client-data-table'

export default async function AdminClientsPage() {
  const clients = await getClients({})

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clients Management</h1>
        <ClientForm mode="create" />
      </div>
      <ClientDataTable data={clients} />
    </div>
  )
}
