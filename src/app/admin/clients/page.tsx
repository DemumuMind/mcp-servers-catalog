import { getClients, deleteClients } from '@/app/actions/clients'
import { Button } from '@/components/ui/button'
import { ClientFormDialog } from '@/components/admin/client-form-dialog'
import { BulkClientTable } from '@/components/admin/bulk-client-table'

export const dynamic = 'force-dynamic'

export default async function AdminClientsPage() {
  const clients = await getClients()

  async function handleDelete(ids: string[]) {
    'use server'
    await deleteClients(ids)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clients</h1>
        <ClientFormDialog>
          <Button>Добавить клиент</Button>
        </ClientFormDialog>
      </div>

      <BulkClientTable clients={clients} deleteAction={handleDelete} />
    </div>
  )
}
